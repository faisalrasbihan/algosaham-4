/**
 * Seed Strategies Script
 * 
 * Reads all JSON strategy files from docs/best_variation/,
 * runs each through the backtest API, and saves the results
 * to the strategies table in the database.
 * 
 * Usage:
 *   npx tsx scripts/seed-strategies.ts [--dry-run] [--test-one] [--creator-id <id>]
 * 
 * Options:
 *   --dry-run     Only read and transform configs, don't call API or save to DB
 *   --test-one    Only run the first strategy as a test
 *   --creator-id  Clerk user ID to set as the creator (required for DB save)
 */

import * as fs from 'fs';
import * as path from 'path';
import crypto from 'crypto';
import { db } from '../db';
import { strategies } from '../db/schema';
import { eq } from 'drizzle-orm';

// ============================================
// Configuration
// ============================================
const BEST_VARIATION_DIR = path.join(__dirname, '..', 'docs', 'best_variation');
const RAILWAY_URL = process.env.RAILWAY_URL
    ? (process.env.RAILWAY_URL.startsWith('http') ? process.env.RAILWAY_URL : `https://${process.env.RAILWAY_URL}`)
    : '';

const DELAY_BETWEEN_REQUESTS_MS = 2000; // 2 seconds between API calls to avoid rate limiting

// ============================================
// Types
// ============================================
interface RawJsonConfig {
    backtestId: string;
    filters: {
        marketCap?: string[];
        syariah?: boolean;
        minDailyValue?: number;
        tickers?: string[];
        sectors?: string[];
    };
    fundamentalIndicators: Array<{
        type: string;
        min?: number;
        max?: number;
    }>;
    technicalIndicators: Array<{
        type: string;
        [key: string]: any;
    }>;
    backtestConfig: {
        initialCapital: number;
        startDate: string;
        endDate: string;
        tradingCosts: {
            brokerFee: number;
            sellFee: number;
            minimumFee: number;
            slippageBps?: number;
            spreadBps?: number;
        };
        portfolio: {
            positionSizePercent: number;
            minPositionPercent: number;
            maxPositions: number;
        };
        riskManagement: {
            maxHoldingDays: number;
            stopLoss: { method: string; percent: number };
            takeProfit: { method: string; percent: number };
        };
    };
}

interface TransformedConfig {
    backtestId: string;
    filters: {
        marketCap?: string[];
        syariah?: boolean;
        minDailyValue?: number;
        tickers?: string[];
        sectors?: string[];
    };
    fundamentalIndicators: Array<{
        type: string;
        min?: number;
        max?: number;
    }>;
    technicalIndicators: Array<{
        type: string;
        [key: string]: any;
    }>;
    backtestConfig: {
        initialCapital: number;
        startDate: string;
        endDate: string;
        tradingCosts: {
            brokerFee: number;
            sellFee: number;
            minimumFee: number;
        };
        portfolio: {
            positionSizePercent: number;
            minPositionPercent: number;
            maxPositions: number;
        };
        riskManagement: {
            stopLossPercent: number;
            takeProfitPercent: number;
            maxHoldingDays: number;
        };
    };
}

// ============================================
// Helper Functions
// ============================================

/**
 * Extrapolate a human-readable strategy name from the backtestId.
 * e.g., "adx_trend_value_pe_period14_threshold20_max15" -> "ADX Trend Value PE"
 * 
 * Strategy: 
 * - Split by underscore
 * - Identify the "base name" portion (before parameter keys like period, threshold, etc.)
 * - Title-case each word, uppercase known abbreviations
 */
function extractStrategyName(backtestId: string): string {
    const parts = backtestId.split('_');

    // Known parameter prefixes to strip from the name
    const paramPrefixes = [
        'period', 'threshold', 'max', 'min', 'shortperiod', 'longperiod',
        'stddev', 'fastperiod', 'slowperiod', 'signalperiod', 'baseperiod',
        'breakoutpct', 'afmax', 'afstep', 'multiplier', 'kperiod', 'dperiod',
        'signalwindow', 'oversold', 'mindailyvalue', 'lookback', 'mode',
        'atrmultiplier', 'riskrewardratio', 'atrperiod',
    ];

    // Known uppercase abbreviations
    const abbreviations = new Set([
        'adx', 'pe', 'pbv', 'roe', 'ema', 'sma', 'rsi', 'macd', 'obv', 'sar',
        'vpt', 'vwap', 'atr', 'v0',
    ]);

    // Version suffix patterns
    const versionPattern = /^v\d+$/;

    // Collect name parts until we hit a parameter-like part
    const nameParts: string[] = [];
    let hitParam = false;

    for (const part of parts) {
        const lower = part.toLowerCase();

        // Check if this part starts a parameter section
        // Parameters are typically like "period14", "threshold20", "max15"
        const isParam = paramPrefixes.some(prefix => lower.startsWith(prefix) && lower !== prefix);
        const isPureParam = paramPrefixes.includes(lower);

        if (isParam && !hitParam) {
            hitParam = true;
            break;
        }

        // Check if it's a pure number (likely a param value)
        if (/^\d+(\.\d+)?$/.test(lower)) {
            break;
        }

        // Version suffix like v0 - include it
        if (versionPattern.test(lower)) {
            nameParts.push(lower.toUpperCase());
            continue;
        }

        // Capitalize appropriately
        if (abbreviations.has(lower)) {
            nameParts.push(lower.toUpperCase());
        } else {
            nameParts.push(lower.charAt(0).toUpperCase() + lower.slice(1));
        }
    }

    return nameParts.join(' ') || backtestId;
}

