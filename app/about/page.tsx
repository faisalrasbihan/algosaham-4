import { Navbar } from "@/components/navbar";
import { TickerTape } from "@/components/ticker-tape";
import { AboutSection } from "@/components/about-section";
import { aboutPageMetaTags } from "@/components/about-seo";

export const metadata = aboutPageMetaTags;

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <TickerTape />
      <div className="flex-1">
        <AboutSection />
      </div>
    </div>
  );
}

