# Vayyy.Store — Solusi Digital Profesional

Website e-commerce dan layanan digital resmi untuk **Vayyy Store**, dirancang dengan identitas brand komersial modern (**White–Yellow / Hitam–Kuning**), mengedepankan kejelasan hierarki informasi, tipografi yang tegas, kebersihan tata letak kelas dunia (terinspirasi dari standar brand global seperti Adidas/Apple), serta sistem pemesanan langsung terintegrasi dan **Admin Control Center** fungsional.

---

## 🌟 Identitas Visual Baru & Karakteristik Desain

1. **Sistem Warna Komersial (White–Yellow & Dark Theme)**
   - **Mode Terang (Default)**: Latar belakang putih bersih (`#FFFFFF`) dan permukaan off-white (`#F8F9FA`), border abu-abu tipis (`#E5E7EB`), teks charcoal pekat (`#171717`) dengan kontras tinggi (WCAG AAA).
   - **Aksen Kuning Emas Kuat**: Warna kuning (`#F5C400` / `#E5AE00`) sebagai penegas aksi utama (CTA), tombol, badge, dan highlight, selalu dipadukan dengan teks hitam pekat demi keterbacaan optimal.
   - **Mode Gelap Penuh (Dark Theme)**: Didukung tombol toggle tema di navbar yang menyesuaikan seluruh komponen (kartu, form, modal, tabel admin, FAQ) ke palet charcoal-emas (`#0E0F12`, `#181B22`, `#F5C400`).

2. **Tipografi Bersih & Terstruktur**
   - Menggunakan satu keluarga font utama: **Inter** (`400`, `500`, `600`, `700`, `800`).
   - Penekanan visual yang tegas pada judul, deskripsi yang nyaman dibaca, serta angka harga yang menonjol.