/**
 * Transform the raw JSON config from the file into the format the API expects.
 */
function transformConfig(raw: RawJsonConfig): TransformedConfig {
    return {
        backtestId: raw.backtestId,
        filters: {
            marketCap: raw.filters.marketCap,
            ...(raw.filters.syariah !== undefined && { syariah: raw.filters.syariah }),
            ...(raw.filters.minDailyValue !== undefined && { minDailyValue: raw.filters.minDailyValue }),
            ...(raw.filters.tickers !== undefined && { tickers: raw.filters.tickers }),
            ...(raw.filters.sectors !== undefined && { sectors: raw.filters.sectors }),
        },
        fundamentalIndicators: raw.fundamentalIndicators || [],
        technicalIndicators: raw.technicalIndicators || [],
        backtestConfig: {
            initialCapital: raw.backtestConfig.initialCapital,
            startDate: raw.backtestConfig.startDate,
            endDate: raw.backtestConfig.endDate,
            tradingCosts: {
                brokerFee: raw.backtestConfig.tradingCosts.brokerFee,
                sellFee: raw.backtestConfig.tradingCosts.sellFee,
                minimumFee: raw.backtestConfig.tradingCosts.minimumFee,
            },
            portfolio: raw.backtestConfig.portfolio,
            riskManagement: {
                stopLossPercent: raw.backtestConfig.riskManagement.stopLoss.percent,
                takeProfitPercent: raw.backtestConfig.riskManagement.takeProfit.percent,
                maxHoldingDays: raw.backtestConfig.riskManagement.maxHoldingDays,
            },
        },
    };
}

/**
 * Generate a SHA256 hash of the config for deduplication.
 */
function generateConfigHash(config: TransformedConfig): string {
    const configString = JSON.stringify(config);
    return crypto.createHash('sha256').update(configString).digest('hex').substring(0, 16);
}

/**
 * Calculate quality score from Sharpe ratio.
 */
function calculateQualityScore(sharpeRatio: number | null | undefined): string {
    if (sharpeRatio === null || sharpeRatio === undefined) return 'Unknown';
    if (sharpeRatio < 1.0) return 'Poor';
    if (sharpeRatio <= 2.0) return 'Good';
    return 'Excellent';
}

/**
 * Sleep utility.
 */
function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Call the Railway backtest API directly (bypassing Next.js API route to avoid auth).
 */
