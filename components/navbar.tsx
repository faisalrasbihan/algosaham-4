"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import { useState } from "react";
import { WalletCards } from "lucide-react";

import { useUserTier } from "@/context/user-tier-context";

export function Navbar() {
  const { isSignedIn } = useUser();
  const [showCredits, setShowCredits] = useState(false);
  const { tier, credits, limits, usage } = useUserTier();

  // Display tier name in uppercase
  const userPlan = tier.toUpperCase();

  // Tier colors
  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'suhu':
        return { border: '#d4af37', bg: '#d4af3710', text: '#d4af37' }; // Gold
      case 'bandar':
        return { border: '#9333ea', bg: '#9333ea10', text: '#9333ea' }; // Purple
      default: // ritel
        return { border: '#6b7280', bg: '#f3f4f610', text: '#6b7280' }; // Gray
    }
  };

  const tierColors = getTierColor(tier);

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
          <div className="relative" onMouseEnter={() => setShowCredits(true)} onMouseLeave={() => setShowCredits(false)}>
            <div
              className="px-3 py-1.5 rounded-md border text-xs font-medium cursor-default !font-ibm-plex-mono"
              style={{
                borderColor: tierColors.border,
                backgroundColor: tierColors.bg,
                color: tierColors.text,
              }}
            >
              {userPlan}
            </div>
            {/* Credit tooltip */}
            {showCredits && (
              <div className="absolute top-full right-0 mt-2 w-64 p-4 rounded-lg border border-border bg-white shadow-lg z-[100]">
                <div className="text-sm font-semibold mb-3 border-b pb-2">Plan Usage</div>
                <div className="text-xs space-y-3">

                  {/* Backtest Quota */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-muted-foreground">Backtests (Daily)</span>
                      <span className="font-medium">
                        {credits.total === 9999 ? '∞' : `${credits.used} / ${credits.total}`}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: credits.total === 9999 ? '100%' : `${Math.min((credits.used / credits.total) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Subscriptions Quota */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-muted-foreground">Subscriptions</span>
                      <span className="font-medium">
                        {limits.subscriptions === -1 ? '∞' : `${usage.subscriptions} / ${limits.subscriptions}`}
                      </span>
                    </div>
                  </div>

                  {/* Saved Strategies Quota */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-muted-foreground">Saved Strategies</span>
                      <span className="font-medium">
                        {limits.savedStrategies === -1 ? '∞' : `${usage.savedStrategies} / ${limits.savedStrategies}`}
                      </span>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>
        </SignedIn>
      </div>

      <div className="flex items-center space-x-3">
        <SignedOut>
          <SignInButton mode="modal" oauthFlow="popup">
            <Button variant="outline" size="sm" className="hover:bg-[#487b78] hover:text-white">
              Sign In
            </Button>
          </SignInButton>
          <SignUpButton mode="modal" oauthFlow="popup">
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
