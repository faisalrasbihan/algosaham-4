"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { StockSearch } from "@/components/stock-search"
import { StockHeaderCard } from "@/components/stock-header-card"
import { OverallScoreCard } from "@/components/overall-score-card"
import { AnalysisCards } from "@/components/analysis-cards"
import { RiskPlanCard } from "@/components/risk-plan-card"
import { IndicatorPanels } from "@/components/indicator-panels"
import { Navbar } from "@/components/navbar"

import { TickerTape } from "@/components/ticker-tape"
import { toast } from "sonner"
import { useUser, useClerk } from "@clerk/nextjs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
function AnalyzeContent() {
    const searchParams = useSearchParams()
    const urlTicker = searchParams.get('ticker')
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [showLoginPrompt, setShowLoginPrompt] = useState(false)
    const { isSignedIn, isLoaded } = useUser()
    const { openSignIn } = useClerk()
    const router = useRouter()

    const handleSearch = async (ticker: string) => {
        if (isLoaded && !isSignedIn) {
            openSignIn()
            return
        }
        setLoading(true)
        router.push(`/analyze-v2?ticker=${ticker.toUpperCase()}`)
    }

    useEffect(() => {
        // Automatically search if there's a ticker in the URL, and we haven't loaded data yet
        if (urlTicker && !data && !loading) {
            handleSearch(urlTicker)
        }
    }, [urlTicker])

    return (
        <div className="min-h-screen bg-background dotted-background flex flex-col">
            <Navbar />
            <TickerTape />

            {!data ? (
                <div className="flex-1 flex flex-col items-center justify-center -mt-20">
                    <StockSearch onSearch={handleSearch} loading={loading} />
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto mt-8 pb-8">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-2xl font-bold font-ibm-plex-mono tracking-tight text-foreground">
                                Hasil Analisis: {data.tickerSummary.ticker}
                            </h1>
                            <button
                                onClick={() => setData(null)}
                                className="text-sm border border-input bg-card/60 backdrop-blur-sm hover:bg-accent hover:text-accent-foreground px-4 py-2 rounded-md transition-colors shadow-sm"
                            >
                                Kembali ke Pencarian
                            </button>
                        </div>

                        <StockHeaderCard
                            tickerData={data.tickerSummary}
                            scoreData={data.overallScore}
                            ohlcvData={data.ohlcv}
                        />

                        <OverallScoreCard data={data.overallScore} />

                        <AnalysisCards
                            technical={data.technicalAnalysis}
                            fundamental={data.fundamentalAnalysis}
                        />

                        <div className="grid lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                <IndicatorPanels
                                    data={data.indicatorPanels}
                                    dates={data.ohlcv.dates}
                                />
                            </div>
                            <div className="lg:col-span-1">
                                <RiskPlanCard data={data.riskPlan} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}

export default function AnalyzePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background dotted-background flex flex-col">
                <Navbar />
                <TickerTape />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        }>
            <AnalyzeContent />
        </Suspense>
    )
}
