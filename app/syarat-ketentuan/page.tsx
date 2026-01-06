import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"

export default function SyaratKetentuanPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />
            <main className="flex-1 container mx-auto px-6 py-12 max-w-4xl">
                <h1 className="text-3xl font-bold mb-2">Term and Condition</h1>
                <h2 className="text-xl font-semibold mb-8 text-muted-foreground">TAMBAHAN SYARAT & KETENTUAN</h2>

                <div className="space-y-8 text-foreground/90">
                    <section className="space-y-4">
                        <h3 className="text-lg font-bold">Khusus Layanan algosaham.ai</h3>

                        <div className="space-y-4">
                            <h4 className="font-semibold">1. Tentang algosaham.ai</h4>
                            <p>
                                algosaham.ai adalah platform analisis saham berbasis data dan teknologi kecerdasan buatan (Artificial Intelligence/AI) yang dirancang untuk membantu trader dan investor di Indonesia dalam menyusun, menguji, dan memahami strategi perdagangan saham secara lebih terstruktur dan terukur.
                            </p>
                            <p>
                                Layanan algosaham.ai dapat digunakan oleh pengguna dari berbagai tingkat pengalaman, mulai dari pemula hingga trader dan investor yang telah aktif, untuk melakukan simulasi dan evaluasi strategi sebelum digunakan secara nyata di pasar saham.
                            </p>
                            <p>
                                algosaham.ai percaya bahwa aktivitas trading dan investasi tidak harus dilakukan berdasarkan spekulasi semata. Dengan memanfaatkan analisis data historis, indikator teknikal, data fundamental, serta teknologi AI, algosaham.ai membantu pengguna memahami potensi kinerja strategi sekaligus risiko yang melekat, sehingga pengambilan keputusan dapat dilakukan secara lebih rasional, tenang, dan berbasis data.
                            </p>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h4 className="font-semibold">2. Informasi Pembaruan Data</h4>
                        <div className="space-y-2">
                            <p>Pengguna memahami dan menyetujui bahwa data yang disediakan di algosaham.ai diperbarui secara berkala dengan ketentuan sebagai berikut:</p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Data harga saham diperbarui secara berkala mengikuti jam perdagangan bursa yang berlaku;</li>
                                <li>Data indikator teknikal diperbarui pada setiap akhir sesi perdagangan;</li>
                                <li>Data fundamental disesuaikan dengan laporan keuangan dan informasi terbaru yang tersedia dari sumber data terkait.</li>
                            </ul>
                            <p className="mt-2">
                                algosaham.ai tidak menjamin bahwa seluruh data selalu tersedia secara real-time, bebas dari keterlambatan, kesalahan, atau ketidakakuratan, dan pengguna disarankan untuk melakukan verifikasi tambahan sebelum mengambil keputusan.
                            </p>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h4 className="font-semibold">3. Tujuan Penggunaan Layanan</h4>
                        <div className="space-y-2">
                            <p>Seluruh informasi, analisis, visualisasi, simulasi strategi, dan fitur lain yang tersedia di algosaham.ai hanya ditujukan untuk keperluan edukasi, pembelajaran, dan pengembangan pemahaman pengguna terhadap pasar saham dan strategi perdagangan.</p>
                            <p>Layanan ini bukan merupakan:</p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>nasihat investasi,</li>
                                <li>rekomendasi pembelian atau penjualan saham,</li>
                                <li>ajakan untuk melakukan transaksi efek tertentu.</li>
                            </ul>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h4 className="font-semibold">4. Peringatan Risiko (Risk Disclaimer)</h4>
                        <div className="space-y-2">
                            <p>Pengguna dengan ini memahami dan menyetujui bahwa:</p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Seluruh keputusan trading dan investasi sepenuhnya menjadi tanggung jawab pribadi pengguna;</li>
                                <li>Trading saham memiliki risiko tinggi, termasuk kemungkinan kehilangan sebagian atau seluruh modal;</li>
                                <li>Kinerja strategi di masa lalu, termasuk hasil simulasi, backtesting, atau analisis historis, tidak menjamin hasil yang sama di masa depan;</li>
                                <li>Setiap strategi yang diuji melalui algosaham.ai bersifat simulatif dan dapat berbeda dengan kondisi pasar nyata akibat faktor likuiditas, volatilitas, biaya transaksi, dan kondisi pasar lainnya;</li>
                            </ul>
                            <p>Pengguna disarankan untuk:</p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>melakukan riset mandiri,</li>
                                <li>menggunakan pertimbangan pribadi,</li>
                                <li>serta hanya menggunakan dana yang siap menanggung risiko.</li>
                            </ul>
                            <p className="mt-2">
                                algosaham.ai tidak bertanggung jawab atas kerugian, kerusakan, atau dampak finansial apa pun yang timbul akibat keputusan trading atau investasi yang diambil oleh pengguna berdasarkan penggunaan Layanan.
                            </p>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h4 className="font-semibold">5. Batasan Tanggung Jawab</h4>
                        <div className="space-y-2">
                            <p>algosaham.ai, pengelola, afiliasi, dan mitra tidak bertanggung jawab atas:</p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>kerugian finansial langsung maupun tidak langsung;</li>
                                <li>kehilangan peluang;</li>
                                <li>kerusakan data;</li>
                                <li>keputusan investasi yang diambil oleh pengguna.</li>
                            </ul>
                            <p className="mt-2">Seluruh Layanan disediakan dalam kondisi “sebagaimana adanya” (as is) tanpa jaminan apa pun, baik tersurat maupun tersirat.</p>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h4 className="font-semibold">6. Kepatuhan Regulasi</h4>
                        <div className="space-y-2">
                            <p>
                                algosaham.ai bukan perusahaan sekuritas, manajer investasi, penasihat investasi, atau broker, serta tidak memberikan layanan yang diatur atau diawasi oleh Otoritas Jasa Keuangan (OJK).
                            </p>
                            <p>
                                Pengguna bertanggung jawab untuk memastikan bahwa penggunaan Layanan sesuai dengan hukum dan peraturan yang berlaku di Republik Indonesia.
                            </p>
                        </div>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    )
}