async function runBacktest(config: TransformedConfig): Promise<any> {
    if (!RAILWAY_URL) {
        throw new Error('RAILWAY_URL environment variable is not set');
    }

    const response = await fetch(`${RAILWAY_URL}/run_backtest`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ config }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Backtest API error ${response.status}: ${errorText.substring(0, 500)}`);
    }

    return response.json();
}

/**
 * Save a strategy to the database.
 */
async function saveStrategy(
    name: string,
    config: TransformedConfig,
    configHash: string,
    backtestResults: any,
    creatorId: string,
): Promise<void> {
    // Extract metrics from results
    const totalReturn = backtestResults?.summary?.totalReturn ?? null;
    const maxDrawdown = backtestResults?.summary?.maxDrawdown ?? null;
    const successRate = backtestResults?.summary?.winRate ?? null;
    const totalTrades = backtestResults?.summary?.totalTrades ?? 0;
    const sharpeRatio = backtestResults?.summary?.sharpeRatio ?? null;

    // Calculate total unique stocks
    let totalStocks = 0;
    const allSignals = backtestResults?.recentSignals?.signals || backtestResults?.signals || [];
    if (Array.isArray(allSignals) && allSignals.length > 0) {
        totalStocks = new Set(allSignals.map((s: any) => s.ticker)).size;
    }

    // Quality score
    const qualityScore = calculateQualityScore(sharpeRatio);

    // Top 3 holdings
    let topHoldings: { symbol: string; color?: string }[] = [];
    if (Array.isArray(allSignals) && allSignals.length > 0) {
        const sortedSignals = [...allSignals].sort((a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        const uniqueTickers = new Set<string>();
        const colors = ['bg-blue-600', 'bg-orange-500', 'bg-green-600', 'bg-purple-600', 'bg-red-600'];

        for (const signal of sortedSignals) {
            if (uniqueTickers.size >= 3) break;
            if (!uniqueTickers.has(signal.ticker)) {
                uniqueTickers.add(signal.ticker);
                topHoldings.push({
                    symbol: signal.ticker,
                    color: colors[uniqueTickers.size - 1] || 'bg-gray-600',
                });
            }
        }
    }

    // Check if a strategy with this config hash already exists
    const existing = await db.query.strategies.findFirst({
        where: eq(strategies.configHash, configHash),
    });

    if (existing) {
        console.log(`  ⏭️  Strategy with hash ${configHash} already exists (id: ${existing.id}), skipping...`);
        return;
    }

    // Insert
    const [newStrategy] = await db.insert(strategies).values({
        name,
        description: `Auto-generated showcase strategy: ${name}`,
        creatorId,
        configHash,
        config: config as any,
        totalReturn: totalReturn?.toString(),
        maxDrawdown: maxDrawdown?.toString(),
        successRate: successRate?.toString(),
        totalTrades,
        totalStocks,
        qualityScore,
        sharpeRatio: sharpeRatio?.toString(),
        isPublic: true,
        isActive: true,
        isShowcase: true,
        topHoldings: topHoldings.length > 0 ? topHoldings : null,
    }).returning();

    console.log(`  ✅ Saved strategy: ${name} (id: ${newStrategy.id}, hash: ${configHash})`);
}

// ============================================
// Main
// ============================================
async function main() {
    const args = process.argv.slice(2);
    const isDryRun = args.includes('--dry-run');
    const isTestOne = args.includes('--test-one');
    const creatorIdIdx = args.indexOf('--creator-id');
    const creatorId = creatorIdIdx !== -1 ? args[creatorIdIdx + 1] : '';

    if (!isDryRun && !creatorId) {
        console.error('❌ --creator-id is required when not in dry-run mode.');
        console.error('   Usage: npx tsx scripts/seed-strategies.ts --creator-id <clerk_user_id>');
        console.error('   Or use --dry-run to test without saving.');
        process.exit(1);
    }

    if (!isDryRun && !RAILWAY_URL) {
        console.error('❌ RAILWAY_URL environment variable is not set.');
        process.exit(1);
    }

    // Read all JSON files
    const files = fs.readdirSync(BEST_VARIATION_DIR)
        .filter(f => f.endsWith('.json'))
        .sort();

    console.log(`📂 Found ${files.length} strategy files in best_variation/`);
    console.log(`🔧 Mode: ${isDryRun ? 'DRY RUN' : isTestOne ? 'TEST ONE' : 'FULL RUN'}`);
    if (!isDryRun) console.log(`🌐 Railway URL: ${RAILWAY_URL}`);
    console.log('');

    const filesToProcess = isTestOne ? [files[0]] : files;
    let successCount = 0;
    let errorCount = 0;
    let skipCount = 0;

    for (let i = 0; i < filesToProcess.length; i++) {
        const file = filesToProcess[i];
        const filePath = path.join(BEST_VARIATION_DIR, file);

        console.log(`[${i + 1}/${filesToProcess.length}] Processing: ${file}`);

        try {
            // Read and parse JSON
            const rawJson: RawJsonConfig = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

            // Extract name from backtestId
            const strategyName = extractStrategyName(rawJson.backtestId);
            console.log(`  📋 Name: "${strategyName}" (from: ${rawJson.backtestId})`);

            // Transform config
            const transformed = transformConfig(rawJson);
            const configHash = generateConfigHash(transformed);
            console.log(`  🔑 Hash: ${configHash}`);

            if (isDryRun) {
                console.log(`  📝 Config (transformed):`, JSON.stringify(transformed.backtestConfig.riskManagement));
                console.log(`  ✅ DRY RUN - Would process this strategy`);
                successCount++;
                continue;
            }

            // Run backtest
            console.log(`  🔄 Running backtest...`);
            const results = await runBacktest(transformed);
            console.log(`  📊 Result: ${results.summary?.totalReturn ?? 'N/A'}% return, ${results.summary?.totalTrades ?? 0} trades`);

            // Save to DB
            await saveStrategy(strategyName, transformed, configHash, results, creatorId);
            successCount++;

            // Delay between requests
            if (i < filesToProcess.length - 1) {
                console.log(`  ⏳ Waiting ${DELAY_BETWEEN_REQUESTS_MS / 1000}s before next request...`);
                await sleep(DELAY_BETWEEN_REQUESTS_MS);
            }

        } catch (error) {
            console.error(`  ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            errorCount++;
        }

        console.log('');
    }

    console.log('══════════════════════════════════════');
    console.log(`📊 Summary:`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Errors:  ${errorCount}`);
    console.log(`   ⏭️  Skipped: ${skipCount}`);
    console.log(`   📂 Total:   ${filesToProcess.length}`);
    console.log('══════════════════════════════════════');

    process.exit(errorCount > 0 ? 1 : 0);
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
