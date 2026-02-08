"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";


export function Navbar() {
  const { isSignedIn, isLoaded } = useUser();
  const [showCredits, setShowCredits] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState({
    isPro: false, // Default to free tier
    credits: {
      used: 0,
      total: 0,
    },
  });

  useEffect(() => {
    async function fetchUserTier() {
      if (!isSignedIn) return;

      try {
        const response = await fetch('/api/user/tier');
        if (response.ok) {
          const data = await response.json();
          const tier = data.tier || 'free';

          setSubscriptionData({
            isPro: tier === 'pro' || tier === 'bandar',
            credits: {
              used: 0, // TODO: Implement credit tracking
              total: tier === 'pro' || tier === 'bandar' ? 1000 : 100,
            },
          });
        }
      } catch (error) {
        console.error('Failed to fetch user tier:', error);
        // Keep default free tier on error
      }
    }

    if (isLoaded && isSignedIn) {
      fetchUserTier();
    }
  }, [isSignedIn, isLoaded]);

  const userPlan = subscriptionData.isPro ? "PRO" : "FREE";
  const credits = subscriptionData.credits;

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
          <div className="relative" onMouseEnter={() => setShowCredits(true)} onMouseLeave={() => setShowCredits(false)}>
            <div
              className="px-3 py-1.5 rounded-md border text-xs font-medium cursor-default !font-ibm-plex-mono"
              style={{
                borderColor: userPlan === "PRO" ? "#d4af37" : "#6b7280",
                backgroundColor: userPlan === "PRO" ? "#d4af3710" : "#f3f4f610",
                color: userPlan === "PRO" ? "#d4af37" : "#6b7280",
              }}
            >
              {userPlan} PLAN
            </div>
            {/* Credit tooltip */}
            {showCredits && (
              <div className="absolute top-full right-0 mt-2 w-48 p-3 rounded-lg border border-border bg-white shadow-lg z-[100]">
                <div className="text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Used Credit:</span>
                    <span className="font-medium">{credits.used}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Available:</span>
                    <span className="font-medium">{credits.total - credits.used}</span>
                  </div>
                  <div className="pt-2 border-t border-border flex justify-between">
                    <span className="text-muted-foreground">Total Credit:</span>
                    <span className="font-semibold">{credits.total}</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${(credits.used / credits.total) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          <Link href="/portfolio" className="text-sm font-medium hover:text-primary transition-colors mx-6">
            Portfolio
          </Link>
          <UserButton />
        </SignedIn>
      </div>
    </nav>
  );
}
