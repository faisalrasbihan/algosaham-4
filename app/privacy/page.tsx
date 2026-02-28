import type { Metadata } from "next"

import { PageChrome } from "@/components/page-chrome"

export const metadata: Metadata = {
  title: "Kebijakan Privasi | algosaham.ai",
  description:
    "Kebijakan Privasi algosaham.ai terkait pengelolaan Data Pribadi pengguna.",
}

export default function PrivacyPage() {
  return (
    <PageChrome>
      <section className="bg-background">
        <div className="container mx-auto max-w-4xl px-6 py-12">
          <div className="mb-8 space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              Kebijakan Privasi
            </h1>
            <h2 className="text-lg font-semibold text-muted-foreground">
              ALGOSAHAM.AI
            </h2>
            <p className="text-sm text-muted-foreground">
              Platform Analisis &amp; Trading Saham
            </p>
            <p className="text-sm text-muted-foreground">
              Terakhir diperbarui: 23 Februari 2026
            </p>
          </div>

          <div className="space-y-6 text-foreground/90">
            <p>
              Algosaham.ai berkomitmen untuk melindungi Data Pribadi pengguna
              sesuai dengan Undang-Undang Nomor 27 Tahun 2022 tentang
              Perlindungan Data Pribadi (UU PDP). Kebijakan Privasi ini
              menjelaskan bagaimana kami mengelola Data Pribadi Anda saat
              menggunakan layanan kami.
            </p>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">
                1. Data Pribadi yang Kami Kumpulkan
              </h3>
              <p>Kami dapat mengumpulkan Data Pribadi berikut:</p>
              <div className="space-y-3">
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">
                    Data yang dikumpulkan secara otomatis
                  </h4>
                  <ul className="list-disc space-y-1 pl-6">
                    <li>Alamat IP, informasi perangkat, data log, email, dan nomor HP</li>
                    <li>Aktivitas penggunaan platform (halaman, fitur, waktu akses)</li>
                    <li>Cookies dan teknologi pelacakan serupa</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">
                    Data yang Anda berikan
                  </h4>
                  <ul className="list-disc space-y-1 pl-6">
                    <li>Nama dan alamat email</li>
                    <li>Pesan atau komunikasi melalui formulir kontak</li>
                    <li>Data pencarian saham, ticker, dan parameter analisis</li>
                  </ul>
                </div>
              </div>
              <p>
                Kami tidak mengumpulkan data keuangan pribadi atau kredensial
                broker Anda.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">
                2. Tujuan dan Dasar Pemrosesan Data
              </h3>
              <p>
                Data Pribadi diproses berdasarkan persetujuan Anda, kepentingan
                sah, dan kewajiban hukum untuk:
              </p>
              <ul className="list-disc space-y-1 pl-6">
                <li>Menyediakan layanan analisis dan simulasi trading</li>
                <li>Menjaga keamanan, stabilitas, dan performa platform</li>
                <li>Memberikan dukungan pengguna dan komunikasi layanan</li>
                <li>Mengembangkan fitur dan meningkatkan pengalaman pengguna</li>
                <li>Mematuhi ketentuan hukum dan regulasi yang berlaku</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">
                3. Cookies dan Teknologi Pelacakan
              </h3>
              <p>Kami menggunakan cookies untuk:</p>
              <ul className="list-disc space-y-1 pl-6">
                <li>Menjalankan fungsi dasar platform</li>
                <li>Menganalisis penggunaan dan performa sistem</li>
                <li>Menyimpan preferensi pengguna</li>
              </ul>
              <p>
                Anda dapat mengelola preferensi cookies melalui pengaturan
                browser atau banner persetujuan cookies.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">
                4. Keamanan dan Penyimpanan Data
              </h3>
              <p>
                Kami menerapkan langkah-langkah keamanan teknis dan organisasi
                yang wajar untuk melindungi Data Pribadi Anda.
              </p>
              <p>
                Data disimpan hanya selama diperlukan untuk tujuan pemrosesan
                atau sesuai ketentuan hukum, dan akan dihapus atau dianonimkan
                setelahnya.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">
                5. Hak Pengguna
              </h3>
              <p>Sesuai UU PDP, Anda berhak untuk:</p>
              <ul className="list-disc space-y-1 pl-6">
                <li>Mengakses dan memperbarui Data Pribadi</li>
                <li>Menarik persetujuan pemrosesan</li>
                <li>Meminta penghapusan Data Pribadi tertentu</li>
                <li>Mengajukan keberatan atas pemrosesan Data Pribadi</li>
                <li>Permintaan dapat diajukan melalui kontak resmi kami.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">
                6. Pengungkapan kepada Pihak Ketiga
              </h3>
              <p>Kami tidak menjual Data Pribadi Anda.</p>
              <p>
                Data hanya dapat dibagikan kepada mitra pendukung operasional
                platform dengan kewajiban perlindungan data sesuai UU PDP.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">
                7. Perubahan Kebijakan
              </h3>
              <p>
                Kebijakan Privasi ini dapat diperbarui dari waktu ke waktu.
                Penggunaan layanan secara berkelanjutan dianggap sebagai
                persetujuan atas kebijakan yang diperbarui.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">
                8. Kontak Pengendali Data
              </h3>
              <p>
                Untuk pertanyaan atau permintaan terkait Data Pribadi, silakan
                hubungi:
              </p>
              <p>Email: algosaham.ai@gmail.com</p>
              <p>Subjek: Kebijakan Privasi / Data Pribadi</p>
            </section>
          </div>
        </div>
      </section>
    </PageChrome>
  )
}
