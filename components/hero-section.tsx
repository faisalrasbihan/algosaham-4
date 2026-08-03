import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-layout";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  return (
    <PageHeader
      align="left"
      className="border-b-0 bg-transparent [&>div]:pb-7 sm:[&>div]:pb-9"
      title={
        <span className="font-heading font-semibold tracking-[-0.045em]">
          Cari, uji, dan pantau strategi trading Indonesia.
        </span>
      }
      description="Temukan strategi yang sudah diuji dengan data pasar Indonesia, cek performanya, lalu optimalkan sesuai gaya trading kamu."
      actions={
        <>
          <Button asChild size="lg">
            <Link href="/backtest">
              Mulai simulasi
              <ArrowRight />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/features">Pelajari lebih lanjut</Link>
          </Button>
        </>
      }
    />
  );
}
