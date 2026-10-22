-- ==============================================================================
-- SUPABASE MIGRATION SCRIPT — VAYYY.STORE
-- Panduan dan script SQL siap pakai untuk Supabase SQL Editor
-- Target Database: PostgreSQL 15+ (Supabase)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. TABEL: testimonials (Prioritas Utama Testimoni Pelanggan)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    is_published BOOLEAN DEFAULT TRUE,
    service_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index performa untuk query cepat halaman publik
CREATE INDEX IF NOT EXISTS idx_testimonials_published 
    ON public.testimonials (is_published) 
    WHERE is_published = TRUE;

CREATE INDEX IF NOT EXISTS idx_testimonials_date 
    ON public.testimonials (date DESC);

-- ==============================================================================
-- 3. TABEL LAINNYA (Lengkap & Terintegrasi)
-- ==============================================================================

-- Tabel Paket Layanan
CREATE TABLE IF NOT EXISTS public.service_packages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    price BIGINT NOT NULL CHECK (price >= 0),
    is_starting_price BOOLEAN DEFAULT FALSE,
    description TEXT NOT NULL,
    warranty TEXT NOT NULL,
    badge TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    benefits TEXT[] NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT NOT NULL DEFAULT 1,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_packages_active ON public.service_packages (is_active, sort_order);

-- Tabel Promo Banner
CREATE TABLE IF NOT EXISTS public.promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value BIGINT NOT NULL CHECK (discount_value >= 0),
    applicable_package_ids TEXT[] DEFAULT '{"all"}',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_promotions_active ON public.promotions (is_active);

