"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useUser } from "@clerk/nextjs";

type UserTier = "ritel" | "suhu" | "bandar";

interface UserTierContextType {
    tier: UserTier;
    credits: {
        used: number;
        total: number;
    };
    isLoading: boolean;
    refreshTier: () => Promise<void>;
}

const UserTierContext = createContext<UserTierContextType | undefined>(undefined);

export function UserTierProvider({ children }: { children: ReactNode }) {
    const { isSignedIn, isLoaded } = useUser();
    const [tier, setTier] = useState<UserTier>("ritel");
    const [credits, setCredits] = useState({ used: 0, total: 100 });
    const [isLoading, setIsLoading] = useState(true);

    const fetchUserTier = async () => {
        if (!isSignedIn) {
            setTier("ritel");
            setCredits({ used: 0, total: 100 });
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch("/api/user/tier");
            if (response.ok) {
                const data = await response.json();
                const newTier = (data.tier || "ritel") as UserTier;

                // Set credits based on tier
                let totalCredits = 100; // ritel
                if (newTier === "suhu") totalCredits = 500;
                if (newTier === "bandar") totalCredits = 1000;

                setTier(newTier);
                setCredits({
                    used: 0, // TODO: Implement credit tracking
                    total: totalCredits,
                });
            }
        } catch (error) {
            console.error("Failed to fetch user tier:", error);
            // Keep default ritel tier on error
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
        <UserTierContext.Provider value={{ tier, credits, isLoading, refreshTier: fetchUserTier }}>
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
