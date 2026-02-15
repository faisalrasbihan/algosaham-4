"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useUser } from "@clerk/nextjs";

type UserTier = "ritel" | "suhu" | "bandar";

interface UserLimits {
    backtest: number;
    subscriptions: number;
    savedStrategies: number;
    aiChat: number;
    analyze: number;
}

interface UserUsage {
    backtest: number;
    subscriptions: number;
    savedStrategies: number;
    aiChat: number;
    analyze: number;
}

interface UserTierContextType {
    tier: UserTier;
    // Keeping credits for backward compatibility if needed, but we'll use usage/limits primarily
    credits: {
        used: number;
        total: number;
    };
    limits: UserLimits;
    usage: UserUsage;
    isLoading: boolean;
    refreshTier: () => Promise<void>;
}

const defaultLimits: UserLimits = {
    backtest: 1,
    subscriptions: 0,
    savedStrategies: 1,
    aiChat: 10,
    analyze: 5
};

const defaultUsage: UserUsage = {
    backtest: 0,
    subscriptions: 0,
    savedStrategies: 0,
    aiChat: 0,
    analyze: 0
};

const UserTierContext = createContext<UserTierContextType | undefined>(undefined);

export function UserTierProvider({ children }: { children: ReactNode }) {
    const { isSignedIn, isLoaded } = useUser();
    const [tier, setTier] = useState<UserTier>("ritel");
    const [credits, setCredits] = useState({ used: 0, total: 100 });
    const [limits, setLimits] = useState<UserLimits>(defaultLimits);
    const [usage, setUsage] = useState<UserUsage>(defaultUsage);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUserTier = async () => {
        if (!isSignedIn) {
            setTier("ritel");
            setCredits({ used: 0, total: 100 });
            setLimits(defaultLimits);
            setUsage(defaultUsage);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch("/api/user/limits");
            if (response.ok) {
                const data = await response.json();

                if (data.success) {
                    const newTier = (data.tier || "ritel") as UserTier;
                    setTier(newTier);
                    setLimits(data.limits);
                    setUsage(data.usage);

                    // Map specific quota to "credits" for backward compatibility or simple display
                    // Here we map Backtest quota as the primary "credit"
                    const totalCredits = data.limits.backtest === -1 ? 9999 : data.limits.backtest;
                    const usedCredits = data.usage.backtest;

                    setCredits({
                        used: usedCredits,
                        total: totalCredits,
                    });
                }
            }
        } catch (error) {
            console.error("Failed to fetch user tier:", error);
            // Keep default/previous state on error
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isLoaded) {
            fetchUserTier();
        }
    }, [isLoaded, isSignedIn]);

    return (
        <UserTierContext.Provider value={{ tier, credits, limits, usage, isLoading, refreshTier: fetchUserTier }}>
            {children}
        </UserTierContext.Provider>
    );
}

export function useUserTier() {
    const context = useContext(UserTierContext);
    if (context === undefined) {
        throw new Error("useUserTier must be used within a UserTierProvider");
    }
    return context;
}
