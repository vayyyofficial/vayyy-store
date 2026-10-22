-- ==============================================================================
-- DATABASE SCHEMA & ROW LEVEL SECURITY (RLS) — VAYYY.STORE
-- Compatible with Supabase (PostgreSQL 15+)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLE: service_packages
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

-- 3. TABLE: testimonials
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name TEXT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    is_published BOOLEAN DEFAULT TRUE,
    service_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLE: promotions
CREATE TABLE IF NOT EXISTS public.promotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- 5. TABLE: promo_codes
CREATE TABLE IF NOT EXISTS public.promo_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- 6. TABLE: faqs
CREATE TABLE IF NOT EXISTS public.faqs (
    id TEXT PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABLE: site_settings
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
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.service_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- 1. service_packages Policies:
-- Public can read active packages
CREATE POLICY "Public can view active packages"
    ON public.service_packages
    FOR SELECT
    USING (is_active = true OR auth.role() = 'authenticated');

-- Authenticated admins can insert/update/delete packages
CREATE POLICY "Admins full access on service_packages"
    ON public.service_packages
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- 2. testimonials Policies:
-- Public can read published testimonials
CREATE POLICY "Public can view published testimonials"
    ON public.testimonials
    FOR SELECT
    USING (is_published = true OR auth.role() = 'authenticated');

-- Admins full access on testimonials
CREATE POLICY "Admins full access on testimonials"
    ON public.testimonials
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- 3. promotions Policies:
-- Public can view active promotions
CREATE POLICY "Public can view active promotions"
    ON public.promotions
    FOR SELECT
    USING (is_active = true OR auth.role() = 'authenticated');

-- Admins full access on promotions
CREATE POLICY "Admins full access on promotions"
    ON public.promotions
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- 4. promo_codes Policies:
-- Public can read active promo codes for validation
CREATE POLICY "Public can view active promo codes"
    ON public.promo_codes
    FOR SELECT
    USING (is_active = true OR auth.role() = 'authenticated');

-- Admins full access on promo_codes
CREATE POLICY "Admins full access on promo_codes"
    ON public.promo_codes
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- 5. faqs Policies:
CREATE POLICY "Public can view faqs"
    ON public.faqs
    FOR SELECT
    USING (true);

CREATE POLICY "Admins full access on faqs"
    ON public.faqs
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- 6. site_settings Policies:
CREATE POLICY "Public can view site settings"
    ON public.site_settings
    FOR SELECT
    USING (true);

CREATE POLICY "Admins full access on site_settings"
    ON public.site_settings
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- ==============================================================================
-- INITIAL SEED DATA
-- ==============================================================================

INSERT INTO public.service_packages (id, name, subtitle, price, is_starting_price, description, warranty, badge, is_featured, benefits, is_active, sort_order, note)
VALUES
('basic', 'Basic', 'Landing Page & Portofolio', 50000, FALSE, 'Cocok untuk branding personal, portofolio, atau biodata profesional.', '3 hari', NULL, FALSE, ARRAY['Maksimal 2 sub-halaman', '1x revisi', 'Tampilan responsif', 'Desain minimalis', 'Domain gratis tidak termasuk'], TRUE, 1, NULL),
('standard', 'Standard', 'Company Profile & Bisnis', 100000, FALSE, 'Cocok untuk profil organisasi, landing page usaha, atau katalog layanan.', '5 hari', NULL, FALSE, ARRAY['Semua fitur Basic', 'Maksimal 4 sub-halaman', '2x revisi', 'Mobile friendly', 'Navigasi kategori', 'Domain gratis tidak termasuk'], TRUE, 2, NULL),
('advanced', 'Advanced', 'Pricelist & Catalog', 250000, FALSE, 'Cocok untuk daftar harga, katalog produk, atau landing page dengan navigasi kategori.', '7 hari', 'PALING LARIS', TRUE, ARRAY['Semua fitur Standard', 'Maksimal 6 sub-halaman', '3x revisi', 'Optimized Theme', 'Dashboard panel', 'Visitor counter', 'Domain gratis tidak termasuk'], TRUE, 3, NULL),
('pro', 'Pro', 'Automated Store', 500000, FALSE, 'Cocok untuk toko produk digital yang membutuhkan proses otomatis.', '14 hari', NULL, FALSE, ARRAY['Semua fitur Advanced', 'Maksimal 8 sub-halaman', '5x revisi', 'Automated payment', 'Dashboard manajemen', 'SEO setup', 'Antrean prioritas', 'Gratis domain .my.id atau .web.id (sesuai ketersediaan & ketentuan penyedia)'], TRUE, 4, NULL),
('expert', 'Expert', 'Custom System', 1000000, FALSE, 'Cocok untuk sistem khusus seperti toko server game, billing, dan kebutuhan digital lainnya.', '1 bulan', 'TOP TIER', FALSE, ARRAY['Semua fitur Pro', 'Maksimal 15 halaman', '7x revisi', 'Login multi-role', 'Email authentication', 'Multi-bahasa', 'Sistem testimoni klien', 'Antrean super prioritas', 'Gratis domain .com, .net, atau .org (sesuai ketersediaan & ketentuan penyedia)', 'Konsultasi penambahan fitur', 'Dukungan teknis selama 1 bulan'], TRUE, 5, NULL),
('custom', 'Custom', 'Custom Website', 25000, TRUE, 'Cocok untuk kamu yang hanya membutuhkan halaman atau fitur tertentu sesuai kebutuhan dan budget.', 'Sesuai kesepakatan', 'MULAI DARI Rp25.000', FALSE, ARRAY['Harga mulai Rp25.000', 'Fitur disesuaikan dengan permintaan', 'Jumlah halaman berdasarkan kesepakatan', 'Revisi dan estimasi pengerjaan disepakati sebelum pesanan dimulai', 'Bisa digunakan untuk penambahan fitur atau website sederhana', 'Garansi dan jumlah revisi mengikuti kesepakatan proyek'], TRUE, 6, 'Harga akhir mengikuti kompleksitas dan ruang lingkup pekerjaan.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.faqs (id, question, answer, sort_order)
VALUES
('faq-1', 'Kalau ada error setelah setup, gimana?', 'Hubungi kami lewat Discord atau WhatsApp dan jelaskan kendalanya. Kami akan bantu mengecek sesuai layanan yang kamu pesan dan masa garansi yang berlaku.', 1),
('faq-2', 'Sistem pembayarannya gimana nih?', 'Metode dan detail pembayaran akan diinformasikan saat konsultasi atau pemesanan. Pesanan mulai dikerjakan setelah detail pesanan dan pembayaran dikonfirmasi.', 2),
('faq-3', 'Berapa lama waktu pengerjaan biasanya?', 'Tergantung paket dan tingkat kesulitan fitur yang diminta. Estimasi pengerjaan akan dibahas sebelum project dimulai.', 3),
('faq-4', 'Saya harus siapin apa aja sebelum mulai?', 'Siapkan gambaran website atau layanan yang kamu inginkan, konten yang sudah tersedia, dan referensi desain jika ada. Kalau masih bingung, kamu bisa konsultasi dulu.', 4),
('faq-5', 'Boleh tanya-tanya setelah project kelar?', 'Boleh. Kamu tetap bisa menghubungi kami untuk bertanya. Untuk perbaikan dan dukungan teknis, ketentuannya mengikuti layanan serta masa garansi yang berlaku.', 5)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.promo_codes (code, discount_type, discount_value, applicable_package_ids, valid_from, valid_until, max_uses, used_count, is_active)
VALUES
('VAYYYLAUNCH', 'percentage', 10, '{"all"}', '2025-01-01', '2027-12-31', 100, 0, TRUE)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.site_settings (id, site_name, hero_title, hero_description, whatsapp_number, discord_url, vayyy_dev_url, other_title, other_description, admin_password_hash)
VALUES
(1, 'Vayyy Store', 'Solusi Digital Profesional', 'Butuh bantuan setup, pembuatan bot, atau pengembangan website? Vayyy Store menyediakan layanan teknis yang cepat, aman, dan berkualitas untuk kebutuhan digital kamu.', '6285816300442', 'https://discord.gg/S8vcsZtgRM', 'https://vayyy.vercel.app', 'Katalog Layanan Digital Lainnya', 'Katalog lengkap layanan Bot Discord, Minecraft Setup, Akun Premium, dan digital service lainnya tersedia eksklusif di Discord Community Vayyy Store.', 'c45b4773f7d5ce22cd841afe0ff6683364c981a20c4390da56a82acafa64aafe')
ON CONFLICT (id) DO NOTHING;