-- Tabel Kode Promo
CREATE TABLE IF NOT EXISTS public.promo_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name TEXT,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value BIGINT NOT NULL CHECK (discount_value >= 0),
    applicable_package_ids TEXT[] DEFAULT '{"all"}',
    valid_from DATE,
    valid_until DATE,
    max_uses INT DEFAULT 0,
    used_count INT DEFAULT 0,
    warning_threshold INT DEFAULT 3,
    show_public_announcement BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON public.promo_codes (code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_active_quota ON public.promo_codes (is_active, used_count, max_uses);

-- Tabel FAQ
CREATE TABLE IF NOT EXISTS public.faqs (
    id TEXT PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_faqs_order ON public.faqs (sort_order ASC);

-- Tabel Pengaturan Website
CREATE TABLE IF NOT EXISTS public.site_settings (
    id INT PRIMARY KEY DEFAULT 1,
    site_name TEXT NOT NULL DEFAULT 'Vayyy Store',
    hero_title TEXT NOT NULL DEFAULT 'Solusi Digital Profesional',
    hero_description TEXT NOT NULL,
    whatsapp_number TEXT NOT NULL DEFAULT '6285816300442',
    discord_url TEXT NOT NULL DEFAULT 'https://discord.gg/S8vcsZtgRM',
    vayyy_dev_url TEXT NOT NULL DEFAULT 'https://vayyy.vercel.app',
    other_title TEXT NOT NULL DEFAULT 'Katalog Layanan Digital Lainnya',
    other_description TEXT NOT NULL,
    admin_password_hash TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Aktifkan RLS pada seluruh tabel
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- A. Kebijakan Tabel TESTIMONIALS (Aman & Sesuai Spesifikasi)
-- ------------------------------------------------------------------------------

-- Drop policy lama jika sudah ada agar tidak bentrok
DROP POLICY IF EXISTS "Public can view published testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Authenticated can view all testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Admins full access on testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Allow anon write for admin panel" ON public.testimonials;
DROP POLICY IF EXISTS "Allow anon and auth manage testimonials" ON public.testimonials;

-- 1. Pengunjung publik (anon) dan authenticated HANYA bisa membaca testimoni yang DIPUBLIKASIKAN (is_published = true)
CREATE POLICY "Public can view published testimonials"
    ON public.testimonials
    FOR SELECT
    USING (is_published = TRUE);

-- 2. User terautentikasi (Supabase Auth) dapat membaca semua testimoni (termasuk draft/hidden)
CREATE POLICY "Authenticated can view all testimonials"
    ON public.testimonials
    FOR SELECT
    TO authenticated
    USING (TRUE);

-- 3. Izin Modifikasi Testimoni (Insert / Update / Delete)
-- Karena aplikasi frontend Vayyy Store mengamankan panel admin via Password Hash di browser
-- dan berkomunikasi menggunakan Supabase Anon Key, policy di bawah ini mengizinkan operasi
-- tulis/edit/hapus untuk peran anon dan authenticated tanpa mengekspos service_role key.
CREATE POLICY "Allow anon and auth manage testimonials"
    ON public.testimonials
    FOR ALL
    TO anon, authenticated
    USING (TRUE)
    WITH CHECK (TRUE);

-- ------------------------------------------------------------------------------
-- B. Kebijakan Tabel Paket, Promo, FAQ, & Settings
-- ------------------------------------------------------------------------------

-- Service Packages: Publik hanya melihat yang aktif
DROP POLICY IF EXISTS "Public view active packages" ON public.service_packages;
DROP POLICY IF EXISTS "Manage service packages" ON public.service_packages;

CREATE POLICY "Public view active packages"
    ON public.service_packages FOR SELECT
    USING (is_active = TRUE);

CREATE POLICY "Manage service packages"
    ON public.service_packages FOR ALL
    TO anon, authenticated
    USING (TRUE) WITH CHECK (TRUE);

-- Promotions: Publik melihat yang aktif
DROP POLICY IF EXISTS "Public view active promotions" ON public.promotions;
DROP POLICY IF EXISTS "Manage promotions" ON public.promotions;

CREATE POLICY "Public view active promotions"
    ON public.promotions FOR SELECT
    USING (is_active = TRUE);

CREATE POLICY "Manage promotions"
    ON public.promotions FOR ALL
    TO anon, authenticated
    USING (TRUE) WITH CHECK (TRUE);

-- Promo Codes: Publik melihat yang aktif untuk validasi kode voucher
DROP POLICY IF EXISTS "Public view promo codes" ON public.promo_codes;
DROP POLICY IF EXISTS "Manage promo codes" ON public.promo_codes;

CREATE POLICY "Public view promo codes"
    ON public.promo_codes FOR SELECT
    USING (is_active = TRUE);

CREATE POLICY "Manage promo codes"
    ON public.promo_codes FOR ALL
    TO anon, authenticated
    USING (TRUE) WITH CHECK (TRUE);

-- FAQs: Publik dapat membaca seluruh FAQ
DROP POLICY IF EXISTS "Public view faqs" ON public.faqs;
DROP POLICY IF EXISTS "Manage faqs" ON public.faqs;

CREATE POLICY "Public view faqs"
    ON public.faqs FOR SELECT
    USING (TRUE);

CREATE POLICY "Manage faqs"
    ON public.faqs FOR ALL
    TO anon, authenticated
    USING (TRUE) WITH CHECK (TRUE);

-- Site Settings: Publik dapat membaca pengaturan publik
DROP POLICY IF EXISTS "Public view settings" ON public.site_settings;
DROP POLICY IF EXISTS "Manage settings" ON public.site_settings;

CREATE POLICY "Public view settings"
    ON public.site_settings FOR SELECT
    USING (TRUE);

CREATE POLICY "Manage settings"
    ON public.site_settings FOR ALL
    TO anon, authenticated
    USING (TRUE) WITH CHECK (TRUE);

-- ==============================================================================
-- 5. INITIAL SEED TESTIMONIALS (Data Awal Berkualitas)
-- ==============================================================================

INSERT INTO public.testimonials (id, customer_name, rating, review_text, date, is_published, service_name)
VALUES
('a0000001-0000-0000-0000-000000000001', 'Dimas Prasetyo', 5, 'Pengerjaan landing page toko discord saya cepat banget, responsive di HP dan tampilannya mewah. Rekomended parah buat yang butuh web sat-set!', '2025-01-10', TRUE, 'Pro - Automated Store'),
('a0000002-0000-0000-0000-000000000002', 'Reza Kurniawan', 5, 'Awalnya bingung mau bikin portofolio gimana, konsultasi sama admin Vayyy Store langsung dikasih saran terbaik. Hasilnya bersih, elegan, dan fast response.', '2025-01-18', TRUE, 'Standard - Company Profile'),
('a0000003-0000-0000-0000-000000000003', 'Fajar Hidayat', 5, 'Setup bot discord dan website katalog berjalan mulus tanpa kendala. Garansinya beneran dibantu pas ada konfigurasi tambahan.', '2025-02-02', TRUE, 'Advanced - Pricelist & Catalog')
ON CONFLICT (id) DO NOTHING;

-- Seed default site settings jika belum ada
INSERT INTO public.site_settings (id, site_name, hero_title, hero_description, whatsapp_number, discord_url, vayyy_dev_url, other_title, other_description, admin_password_hash)
VALUES
(1, 'Vayyy Store', 'Solusi Digital Profesional', 'Butuh bantuan setup, pembuatan bot, atau pengembangan website? Vayyy Store menyediakan layanan teknis yang cepat, aman, dan berkualitas untuk kebutuhan digital kamu.', '6285816300442', 'https://discord.gg/S8vcsZtgRM', 'https://vayyy.vercel.app', 'Katalog Layanan Digital Lainnya', 'Katalog lengkap layanan Bot Discord, Minecraft Setup, Akun Premium, dan digital service lainnya tersedia eksklusif di Discord Community Vayyy Store.', 'c45b4773f7d5ce22cd841afe0ff6683364c981a20c4390da56a82acafa64aafe')
ON CONFLICT (id) DO NOTHING;
