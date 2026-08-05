"use client";

import { useState } from "react";
import { ChevronDown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageSection, SectionHeader } from "@/components/page-layout";
import { cn } from "@/lib/utils";

interface FAQItem {
  question: string;
  answer: string;
}

const allFAQs: FAQItem[] = [
  {
    question: "Apa itu Algosaham.ai?",
    answer:
      "Algosaham.ai adalah platform berbasis AI yang membantu Anda membangun, menguji, dan mengoptimalkan strategi trading saham menggunakan data pasar Indonesia yang real-time. Platform ini dirancang agar trader dapat membuat keputusan investasi secara lebih objektif dan berbasis data.",
  },
  {
    question: "Siapa yang bisa menggunakan Algosaham.ai?",
    answer:
      "Algosaham.ai dapat digunakan oleh semua kalangan trader dan investor, baik pemula yang ingin belajar strategi trading, maupun profesional yang ingin menguji dan mengotomatisasi strategi mereka.",
  },
  {
    question: "Apakah saya perlu bisa coding untuk menggunakan Algosaham.ai?",
    answer:
      "Tidak perlu! Algosaham.ai menyediakan antarmuka visual (no-code) untuk membuat strategi. Namun, bagi pengguna yang mahir, tersedia juga opsi advanced untuk menggunakan skrip dan logika kustom.",
  },
  {
    question: "Dari mana sumber data yang digunakan di Algosaham.ai?",
    answer:
      "Data yang digunakan berasal dari bursa saham Indonesia (IDX) serta penyedia data pasar terpercaya lainnya. Semua data diperbarui secara real-time atau near real-time agar hasil pengujian strategi akurat.",
  },
  {
    question: "Apa saja fitur utama Algosaham.ai?",
    answer:
      "Beberapa fitur utama meliputi: 🔹 Strategy Builder: Bangun strategi trading tanpa coding 🔹 Backtesting Engine: Uji performa strategi menggunakan data historis 🔹 Optimization Tool: Temukan parameter terbaik untuk strategi Anda 🔹 Real-Time Data Feed: Akses data pasar Indonesia secara langsung 🔹 Performance Dashboard: Pantau hasil dan analisis kinerja strategi",
  },
  {
    question: "Apa manfaat menggunakan Algosaham.ai dibandingkan platform lain?",
    answer:
      "Keunggulan utama Algosaham.ai: Fokus pada pasar saham Indonesia, Dukungan AI dan machine learning untuk optimasi strategi, No-code interface yang mudah digunakan, Hasil pengujian yang transparan dan terukur.",
  },
  {
    question: "Apakah Algosaham.ai bisa digunakan di perangkat mobile?",
    answer:
      "Ya, Algosaham.ai dapat diakses melalui browser desktop maupun mobile, sehingga Anda bisa memantau dan mengelola strategi di mana pun.",
  },
  {
    question: "Apakah data di Algosaham.ai real-time?",
    answer:
      "Ya, sebagian besar data disajikan secara real-time atau dengan sedikit keterlambatan tergantung pada jenis data dan sumbernya.",
  },
  {
    question: "Apakah saya bisa menyimpan atau berbagi strategi saya?",
    answer:
      "Bisa. Anda dapat menyimpan strategi pribadi atau memilih untuk membagikannya dengan komunitas trader di Algosaham.ai agar saling belajar dan berkolaborasi.",
  },
  {
    question: "Apakah Algosaham.ai menyediakan panduan untuk pengguna baru?",
    answer:
      "Tentu. Kami menyediakan tutorial, dokumentasi, dan video panduan agar pengguna baru dapat langsung memahami cara membangun dan menguji strategi.",
  },
  {
    question: "Apakah Algosaham.ai gratis digunakan?",
    answer:
      "Algosaham.ai menyediakan paket gratis dengan fitur dasar, serta paket premium bagi pengguna yang ingin mengakses data real-time penuh dan fitur lanjutan seperti optimasi AI.",
  },
  {
    question: "Apakah hasil pengujian strategi bisa dijadikan acuan untuk trading nyata?",
    answer:
      "Hasil pengujian (backtest) memberikan gambaran performa strategi di masa lalu. Namun, hasil tersebut tidak menjamin kinerja di masa depan. Gunakan sebagai alat bantu untuk pengambilan keputusan, bukan sebagai rekomendasi investasi.",
  },
  {
    question: "Apakah Algosaham.ai aman digunakan?",
    answer:
      "Ya. Kami menggunakan enkripsi dan standar keamanan tinggi untuk melindungi data pengguna dan strategi yang dibuat di platform.",
  },
  {
    question: "Bagaimana cara memulai menggunakan Algosaham.ai?",
    answer:
      "Cukup buka https://algosaham.ai, lalu buat akun gratis Anda. Setelah login, Anda bisa langsung mulai membangun dan menguji strategi trading pertama Anda.",
  },
  {
    question: "Bagaimana cara menghubungi tim Algosaham.ai jika butuh bantuan?",
    answer:
      "Anda dapat menghubungi kami melalui: Email: support@algosaham.ai, Menu Bantuan di dalam platform, Komunitas Discord/Telegram resmi (jika tersedia).",
  },
];

