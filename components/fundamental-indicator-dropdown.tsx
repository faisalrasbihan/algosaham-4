"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown, Plus } from "lucide-react"

interface Indicator {
    name: string
    type: "fundamental" | "technical"
    params: Record<string, any>
}

interface FundamentalIndicatorDropdownProps {
    onAddIndicator: (indicator: Omit<Indicator, "id">) => void
}

const fundamentalIndicators = [
    { name: "PE Ratio", description: "Rasio Harga terhadap Laba - mengukur valuasi saham", params: { min: 0, max: 50 } },
    { name: "PBV", description: "Rasio Harga terhadap Nilai Buku - membandingkan nilai pasar dengan nilai buku", params: { min: 0, max: 10 } },
    { name: "ROE", description: "Pengembalian atas Ekuitas - mengukur profitabilitas terhadap ekuitas pemegang saham", params: { min: 0, max: 100 } },
    { name: "DE Ratio", description: "Rasio Hutang terhadap Ekuitas - mengukur leverage keuangan", params: { min: 0, max: 5 } },
    { name: "ROA", description: "Pengembalian atas Aset - mengukur profitabilitas terhadap total aset", params: { min: 0, max: 50 } },
    { name: "NPM", description: "Margin Laba Bersih - mengukur efisiensi laba", params: { min: 0, max: 100 } },
    { name: "EPS", description: "Laba Per Saham - laba yang dialokasikan untuk setiap saham", params: { min: 0, max: 1000 } },
]

export function FundamentalIndicatorDropdown({ onAddIndicator }: FundamentalIndicatorDropdownProps) {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside)
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [isOpen])

    const handleAddIndicator = (indicator: typeof fundamentalIndicators[0]) => {
        onAddIndicator({
            name: indicator.name,
            type: "fundamental",
            params: indicator.params,
        })
        setIsOpen(false)
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <Button
                variant="outline"
                size="sm"
                className="w-full bg-transparent font-mono hover:text-foreground border-slate-300 hover:border-[#d07225] justify-between"
                style={
                    {
                        "--hover-bg": "#d072251a",
                        "--hover-text": "#d07225",
                        "--hover-border": "#d07225",
                    } as React.CSSProperties
                }
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#d0722510"
                    e.currentTarget.style.color = "#d07225"
                    e.currentTarget.style.borderColor = "#d07225"
                }}
                onMouseLeave={(e) => {
                    if (!isOpen) {
                        e.currentTarget.style.backgroundColor = "transparent"
                        e.currentTarget.style.color = ""
                        e.currentTarget.style.borderColor = "#cbd5e1"
                    }
                }}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Fundamental Indicator
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </Button>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-[400px] overflow-y-auto">
                    {fundamentalIndicators.map((indicator, index) => (
                        <div
                            key={index}
                            className="p-3 hover:bg-secondary cursor-pointer border-b border-border last:border-b-0 transition-colors"
                            onClick={() => handleAddIndicator(indicator)}
                        >
                            <div className="font-medium text-sm text-foreground mb-1">{indicator.name}</div>
                            <div className="text-xs text-muted-foreground">{indicator.description}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
