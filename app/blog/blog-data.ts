export type BlogSection = {
  heading: string
  paragraphs: string[]
}

export type BlogPost = {
  slug: string
  title: string
  excerpt: string
  category: string
  readTime: string
  publishedAt: string
  author: string
  accent: "ochre" | "cambridge" | "pomp"
  featured?: boolean
  summaryPoints: string[]
  sections: BlogSection[]
}

export const blogPosts: BlogPost[] = [
  {
    slug: "cara-membaca-backtest-tanpa-tertipu-win-rate",
    title: "Cara membaca hasil backtest tanpa tertipu win rate",
    excerpt:
      "Win rate tinggi sering terlihat meyakinkan, tetapi kualitas strategi biasanya baru terlihat setelah metrik lain dibaca dalam konteks yang benar.",
    category: "Backtesting",
    readTime: "7 min read",
    publishedAt: "2026-02-24",
    author: "Tim algosaham.ai",
    accent: "ochre",
    featured: true,
    summaryPoints: [
      "Win rate tanpa average gain dan average loss hampir tidak berguna.",
      "Drawdown, trade frequency, dan exposure lebih dekat ke realitas penggunaan strategi.",
      "Strategi yang terlihat bagus di laporan bisa gagal total kalau konteks pasarnya berubah.",
    ],
    sections: [
      {
        heading: "Win rate adalah pembuka, bukan kesimpulan",
        paragraphs: [
          "Banyak trader berhenti terlalu cepat ketika melihat win rate di atas 70 persen. Masalahnya, angka itu tidak memberi tahu seberapa besar kerugian saat strategi salah. Satu kekalahan besar bisa menghapus banyak kemenangan kecil.",
          "Saat membaca hasil backtest, perlakukan win rate sebagai sinyal awal saja. Setelah itu, cek average profit, average loss, profit factor, dan distribusi hasil trading. Di situlah kualitas strategi mulai terlihat.",
        ],
      },
      {
        heading: "Perhatikan struktur risiko, bukan hanya hasil akhirnya",
        paragraphs: [
          "Equity curve yang naik rapi memang menarik, tetapi drawdown yang dalam bisa membuat strategi sulit dijalankan secara psikologis. Bahkan strategi yang menguntungkan tetap buruk jika penurunannya terlalu ekstrem untuk modal dan toleransi pengguna.",
          "Trade frequency juga penting. Strategi dengan hasil tahunan bagus tetapi hanya menghasilkan beberapa transaksi mungkin terlihat stabil secara statistik, padahal belum cukup kuat untuk dijadikan dasar keputusan besar.",
        ],
      },
      {
        heading: "Gunakan hasil backtest untuk mempersempit asumsi",
        paragraphs: [
          "Backtest bukan alat untuk membuktikan bahwa ide Anda benar. Fungsinya justru untuk menemukan di mana ide itu rapuh. Jika satu perubahan kecil pada parameter membuat performa runtuh, strategi itu mungkin belum cukup robust.",
          "Cara baca yang sehat adalah mencari konsistensi lintas periode, lintas kondisi pasar, dan lintas variasi parameter yang masuk akal. Semakin mudah strategi pecah, semakin rendah kepercayaan yang layak Anda berikan.",
        ],
      },
    ],
  },
  {
    slug: "membangun-proses-screening-yang-masuk-akal",
    title: "Membangun proses screening saham yang masuk akal",
    excerpt:
      "Screener yang baik bukan yang memunculkan banyak kandidat, tetapi yang memperkecil noise sebelum analisis lebih dalam dilakukan.",
    category: "Screening",
    readTime: "5 min read",
    publishedAt: "2026-02-18",
    author: "Tim algosaham.ai",
    accent: "cambridge",
    summaryPoints: [
      "Gunakan screener untuk menyusutkan universe, bukan mengambil keputusan akhir.",
      "Campurkan filter likuiditas, kualitas bisnis, dan momentum sesuai horizon trading Anda.",
      "Semakin banyak filter tidak selalu berarti semakin baik.",
    ],
    sections: [
      {
        heading: "Mulai dari batasan paling praktis",
        paragraphs: [
          "Likuiditas, ukuran perusahaan, dan sektor biasanya lebih penting di awal daripada indikator yang terlalu spesifik. Filter dasar semacam ini membantu Anda menghindari kandidat yang secara operasional sulit diperdagangkan.",
          "Setelah universe lebih bersih, baru tambahkan filter teknikal atau fundamental yang relevan dengan gaya strategi Anda.",
        ],
      },
      {
        heading: "Jangan jadikan screener sebagai mesin pembenaran",
        paragraphs: [
          "Screener sering dipakai secara terbalik: trader sudah suka pada satu ide, lalu menambah filter sampai hanya saham yang mendukung keyakinannya yang tersisa. Itu bukan proses seleksi, itu proses pembenaran.",
          "Desain screener yang sehat adalah yang bisa dijelaskan dengan sederhana dan tetap masuk akal saat dijalankan berulang kali.",
        ],
      },
    ],
  },
  {
    slug: "kapan-strategi-harus-disederhanakan",
    title: "Kapan strategi justru harus disederhanakan",
    excerpt:
      "Semakin banyak indikator sering terasa lebih pintar, padahal sering kali hanya menambah ilusi kontrol dan memperbesar risiko overfitting.",
    category: "Strategy Design",
    readTime: "6 min read",
    publishedAt: "2026-02-11",
    author: "Tim algosaham.ai",
    accent: "pomp",
    summaryPoints: [
      "Kompleksitas tambahan harus membayar dirinya sendiri dengan peningkatan kualitas yang nyata.",
      "Strategi sederhana lebih mudah diuji, dijelaskan, dan dijalankan dengan disiplin.",
      "Jika Anda tidak bisa menjelaskan alasan setiap aturan, aturan itu mungkin tidak perlu ada.",
    ],
    sections: [
      {
        heading: "Kompleks bukan sinonim dari kuat",
        paragraphs: [
          "Menumpuk indikator sering memberi rasa aman karena keputusan terlihat lebih 'terkonfirmasi'. Tetapi terlalu banyak aturan bisa membuat sinyal datang terlambat, terlalu jarang, atau hanya cocok pada data masa lalu.",
          "Setiap aturan baru seharusnya menjawab kelemahan tertentu. Jika tidak, ia hanya menambah kebisingan dan mengurangi keterbacaan strategi.",
        ],
      },
      {
        heading: "Sederhana membantu disiplin eksekusi",
        paragraphs: [
          "Strategi yang terlalu rumit lebih sulit dipelihara dan lebih mudah salah diterapkan. Pada akhirnya, strategi yang bisa dijalankan konsisten biasanya lebih berharga daripada strategi yang terlihat canggih namun rapuh.",
          "Kesederhanaan juga membantu saat Anda ingin membandingkan variasi parameter. Anda bisa melihat perubahan perilaku strategi dengan lebih jernih.",
        ],
      },
    ],
  },
  {
    slug: "apa-yang-perlu-dicatat-saat-produk-analisis-berkembang",
    title: "Apa yang perlu dicatat saat produk analisis terus berkembang",
    excerpt:
      "Halaman analisis bukan sekadar tempat melihat indikator. Ia harus membantu pengguna mempersempit keputusan, bukan memperluas kebingungan.",
    category: "Product Notes",
    readTime: "4 min read",
    publishedAt: "2026-02-05",
    author: "Tim algosaham.ai",
    accent: "ochre",
    summaryPoints: [
      "Fitur analisis yang baik harus membantu prioritas, bukan sekadar menambah data.",
      "Visualisasi perlu dirancang untuk keputusan, bukan dekorasi.",
      "Catatan perubahan produk penting agar pengguna tidak kehilangan konteks.",
    ],
    sections: [
      {
        heading: "Produk analisis harus mengurangi kerja mental",
        paragraphs: [
          "Menambahkan indikator baru selalu mudah. Yang sulit adalah memastikan indikator itu benar-benar membantu pengguna memahami konteks yang sebelumnya belum terlihat.",
          "Setiap penambahan fitur di area analisis seharusnya bisa menjawab satu pertanyaan: keputusan apa yang menjadi lebih mudah setelah fitur ini ada.",
        ],
      },
      {
        heading: "Perubahan kecil tetap perlu dokumentasi",
        paragraphs: [
          "Pengguna aktif membangun kebiasaan. Saat layout atau definisi metrik berubah tanpa konteks, friction akan langsung terasa. Karena itu blog juga perlu berfungsi sebagai changelog naratif, bukan hanya tempat artikel edukasi.",
          "Pendekatan ini membuat pertumbuhan produk lebih bisa diikuti, terutama ketika fitur analisis dan backtesting bergerak cepat.",
        ],
      },
    ],
  },
]

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug)
}
