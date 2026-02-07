import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/strategies(.*)', // Strategies page is public
  '/backtest(.*)', // Backtest page is public
  '/harga(.*)', // Pricing page is public
  '/about(.*)', // About page is public
  '/syarat-ketentuan(.*)', // Terms page is public
  '/api/webhooks(.*)', // Webhooks need to be public
  '/api/subscriptions/webhook(.*)', // Midtrans webhook
  '/api/strategies/popular(.*)', // Popular strategies is public
  '/api/backtest(.*)', // Backtesting is public
  '/api/stocks(.*)', // Stock data is public
]);

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/portfolio(.*)',
  '/api/strategies/list(.*)', // User's saved strategies requires auth
  '/api/strategies/save(.*)', // Saving strategies requires auth
  '/api/subscriptions/create(.*)',
  '/api/subscriptions/gopay(.*)',
]);


export default clerkMiddleware(async (auth, req) => {
  // Skip authentication for public routes
  if (isPublicRoute(req)) {
    return;
  }

  // Protect routes that require authentication
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
