/**
 * Seed the database with initial data
 * Run with: npx tsx db/seed.ts
 */

import { db } from "./index";
import { stocks, strategies, indicators } from "./schema";

async function seed() {
  console.log("🌱 Seeding database...\n");

  try {
    // Seed stocks
    console.log("📈 Inserting stocks...");
    const insertedStocks = await db.insert(stocks).values([
      // Banking Sector
      { stockSymbol: "BBCA", companyName: "Bank Central Asia Tbk", sector: "Finance", isSyariah: false, isIdx30: true, isLq45: true },
      { stockSymbol: "BBRI", companyName: "Bank Rakyat Indonesia Tbk", sector: "Finance", isSyariah: false, isIdx30: true, isLq45: true },
      { stockSymbol: "BMRI", companyName: "Bank Mandiri Tbk", sector: "Finance", isSyariah: false, isIdx30: true, isLq45: true },
      { stockSymbol: "BBNI", companyName: "Bank Negara Indonesia Tbk", sector: "Finance", isSyariah: false, isIdx30: true, isLq45: true },
      { stockSymbol: "BBTN", companyName: "Bank Tabungan Negara Tbk", sector: "Finance", isSyariah: false, isIdx30: false, isLq45: true },
      
      // Consumer Goods
      { stockSymbol: "ICBP", companyName: "Indofood CBP Sukses Makmur Tbk", sector: "Consumer Goods", isSyariah: true, isIdx30: true, isLq45: true },
      { stockSymbol: "INDF", companyName: "Indofood Sukses Makmur Tbk", sector: "Consumer Goods", isSyariah: false, isIdx30: true, isLq45: true },
      { stockSymbol: "UNVR", companyName: "Unilever Indonesia Tbk", sector: "Consumer Goods", isSyariah: false, isIdx30: true, isLq45: true },
      { stockSymbol: "KLBF", companyName: "Kalbe Farma Tbk", sector: "Consumer Goods", isSyariah: true, isIdx30: true, isLq45: true },
      { stockSymbol: "MYOR", companyName: "Mayora Indah Tbk", sector: "Consumer Goods", isSyariah: true, isIdx30: false, isLq45: true },
      
      // Telecommunications
      { stockSymbol: "TLKM", companyName: "Telkom Indonesia Tbk", sector: "Telecommunications", isSyariah: true, isIdx30: true, isLq45: true },
      { stockSymbol: "EXCL", companyName: "XL Axiata Tbk", sector: "Telecommunications", isSyariah: false, isIdx30: false, isLq45: true },
      { stockSymbol: "ISAT", companyName: "Indosat Tbk", sector: "Telecommunications", isSyariah: false, isIdx30: false, isLq45: false },
      
      // Mining & Energy
      { stockSymbol: "ADRO", companyName: "Adaro Energy Indonesia Tbk", sector: "Mining", isSyariah: false, isIdx30: true, isLq45: true },
      { stockSymbol: "PTBA", companyName: "Bukit Asam Tbk", sector: "Mining", isSyariah: false, isIdx30: true, isLq45: true },
      { stockSymbol: "ITMG", companyName: "Indo Tambangraya Megah Tbk", sector: "Mining", isSyariah: false, isIdx30: false, isLq45: true },
      { stockSymbol: "ANTM", companyName: "Aneka Tambang Tbk", sector: "Mining", isSyariah: false, isIdx30: true, isLq45: true },
      { stockSymbol: "INCO", companyName: "Vale Indonesia Tbk", sector: "Mining", isSyariah: false, isIdx30: false, isLq45: true },
      
      // Infrastructure & Construction
      { stockSymbol: "WIKA", companyName: "Wijaya Karya Tbk", sector: "Infrastructure", isSyariah: true, isIdx30: false, isLq45: true },
      { stockSymbol: "WSKT", companyName: "Waskita Karya Tbk", sector: "Infrastructure", isSyariah: false, isIdx30: false, isLq45: false },
      { stockSymbol: "PTPP", companyName: "PP (Persero) Tbk", sector: "Infrastructure", isSyariah: true, isIdx30: false, isLq45: true },
      { stockSymbol: "ADHI", companyName: "Adhi Karya Tbk", sector: "Infrastructure", isSyariah: true, isIdx30: false, isLq45: false },
      
      // Technology
      { stockSymbol: "GOTO", companyName: "GoTo Gojek Tokopedia Tbk", sector: "Technology", isSyariah: false, isIdx30: true, isLq45: true },
      { stockSymbol: "BUKA", companyName: "Bukalapak.com Tbk", sector: "Technology", isSyariah: false, isIdx30: false, isLq45: false },
      { stockSymbol: "EMTK", companyName: "Elang Mahkota Teknologi Tbk", sector: "Technology", isSyariah: false, isIdx30: false, isLq45: false },
      
      // Cement
      { stockSymbol: "SMGR", companyName: "Semen Indonesia Tbk", sector: "Basic Materials", isSyariah: false, isIdx30: true, isLq45: true },
      { stockSymbol: "INTP", companyName: "Indocement Tunggal Prakarsa Tbk", sector: "Basic Materials", isSyariah: false, isIdx30: false, isLq45: true },
      
      // Automotive
      { stockSymbol: "ASII", companyName: "Astra International Tbk", sector: "Automotive", isSyariah: false, isIdx30: true, isLq45: true },
      { stockSymbol: "AUTO", companyName: "Astra Otoparts Tbk", sector: "Automotive", isSyariah: false, isIdx30: false, isLq45: false },
      { stockSymbol: "GJTL", companyName: "Gajah Tunggal Tbk", sector: "Automotive", isSyariah: false, isIdx30: false, isLq45: false },
      
      // Retail
      { stockSymbol: "ACES", companyName: "Ace Hardware Indonesia Tbk", sector: "Retail", isSyariah: false, isIdx30: false, isLq45: true },
      { stockSymbol: "MAPI", companyName: "Mitra Adiperkasa Tbk", sector: "Retail", isSyariah: false, isIdx30: false, isLq45: false },
      { stockSymbol: "ERAA", companyName: "Erajaya Swasembada Tbk", sector: "Retail", isSyariah: false, isIdx30: false, isLq45: false },
      
      // Real Estate & Property
      { stockSymbol: "BSDE", companyName: "Bumi Serpong Damai Tbk", sector: "Property", isSyariah: true, isIdx30: false, isLq45: true },
      { stockSymbol: "PWON", companyName: "Pakuwon Jati Tbk", sector: "Property", isSyariah: false, isIdx30: false, isLq45: true },
      { stockSymbol: "CTRA", companyName: "Ciputra Development Tbk", sector: "Property", isSyariah: false, isIdx30: false, isLq45: false },
    ]).returning();
    console.log(`✅ Inserted ${insertedStocks.length} stocks\n`);

    // Seed strategies
    console.log("🎯 Inserting strategies...");
    const insertedStrategies = await db.insert(strategies).values([
      {
        creatorId: 0,
        name: "IDX30 Mean Reversion",
        description: "Advanced mean reversion strategy targeting IDX30 stocks with statistical arbitrage techniques for optimal entry and exit points",
        totalReturns: "42.8",
        maxDrawdown: "-9.5",
        sharpeRatio: "2.45",
        winRate: "74.2",
        totalStocks: 18,
        startingTime: new Date("2024-01-01T00:00:00+07:00"),
        volatility: "12.5",
        sortinoRatio: "2.89",
        calmarRatio: "4.50",
        beta: "0.92",
        alpha: "5.2",
        dailyReturn: "0.12",
        weeklyReturn: "0.85",
        monthlyReturn: "3.57",
        threeMonthReturn: "10.7",
        sixMonthReturn: "21.4",
        ytdReturn: "42.8",
      },
      {
        creatorId: 0,
        name: "Commodity Momentum Master",
        description: "High-frequency momentum strategy for mining and energy stocks with dynamic position sizing",
        totalReturns: "38.6",
        maxDrawdown: "-11.3",
        sharpeRatio: "2.12",
        winRate: "69.8",
        totalStocks: 22,
        startingTime: new Date("2024-01-01T00:00:00+07:00"),
        volatility: "15.8",
        sortinoRatio: "2.42",
        calmarRatio: "3.42",
        beta: "1.15",
        alpha: "4.8",
        dailyReturn: "0.11",
        weeklyReturn: "0.78",
        monthlyReturn: "3.22",
        threeMonthReturn: "9.65",
        sixMonthReturn: "19.3",
        ytdReturn: "38.6",
      },
      {
        creatorId: 0,
        name: "Consumer Defensive Shield",
        description: "Low-risk strategy focusing on consumer staples with consistent returns and minimal volatility exposure",
        totalReturns: "16.4",
        maxDrawdown: "-4.2",
        sharpeRatio: "1.98",
        winRate: "78.5",
        totalStocks: 9,
        startingTime: new Date("2024-01-01T00:00:00+07:00"),
        volatility: "6.5",
        sortinoRatio: "2.35",
        calmarRatio: "3.90",
        beta: "0.68",
        alpha: "2.1",
        dailyReturn: "0.05",
        weeklyReturn: "0.35",
        monthlyReturn: "1.37",
        threeMonthReturn: "4.1",
        sixMonthReturn: "8.2",
        ytdReturn: "16.4",
      },
      {
        creatorId: 0,
        name: "Banking Sector Breakout",
        description: "Momentum-based strategy capitalizing on banking sector volatility and breakout patterns with technical indicators",
        totalReturns: "31.2",
        maxDrawdown: "-8.7",
        sharpeRatio: "2.28",
        winRate: "71.4",
        totalStocks: 12,
        startingTime: new Date("2024-01-01T00:00:00+07:00"),
        volatility: "11.2",
        sortinoRatio: "2.67",
        calmarRatio: "3.59",
        beta: "1.05",
        alpha: "3.9",
        dailyReturn: "0.09",
        weeklyReturn: "0.63",
        monthlyReturn: "2.60",
        threeMonthReturn: "7.8",
        sixMonthReturn: "15.6",
        ytdReturn: "31.2",
      },
      {
        creatorId: 0,
        name: "Tech Growth Accelerator",
        description: "Growth-focused strategy targeting emerging technology companies with strong fundamentals and market momentum",
        totalReturns: "54.3",
        maxDrawdown: "-15.2",
        sharpeRatio: "1.87",
        winRate: "65.3",
        totalStocks: 25,
        startingTime: new Date("2024-01-01T00:00:00+07:00"),
        volatility: "22.3",
        sortinoRatio: "2.15",
        calmarRatio: "3.57",
        beta: "1.38",
        alpha: "8.2",
        dailyReturn: "0.15",
        weeklyReturn: "1.05",
        monthlyReturn: "4.53",
        threeMonthReturn: "13.58",
        sixMonthReturn: "27.15",
        ytdReturn: "54.3",
      },
      {
        creatorId: 0,
        name: "Dividend Aristocrats",
        description: "Conservative income strategy focusing on high-dividend blue-chip stocks with long track records of consistent payouts",
        totalReturns: "12.8",
        maxDrawdown: "-3.1",
        sharpeRatio: "2.56",
        winRate: "82.1",
        totalStocks: 8,
        startingTime: new Date("2024-01-01T00:00:00+07:00"),
        volatility: "4.8",
        sortinoRatio: "3.12",
        calmarRatio: "4.13",
        beta: "0.52",
        alpha: "1.8",
        dailyReturn: "0.04",
        weeklyReturn: "0.27",
        monthlyReturn: "1.07",
        threeMonthReturn: "3.2",
        sixMonthReturn: "6.4",
        ytdReturn: "12.8",
      },
      {
        creatorId: 0,
        name: "Small Cap Value Hunter",
        description: "Value investing approach targeting undervalued small-cap stocks with strong balance sheets and growth potential",
        totalReturns: "47.9",
        maxDrawdown: "-12.8",
        sharpeRatio: "2.03",
        winRate: "68.7",
        totalStocks: 32,
        startingTime: new Date("2024-01-01T00:00:00+07:00"),
        volatility: "18.5",
        sortinoRatio: "2.38",
        calmarRatio: "3.74",
        beta: "1.25",
        alpha: "6.8",
        dailyReturn: "0.13",
        weeklyReturn: "0.92",
        monthlyReturn: "3.99",
        threeMonthReturn: "11.98",
        sixMonthReturn: "23.95",
        ytdReturn: "47.9",
      },
      {
        creatorId: 0,
        name: "Infrastructure Play",
        description: "Long-term strategy focused on infrastructure and construction sector growth driven by government spending",
        totalReturns: "28.5",
        maxDrawdown: "-7.4",
        sharpeRatio: "2.19",
        winRate: "73.6",
        totalStocks: 14,
        startingTime: new Date("2024-01-01T00:00:00+07:00"),
        volatility: "10.8",
        sortinoRatio: "2.58",
        calmarRatio: "3.85",
        beta: "0.95",
        alpha: "3.5",
        dailyReturn: "0.08",
        weeklyReturn: "0.58",
        monthlyReturn: "2.38",
        threeMonthReturn: "7.13",
        sixMonthReturn: "14.25",
        ytdReturn: "28.5",
      },
    ]).returning();
    console.log(`✅ Inserted ${insertedStrategies.length} strategies\n`);

    // Seed indicators
    console.log("📊 Inserting indicators...");
    const insertedIndicators = await db.insert(indicators).values([
      // IDX30 Mean Reversion
      { strategyId: insertedStrategies[0].id, name: "RSI", parameters: { period: 14, overbought: 70, oversold: 30 } },
      { strategyId: insertedStrategies[0].id, name: "Bollinger Bands", parameters: { period: 20, std_dev: 2 } },
      { strategyId: insertedStrategies[0].id, name: "Mean Reversion", parameters: { lookback_period: 30, z_score_threshold: 2 } },
      
      // Commodity Momentum Master
      { strategyId: insertedStrategies[1].id, name: "Moving Average", parameters: { short_period: 10, long_period: 50 } },
      { strategyId: insertedStrategies[1].id, name: "MACD", parameters: { fast: 12, slow: 26, signal: 9 } },
      { strategyId: insertedStrategies[1].id, name: "ADX", parameters: { period: 14, threshold: 25 } },
      
      // Consumer Defensive Shield
      { strategyId: insertedStrategies[2].id, name: "SMA", parameters: { period: 50 } },
      { strategyId: insertedStrategies[2].id, name: "Volatility Filter", parameters: { max_volatility: 15 } },
      { strategyId: insertedStrategies[2].id, name: "Dividend Yield", parameters: { min_yield: 3 } },
      
      // Banking Sector Breakout
      { strategyId: insertedStrategies[3].id, name: "Breakout Detection", parameters: { period: 20, threshold: 1.5 } },
      { strategyId: insertedStrategies[3].id, name: "Volume Confirmation", parameters: { volume_factor: 1.5 } },
      { strategyId: insertedStrategies[3].id, name: "ATR", parameters: { period: 14 } },
      
      // Tech Growth Accelerator
      { strategyId: insertedStrategies[4].id, name: "Momentum", parameters: { period: 20 } },
      { strategyId: insertedStrategies[4].id, name: "EMA", parameters: { short: 12, long: 26 } },
      { strategyId: insertedStrategies[4].id, name: "Growth Filter", parameters: { min_growth_rate: 15 } },
      
      // Dividend Aristocrats
      { strategyId: insertedStrategies[5].id, name: "Dividend History", parameters: { min_consecutive_years: 5 } },
      { strategyId: insertedStrategies[5].id, name: "Payout Ratio", parameters: { max_ratio: 70 } },
      { strategyId: insertedStrategies[5].id, name: "Yield Filter", parameters: { min_yield: 4 } },
      
      // Small Cap Value Hunter
      { strategyId: insertedStrategies[6].id, name: "P/E Ratio", parameters: { max_pe: 15 } },
      { strategyId: insertedStrategies[6].id, name: "P/B Ratio", parameters: { max_pb: 1.5 } },
      { strategyId: insertedStrategies[6].id, name: "Market Cap Filter", parameters: { max_market_cap: 5000000000000 } },
      
      // Infrastructure Play
      { strategyId: insertedStrategies[7].id, name: "Sector Momentum", parameters: { period: 30 } },
      { strategyId: insertedStrategies[7].id, name: "Government Contract", parameters: { min_contract_value: 1000000000000 } },
      { strategyId: insertedStrategies[7].id, name: "Technical Breakout", parameters: { period: 50 } },
    ]).returning();
    console.log(`✅ Inserted ${insertedIndicators.length} indicators\n`);

    console.log("✨ Seeding completed successfully!\n");
    console.log("Summary:");
    console.log(`  📈 ${insertedStocks.length} stocks`);
    console.log(`  🎯 ${insertedStrategies.length} strategies`);
    console.log(`  📊 ${insertedIndicators.length} indicators`);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seed();

