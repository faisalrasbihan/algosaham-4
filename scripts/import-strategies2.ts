import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { eq } from 'drizzle-orm';
import { db } from '../db/index';
import { strategies, users } from '../db/schema';
import { runBacktestWithQuota, summarizeBacktestResult } from '../lib/server/backtest';

function parseCSVLine(line: string) {
    const result = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === '"') {
            if (i + 1 < line.length && line[i + 1] === '"') {
                cur += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (c === ',' && !inQuotes) {
            result.push(cur);
            cur = '';
        } else {
            cur += c;
        }
    }
    result.push(cur);
    return result;
}

async function main() {
    let systemUser = await db.query.users.findFirst({
        where: eq(users.clerkId, "system_showcase")
    });

    if (!systemUser) {
        console.log("Creating default system_showcase user...");
        await db.insert(users).values({
            clerkId: "system_showcase",
            email: "showcase@algosaham.com",
            name: "AlgoSaham Official",
            subscriptionTier: "bandar",
            subscriptionStatus: "active",
        });
    }

    const csvPath = path.join(__dirname, '..', 'docs', 'results_summary_2.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    const headers = parseCSVLine(lines[0]);
    const nameIdx = headers.indexOf('strategy_name');
    const categoryIdx = headers.indexOf('strategy_category');
    const hypothesisIdx = headers.indexOf('hypothesis');
    const variationIdx = headers.indexOf('best_variation');

    const totalStrategies = lines.length - 1;

    for (let i = 1; i < lines.length; i++) {
        const row = parseCSVLine(lines[i]);

        const strategyName = row[nameIdx];
        const strategyCategory = row[categoryIdx];
        const hypothesis = row[hypothesisIdx];
        let bestVariation = row[variationIdx];

        // Remove surrounding quotes from bestVariation just in case
        bestVariation = bestVariation?.replace(/^"/, '').replace(/"$/, '');

        if (!bestVariation) {
            console.log(`[SKIP] Missing best_variation for ${strategyName}`);
            continue;
        }

        const jsonPath = path.join(__dirname, '..', 'docs', 'best_variation_2', `${bestVariation}.json`);
        if (!fs.existsSync(jsonPath)) {
            console.log(`[SKIP] [${i}/${totalStrategies}] JSON not found for ${strategyName} at ${jsonPath}`);
            continue;
        }

        console.log(`[PROCESS] [${i}/${totalStrategies}] Backtesting: ${strategyName} ...`);
        const configStr = fs.readFileSync(jsonPath, 'utf8');
        const config = JSON.parse(configStr);

        try {
            // Run backtest by bypassing user quota logic (no userId)
            const result = await runBacktestWithQuota({
                config,
                userId: null,
                consumeQuota: false,
                requireUser: false
            });

            // Summarize
            const metadata = summarizeBacktestResult(result);

            // Generate config hash
            const configHash = crypto.createHash('sha256').update(JSON.stringify(config)).digest('hex').substring(0, 16);

            // Insert into the database
            await db.insert(strategies).values({
                name: strategyName,
                description: hypothesis,
                strategyCategory: strategyCategory,
                creatorId: "system_showcase",
                configHash,
                config,
                totalReturn: metadata.totalReturn?.toString(),
                maxDrawdown: metadata.maxDrawdown?.toString(),
                successRate: metadata.successRate?.toString(),
                sharpeRatio: metadata.sharpeRatio?.toString(),
                totalTrades: metadata.totalTrades,
                totalStocks: metadata.totalStocks,
                qualityScore: metadata.qualityScore,
                isPublic: true,
                isActive: true,
                isShowcase: true,
                topHoldings: metadata.topHoldings,
            }).onConflictDoUpdate({
                target: strategies.configHash,
                set: {
                    name: strategyName,
                    description: hypothesis,
                    strategyCategory: strategyCategory,
                    totalReturn: metadata.totalReturn?.toString(),
                    maxDrawdown: metadata.maxDrawdown?.toString(),
                    successRate: metadata.successRate?.toString(),
                    sharpeRatio: metadata.sharpeRatio?.toString(),
                    totalTrades: metadata.totalTrades,
                    totalStocks: metadata.totalStocks,
                    qualityScore: metadata.qualityScore,
                    isPublic: true,
                    isActive: true,
                    isShowcase: true,
                    topHoldings: metadata.topHoldings,
                    updatedAt: new Date(),
                }
            });

            console.log(`[OK] [${i}/${totalStrategies}] Saved Strategy: ${strategyName}`);
        } catch (error) {
            console.error(`[ERROR] [${i}/${totalStrategies}] Failed strategy ${strategyName}:`, error instanceof Error ? error.message : error);
        }
    }

    console.log("All done.");
    process.exit(0);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
