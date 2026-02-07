# AlgoSaham Codebase Review

## Project Overview

AlgoSaham is an AI-powered stock strategy backtesting platform for the Indonesian stock market. Users create trading strategies using technical/fundamental indicators, backtest them against historical data, subscribe to top strategies, and view trade analytics.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Drizzle ORM, PostgreSQL, Clerk auth, Midtrans payments, lightweight-charts, deployed on Railway with Cloudflare CDN.

---

## Critical Findings

### 1. Payment Webhook Handlers Are Stub Code — Payments Never Fulfilled

**Severity: CRITICAL** | `app/api/subscriptions/webhook/route.ts:221-350`

Every webhook handler (`handleSuccessfulPayment`, `handleFailedPayment`, `handleRefund`, `handleSubscriptionNotification`) contains only `console.log` and `// TODO` comments. No database writes occur. The system accepts Midtrans payments but never:
- Records successful payments
- Upgrades user plans
- Tracks failed payments
- Processes refunds

Additionally, the catch block (line 203-207) swallows errors and returns HTTP 200, so Midtrans will not retry failed notifications.

### 2. Drizzle Config Excludes Subscription Schema

**Severity: CRITICAL** | `drizzle.config.ts:4`

```typescript
schema: "./db/schema.ts",  // missing schema-subscriptions.ts
```

The subscription schema (`db/schema-subscriptions.ts`) defining `gopayAccounts`, `paymentSubscriptions`, and `paymentTransactions` is not included. Drizzle migrations will never create these tables. The DB instance in `db/index.ts:3` also only imports `schema.ts`, so Drizzle's relational query builder cannot access payment tables.

### 3. Default-Open Authentication Policy

**Severity: CRITICAL** | `middleware.ts:30-39`

Routes not in either `isPublicRoute` or `isProtectedRoute` receive no auth check:

```typescript
if (isPublicRoute(req)) return;           // skip auth
if (isProtectedRoute(req)) auth.protect(); // enforce auth
// everything else: no auth
```

Any new API route added without updating the middleware is silently unprotected. This should be default-deny.

### 4. GoPay Callback Auth Conflict / IDOR

**Severity: CRITICAL** | `app/api/subscriptions/gopay/callback/route.ts`

The callback endpoint takes `userId` from a query parameter with no verification against the authenticated session. The middleware protects `/api/subscriptions/gopay(.*)`, but this endpoint is designed to be hit by GoPay redirect — creating a conflict where either the callback fails (session expired) or is exploitable (any user can manipulate `userId`).

### 5. `strategy/save` Has No Runtime Input Validation

**Severity: HIGH** | `app/api/strategies/save/route.ts:20-25`

The request body is cast with TypeScript `as` (compile-time only — no runtime validation). The `config` object, indicator data, `name`, and `description` are stored directly to the database without any Zod validation or length limits.

---

## Security Issues

### API Layer

| Issue | Severity | Location |
|-------|----------|----------|
| No rate limiting on any route | HIGH | All API routes |
| `/api/backtest` is unauthenticated and triggers expensive backend computation | HIGH | `app/api/backtest/route.ts` |
| SSRF risk: `accountId` not validated before building Midtrans URL | HIGH | `gopay/callback/route.ts`, `gopay/status/route.ts` |
| IDOR: any authenticated user can query any GoPay account status | MEDIUM | `gopay/status/route.ts` |
| Raw `error.message` forwarded to clients across 5+ routes | MEDIUM | Multiple API routes |
| `.passthrough()` on Zod schema defeats validation for indicator objects | MEDIUM | `app/api/backtest/route.ts:31` |
| `MIDTRANS_SERVER_KEY` defaults to empty string — webhook signature check bypassable | HIGH | `lib/midtrans.ts:3` |
| PII (phone numbers) logged in plaintext | MEDIUM | `lib/midtrans.ts:136-141` |
| Full Midtrans API responses logged including tokens | MEDIUM | `lib/midtrans.ts:155-159` |
| No security headers configured (CSP, HSTS, X-Frame-Options, etc.) | MEDIUM | `next.config.mjs` |

