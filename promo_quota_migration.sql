-- ==============================================================================
-- MIGRATION: SISTEM PROMO BERBASIS KUPON DENGAN KUOTA MANUAL
-- Vayyy.Store — Supabase PostgreSQL
-- ==============================================================================

-- 1. Tambahkan kolom pendukung kuota promo jika belum ada
ALTER TABLE public.promo_codes 
    ADD COLUMN IF NOT EXISTS name TEXT,
    ADD COLUMN IF NOT EXISTS max_uses INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS used_count INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS warning_threshold INT DEFAULT 3,
    ADD COLUMN IF NOT EXISTS show_public_announcement BOOLEAN DEFAULT TRUE;

-- 2. Beri komentar dokumentasi kolom
COMMENT ON COLUMN public.promo_codes.name IS 'Nama deskriptif promo kupon (cth: Promo Website)';
COMMENT ON COLUMN public.promo_codes.max_uses IS 'Kuota awal kupon yang tersedia (0 = tidak terbatas)';
COMMENT ON COLUMN public.promo_codes.used_count IS 'Jumlah kupon yang sudah dikonfirmasi manual oleh admin';
COMMENT ON COLUMN public.promo_codes.warning_threshold IS 'Batas sisa kuota untuk memicu peringatan kuota menipis (default 3)';
COMMENT ON COLUMN public.promo_codes.show_public_announcement IS 'Apakah banner kuota ditampilkan di halaman publik';

-- 3. Update data promo lama agar memiliki nilai default yang valid
UPDATE public.promo_codes 
SET 
    name = COALESCE(name, code),
    max_uses = COALESCE(max_uses, 0),
    used_count = COALESCE(used_count, 0),
    warning_threshold = COALESCE(warning_threshold, 3),
    show_public_announcement = COALESCE(show_public_announcement, TRUE)
WHERE name IS NULL OR warning_threshold IS NULL;

-- 4. Indeks performa untuk query promo aktif
CREATE INDEX IF NOT EXISTS idx_promo_codes_active_quota 
    ON public.promo_codes (is_active, used_count, max_uses);

-- 5. Kebijakan Row Level Security (RLS)
-- Publik dapat melihat promo aktif untuk validasi kode dan pengumuman
DROP POLICY IF EXISTS "Public can view active promo codes" ON public.promo_codes;
CREATE POLICY "Public can view active promo codes"
    ON public.promo_codes
    FOR SELECT
    USING (is_active = true OR auth.role() = 'authenticated');

-- Admin berwenang memiliki akses penuh (Insert, Update, Delete)
DROP POLICY IF EXISTS "Admins full access on promo_codes" ON public.promo_codes;
CREATE POLICY "Admins full access on promo_codes"
    ON public.promo_codes
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');
