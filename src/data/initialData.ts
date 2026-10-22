import { ServicePackage, FaqItem, SiteSettings, Promotion, PromoCode, Testimonial } from '../types';

export const INITIAL_PACKAGES: ServicePackage[] = [
  {
    id: 'basic',
    name: 'Basic',
    subtitle: 'Landing Page & Portofolio',
    price: 50000,
    description: 'Cocok untuk branding personal, portofolio, atau biodata profesional.',
    warranty: '3 hari',
    benefits: [
      { text: 'Maksimal 2 sub-halaman', type: 'included' },
      { text: '1x revisi', type: 'included' },
      { text: 'Tampilan responsif', type: 'included' },
      { text: 'Desain minimalis', type: 'included' },
      { text: 'Domain gratis tidak termasuk', type: 'excluded' }
    ],
    isActive: true,
    sortOrder: 1
  },
  {
    id: 'standard',
    name: 'Standard',
    subtitle: 'Company Profile & Bisnis',
    price: 100000,
    description: 'Cocok untuk profil organisasi, landing page usaha, atau katalog layanan.',
    warranty: '5 hari',
    benefits: [
      { text: 'Semua fitur Basic', type: 'included' },
      { text: 'Maksimal 4 sub-halaman', type: 'included' },
      { text: '2x revisi', type: 'included' },
      { text: 'Mobile friendly', type: 'included' },
      { text: 'Navigasi kategori', type: 'included' },
      { text: 'Domain gratis tidak termasuk', type: 'excluded' }
    ],
    isActive: true,
    sortOrder: 2
  },
  {
    id: 'advanced',
    name: 'Advanced',
    subtitle: 'Pricelist & Catalog',
    price: 250000,
    description: 'Cocok untuk daftar harga, katalog produk, atau landing page dengan navigasi kategori.',
    warranty: '7 hari',
    badge: 'PALING LARIS',
    isFeatured: true,
    benefits: [
      { text: 'Semua fitur Standard', type: 'included' },
      { text: 'Maksimal 6 sub-halaman', type: 'included' },
      { text: '3x revisi', type: 'included' },
      { text: 'Optimized Theme', type: 'included' },
      { text: 'Dashboard panel', type: 'included' },
      { text: 'Visitor counter', type: 'included' },
      { text: 'Domain gratis tidak termasuk', type: 'excluded' }
    ],
    isActive: true,
    sortOrder: 3
  },
  {
    id: 'pro',
    name: 'Pro',
    subtitle: 'Automated Store',
    price: 500000,
    description: 'Cocok untuk toko produk digital yang membutuhkan proses otomatis.',
    warranty: '14 hari',
    benefits: [
      { text: 'Semua fitur Advanced', type: 'included' },
      { text: 'Maksimal 8 sub-halaman', type: 'included' },
      { text: '5x revisi', type: 'included' },
      { text: 'Automated payment', type: 'included' },
      { text: 'Dashboard manajemen', type: 'included' },
      { text: 'SEO setup', type: 'included' },
      { text: 'Antrean prioritas', type: 'included' },
      { text: 'Gratis domain .my.id atau .web.id (sesuai ketersediaan & ketentuan penyedia)', type: 'included' }
    ],
    isActive: true,
    sortOrder: 4
  },
  {
    id: 'expert',
    name: 'Expert',
    subtitle: 'Custom System',
    price: 1000000,
    description: 'Cocok untuk sistem khusus seperti toko server game, billing, dan kebutuhan digital lainnya.',
    warranty: '1 bulan',
    badge: 'TOP TIER',
    benefits: [
      { text: 'Semua fitur Pro', type: 'included' },
      { text: 'Maksimal 15 halaman', type: 'included' },
      { text: '7x revisi', type: 'included' },
      { text: 'Login multi-role', type: 'included' },
      { text: 'Email authentication', type: 'included' },
      { text: 'Multi-bahasa', type: 'included' },
      { text: 'Sistem testimoni klien', type: 'included' },
      { text: 'Antrean super prioritas', type: 'included' },
      { text: 'Gratis domain .com, .net, atau .org (sesuai ketersediaan & ketentuan penyedia)', type: 'included' },
      { text: 'Konsultasi penambahan fitur', type: 'included' },
      { text: 'Dukungan teknis selama 1 bulan', type: 'included' }
    ],
    isActive: true,
    sortOrder: 5
  },
  {
    id: 'custom',
    name: 'Custom',
    subtitle: 'Custom Website',
    price: 25000,
    isStartingPrice: true,
    description: 'Cocok untuk kamu yang hanya membutuhkan halaman atau fitur tertentu sesuai kebutuhan dan budget.',
    warranty: 'Sesuai kesepakatan',
    badge: 'FLEKSIBEL',
    benefits: [
      { text: 'Harga mulai Rp25.000', type: 'info' },
      { text: 'Fitur disesuaikan dengan permintaan', type: 'included' },
      { text: 'Jumlah halaman berdasarkan kesepakatan', type: 'info' },
      { text: 'Revisi dan estimasi pengerjaan disepakati sebelum pesanan dimulai', type: 'info' },
      { text: 'Bisa digunakan untuk penambahan fitur atau website sederhana', type: 'included' },
      { text: 'Garansi dan jumlah revisi mengikuti kesepakatan proyek', type: 'info' }
    ],
    isActive: true,
    sortOrder: 6,
    note: 'Harga akhir mengikuti kompleksitas dan ruang lingkup pekerjaan.'
  }
];