### Database

| Issue | Severity | Location |
|-------|----------|----------|
| `subscriptions.userId` is `bigint` but should be `text` for Clerk IDs | HIGH | `db/schema.ts:75` |
| `notifications.userId` same problem | HIGH | `db/schema.ts:89` |
| No indexes on any foreign key column | MEDIUM | `db/schema.ts` (multiple) |
| Missing unique constraint on `fundamentals(stock_id, date)` | MEDIUM | `db/schema.ts:44-62` |
| No `ON DELETE CASCADE` on any foreign key reference | MEDIUM | `db/schema.ts` (multiple) |
| `updatedAt` columns only set on INSERT, not UPDATE | LOW | `db/schema-subscriptions.ts:48,83,113` |
| `gopayAccounts.metadata` stored as `text` instead of `jsonb` | LOW | `db/schema-subscriptions.ts:44` |
| `strategies.creatorId` defaults to magic value `"0"` | LOW | `db/schema.ts:18` |
| No `updatedAt` on core domain tables | LOW | `db/schema.ts` |

### Payment Integration

| Issue | Severity | Location |
|-------|----------|----------|
| Midtrans production mode activates on `NODE_ENV=production` (risky for staging) | HIGH | `lib/midtrans.ts:6` |
| No request timeouts on any Midtrans API call | MEDIUM | `lib/midtrans.ts` (10+ fetch calls) |
| Hardcoded pricing in webhook handler disconnected from source of truth | LOW | `webhook/route.ts:70-71` |

---

## Code Quality Issues

### Dead Code

| Issue | Location | Impact |
|-------|----------|--------|
| `strategy-builder.tsx` (1005 lines) is never imported anywhere | `components/strategy-builder.tsx` | ~1000 lines of dead code |
| `hasVisited` state and commented-out tutorial overlay | `backtest-strategy-builder.tsx:132,799-801` | Dead state variable |
| Unnecessary `@ts-ignore` on valid type | `backtest-strategy-builder.tsx:893` | Misleading suppression |
| `handleTutorialStart` sets state for commented-out feature | `backtest-strategy-builder.tsx:788` | Dead code |
| `app/api/backtest-alt/` empty directory | `app/api/backtest-alt/` | Clutter |

### Code Duplication

| Duplicated Pattern | Files | Lines Wasted |
|-------------------|-------|--------------|
| Indicator rendering blocks | `backtest-strategy-builder.tsx`, `strategy-builder.tsx` | ~300 lines |
| Indicator name-to-API-type mapping | Both builder files (different implementations) | ~100 lines |
| Card metrics section (drawdown, quality, trades) | 3 card files in `components/cards/` | ~250 lines |
| Info tooltip with hover pattern | Repeated 15x across card files | ~90 lines |
| Quality label logic (Sharpe ratio → text) | 3 card files | ~30 lines |
| `formatPrice` / `formatRupiah` | `payment-method-dialog.tsx:70`, `performance-chart.tsx:21` | ~15 lines |
| `onMouseEnter`/`onMouseLeave` inline style manipulation | Both builder files | ~30 lines |

### Component Complexity

`backtest-strategy-builder.tsx` at 1740 lines is the most complex file:

- **30+ `useState` hooks** managing form state, chat, dialogs, sections, and configuration
- **940 lines of JSX** in a single render function
- **No memoization** — no `useCallback` or `useMemo` anywhere, all callbacks recreated every render
- **Constant arrays** (`marketCapOptions`, `sectorOptions`, `backtestPeriodOptions`) re-declared inside the component on every render
- **Chat `setInterval`** (lines 645-655) updates state every second, re-rendering the entire 1740-line component
- Should be split into 5-7 components: `StockFiltersCard`, `IndicatorEditor`, `BacktestPeriodCard`, `RiskManagementCard`, `AgentChatPanel`, `SaveStrategyDialog`, `LoginPromptDialog`

### Accessibility

