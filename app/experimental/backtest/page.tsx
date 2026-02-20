"use client"

import { Navbar } from "@/components/navbar"
import { TickerTape } from "@/components/ticker-tape"
import { ResultsPanel } from "@/components/results-panel"
import { useBacktest } from "@/lib/hooks/useBacktest"
import { BacktestRequest } from "@/lib/api"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { ExperimentalStrategySidebar } from "@/components/experimental-strategy-sidebar"

export default function ExperimentalBacktestPage() {
    const { results, loading, error, runBacktest } = useBacktest()

    const handleBacktestRun = async (config: BacktestRequest) => {
        await runBacktest(config)
    }

    return (
        <div className="min-h-screen bg-background dotted-background flex flex-col">
            <Navbar />
            <TickerTape />
            <div className="flex-1 overflow-hidden">
                <SidebarProvider defaultOpen={true} style={{ "--sidebar-width": "380px" } as React.CSSProperties}>
                    <ExperimentalStrategySidebar
                        onRunBacktest={handleBacktestRun}
                        backtestResults={results}
                    />
                    <SidebarInset className="flex w-full flex-col bg-transparent">
                        <div className="flex-1 overflow-y-auto w-full">
                            <ResultsPanel
                                backtestResults={results}
                                loading={loading}
                                error={error}
                            />
                        </div>
                    </SidebarInset>
                </SidebarProvider>
            </div>
        </div>
    )
}
