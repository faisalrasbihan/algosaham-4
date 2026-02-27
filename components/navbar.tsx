"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import { useState } from "react";
import { WalletCards, Zap, Heart, BookMarked, ArrowUpRight, Loader2, Settings, Menu } from "lucide-react";
import { AccountManagementPage } from "@/components/account-management-page";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";

import { useUserTier } from "@/context/user-tier-context";

export function Navbar() {
  const { isSignedIn } = useUser();
  const [showCredits, setShowCredits] = useState(false);
  const { tier, credits, limits, usage, isLoading, isRefreshing, refreshTier, subscriptionPeriodEnd } = useUserTier();

  // Display tier name in uppercase
  const userPlan = tier.toUpperCase();

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
    <nav className="h-16 bg-card/50 backdrop-blur-sm border-b border-border px-6 flex items-center justify-between relative z-50">
      <Link href="/" className="text-xl font-medium font-ibm-plex-mono flex items-center gap-2">
        <div className="relative w-8 h-8">
          <Image
            src="/icons/logo.svg"
            alt="Algosaham Logo"
            fill
            className="object-contain"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-black">algosaham.ai</span>
          <span className="px-1.5 py-0.5 rounded-md bg-[#d07225]/10 border border-[#d07225]/20 text-[#d07225] text-xs font-bold leading-none tracking-wider">
            BETA
          </span>
        </div>
      </Link>

      <div className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/" className="px-3 py-2 rounded-lg hover:bg-muted hover:text-foreground transition-all duration-200 ease-in-out">
          Home
        </Link>
        <Link href="/backtest" className="px-3 py-2 rounded-lg hover:bg-muted hover:text-foreground transition-all duration-200 ease-in-out">
          Simulasi
        </Link>
        <Link href="/strategies" className="px-3 py-2 rounded-lg hover:bg-muted hover:text-foreground transition-all duration-200 ease-in-out">
          Strategi
        </Link>
        <Link href="/screener" className="px-3 py-2 rounded-lg hover:bg-muted hover:text-foreground transition-all duration-200 ease-in-out">
          Screener
        </Link>
        <a href="/analyze-v2" className="px-3 py-2 rounded-lg hover:bg-muted hover:text-foreground transition-all duration-200 ease-in-out">
          Analisis
        </a>
        {/* <SignedIn>
          <Link href="/portfolio" className="px-3 py-2 rounded-lg hover:bg-muted hover:text-foreground transition-all duration-200 ease-in-out">
            Portfolio
          </Link>
        </SignedIn> */}
        <Link href="/harga" className="px-3 py-2 rounded-lg hover:bg-muted hover:text-foreground transition-all duration-200 ease-in-out">
          Harga
        </Link>
        <Link href="/about" className="px-3 py-2 rounded-lg hover:bg-muted hover:text-foreground transition-all duration-200 ease-in-out">
          Pelajari
        </Link>
        <SignedIn>
          {!isLoading && (
            <div className="relative" onMouseEnter={() => { setShowCredits(true); refreshTier(); }} onMouseLeave={() => setShowCredits(false)}>
              <div
                className="px-3 py-1 text-[11px] font-semibold cursor-default transition-all duration-200 select-none"
                style={{
                  backgroundColor: tierColors.badgeBg,
                  color: tierColors.badgeText,
                  border: `1px solid ${tierColors.badgeBorder}`,
                  fontFamily: "'IBM Plex Mono', monospace",
                  borderRadius: '3px',
                  letterSpacing: '0.1em',
                }}
              >
                {userPlan}
              </div>

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

                          {/* Saved Strategies */}
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-1.5">
                                <BookMarked className="w-3.5 h-3.5 text-muted-foreground/70" />
                                <span className="text-xs font-medium text-foreground/80">Saved Strategies</span>
                              </div>
                              <span className="text-xs font-semibold font-mono text-foreground">
                                {limits.savedStrategies === -1 ? '∞' : `${usage.savedStrategies} / ${limits.savedStrategies}`}
                              </span>
                            </div>
                            {limits.savedStrategies !== -1 && (
                              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-500 ease-out"
                                  style={{
                                    width: `${Math.min((usage.savedStrategies / limits.savedStrategies) * 100, 100)}%`,
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
      </div >

      <div className="flex items-center space-x-2 md:space-x-3">
        <SignedOut>
          <div className="hidden md:flex space-x-2">
            <SignInButton mode="modal">
              <Button variant="outline" size="sm" className="hover:bg-[#487b78] hover:text-white">
                Sign In
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button size="sm" style={{ backgroundColor: "#d07225", color: "white" }} className="hover:opacity-90">
                Sign Up
              </Button>
            </SignUpButton>
          </div>
        </SignedOut>
        <SignedIn>
          <div className="hidden md:flex items-center gap-3 mr-3">
            <Link href="/portfolio">
              <button
                className="px-3 py-1.5 rounded-md border flex items-center gap-2 text-sm font-medium transition-colors hover:bg-muted cursor-pointer"
                style={{
                  borderColor: "#e5e7eb",
                  backgroundColor: "rgba(245, 245, 245, 0.5)",
                  color: "#1f2937",
                }}
              >
                <WalletCards size={16} />
                Portfolio
              </button>
            </Link>
          </div>
          <UserButton>
            <UserButton.UserProfilePage
              label="Subscriptions"
              url="account"
              labelIcon={<Settings size={16} />}
            >
              <AccountManagementPage />
            </UserButton.UserProfilePage>
          </UserButton>
        </SignedIn>

        {/* Mobile Burger Menu */}
        <div className="md:hidden flex items-center ml-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 p-0 hover:bg-muted rounded-md" aria-label="Menu">
                <Menu className="h-5 w-5 text-foreground" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] sm:w-[350px] p-6 flex flex-col gap-6">
              <SheetHeader className="text-left mt-2 border-b border-border/50 pb-4">
                <SheetTitle className="font-ibm-plex-mono text-xl tracking-tight text-foreground flex items-center gap-2">
                  <div className="relative w-6 h-6">
                    <Image src="/icons/logo.svg" alt="Logo" fill className="object-contain" />
                  </div>
                  algosaham.ai
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-1.5">
                <SheetClose asChild><Link href="/" className="px-3 py-3 text-base font-medium text-foreground hover:bg-muted hover:text-[#d07225] rounded-md transition-colors">Home</Link></SheetClose>
                <SheetClose asChild><Link href="/backtest" className="px-3 py-3 text-base font-medium text-foreground hover:bg-muted hover:text-[#d07225] rounded-md transition-colors">Simulasi</Link></SheetClose>
                <SheetClose asChild><Link href="/strategies" className="px-3 py-3 text-base font-medium text-foreground hover:bg-muted hover:text-[#d07225] rounded-md transition-colors">Strategi</Link></SheetClose>
                <SheetClose asChild><Link href="/screener" className="px-3 py-3 text-base font-medium text-foreground hover:bg-muted hover:text-[#d07225] rounded-md transition-colors">Screener</Link></SheetClose>
                <SheetClose asChild><Link href="/analyze-v2" className="px-3 py-3 text-base font-medium text-foreground hover:bg-muted hover:text-[#d07225] rounded-md transition-colors">Analisis</Link></SheetClose>
                <SheetClose asChild><Link href="/harga" className="px-3 py-3 text-base font-medium text-foreground hover:bg-muted hover:text-[#d07225] rounded-md transition-colors">Harga</Link></SheetClose>
                <SheetClose asChild><Link href="/about" className="px-3 py-3 text-base font-medium text-foreground hover:bg-muted hover:text-[#d07225] rounded-md transition-colors">Pelajari</Link></SheetClose>
              </div>
              <SignedOut>
                <div className="flex flex-col gap-3 mt-2 border-t border-border/50 pt-6">
                  <SignInButton mode="modal">
                    <Button variant="outline" className="w-full justify-center h-10 border-[#487b78]/20 text-[#3b6663] hover:bg-[#eff4f4]">Sign In</Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <Button className="w-full justify-center h-10 bg-[#d07225] hover:bg-[#a65b1d] text-white">Sign Up</Button>
                  </SignUpButton>
                </div>
              </SignedOut>
              <SignedIn>
                <div className="flex flex-col gap-3 mt-2 border-t border-border/50 pt-6">
                  <SheetClose asChild>
                    <Link href="/portfolio" className="w-full">
                      <Button variant="outline" className="w-full justify-center gap-2 h-10">
                        <WalletCards size={16} />
                        Portfolio
                      </Button>
                    </Link>
                  </SheetClose>
                </div>
              </SignedIn>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav >
  );
}
