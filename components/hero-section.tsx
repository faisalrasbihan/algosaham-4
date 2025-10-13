"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-ochre/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cambridge-blue/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 py-12 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-7xl mx-auto">
          {/* Left side - Main heading */}
          <div>
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
              Cari strategi paling menguntungkan bagi Anda di{" "}
              <span className="text-ochre font-mono" style={{ fontFamily: "var(--font-ibm-plex-mono)" }}>
                algosaham.ai
              </span>
            </h1>
          </div>

          {/* Right side - Description and CTAs */}
          <div className="space-y-6">
            <p className="text-lg lg:text-xl text-muted-foreground text-pretty leading-relaxed font-mono">
              Build, test, and optimize your trading strategies with real Indonesian market data. Join thousands of traders making data-driven decisions.
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Button size="lg" className="bg-ochre hover:bg-ochre/90 text-white text-base px-8 h-12">
                Start Backtesting
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="text-base px-8 h-12 bg-transparent">
                View Documentation
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
