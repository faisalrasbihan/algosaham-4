# AlgoSaham - Stock Strategy Backtesting Platform

This is a [Next.js](https://nextjs.org) project for stock strategy backtesting with FastAPI integration.

## Features

- **Strategy Builder**: Create and configure stock trading strategies with fundamental and technical indicators
- **Real-time Backtesting**: Run backtests using FastAPI backend with live data
- **Performance Analytics**: View detailed performance metrics, charts, and trade history
- **Risk Management**: Configure stop-loss, take-profit, and position sizing

## Getting Started

### Prerequisites

- Node.js 18+ 
- FastAPI backend running on port 8000

### Environment Setup

Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_API_URL=https://backtester-psi.vercel.app
FASTAPI_URL=https://backtester-psi.vercel.app
```

### Installation

```bash
npm install
```

### Development

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### FastAPI Integration

The app automatically calls the FastAPI `/run_backtest` endpoint when loaded with default strategy parameters. In production, the FastAPI backend is deployed at `https://backtester-psi.vercel.app`.

## API Integration

The app integrates with a FastAPI backend that provides:

- `/run_backtest` - POST endpoint for running backtests
- Backtest configuration matching the StrategyBuilder form
- Real-time performance data and trade history

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
