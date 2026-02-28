import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"

export default function SyaratKetentuanPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />
            <main className="flex-1 container mx-auto max-w-4xl px-6 py-12">
                <h1 className="mb-2 text-3xl font-bold">Ketentuan Layanan Algosaham.ai</h1>
                <h2 className="mb-2 text-xl font-semibold text-muted-foreground">Syarat dan Ketentuan Penggunaan Platform</h2>
                <p className="mb-8 text-sm text-muted-foreground">Terakhir diperbarui: 23 Februari 2026</p>

                <div className="space-y-8 text-foreground/90">
                    <section className="space-y-4">
                        <p>
                            Dengan mengakses dan menggunakan platform Algosaham.ai, Anda menyatakan telah membaca, memahami, dan menyetujui seluruh Ketentuan Layanan ini. Jika Anda tidak menyetujui ketentuan ini, mohon untuk tidak menggunakan layanan kami.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h3 className="text-lg font-bold">1. Ruang Lingkup Layanan</h3>
                        <p>Algosaham.ai menyediakan platform analisis, simulasi, dan visualisasi data pasar saham untuk tujuan informasi dan edukasi.</p>
                        <p>Algosaham.ai bukan perusahaan sekuritas, bukan broker, dan tidak mengeksekusi transaksi perdagangan saham.</p>
                        <p>Seluruh informasi yang tersedia bukan merupakan nasihat keuangan, investasi, atau rekomendasi jual/beli.</p>
                    </section>

                    <section className="space-y-4">
                        <h3 className="text-lg font-bold">2. Hak dan Ketentuan Penggunaan</h3>
                        <div className="space-y-2">
                            <h4 className="font-semibold">Hak Pengguna</h4>
                            <p>Anda diperkenankan untuk:</p>
                            <ul className="list-disc space-y-1 pl-6">
                                <li>Mengakses dan menggunakan fitur analisis saham di platform</li>
                                <li>Menggunakan data dan insight untuk keperluan pribadi dan non-komersial</li>
                                <li>Memberikan masukan, saran, atau feedback terkait layanan</li>
                            </ul>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-semibold">Batasan Penggunaan</h4>
                            <p>Anda dilarang untuk:</p>
                            <ul className="list-disc space-y-1 pl-6">
                                <li>Menggunakan platform untuk tujuan komersial tanpa persetujuan tertulis</li>
                                <li>Melakukan reverse engineering, scraping, atau menyalin algoritma dan sistem kami</li>
                                <li>Menggunakan bot, script otomatis, atau aktivitas yang membebani sistem</li>
                                <li>Mengganggu keamanan, integritas, atau ketersediaan platform</li>
                                <li>Menggunakan layanan untuk aktivitas yang melanggar hukum</li>
                            </ul>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h3 className="text-lg font-bold">3. Akurasi Informasi dan Risiko</h3>
                        <p>Kami berupaya menyajikan data dan analisis seakurat mungkin, namun tidak menjamin kelengkapan, ketepatan, atau keandalan informasi.</p>
                        <p>Keputusan investasi dan risiko trading sepenuhnya menjadi tanggung jawab Anda sebagai pengguna.</p>
                    </section>

                    <section className="space-y-4">
                        <h3 className="text-lg font-bold">4. Ketersediaan Layanan</h3>
                        <p>Kami berupaya menyediakan layanan secara berkelanjutan, namun tidak menjamin platform selalu tersedia tanpa gangguan. Layanan dapat dihentikan sementara untuk:</p>
                        <ul className="list-disc space-y-1 pl-6">
                            <li>Pemeliharaan sistem dan pembaruan fitur</li>
                            <li>Peningkatan keamanan dan performa</li>
                            <li>Gangguan teknis atau keadaan di luar kendali kami (force majeure)</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h3 className="text-lg font-bold">5. Ketentuan Pengkinian Data</h3>
                        <p>
                            Algosaham.ai menyediakan data pasar dan analisis saham berdasarkan jadwal pengkinian tertentu. Pengguna memahami dan menyetujui bahwa data yang ditampilkan tidak selalu bersifat real-time dan dapat mengalami keterlambatan atau perbedaan waktu pembaruan.
                        </p>
                        <p>Jadwal pengkinian data pada platform Algosaham.ai adalah sebagai berikut:</p>
                        <ul className="list-disc space-y-1 pl-6">
                            <li>Data Harga Saham: Diperbarui setiap 3 (tiga) menit selama jam perdagangan.</li>
                            <li>Data Analisis Teknikal: Diperbarui pada akhir sesi perdagangan, yaitu pukul 12:15 WIB dan 19:15 WIB.</li>
                            <li>Data Broker Summary: Diperbarui setiap hari pada pukul 19:15 WIB.</li>
                            <li>Data Fundamental: Diperbarui setiap hari pada pukul 19:15 WIB atau mengikuti ketersediaan data terbaru.</li>
                            <li>Analisis Sektoral IHSG: Diperbarui pada pukul 08:45 WIB dan 17:00 WIB.</li>
                        </ul>
                        <p>Pengguna memahami bahwa:</p>
                        <ul className="list-disc space-y-1 pl-6">
                            <li>Waktu pengkinian dapat berubah sewaktu-waktu tanpa pemberitahuan sebelumnya</li>
                            <li>Keterlambatan data dapat terjadi akibat sumber pihak ketiga, kondisi pasar, atau gangguan teknis</li>
                            <li>Data yang ditampilkan bukan dasar tunggal untuk pengambilan keputusan investasi</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h3 className="text-lg font-bold">6. Hak Kekayaan Intelektual</h3>
                        <p>Seluruh konten, sistem, algoritma, desain, merek, dan teknologi di Algosaham.ai merupakan milik kami dan dilindungi oleh hukum yang berlaku.</p>
                        <p>Anda tidak diperkenankan untuk:</p>
                        <ul className="list-disc space-y-1 pl-6">
                            <li>Menggunakan nama, logo, atau merek dagang tanpa izin tertulis</li>
                            <li>Menyalin, memodifikasi, atau mendistribusikan sistem dan metode analisis kami</li>
                            <li>Menggunakan konten platform untuk kepentingan komersial tanpa persetujuan</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h3 className="text-lg font-bold">7. Penangguhan dan Penghentian Akses</h3>
                        <p>Kami berhak menangguhkan atau menghentikan akses pengguna jika:</p>
                        <ul className="list-disc space-y-1 pl-6">
                            <li>Terjadi pelanggaran terhadap Ketentuan Layanan ini</li>
                            <li>Ditemukan penyalahgunaan platform</li>
                            <li>Diperlukan oleh hukum atau permintaan otoritas berwenang</li>
                            <li>Aktivitas pengguna berpotensi merugikan sistem atau pengguna lain</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h3 className="text-lg font-bold">8. Batasan Tanggung Jawab</h3>
                        <p>Sepanjang diizinkan oleh hukum, Algosaham.ai tidak bertanggung jawab atas:</p>
                        <ul className="list-disc space-y-1 pl-6">
                            <li>Kerugian finansial akibat keputusan trading</li>
                            <li>Kehilangan data, peluang, atau keuntungan</li>
                            <li>Gangguan layanan yang bersifat sementara</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h3 className="text-lg font-bold">9. Perubahan Ketentuan</h3>
                        <p>
                            Kami dapat memperbarui Ketentuan Layanan ini dari waktu ke waktu. Penggunaan layanan secara berkelanjutan setelah perubahan dianggap sebagai persetujuan atas ketentuan yang diperbarui.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h3 className="text-lg font-bold">10. Hukum yang Berlaku</h3>
                        <p>
                            Ketentuan Layanan ini diatur dan ditafsirkan berdasarkan hukum Republik Indonesia. Sengketa akan diselesaikan melalui pengadilan yang berwenang di wilayah Republik Indonesia.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h3 className="text-lg font-bold">11. Kontak</h3>
                        <p>Untuk pertanyaan terkait Ketentuan Layanan ini, silakan hubungi kami melalui:</p>
                        <p>Email: admin@algosaham.ai</p>
                        <p>Subjek: Ketentuan Layanan</p>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    )
}
