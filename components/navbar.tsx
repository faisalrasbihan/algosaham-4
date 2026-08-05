"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { Gift, Zap, Heart, Search, LineChart, ArrowUpRight, Loader2, Settings, Menu, Lightbulb } from "lucide-react";
import { AccountManagementPage } from "@/components/account-management-page";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { usePathname, useRouter } from "next/navigation";
import { NavbarBrand } from "@/components/navbar-brand";
import { pageContainerClassName } from "@/components/page-layout";
import { cn } from "@/lib/utils";

import { useUserTier } from "@/context/user-tier-context";
import { getTierDisplayName } from "@/lib/subscription-plans";

const primaryNavigation = [
  { href: "/screener", label: "Screener" },
  { href: "/analyze-v2", label: "Analisis" },
  { href: "/backtest", label: "Simulasi" },
  { href: "/harga", label: "Harga" },
  { href: "/features", label: "Pelajari" },
  { href: "/portfolio", label: "Portfolio" },
] as const;

export function Navbar() {
  const [showCredits, setShowCredits] = useState(false);
  const [showReferralNotice, setShowReferralNotice] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { tier, credits, limits, usage, isLoading, isRefreshing, refreshTier, subscriptionPeriodEnd } = useUserTier();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const routesToPrefetch = [
      "/",
      "/screener",
      "/analyze-v2",
      "/backtest",
      "/portfolio",
      "/harga",
      "/features",
      "/help",
    ];

    routesToPrefetch.forEach((route) => {
      router.prefetch(route);
    });
  }, [router]);

  const userPlan = getTierDisplayName(tier).toUpperCase();

  const isActiveRoute = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  // Tier colors — coherent color scheme with consistent saturation
  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'admin':
        return {
          badgeBg: '#18181b',
          badgeText: '#ffffff',
          badgeBorder: 'transparent',
          bg: '#1a1a1e',
          text: '#e4e4e7',
          border: 'rgba(24, 24, 27, 0.3)',
          gradient: 'linear-gradient(135deg, #27272a, #18181b)',
          iconBg: 'rgba(255, 255, 255, 0.1)'
        };
      case 'suhu':
        return {
          badgeBg: '#487b78',
          badgeText: '#ffffff',
          badgeBorder: 'transparent',
          bg: '#eff4f4',
          text: '#3b6663',
          border: 'rgba(72, 123, 120, 0.2)',
          gradient: 'linear-gradient(135deg, #eff4f4, #f5f8f8)',
          iconBg: 'rgba(72, 123, 120, 0.15)'
        };
      case 'bandar':
        return {
          badgeBg: '#d4af37',
          badgeText: '#ffffff',
          badgeBorder: 'transparent',
          bg: '#fdf8ea',
          text: '#b08d24',
          border: 'rgba(212, 175, 55, 0.2)',
          gradient: 'linear-gradient(135deg, #fdf8ea, #fefcf5)',
          iconBg: 'rgba(212, 175, 55, 0.15)'
        };
      default: // ritel
        return {
          badgeBg: '#71717a',
          badgeText: '#ffffff',
          badgeBorder: 'transparent',
          bg: '#f4f4f5',
          text: '#52525b',
          border: 'rgba(113, 113, 122, 0.2)',
          gradient: 'linear-gradient(135deg, #f4f4f5, #fafafa)',
          iconBg: 'rgba(113, 113, 122, 0.15)'
        };
    }
  };

  const tierColors = getTierColor(tier);

  const getProgressColor = () => {
    return '#d07225';
  };

  return (
    <nav className="sticky top-0 z-50 py-3">
      <div className={pageContainerClassName}>
        <div className="-mx-1 flex h-16 items-center rounded-2xl border border-black/[0.07] bg-white/[0.88] px-1 shadow-[0_10px_30px_rgba(34,26,17,0.07)] backdrop-blur-xl transform-gpu [backface-visibility:hidden] supports-[backdrop-filter]:bg-white/[0.78] sm:-mx-3 sm:px-3 lg:-mx-4 lg:px-4">
      <NavbarBrand className="justify-self-start" />

      <div className="ml-8 hidden items-center gap-1 text-sm text-muted-foreground lg:flex">
        {primaryNavigation.map((item) => {
          const active = isActiveRoute(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative px-2.5 py-2 font-medium transition-colors duration-150 hover:text-foreground",
                item.href === "/portfolio" &&
                  "ml-2 pl-4 text-foreground/90 before:absolute before:left-0 before:top-1/2 before:h-4 before:w-px before:-translate-y-1/2 before:bg-black/[0.10]",
                active && "text-foreground after:absolute after:inset-x-2.5 after:-bottom-0.5 after:h-px after:bg-[#d07225]",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div >

      <div className="ml-auto flex items-center gap-1.5">
        <div className="relative hidden lg:block">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Referral"
            aria-expanded={showReferralNotice}
            title="Referral"
            className="h-9 w-9 rounded-lg text-muted-foreground hover:bg-black/[0.04] hover:text-foreground"
            onClick={() => setShowReferralNotice((current) => !current)}
            onBlur={() => setShowReferralNotice(false)}
          >
            <Gift className="h-[18px] w-[18px]" />
          </Button>
          {showReferralNotice ? (
            <div className="absolute right-0 top-full z-[100] mt-2 whitespace-nowrap rounded-lg border border-black/[0.07] bg-white px-3 py-2 text-xs font-medium text-muted-foreground shadow-lg">
              Referral segera hadir
            </div>
          ) : null}
        </div>
        <Link href="/help" className="hidden lg:block">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Feedback"
            title="Feedback"
            className="h-9 w-9 rounded-lg text-muted-foreground hover:bg-black/[0.04] hover:text-foreground"
          >
            <Lightbulb className="h-[18px] w-[18px]" />
          </Button>
        </Link>
        <SignedIn>
          {!isLoading && (
            <div
              className="relative hidden lg:block"
              onMouseEnter={() => {
                setShowCredits(true);
                if (!isRefreshing) {
                  refreshTier();
                }
              }}
              onMouseLeave={() => setShowCredits(false)}
              onFocus={() => setShowCredits(true)}
              onBlur={() => setShowCredits(false)}
            >
              <button
                type="button"
                className="cursor-default select-none rounded-[3px] px-3 py-1 text-[11px] font-semibold tracking-[0.1em] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d07225]/30"
                style={{
                  backgroundColor: tierColors.badgeBg,
                  color: tierColors.badgeText,
                  border: `1px solid ${tierColors.badgeBorder}`,
                  fontFamily: "'IBM Plex Mono', monospace",
                }}
                aria-label={`${userPlan} plan usage`}
                aria-expanded={showCredits}
              >
                {userPlan}
              </button>

              {/* Credit tooltip with hover bridge */}
              {showCredits && (
                <>
                  {/* Invisible bridge to keep hover alive across the gap */}
                  <div className="absolute top-full right-0 w-full h-3" />

                  <div
                    className="absolute top-full right-0 pt-2 z-[100]"
                    style={{ width: '280px' }}
                  >
                    <div
                      className="rounded-xl border border-border/60 bg-white overflow-hidden"
                      style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)' }}
                    >
                      {/* Header with subtle colors */}
                      <div
                        className="px-4 py-3 flex items-center justify-between border-b"
                        style={{ background: tierColors.gradient, borderColor: tierColors.border }}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center backdrop-blur-sm"
                            style={{ backgroundColor: tierColors.iconBg }}
                          >
                            <Zap className="w-3.5 h-3.5" style={{ color: tierColors.text }} />
                          </div>
                          <span
                            className="text-sm font-semibold tracking-wide"
                            style={{ color: tierColors.text }}
                          >
                            {userPlan} PLAN
                          </span>
                        </div>
                      </div>

                      {/* Quota items */}
                      {(isLoading || isRefreshing) ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                      ) : (
                        <div className="p-4 space-y-4">
                          {/* Backtest */}
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-1.5">
                                <Zap className="w-3.5 h-3.5 text-muted-foreground/70" />
                                <span className="text-xs font-medium text-foreground/80">Backtests</span>
                              </div>
                              <span className="text-xs font-semibold font-mono text-foreground">
                                {credits.total === 9999 ? '∞' : `${credits.used} / ${credits.total}`}
                              </span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500 ease-out"
                                style={{
                                  width: credits.total === 9999 ? '100%' : `${Math.min((credits.used / credits.total) * 100, 100)}%`,
                                  backgroundColor: getProgressColor(),
                                }}
                              />
                            </div>
                            <span className="text-[10px] text-muted-foreground/60 mt-0.5 block">Resets daily</span>
                          </div>

                          {/* Subscriptions */}
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-1.5">
                                <Heart className="w-3.5 h-3.5 text-muted-foreground/70" />
                                <span className="text-xs font-medium text-foreground/80">Subscriptions</span>
                              </div>
                              <span className="text-xs font-semibold font-mono text-foreground">
                                {limits.subscriptions === -1 ? '∞' : `${usage.subscriptions} / ${limits.subscriptions}`}
                              </span>
                            </div>
                            {limits.subscriptions !== -1 && (
                              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-500 ease-out"
                                  style={{
                                    width: `${Math.min((usage.subscriptions / limits.subscriptions) * 100, 100)}%`,
                                    backgroundColor: getProgressColor(),
                                  }}
                                />
                              </div>
                            )}
                          </div>

                          {/* Screening */}
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-1.5">
                                <Search className="w-3.5 h-3.5 text-muted-foreground/70" />
                                <span className="text-xs font-medium text-foreground/80">Screening</span>
                              </div>
                              <span className="text-xs font-semibold font-mono text-foreground">
                                {limits.screening === -1 ? '∞' : `${usage.screening} / ${limits.screening}`}
                              </span>
                            </div>
                            {limits.screening !== -1 && (
                              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-500 ease-out"
                                  style={{
                                    width: `${Math.min((usage.screening / limits.screening) * 100, 100)}%`,
                                    backgroundColor: getProgressColor(),
                                  }}
                                />
                              </div>
                            )}
                            <span className="text-[10px] text-muted-foreground/60 mt-0.5 block">Resets daily</span>
                          </div>

                          {/* Analysis */}
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-1.5">
                                <LineChart className="w-3.5 h-3.5 text-muted-foreground/70" />
                                <span className="text-xs font-medium text-foreground/80">Analisis</span>
                              </div>
                              <span className="text-xs font-semibold font-mono text-foreground">
                                {limits.analyze === -1 ? '∞' : `${usage.analyze} / ${limits.analyze}`}
                              </span>
                            </div>
                            {limits.analyze !== -1 && (
                              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-500 ease-out"
                                  style={{
                                    width: `${Math.min((usage.analyze / limits.analyze) * 100, 100)}%`,
                                    backgroundColor: getProgressColor(),
                                  }}
                                />
                              </div>
                            )}
                          </div>

                          {/* Expiry Date */}
                          {subscriptionPeriodEnd && tier !== 'ritel' && tier !== 'admin' && (
                            <div className="pt-3 border-t border-border/50">
                              <span className="text-[11px] text-muted-foreground block text-center">
                                Berlaku hingga <span className="font-medium text-foreground">{new Date(subscriptionPeriodEnd).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Upgrade button for non-bandar */}
                      {(tier === 'ritel' || tier === 'suhu') && (
                        <div className="px-4 pb-4">
                          <Link href="/harga" className="block">
                            <Button
                              size="sm"
                              className="w-full text-white font-medium hover:opacity-90 transition-all duration-200 group"
                              style={{ backgroundColor: "#d07225" }}
                            >
                              Upgrade Plan
                              <ArrowUpRight className="w-3.5 h-3.5 ml-1.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </SignedIn>
        <SignedOut>
          <div className="hidden items-center gap-2 lg:flex">
            <SignInButton mode="modal">
              <Button variant="ghost" size="sm" className="hover:bg-black/[0.04]">
                Masuk
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button size="sm" style={{ backgroundColor: "#d07225", color: "white" }} className="hover:opacity-90">
                Daftar
              </Button>
            </SignUpButton>
          </div>
        </SignedOut>
        <SignedIn>
          <div className="ml-1.5 flex items-center">
            <UserButton>
              <UserButton.UserProfilePage
                label="Subscriptions"
                url="account"
                labelIcon={<Settings size={16} />}
              >
                <AccountManagementPage />
              </UserButton.UserProfilePage>
            </UserButton>
          </div>
        </SignedIn>

        {/* Mobile Burger Menu */}
        <div className="ml-1 flex items-center lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-md p-0 hover:bg-muted"
            aria-label="Menu"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5 text-foreground" />
          </Button>
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetContent side="right" className="w-[85vw] sm:w-[350px] p-6 flex flex-col gap-6">
              <SheetHeader className="text-left mt-2 border-b border-border/50 pb-4">
                <SheetTitle>
                  <NavbarBrand />
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-1.5">
                {primaryNavigation.map((item) => {
                  const active = isActiveRoute(item.href);

                  return (
                    <SheetClose asChild key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "rounded-md px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-muted hover:text-[#d07225]",
                          item.href === "/portfolio" && "mt-1 border-t border-border/60 pt-4 text-foreground",
                          active && "bg-muted text-[#b85f19]",
                        )}
                      >
                        {item.label}
                      </Link>
                    </SheetClose>
                  );
                })}
                <div
                  className="flex items-center gap-3 rounded-md px-3 py-3 text-base font-medium text-muted-foreground"
                  aria-label="Referral segera hadir"
                >
                  <Gift className="h-4 w-4" />
                  Referral <span className="ml-auto text-xs font-normal">Segera hadir</span>
                </div>
                <SheetClose asChild>
                  <Link href="/help" className="flex items-center gap-3 rounded-md px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-muted hover:text-[#d07225]">
                    <Lightbulb className="h-4 w-4" />
                    Feedback
                  </Link>
                </SheetClose>
              </div>
              <SignedOut>
                <div className="flex flex-col gap-3 mt-2 border-t border-border/50 pt-6">
                  <SignInButton mode="modal">
                    <Button variant="outline" className="h-10 w-full justify-center">Masuk</Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <Button className="h-10 w-full justify-center">Daftar</Button>
                  </SignUpButton>
                </div>
              </SignedOut>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      </div>
      </div>
    </nav>
  );
}
