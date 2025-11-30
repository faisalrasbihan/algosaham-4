# AlgoSaham - Stock Strategy Backtesting Platform

A comprehensive stock strategy backtesting platform built with modern web technologies. Create, test, and analyze trading strategies with real-time data visualization and performance analytics.

## 🚀 Tech Stack

### Frontend & Framework
- **[Next.js 14+](https://nextjs.org)** - React framework with App Router
- **[TradingView Charting Library](https://www.tradingview.com/charting-library-docs/)** - Professional-grade financial charts
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety and developer experience
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework

### Backend & Database
- **[PostgreSQL](https://www.postgresql.org/)** - Relational database for storing strategies, backtests, and user data
- **[Railway](https://railway.app/)** - Platform for hosting Next.js app and PostgreSQL database

### Authentication & Security
- **[Clerk](https://clerk.com/)** - User authentication and management
- **[Cloudflare](https://www.cloudflare.com/)** - CDN, DNS management, DDoS protection, and SSL/TLS encryption

### Analytics & Monitoring
- **[PostHog](https://posthog.com/)** - Product analytics and feature flags (integration in progress)

## ✨ Features

- **Strategy Builder**: Create and configure stock trading strategies with fundamental and technical indicators
- **Real-time Backtesting**: Run backtests with historical data and see immediate results
- **Performance Analytics**: View detailed performance metrics, equity curves, and monthly heatmaps
- **Trade History**: Analyze individual trades with entry/exit points and P&L tracking
- **Risk Management**: Configure stop-loss, take-profit, and position sizing parameters
- **User Authentication**: Secure login and user session management with Clerk
- **Interactive Charts**: Professional TradingView charts with technical indicators
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database (local or Railway-hosted)
- Clerk account for authentication
- TradingView Charting Library license (for production)

### Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```bash
# Database
DATABASE_URL="postgresql://user:password@host:port/database"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# API Configuration
NEXT_PUBLIC_API_URL=https://your-api-url.com
FASTAPI_URL=https://your-api-url.com

# PostHog Analytics (Optional)
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Cloudflare (managed via dashboard)
```

### Installation

```bash
# Install dependencies
npm install

# Set up database (if using migrations)
npm run db:migrate

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 🗄️ Database Schema

The PostgreSQL database stores:
- User profiles and authentication data (via Clerk)
- Trading strategies and configurations
- Backtest results and performance metrics
- Trade history and analytics data

## 🔐 Authentication Flow

1. Users sign up/sign in via Clerk
2. Clerk manages user sessions and JWTs
3. Protected routes are secured via Clerk middleware
4. User data is stored in PostgreSQL with Clerk user IDs as foreign keys

## 📊 Analytics Integration

PostHog analytics tracks:
- User interactions and feature usage
- Strategy creation and backtest runs
- Performance metrics and conversions
- A/B testing and feature flags

## 🌐 Cloudflare Integration

Cloudflare provides:
- **CDN**: Fast content delivery worldwide
- **DNS Management**: Domain name resolution
- **DDoS Protection**: Security against attacks
- **SSL/TLS**: Encrypted connections
- **WAF**: Web application firewall
- **Caching**: Improved performance and reduced server load

## 🚢 Deployment

### Railway Deployment

The application is deployed on Railway with:

1. **Next.js App**: Automatically builds and deploys from Git
2. **PostgreSQL Database**: Managed database instance with automatic backups
3. **Environment Variables**: Configured in Railway dashboard

To deploy:

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login to Railway
railway login

# Link to your project
railway link

# Deploy
railway up
```

### Domain Configuration

1. Configure your domain in Railway
2. Update Cloudflare DNS to point to Railway
3. Enable Cloudflare proxy for CDN benefits

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Railway Documentation](https://docs.railway.app/)
- [Clerk Documentation](https://clerk.com/docs)
- [TradingView Charting Library Docs](https://www.tradingview.com/charting-library-docs/)
- [PostHog Documentation](https://posthog.com/docs)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.
