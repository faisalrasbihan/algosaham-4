"use client"

import React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface StockSearchProps {
  onSearch: (ticker: string) => void
  loading: boolean
}

export function StockSearch({ onSearch, loading }: StockSearchProps) {
  const [ticker, setTicker] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (ticker.trim()) {
      onSearch(ticker.trim().toUpperCase())
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-6 py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-3 font-ibm-plex-mono text-balance">
          Analisis Saham Indonesia
        </h1>
        <p className="text-lg text-muted-foreground">
          Masukkan kode saham untuk mendapatkan analisis teknikal dan fundamental lengkap
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3 justify-center w-full transition-all">
        {!loading && (
          <div className="flex-1 relative transition-all duration-500">
            <Input
              type="text"
              placeholder="Masukkan kode ticker (contoh: BBCA, TLKM, ASII)"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              className="h-14 text-lg pl-5 pr-5 bg-white"
              disabled={loading}
            />
          </div>
        )}
        <Button
          type="submit"
          size="lg"
          disabled={loading || !ticker.trim()}
          className={`h-14 text-base bg-ochre hover:bg-ochre/90 text-white transition-all duration-500 ${loading ? "w-full max-w-md px-12" : "px-8"
            }`}
        >
          {loading ? (
            <>
              <span className="mr-2">Analyze</span>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </>
          ) : (
            <>
              <Search className="mr-2 h-5 w-5" />
              Analyze
            </>
          )}
        </Button>
      </form>

      <div className="mt-6 flex flex-wrap gap-2 justify-center">
        <span className="text-sm text-muted-foreground">Coba:</span>
        {["BBCA", "TLKM", "ASII", "BMRI", "UNVR"].map((code) => (
          <button
            key={code}
            onClick={() => setTicker(code)}
            className="px-3 py-1 text-sm rounded-md border border-border bg-white hover:bg-muted transition-colors"
            disabled={loading}
          >
            {code}
          </button>
        ))}
      </div>
    </div>
  )
}
