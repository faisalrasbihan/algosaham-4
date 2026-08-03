"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageSection, SectionHeader } from "@/components/page-layout";

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
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(question)) {
      newExpanded.delete(question);
    } else {
      newExpanded.add(question);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <PageSection className="border-t border-border/60 bg-background py-12 sm:py-16">
      <div className="mx-auto max-w-4xl">
        <SectionHeader
          title="Pertanyaan yang sering diajukan"
          description="Temukan jawaban untuk pertanyaan umum tentang Algosaham.ai."
          className="mb-8"
        />

        <div className="mb-8 space-y-2">
          {faqsToDisplay.map((faq) => {
            const isExpanded = expandedItems.has(faq.question);
            return (
              <div
                key={faq.question}
                className="rounded-lg border border-border bg-card"
              >
                <button
                  onClick={() => toggleItem(faq.question)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-muted/50 transition-colors rounded-lg"
                >
                  <h3 className="text-lg font-semibold text-foreground pr-4">{faq.question}</h3>
                  <div className="flex-shrink-0">
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-primary" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </button>
                {isExpanded && (
                  <div className="px-6 pb-4">
                    <div className="pt-2 border-t border-border">
                      <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {!showAll && (
          <div className="text-center">
            <Button
              onClick={() => setShowAll(true)}
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              Lihat Semua Pertanyaan
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        )}

        {showAll && (
          <div className="text-center mt-8">
            <p className="mb-4 text-sm text-muted-foreground">
              Masih punya pertanyaan? Hubungi kami di{" "}
              <a href="mailto:algosaham.ai@gmail.com" className="text-primary hover:underline">
                algosaham.ai@gmail.com
              </a>
            </p>
          </div>
        )}
      </div>
    </PageSection>
  );
}