export const INITIAL_FAQS: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'Kalau ada error setelah setup, gimana?',
    answer: 'Hubungi kami lewat Discord atau WhatsApp dan jelaskan kendalanya. Kami akan bantu mengecek sesuai layanan yang kamu pesan dan masa garansi yang berlaku.',
    sortOrder: 1
  },
  {
    id: 'faq-2',
    question: 'Sistem pembayarannya gimana nih?',
    answer: 'Metode dan detail pembayaran akan diinformasikan saat konsultasi atau pemesanan. Pesanan mulai dikerjakan setelah detail pesanan dan pembayaran dikonfirmasi.',
    sortOrder: 2
  },
  {
    id: 'faq-3',
    question: 'Berapa lama waktu pengerjaan biasanya?',
    answer: 'Tergantung paket dan tingkat kesulitan fitur yang diminta. Estimasi pengerjaan akan dibahas sebelum project dimulai.',
    sortOrder: 3
  },
  {
    id: 'faq-4',
    question: 'Saya harus siapin apa aja sebelum mulai?',
    answer: 'Siapkan gambaran website atau layanan yang kamu inginkan, konten yang sudah tersedia, dan referensi desain jika ada. Kalau masih bingung, kamu bisa konsultasi dulu.',
    sortOrder: 4
  },
  {
    id: 'faq-5',
    question: 'Boleh tanya-tanya setelah project kelar?',
    answer: 'Boleh. Kamu tetap bisa menghubungi kami untuk bertanya. Untuk perbaikan dan dukungan teknis, ketentuannya mengikuti layanan serta masa garansi yang berlaku.',
    sortOrder: 5
  }
];

export const INITIAL_TESTIMONIALS: Testimonial[] = [
  {
    id: 'a0000001-0000-0000-0000-000000000001',
    customerName: 'Dimas Prasetyo',
    rating: 5,
    reviewText: 'Pengerjaan landing page toko discord saya cepat banget, responsive di HP dan tampilannya mewah. Rekomended parah buat yang butuh web sat-set!',
    date: '2025-01-10',
    isPublished: true,
    serviceName: 'Pro - Automated Store'
  },
  {
    id: 'a0000002-0000-0000-0000-000000000002',
    customerName: 'Reza Kurniawan',
    rating: 5,
    reviewText: 'Awalnya bingung mau bikin portofolio gimana, konsultasi sama admin Vayyy Store langsung dikasih saran terbaik. Hasilnya bersih, elegan, dan fast response.',
    date: '2025-01-18',
    isPublished: true,
    serviceName: 'Standard - Company Profile'
  },
  {
    id: 'a0000003-0000-0000-0000-000000000003',
    customerName: 'Fajar Hidayat',
    rating: 5,
    reviewText: 'Setup bot discord dan website katalog berjalan mulus tanpa kendala. Garansinya beneran dibantu pas ada konfigurasi tambahan.',
    date: '2025-02-02',
    isPublished: true,
    serviceName: 'Advanced - Pricelist & Catalog'
  }
];

export const INITIAL_PROMOTIONS: Promotion[] = [];

export const INITIAL_PROMO_CODES: PromoCode[] = [
  {
    id: 'promo-launch',
    code: 'VAYYYLAUNCH',
    discountType: 'percentage',
    discountValue: 10,
    applicablePackageIds: ['all'],
    validFrom: '2025-01-01T00:00',
    validUntil: '2027-12-31T23:59',
    isActive: true
  }
];

export const INITIAL_SETTINGS: SiteSettings = {
  siteName: 'Vayyy Store',
  heroTitle: 'Solusi Digital Profesional',
  heroDescription: 'Butuh bantuan setup, pembuatan bot, atau pengembangan website? Vayyy Store menyediakan layanan teknis yang cepat, aman, dan berkualitas untuk kebutuhan digital kamu.',
  whatsappNumber: '6285816300442',
  discordUrl: 'https://discord.gg/S8vcsZtgRM',
  vayyyDevUrl: 'https://vayyy.dev',
  otherTitle: 'Katalog Layanan Digital Lainnya',
  otherDescription: 'Katalog lengkap layanan Bot Discord, Minecraft Setup, Akun Premium, dan digital service lainnya tersedia eksklusif di Discord Community Vayyy Store.',
  adminPasswordHash: 'c45b4773f7d5ce22cd841afe0ff6683364c981a20c4390da56a82acafa64aafe' // SHA-256 hash of 'vayyystore2026'
};
