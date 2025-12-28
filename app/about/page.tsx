import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { TickerTape } from "@/components/ticker-tape";
import { AboutSection } from "@/components/about-section";
import { aboutPageMetaTags } from "@/components/about-seo";

export const metadata = aboutPageMetaTags;

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <TickerTape />
      <div className="flex-1">
        <AboutSection />
      </div>
      <Footer />
    </div>
  );
}

