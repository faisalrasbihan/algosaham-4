// SEO Meta Tags untuk halaman About algosaham.ai
// File ini berisi meta description dan title tag yang SEO-friendly

export const aboutPageSEO = {
  title: "Tentang Algosaham.ai - Platform Strategi Saham Berbasis AI Terdepan di Indonesia",
  description:
    "algosaham.ai adalah platform strategi saham berbasis AI terdepan di Indonesia. Eksplorasi strategi kustom, akses strategi top performer, dan nikmati strategi premium berlangganan. Platform revolusioner dengan backtesting otomatis dan analisis investasi cerdas untuk memaksimalkan keuntungan investor Indonesia.",
  keywords: [
    "strategi saham berbasis AI",
    "eksplorasi strategi kustom",
    "strategi top performer",
    "strategi premium berlangganan",
    "backtesting saham otomatis",
    "analisis saham AI",
    "platform investasi cerdas",
    "algoritma trading Indonesia",
    "strategi saham terbaik",
    "investasi berbasis data",
    "AI trading platform",
    "backtesting Indonesia",
    "strategi investasi premium",
    "platform saham AI",
  ],
  ogTitle: "Tentang Algosaham.ai - Platform AI untuk Strategi Investasi Saham",
  ogDescription: "Platform revolusioner yang menggabungkan AI dengan analisis data mendalam untuk strategi investasi saham yang optimal. Backtesting otomatis dan strategi dipersonalisasi untuk investor Indonesia.",
  twitterTitle: "algosaham.ai - Strategi Saham Berbasis AI untuk Investor Indonesia",
  twitterDescription: "Platform AI terdepan untuk backtesting saham dan strategi investasi cerdas. Analisis otomatis dan strategi dipersonalisasi untuk memaksimalkan keuntungan investasi Anda.",
};

// Structured Data untuk SEO
export const aboutPageStructuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "algosaham.ai",
  description: "Platform strategi saham berbasis AI yang menyediakan backtesting otomatis dan analisis investasi cerdas untuk investor Indonesia",
  url: "https://algosaham.ai",
  logo: "https://algosaham.ai/logo.png",
  foundingDate: "2024",
  address: {
    "@type": "PostalAddress",
    addressCountry: "ID",
    addressRegion: "Indonesia",
  },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    availableLanguage: "Indonesian",
  },
  sameAs: ["https://twitter.com/algosaham", "https://linkedin.com/company/algosaham", "https://instagram.com/algosaham"],
  offers: {
    "@type": "Offer",
    description: "Platform backtesting saham berbasis AI dengan strategi investasi otomatis",
    category: "Financial Technology",
  },
};

// Meta tags untuk Next.js Head component
export const aboutPageMetaTags = {
  title: aboutPageSEO.title,
  description: aboutPageSEO.description,
  keywords: aboutPageSEO.keywords.join(", "),
  openGraph: {
    title: aboutPageSEO.ogTitle,
    description: aboutPageSEO.ogDescription,
    type: "website",
    url: "https://algosaham.ai/about",
    siteName: "algosaham.ai",
  },
  twitter: {
    card: "summary",
    title: aboutPageSEO.twitterTitle,
    description: aboutPageSEO.twitterDescription,
  },
  alternates: {
    canonical: "https://algosaham.ai/about",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};