const initialFAQsToShow = 6;

export function FAQSection() {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);

  const faqsToDisplay = showAll ? allFAQs : allFAQs.slice(0, initialFAQsToShow);

  const toggleItem = (question: string) => {
    setExpandedItems((currentItems) => {
      const nextItems = new Set(currentItems);

      if (nextItems.has(question)) {
        nextItems.delete(question);
      } else {
        nextItems.add(question);
      }

      return nextItems;
    });
  };

  return (
    <PageSection
      aria-labelledby="faq-heading"
      className="border-t border-border/60 bg-background py-16 sm:py-20 lg:py-24"
    >
      <div className="grid gap-10 lg:grid-cols-[minmax(260px,0.72fr)_minmax(0,1.35fr)] lg:gap-16 xl:gap-24">
        <div className="lg:pt-1">
          <SectionHeader
            id="faq-heading"
            title="Pertanyaan yang sering diajukan"
            description="Jawaban ringkas untuk membantu Anda memahami cara kerja Algosaham.ai."
            align="left"
            className="mb-0 [&_h2]:text-3xl [&_h2]:leading-[1.12] sm:[&_h2]:text-4xl lg:[&_h2]:text-[2.75rem]"
          />
        </div>

        <div>
          <div className="border-t border-border/70">
            {faqsToDisplay.map((faq, index) => {
              const isExpanded = expandedItems.has(faq.question);
              const triggerId = `faq-trigger-${index}`;
              const panelId = `faq-panel-${index}`;

              return (
                <div
                  key={faq.question}
                  className="border-b border-border/70"
                >
                  <button
                    id={triggerId}
                    type="button"
                    onClick={() => toggleItem(faq.question)}
                    aria-expanded={isExpanded}
                    aria-controls={panelId}
                    className="group flex w-full items-start justify-between gap-6 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d07225]/30 focus-visible:ring-offset-4 sm:py-6"
                  >
                    <span className="text-[17px] font-medium leading-7 text-foreground transition-colors group-hover:text-[#b85f19] sm:text-lg">
                      {faq.question}
                    </span>
                    <ChevronDown
                      aria-hidden="true"
                      className={cn(
                        "mt-1 h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200",
                        isExpanded && "rotate-180 text-foreground",
                      )}
                    />
                  </button>
                  {isExpanded && (
                    <div
                      id={panelId}
                      role="region"
                      aria-labelledby={triggerId}
                      className="pb-6 pr-10 sm:pb-7 sm:pr-14"
                    >
                      <p className="max-w-3xl whitespace-pre-line text-base leading-7 text-muted-foreground sm:text-[17px] sm:leading-8">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!showAll && (
            <div className="mt-8">
              <Button
                onClick={() => setShowAll(true)}
                variant="outline"
                className="rounded-lg border-border bg-transparent text-foreground hover:bg-muted"
              >
                Lihat semua pertanyaan
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {showAll && (
            <p className="mt-8 text-base text-muted-foreground">
              Masih punya pertanyaan? Hubungi kami di{" "}
              <a href="mailto:algosaham.ai@gmail.com" className="font-medium text-foreground underline-offset-4 hover:underline">
                algosaham.ai@gmail.com
              </a>
            </p>
          )}
        </div>
      </div>
    </PageSection>
  );
}
