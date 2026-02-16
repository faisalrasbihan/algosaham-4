"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import { useState } from "react";
import { WalletCards, Zap, Heart, BookMarked, ArrowUpRight, Loader2 } from "lucide-react";

import { useUserTier } from "@/context/user-tier-context";

export function Navbar() {
  const { isSignedIn } = useUser();
  const [showCredits, setShowCredits] = useState(false);
  const { tier, credits, limits, usage, isLoading, refreshTier } = useUserTier();

  // Display tier name in uppercase
  const userPlan = tier.toUpperCase();

  // Tier colors — coherent color scheme with consistent saturation
  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'suhu':
        return {
          bg: '#487b78',
          text: '#ffffff',
          gradient: 'linear-gradient(135deg, #487b78, #5a9e9a)',
        };
      case 'bandar':
        return {
          bg: '#d4af37',
          text: '#ffffff',
          gradient: 'linear-gradient(135deg, #d4af37, #f0c75e)',
        };
      default: // ritel
        return {
          bg: '#71717a',
          text: '#ffffff',
          gradient: 'linear-gradient(135deg, #71717a, #8a8a94)',
        };
    }
  };

  const tierColors = getTierColor(tier);

  // Progress bar color based on usage percentage  
  const getProgressColor = () => {
    return tierColors.bg;
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
        <span className="text-black">algosaham.ai</span>
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
          <div className="relative" onMouseEnter={() => { setShowCredits(true); refreshTier(); }} onMouseLeave={() => setShowCredits(false)}>
            <div
              className="px-3 py-1 text-[11px] font-semibold cursor-default transition-all duration-200 select-none"
              style={{
                backgroundColor: tierColors.bg,
                color: tierColors.text,
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
                    {/* Header with gradient */}
                    <div
                      className="px-4 py-3 flex items-center justify-between"
                      style={{ background: tierColors.gradient }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                          <Zap className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-white tracking-wide">
                          {userPlan} PLAN
                        </span>
                      </div>
                    </div>

                    {/* Quota items */}
                    {isLoading ? (
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
        </SignedIn>
      </div>

      <div className="flex items-center space-x-3">
        <SignedOut>
          <SignInButton mode="modal" >
            <Button variant="outline" size="sm" className="hover:bg-[#487b78] hover:text-white">
              Sign In
            </Button>
          </SignInButton>
          <SignUpButton mode="modal" >
            <Button size="sm" style={{ backgroundColor: "#d07225", color: "white" }} className="hover:opacity-90">
              Sign Up
            </Button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <Link href="/portfolio">
            <button
              className="px-3 py-1.5 rounded-md border flex items-center gap-2 text-sm font-medium transition-colors hover:bg-muted mr-3 cursor-pointer"
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
          <UserButton />
        </SignedIn>
      </div>
    </nav>
  );
}
