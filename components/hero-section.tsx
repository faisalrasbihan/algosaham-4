"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="max-w-3xl">
          <div className="mb-3 font-ibm-plex-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-ochre">
            Riset · Simulasi · Monitoring
          </div>
          <h1 className="text-balance text-4xl font-bold leading-tight tracking-[-0.04em] text-foreground sm:text-5xl">
            Cari, uji, dan pantau strategi trading Indonesia.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            Temukan strategi yang sudah diuji dengan data pasar Indonesia, cek
            performanya, lalu optimalkan sesuai gaya trading kamu.
          </p>

          <div className="mt-7 flex flex-col items-start gap-3 sm:flex-row">
              <Link href="/backtest">
                <Button size="lg" className="h-11 bg-ochre px-6 text-base text-white hover:bg-ochre/90">
                  Mulai Simulasi
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/features">
                <Button size="lg" variant="outline" className="h-11 border-border bg-card px-6 text-base text-foreground">
                  Pelajari lebih lanjut
                </Button>
              </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
