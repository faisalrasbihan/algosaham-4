"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden dotted-background">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-ochre/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cambridge-blue/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 pt-12 lg:pt-16 pb-6 lg:pb-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-7xl mx-auto">
          {/* Left side - Main heading */}
          <div>
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
              Cari dan pakai strategi trading di{" "}
              <span className="text-ochre font-mono" style={{ fontFamily: "var(--font-ibm-plex-mono)" }}>
                algosaham.ai
              </span>
            </h1>
            {/* <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight mt-1 italic">
              Trading #AntiFOMO
            </h1> */}
          </div>

          {/* Right side - Description and CTAs */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl lg:text-2xl font-bold text-foreground">
                Mau trading lebih cuan tanpa ribet?
              </h2>
              {/* <p className="text-base lg:text-lg text-muted-foreground text-pretty leading-relaxed font-mono">
                Cari, uji, dan pakai strategi trading siap pakai di algosaham.ai. Bikin keputusan lebih yakin, bukan karena FOMO.
              </p> */}
              <p className="text-base lg:text-lg text-muted-foreground text-pretty leading-relaxed font-mono">
                Di sini, kamu bisa nemuin strategi trading yang udah diuji dengan data pasar Indonesia yang real. Tinggal pilih strateginya, cek performanya, terus optimalkan sesuai gaya trading kamu.
              </p>
              <p className="text-base lg:text-lg text-muted-foreground text-pretty leading-relaxed font-mono">
                Gampang, jelas, dan anti pusing.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Link href="/backtest">
                <Button size="lg" className="grainy-gradient-button text-white text-base px-8 h-12 border-0">
                  Mulai Simulasi
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline" className="text-base px-8 h-12 bg-white text-foreground border-border hover:bg-[#487b78] hover:text-white">
                  Pelajari lebih lanjut
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
