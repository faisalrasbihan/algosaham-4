
import { NextRequest, NextResponse } from "next/server";

// Types matching lib/api.ts
interface BacktestRequest {
    backtestId: string;
    filters: {
        marketCap: string[];
        syariah: boolean;
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

// In-memory session store (resets on server restart)
const sessions = new Map<string, Partial<BacktestRequest>>();

const DEFAULT_CONFIG: BacktestRequest = {
    backtestId: "",
    filters: {
        marketCap: ["large", "mid"],
        syariah: false,
        minDailyValue: 1000000000,
    },
    fundamentalIndicators: [],
    technicalIndicators: [],
    backtestConfig: {
        initialCapital: 100000000,
        startDate: "2024-01-01",
        endDate: "2024-12-31",
        tradingCosts: {
            brokerFee: 0.15,
            sellFee: 0.15,
            minimumFee: 1000,
        },
        portfolio: {
            positionSizePercent: 20,
            minPositionPercent: 5,
            maxPositions: 5,
        },
        riskManagement: {
            stopLossPercent: 7,
            takeProfitPercent: 15,
            maxHoldingDays: 30,
        },
    },
};

export async function POST(req: NextRequest) {
    try {
        const { input_text, session_id } = await req.json();
        const userInput = input_text?.toLowerCase() || "";

        let responseText = "";
        let configReady = false;
        let config = { ...DEFAULT_CONFIG, backtestId: `agent_${Date.now()}` };

        // 1. Check for Presets
        if (userInput.includes("conservative")) {
            config.fundamentalIndicators = [
                { type: "PE_RATIO", max: 15 },
                { type: "DE_RATIO", max: 1 }
            ];
            config.filters.marketCap = ["large"];
            config.backtestConfig.riskManagement = { stopLossPercent: 5, takeProfitPercent: 10, maxHoldingDays: 60 };
            responseText = "I've applied the **Conservative Strategy**. It focuses on large-cap stocks with low valuation (PE < 15) and healthy debt levels.";
            configReady = true;

        } else if (userInput.includes("balanced")) {
            config.fundamentalIndicators = [
                { type: "PE_RATIO", max: 20 },
                { type: "ROE", min: 10 }
            ];
            config.filters.marketCap = ["large", "mid"];
            responseText = "I've applied the **Balanced Strategy**. It targets a mix of growth and value with reasonable valuations and good profitability.";
            configReady = true;

        } else if (userInput.includes("aggressive")) {
            config.technicalIndicators = [
                { type: "SMA_CROSSOVER", shortPeriod: 10, longPeriod: 20 },
                { type: "RSI", period: 14, oversold: 40, overbought: 80 }
            ];
            config.filters.marketCap = ["mid", "small"];
            config.backtestConfig.riskManagement = { stopLossPercent: 7, takeProfitPercent: 20, maxHoldingDays: 14 };
            responseText = "I've applied the **Aggressive Strategy**. It targets smaller caps with tighter moving average crossovers for fast moves.";
            configReady = true;

        } else if (userInput.includes("momentum")) {
            config.technicalIndicators = [
                { type: "RSI", period: 14, oversold: 30, overbought: 70 },
                { type: "MACD", fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 },
                { type: "SMA_TREND", shortPeriod: 20, longPeriod: 50 },
            ];
            config.filters.marketCap = ["large", "mid"];
            responseText = "I've created a **Momentum Strategy** for you. It uses RSI for entry signals, MACD for trend confirmation, and filters for liquid large/mid-cap stocks.";
            configReady = true;

        } else if (userInput.includes("value") || userInput.includes("cheap")) {
            config.fundamentalIndicators = [
                { type: "PE_RATIO", min: 0, max: 15 },
                { type: "PBV", min: 0, max: 1.5 },
                { type: "ROE", min: 10 },
            ];
            config.technicalIndicators = [
                { type: "RSI", period: 14, oversold: 30, overbought: 70 }
            ];
            config.filters.marketCap = ["large"];
            responseText = "I've set up a **Value Investing Strategy**. It looks for cheap stocks (low PE/PBV) that are high quality (high ROE), using RSI to time entries.";
            configReady = true;

        } else if (userInput.includes("dividend")) {
            config.fundamentalIndicators = [
                { type: "ROE", min: 15 },
                { type: "NPM", min: 10 },
                { type: "DE_RATIO", max: 1 }
            ];
            config.filters.marketCap = ["large"];
            responseText = "I've configured a **Dividend/Quality Strategy**. It prioritizes high-profitability companies (ROE > 15%, NPM > 10%) with solid balance sheets.";
            configReady = true;

        } else if (userInput.includes("trend") || userInput.includes("follow")) {
            config.technicalIndicators = [
                { type: "SMA_CROSSOVER", shortPeriod: 20, longPeriod: 50 },
                { type: "ADX", period: 14 },
            ];
            config.backtestConfig.riskManagement.stopLossPercent = 10;
            config.backtestConfig.riskManagement.maxHoldingDays = 60;
            responseText = "I've configured a **Trend Following Strategy**. It buys when the 20-day SMA crosses above the 50-day SMA, indicating a new uptrend.";
            configReady = true;

        } else if (userInput.includes("reversal")) {
            config.technicalIndicators = [
                { type: "RSI", period: 14, oversold: 30, overbought: 70 },
                { type: "BULLISH_ENGULFING" }
            ];
            responseText = "I've configured a **Reversal Strategy**. It looks for Bullish Engulfing patterns when RSI is oversold.";
            configReady = true;

        } else if (userInput.includes("swing")) {
            config.technicalIndicators = [
                { type: "RSI", period: 14, oversold: 30, overbought: 70 },
                { type: "BOLLINGER_BANDS", period: 20, stdDev: 2 }
            ];
            responseText = "I've created a **Swing Trading Strategy**. It attempts to buy at the lower Bollinger Band when RSI is favorable.";
            configReady = true;

        } else if (userInput.includes("breakout")) {
            config.technicalIndicators = [
                { type: "VOLATILITY_BREAKOUT", period: 20, multiplier: 2 },
                { type: "VOLUME_SMA", period: 20, threshold: 1.5 },
            ];
            responseText = "I've built a **Volatility Breakout Strategy**. It catches price explosions accompanied by high volume.";
            configReady = true;

        } else if (userInput.includes("syariah")) {
            config.filters.syariah = true;
            config.technicalIndicators = [
                { type: "SMA_TREND", shortPeriod: 20, longPeriod: 50 }
            ]
            responseText = "I've enabled **Syariah Screening**. Only syariah-compliant stocks will be traded. I've also added a simple trend filter.";
            configReady = true;
        } else {
            // General or unknown info
            responseText = "I can help you build a trading strategy. Try asking for: \n- 'Build a momentum strategy'\n- 'Find cheap value stocks'\n- 'Trend following setup'\n- 'Breakout strategy with volume'";
            configReady = false;
        }

        // 2. Dynamic Entity Extraction (overrides/additions)

        // Market Cap
        const caps: string[] = [];
        if (userInput.includes("small")) caps.push("small");
        if (userInput.includes("mid")) caps.push("mid");
        if (userInput.includes("large") || userInput.includes("big")) caps.push("large");
        if (caps.length > 0) config.filters.marketCap = caps;

        // Sectors
        const foundSectors: string[] = [];
        const sectors = ["Banking", "Consumer", "Property", "Technology", "Mining", "Energy", "Healthcare", "Telecommunications", "Transportation", "Agriculture"];
        sectors.forEach(s => {
            if (userInput.includes(s.toLowerCase())) foundSectors.push(s);
        });
        if (foundSectors.length > 0) config.filters.sectors = foundSectors;

        // Syariah override if mentioned explicitly
        if (userInput.includes("syariah") && !config.filters.syariah) {
            config.filters.syariah = true;
            if (!configReady) responseText += "\n\nI've enabled the **Syariah** filter.";
        }

        // Apply specific modifications if mentioned
        if (userInput.includes("stop loss")) {
            const match = userInput.match(/stop loss.*?(\d+)/);
            if (match) {
                config.backtestConfig.riskManagement.stopLossPercent = parseInt(match[1]);
                responseText += `\n\nI've also updated the **Stop Loss** to ${match[1]}%.`;
            }
        }

        if (userInput.includes("capital")) {
            const match = userInput.match(/capital.*?(\d+)/);
            if (match) {
                config.backtestConfig.initialCapital = parseInt(match[1]);
                responseText += `\n\nStarting **Capital** set to IDR ${parseInt(match[1]).toLocaleString()}.`;
            }
        }

        return NextResponse.json({
            response: responseText,
            config_ready: configReady,
            backtest_config: configReady ? config : null,
            session_id: session_id
        });

    } catch (error) {
        console.error("Agent API Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