3. **Ikon Resmi Simple Icons & Lucide React**
   - **WhatsApp**: Menggunakan siluet vektor resmi dari [Simple Icons](https://simpleicons.org/?q=whatsapp).
   - **Discord**: Menggunakan siluet vektor resmi dari [Simple Icons](https://simpleicons.org/?q=discord).
   - **GitHub**: Menggunakan siluet vektor resmi dari [Simple Icons](https://simpleicons.org/?q=github).
   - Ikon antarmuka menggunakan **Lucide React** (tanpa penggunaan emoji sebagai pengganti ikon antarmuka).

4. **Tanpa Delay Loading Screen**
   - Seluruh loading screen pembuka dan animasi matriks telah dihapus.
   - Konten halaman terbuka secara instan begitu pengguna mengakses website.

5. **Identitas Tab Browser & Favicon**
   - Judul tab browser tepat: **`Vayyy Store`**.
   - Favicon berbentuk lingkaran dengan monogram 'V' kuning di atas latar gelap, tajam pada resolusi 16x16, 32x32, dan mobile.

---

## 🚀 Fitur Halaman Publik

1. **Navbar**
   - Logo emblem lingkaran **Vayyy.Store**.
   - Menu navigasi: **Home**, **Pricelist**, **Testimoni**, **FAQ**.
   - Tombol pengalih tema (Light / Dark).
   - Tombol CTA khusus **Vayyy.Dev** yang mengarahkan ke portfolio resmi Vayyy.Dev.
   - Menu mobile drawer responsif.

2. **Hero Section**
   - Headline: *"Solusi Digital Profesional"*.
   - Deskripsi: *"Butuh bantuan setup, pembuatan bot, atau pengembangan website? Vayyy Store menyediakan layanan teknis yang cepat, aman, dan berkualitas untuk kebutuhan digital kamu."*
   - Tombol CTA *"Lihat Harga"* dengan scroll halus ke section Pricelist.
   - Tombol *"Join Discord"* dengan logo resmi Discord.
   - Nilai keunggulan: Garansi Teknis Resmi, Clean Code, Pengerjaan Cepat & Tepat.

3. **Pricelist — 6 Paket Layanan Komersial**
   - **Basic (Rp50.000)**: Landing Page & Portofolio (Maks 2 sub-halaman, 1x revisi, garansi 3 hari).
   - **Standard (Rp100.000)**: Company Profile & Bisnis (Maks 4 sub-halaman, 2x revisi, navigasi kategori, garansi 5 hari).
   - **Advanced (Rp250.000)**: Pricelist & Catalog — **Paket Unggulan** dengan border kuning tegas dan badge *"PALING LARIS"*, garansi 7 hari.
   - **Pro (Rp500.000)**: Automated Store (Maks 8 sub-halaman, 5x revisi, automated payment, gratis domain .my.id / .web.id, garansi 14 hari).
   - **Expert (Rp1.000.000)**: Custom System (Maks 15 halaman, 7x revisi, multi-role login, multi-bahasa, badge *"TOP TIER"*, garansi 1 bulan).
   - **Custom (Mulai Dari Rp25.000)**: Custom Website — Label *"MULAI DARI Rp25.000"*, penyesuaian fitur & halaman dengan catatan harga akhir mengikuti ruang lingkup pekerjaan.

4. **Sistem Pemesanan WhatsApp Terintegrasi Promo**
   - Tombol *"Order Sekarang"* membuka `https://wa.me/` dengan nomor resmi terpusat.
   - Pesan otomatis diformat dinamis sesuai nama dan harga paket.
   - Input kupon promo (cth: `VAYYYLAUNCH` untuk diskon 10%): jika diaplikasikan, harga lama dicoret, harga diskon dihitung real-time, dan pesan WhatsApp otomatis mencantumkan rincian promo.

5. **Layanan Lainnya (Other Modal)**
   - Tombol *"Layanan Lainnya (Other)"* membuka modal penawaran non-website (Bot Discord, Setup Minecraft, Akun Premium, Make Skins).
   - Dilengkapi tombol direct link ke server Discord Vayyy Store: `https://discord.gg/S8vcsZtgRM`.

6. **Testimoni & Skor Rata-rata Dinamis**
   - Kalkulasi otomatis skor rata-rata dari seluruh ulasan yang berstatus *published*:
     $$\text{Rating Rata-rata} = \frac{\sum \text{Seluruh Rating Published}}{\text{Jumlah Testimoni Published}}$$
   - Menampilkan bintang, tanggal ulasan, nama klien, dan jenis layanan yang dipesan.
   - Penanganan *empty state* yang rapi jika belum ada ulasan dipublikasikan.

7. **FAQ (Frequently Asked Questions)**
   - Accordion interaktif dengan 5 pertanyaan dan jawaban seputar error setup, sistem pembayaran, waktu pengerjaan, persiapan pemesanan, dan dukungan pasca proyek.
   - Ramah keyboard (`Tab`, `Enter`, `Spasi`).

8. **Footer & Tombol Akses Admin Tersembunyi**
   - Logo, deskripsi layanan, tautan navigasi, tautan Discord, tautan WhatsApp, dan copyright dengan tahun dinamis otomatis (`new Date().getFullYear()`).
   - **Tombol Admin Tersembunyi**: Tombol berbentuk lingkaran kecil (*dot*) di samping copyright teks.
   - Mengklik dot membuka modal kecil **"Admin Access"** untuk memasukkan password.

---

## 🔐 Autentikasi Admin & Keamanan Password

- **Password Awal Admin**:
  ```text
  vayyystore2026
  ```
- **Keamanan**:
  - Password **TIDAK PERNAH** disimpan dalam bentuk plaintext di frontend bundle maupun log.
  - Verifikasi menggunakan hash standar **SHA-256** (`c45b4773f7d5ce22cd841afe0ff6683364c981a20c4390da56a82acafa64aafe`).
  - Dilengkapi proteksi *rate-limiting* (penguncian akses selama 30 detik setelah 5 kali berturut-turut memasukkan password yang salah).
  - Menggunakan token sesi kriptografis dengan masa berlaku 12 jam.
  - Tersedia tombol **Keluar (Logout)** untuk mengakhiri sesi kapan saja.
  - Admin dapat mengganti password kapan saja melalui tab **Pengaturan & FAQ** di Admin Panel.

---

## 🛠️ Panduan Menjalankan Proyek

### 1. Instalasi
```bash
npm install
```

### 2. Menjalankan Server Development
```bash
npm run dev
```
Akses di browser pada: `http://localhost:3001`

### 3. Build Produksi
```bash
npm run build
```
Hasil kompilasi siap deploy tersedia di direktori `dist/`.

---

## ⚙️ Konfigurasi `.env`

Salin `.env.example` ke `.env`:
```env
# 1. Supabase (Opsional - Jika belum diisi, otomatis menggunakan local persistent engine)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# 2. Kontak & Komunitas
VITE_WHATSAPP_NUMBER=6285816300442
VITE_DISCORD_URL=https://discord.gg/S8vcsZtgRM
VITE_VAYYY_DEV_URL=https://vayyy.dev
```

---

## 📊 Laporan Pengujian (QA Summary)

| No | Pengujian | Hasil Pengujian | Status |
|:---|:---|:---|:---:|
| 1 | **Loading Screen** | Dihapus sepenuhnya; website langsung terbuka instan | ✅ Lulus |
| 2 | **Judul Tab & Favicon** | Judul tepat `Vayyy Store`; favicon circular vector jelas | ✅ Lulus |
| 3 | **Theme Toggle** | Beralih mulus antara tema White-Yellow dan Dark Theme | ✅ Lulus |
| 4 | **Pricelist & WhatsApp** | 6 paket ditampilkan, tombol WA membuka URL valid wa.me | ✅ Lulus |
| 5 | **Kupon Diskon** | `VAYYYLAUNCH` memotong harga 10% dan mencoret harga lama | ✅ Lulus |
| 6 | **Modal Other** | Membuka popup layanan lain dengan tombol resmi Discord | ✅ Lulus |
| 7 | **Accordion FAQ** | Buka/tutup pertanyaan lancar dan responsif | ✅ Lulus |
| 8 | **Footer Admin Dot** | Dot bulat di footer membuka modal "Admin Access" | ✅ Lulus |
| 9 | **Password Salah** | Muncul pesan error "Password admin tidak valid" | ✅ Lulus |
| 10 | **Password Benar** | `vayyystore2026` berhasil login ke Admin Control Center | ✅ Lulus |
| 11 | **Admin CRUD** | Data paket, promo, testimoni, dan FAQ tersimpan persisten | ✅ Lulus |
| 12 | **Admin Logout** | Tombol keluar menghapus sesi dan menutup dashboard | ✅ Lulus |
| 13 | **Uji Responsivitas** | Tampilan mobile (390x844) tanpa horizontal overflow | ✅ Lulus |
| 14 | **Production Build** | `npm run build` sukses 100% tanpa error TypeScript | ✅ Lulus |

---

© 2026 **Vayyy Store**. All rights reserved.