| Issue | Location |
|-------|----------|
| Collapsible section headers use `<div>` with `onClick` — missing `role="button"`, keyboard support | `backtest-strategy-builder.tsx:961-974` |
| Custom dropdown menus lack ARIA attributes, keyboard navigation, focus trapping | `backtest-strategy-builder.tsx:1013-1161` |
| Custom checkbox `<div>` elements lack `role="checkbox"`, `aria-checked` | `backtest-strategy-builder.tsx:1068-1075` |
| Chart tooltip created via DOM — no `role="tooltip"` or ARIA | `performance-chart.tsx:149-165` |

### Data Integrity

| Issue | Location |
|-------|----------|
| `generateHeatmapData` returns random values on every mount | `components/cards/utils.ts:26-36` |
| `generateSparklineData` shape is arbitrary, not based on actual data | `components/cards/utils.ts:1-24` |
| Hardcoded `initialCapital = 100000000` in chart tooltip ignores user config | `performance-chart.tsx:186` |

### Logging

The codebase has excessive, unconditional `console.log` statements:
- `lib/api.ts`: 20+ logs per request (headers, body samples, stack traces)
- `performance-chart.tsx`: 15+ emoji-prefixed logs
- `strategy-builder.tsx`: 15+ debug logs
- `lib/midtrans.ts`: Logs PII and payment tokens
- Most API routes: Raw error objects logged

Only `app/api/backtest/route.ts` uses environment-gated logging.

---

## Architecture Observations

### What Works Well

- **Clerk integration** is properly configured with middleware-based route protection for the routes it covers
- **Drizzle ORM** provides type-safe database access with proper parameterization (no SQL injection risk)
- **Zod validation** on the backtest route is well-structured (aside from `.passthrough()`)
- **API proxy pattern** — Next.js routes proxying to a FastAPI backend is a clean separation
- **Midtrans webhook signature verification** using HMAC SHA-512 is correctly implemented

### What Needs Improvement

1. **Missing test suite** — No unit, integration, or E2E tests exist anywhere in the codebase
2. **No CI/CD pipeline** — No GitHub Actions, pre-commit hooks, or automated quality gates
3. **No `.env.example`** — Required environment variables are scattered across 6+ files with no documentation
4. **N+1 query in strategies list** — `app/api/strategies/list/route.ts` runs a separate DB query per strategy for indicators
5. **Database connection pool `max: 1`** — `db/index.ts:12` limits concurrency; all requests queue behind slow queries
6. **`makeRequest` vs `runBacktest` duplication** — `lib/api.ts` has a generic request method that `runBacktest` does not use
7. **30 unused npm packages** (~2.5MB) identified in existing analysis

---

## Recommended Priority Actions

### P0 — Fix Before Production

1. Implement the webhook database persistence — payments are accepted but never fulfilled
2. Add subscription schema to Drizzle config and DB instance
3. Switch middleware to default-deny authentication
4. Add Zod validation to `strategies/save` endpoint
5. Guard against empty `MIDTRANS_SERVER_KEY`
6. Fix `subscriptions.userId` data type from `bigint` to `text`

### P1 — Security Hardening

7. Add rate limiting (at minimum to `/api/backtest` and `/api/subscriptions/create`)
8. Validate `accountId` format to prevent SSRF in Midtrans calls
9. Add IDOR check on GoPay status endpoint
10. Stop forwarding raw error messages to API clients
11. Add security headers in `next.config.mjs`
12. Remove PII from logs, add environment-gated logging

### P2 — Code Quality

13. Delete `strategy-builder.tsx` (dead code)
14. Decompose `backtest-strategy-builder.tsx` into smaller components
15. Extract shared card metrics into reusable components
16. Centralize indicator mapping logic
17. Add `useCallback`/`useMemo` for performance-critical paths
18. Add database indexes on foreign key columns
19. Add request timeouts to all fetch calls

### P3 — Infrastructure

20. Add a test suite (at least for API routes and payment logic)
21. Set up CI/CD with linting and type checking
22. Create `.env.example` with all required variables documented
23. Clean up unused npm packages
24. Add `ON DELETE CASCADE` to foreign keys
