import * as fs from 'fs';
import * as path from 'path';

// Load .env.local manually (before importing db)
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        if (!process.env[key]) {
            process.env[key] = value;
        }
    }
});

import { db } from "./index"
import { strategies } from "./schema"

async function seedShowcaseStrategies() {
    try {
        console.log("🌱 Seeding showcase strategies...")

        const showcaseStrategies = [
            {
                creatorId: "system_showcase",
                name: "IDX30 Momentum Master",
                description: "Strategi momentum untuk saham blue-chip IDX30 dengan indikator teknikal canggih. Fokus pada pergerakan harga jangka menengah dengan risk management ketat.",
                configHash: `showcase_idx30_${Date.now()}`,
                totalReturn: "42.8",
                maxDrawdown: "-9.5",
                successRate: "74.2",
                sharpeRatio: "2.45",
                totalTrades: 156,
                totalStocks: 18,
                qualityScore: "Excellent",
                subscribers: 1847,
                isPublic: true,
                isShowcase: true,
                isActive: true,
            },
            {
                creatorId: "system_showcase",
                name: "Value Hunter Pro",
                description: "Mencari saham undervalued dengan fundamental kuat. Kombinasi analisis PE Ratio, PBV, dan ROE untuk menemukan hidden gems di pasar modal.",
                configHash: `showcase_value_${Date.now()}`,
                totalReturn: "47.9",
                maxDrawdown: "-12.8",
                successRate: "68.7",
                sharpeRatio: "2.03",
                totalTrades: 224,
                totalStocks: 32,
                qualityScore: "Good",
                subscribers: 1523,
                isPublic: true,
                isShowcase: true,
                isActive: true,
            },
            {
                creatorId: "system_showcase",
                name: "Dividend Aristocrats",
                description: "Strategi konservatif fokus pada saham dividen tinggi dengan track record pembayaran konsisten. Ideal untuk passive income jangka panjang.",
                configHash: `showcase_dividend_${Date.now()}`,
                totalReturn: "12.8",
                maxDrawdown: "-3.1",
                successRate: "82.1",
                sharpeRatio: "2.56",
                totalTrades: 67,
                totalStocks: 8,
                qualityScore: "Excellent",
                subscribers: 2134,
                isPublic: true,
                isShowcase: true,
                isActive: true,
            },
            {
                creatorId: "system_showcase",
                name: "Tech Growth Accelerator",
                description: "Mengincar saham teknologi dengan pertumbuhan tinggi. Menggunakan analisis fundamental dan momentum untuk menangkap tren digital transformation.",
                configHash: `showcase_tech_${Date.now()}`,
                totalReturn: "54.3",
                maxDrawdown: "-15.2",
                successRate: "65.3",
                sharpeRatio: "1.87",
                totalTrades: 189,
                totalStocks: 25,
                qualityScore: "Good",
                subscribers: 1689,
                isPublic: true,
                isShowcase: true,
                isActive: true,
            },
            {
                creatorId: "system_showcase",
                name: "Banking Sector Breakout",
                description: "Spesialis sektor perbankan dengan strategi breakout pattern. Memanfaatkan volatilitas sektor finansial untuk profit maksimal.",
                configHash: `showcase_banking_${Date.now()}`,
                totalReturn: "31.2",
                maxDrawdown: "-8.7",
                successRate: "71.4",
                sharpeRatio: "2.28",
                totalTrades: 134,
                totalStocks: 12,
                qualityScore: "Excellent",
                subscribers: 1456,
                isPublic: true,
                isShowcase: true,
                isActive: true,
            },
            {
                creatorId: "system_showcase",
                name: "Consumer Defensive Shield",
                description: "Strategi defensif fokus pada consumer goods dengan volatilitas rendah. Cocok untuk investor yang mencari stabilitas di tengah ketidakpastian pasar.",
                configHash: `showcase_consumer_${Date.now()}`,
                totalReturn: "16.4",
                maxDrawdown: "-4.2",
                successRate: "78.5",
                sharpeRatio: "1.98",
                totalTrades: 89,
                totalStocks: 9,
                qualityScore: "Good",
                subscribers: 1892,
                isPublic: true,
                isShowcase: true,
                isActive: true,
            },
            {
                creatorId: "system_showcase",
                name: "Small Cap Rocket",
                description: "Strategi agresif untuk saham small-cap dengan potensi pertumbuhan eksplosif. High risk, high reward untuk investor berani.",
                configHash: `showcase_smallcap_${Date.now()}`,
                totalReturn: "68.5",
                maxDrawdown: "-18.3",
                successRate: "62.4",
                sharpeRatio: "1.76",
                totalTrades: 267,
                totalStocks: 38,
                qualityScore: "Fair",
                subscribers: 1234,
                isPublic: true,
                isShowcase: true,
                isActive: true,
            },
            {
                creatorId: "system_showcase",
                name: "Commodity Momentum",
                description: "Mengikuti tren komoditas global dengan fokus pada sektor mining dan energi. Strategi momentum yang memanfaatkan siklus harga komoditas.",
                configHash: `showcase_commodity_${Date.now()}`,
                totalReturn: "38.6",
                maxDrawdown: "-11.3",
                successRate: "69.8",
                sharpeRatio: "2.12",
                totalTrades: 178,
                totalStocks: 22,
                qualityScore: "Good",
                subscribers: 1567,
                isPublic: true,
                isShowcase: true,
                isActive: true,
            },
        ]

        for (const strategy of showcaseStrategies) {
            await db.insert(strategies).values(strategy).onConflictDoNothing()
            console.log(`   ✓ ${strategy.name}`)
        }

        console.log(`\n✅ Successfully seeded ${showcaseStrategies.length} showcase strategies`)
        console.log("   All strategies marked as showcase and public")

        process.exit(0)
    } catch (error) {
        console.error("❌ Error seeding showcase strategies:", error)
        process.exit(1)
    }
}

seedShowcaseStrategies()
