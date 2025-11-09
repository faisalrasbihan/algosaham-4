"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Gift, ArrowUpRight } from "lucide-react";
import { useState, useEffect } from "react";

// Mock data - replace with actual API call
const getSubscriptionData = () => {
  // In a real app, this would fetch from your API
  return {
    subscribedStrategies: 2,
    maxStrategies: 5,
  };
};

export function Navbar() {
  const { isSignedIn, isLoaded } = useUser();
  const [subscriptionData, setSubscriptionData] = useState({
    subscribedStrategies: 0,
    maxStrategies: 0,
  });

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      // Fetch subscription data when user is signed in
      const data = getSubscriptionData();
      setSubscriptionData(data);
    }
  }, [isSignedIn, isLoaded]);

  return (
    <nav className="h-16 bg-card/50 backdrop-blur-sm border-b border-border px-6 flex items-center justify-between">
      <Link href="/" className="text-xl font-medium font-ibm-plex-mono">
        <span className="text-orange-500">{">"}</span>
        <span className="text-black">algosaham.ai</span>
      </Link>

      <div className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/" className="px-3 py-2 rounded-lg hover:bg-muted hover:text-foreground transition-all duration-200 ease-in-out">
          Home
        </Link>
        <Link href="/backtest" className="px-3 py-2 rounded-lg hover:bg-muted hover:text-foreground transition-all duration-200 ease-in-out">
          Backtest
        </Link>
        <Link href="/strategies" className="px-3 py-2 rounded-lg hover:bg-muted hover:text-foreground transition-all duration-200 ease-in-out">
          Strategies
        </Link>
        <SignedIn>
          <Link href="/portfolio" className="px-3 py-2 rounded-lg hover:bg-muted hover:text-foreground transition-all duration-200 ease-in-out">
            Portfolio
          </Link>
        </SignedIn>
        <Link href="/pricing" className="px-3 py-2 rounded-lg hover:bg-muted hover:text-foreground transition-all duration-200 ease-in-out">
          Pricing
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
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="bg-white hover:bg-muted rounded-lg px-3 py-2 text-sm font-medium text-black border border-gray-200"
              >
                <ArrowUpRight className="w-4 h-4 mr-1.5" />
                {subscriptionData.subscribedStrategies} / {subscriptionData.maxStrategies}
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Credit Balance</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Gifted credits</span>
                      <span className="font-medium">0.00</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Monthly credits</span>
                      <span className="font-medium">5.00</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Purchased credits</span>
                      <span className="font-medium">0.00</span>
                    </div>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <div className="space-y-2 text-sm mb-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Subscribed strategies</span>
                      <span className="font-medium">{subscriptionData.subscribedStrategies}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Max strategies</span>
                      <span className="font-medium">{subscriptionData.maxStrategies}</span>
                    </div>
                  </div>
                  <Link href="/pricing" className="block">
                    <Button
                      className="w-full bg-black text-white hover:opacity-90 rounded-lg"
                      size="sm"
                    >
                      Upgrade
                    </Button>
                  </Link>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
          <Button
            variant="outline"
            size="sm"
            className="bg-white hover:bg-muted rounded-lg px-3 py-2 text-sm font-medium text-black border border-gray-200"
            onClick={() => {
              // Handle refer action
              // You can add a refer modal or navigate to a refer page
            }}
          >
            <Gift className="w-4 h-4 mr-1.5" />
            Refer
          </Button>
          <UserButton />
        </SignedIn>
      </div>
    </nav>
  );
}
