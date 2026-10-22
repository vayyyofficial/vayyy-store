import {
  ServicePackage,
  FaqItem,
  SiteSettings,
  Promotion,
  PromoCode,
  PromoStatus,
  Testimonial,
  AdminAuthState
} from '../types';
import {
  INITIAL_PACKAGES,
  INITIAL_FAQS,
  INITIAL_TESTIMONIALS,
  INITIAL_PROMOTIONS,
  INITIAL_PROMO_CODES,
  INITIAL_SETTINGS
} from '../data/initialData';
import { supabase, isSupabaseConfigured } from './supabase';

const STORAGE_KEYS = {
  PACKAGES: 'vayyy_store_packages_v1',
  FAQS: 'vayyy_store_faqs_v1',
  TESTIMONIALS: 'vayyy_store_testimonials_v1',
  PROMOTIONS: 'vayyy_store_promotions_v1',
  PROMO_CODES: 'vayyy_store_promo_codes_v1',
  SETTINGS: 'vayyy_store_settings_v1',
  AUTH_SESSION: 'vayyy_store_admin_session_v1'
};

// Event system to synchronize state across components and tabs
export const STORE_UPDATE_EVENT = 'vayyy_store_data_updated';

export const notifyDataUpdated = () => {
  window.dispatchEvent(new CustomEvent(STORE_UPDATE_EVENT));
};

// Cryptographic SHA-256 helper
export async function sha256(message: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// ---------------- Local Cache & Storage Helpers ----------------
function loadLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`Error reading ${key} from storage:`, err);
    return fallback;
  }
}

function saveLocal<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    notifyDataUpdated();
  } catch (err) {
    console.error(`Error saving ${key} to storage:`, err);
  }
}

// Initialize seed data if not present
export function initSeedData(): void {
  if (!localStorage.getItem(STORAGE_KEYS.PACKAGES)) {
    saveLocal(STORAGE_KEYS.PACKAGES, INITIAL_PACKAGES);
  }
  if (!localStorage.getItem(STORAGE_KEYS.FAQS)) {
    saveLocal(STORAGE_KEYS.FAQS, INITIAL_FAQS);
  }
  const currentTestis = localStorage.getItem(STORAGE_KEYS.TESTIMONIALS);
  if (!currentTestis || currentTestis === '[]') {
    saveLocal(STORAGE_KEYS.TESTIMONIALS, INITIAL_TESTIMONIALS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.PROMOTIONS)) {
    saveLocal(STORAGE_KEYS.PROMOTIONS, INITIAL_PROMOTIONS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.PROMO_CODES)) {
    saveLocal(STORAGE_KEYS.PROMO_CODES, INITIAL_PROMO_CODES);
  }
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    saveLocal(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  } else {
    // Migrate old admin hash if present
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}');
      if (stored.adminPasswordHash === '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918') {
        stored.adminPasswordHash = INITIAL_SETTINGS.adminPasswordHash;
        saveLocal(STORAGE_KEYS.SETTINGS, stored);
      }
    } catch {
      // ignore
    }
  }
}

// ---------------- Synchronous Cache Getters for Instant Performance (SWR) ----------------
export function getInitialCachedPackages(): ServicePackage[] {
  const all = loadLocal<ServicePackage[]>(STORAGE_KEYS.PACKAGES, INITIAL_PACKAGES);
  return all.filter((p) => p.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getInitialCachedTestimonials(): Testimonial[] {
  let all = loadLocal<Testimonial[]>(STORAGE_KEYS.TESTIMONIALS, INITIAL_TESTIMONIALS);
  if (all.length === 0 && INITIAL_TESTIMONIALS.length > 0) {
    all = INITIAL_TESTIMONIALS;
  }
  return all.filter((t) => t.isPublished).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getInitialCachedFaqs(): FaqItem[] {
  const all = loadLocal<FaqItem[]>(STORAGE_KEYS.FAQS, INITIAL_FAQS);
  return all.sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getInitialCachedSettings(): SiteSettings {
  return loadLocal<SiteSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
}

export function getInitialCachedPromoCodes(): PromoCode[] {
  return loadLocal<PromoCode[]>(STORAGE_KEYS.PROMO_CODES, INITIAL_PROMO_CODES);
}

// ---------------- Public Accessors ----------------

export async function getPublicPackages(): Promise<ServicePackage[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('service_packages')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (!error && data && data.length > 0) {
        return data.map((item) => ({
          id: item.id,
          name: item.name,
          subtitle: item.subtitle,
          price: item.price,
          isStartingPrice: item.is_starting_price,
          description: item.description,
          warranty: item.warranty,
          badge: item.badge,
          isFeatured: item.is_featured,
          benefits: item.benefits || [],
          isActive: item.is_active,
          sortOrder: item.sort_order,
          note: item.note
        }));
      }
    } catch (e) {
      console.warn('Supabase fetch failed, falling back to local:', e);
    }
  }

  const all = loadLocal<ServicePackage[]>(STORAGE_KEYS.PACKAGES, INITIAL_PACKAGES);
  return all.filter((p) => p.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getPublicFaqs(): Promise<FaqItem[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .order('sort_order', { ascending: true });
      if (!error && data && data.length > 0) {
        return data.map((d) => ({
          id: d.id,
          question: d.question,
          answer: d.answer,
          sortOrder: d.sort_order
        }));
      }
    } catch (e) {
      console.warn('Supabase FAQ fetch failed:', e);
    }
  }

  const faqs = loadLocal<FaqItem[]>(STORAGE_KEYS.FAQS, INITIAL_FAQS);
  return faqs.sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getPublicTestimonials(): Promise<Testimonial[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_published', true)
        .order('date', { ascending: false });
      if (!error && data) {
        return data.map((d) => ({
          id: d.id,
          customerName: d.customer_name,
          rating: Number(d.rating),
          reviewText: d.review_text,
          date: d.date,
          isPublished: Boolean(d.is_published),
          serviceName: d.service_name || undefined
        }));
      }
      if (error) {
        console.warn('Supabase getPublicTestimonials error:', error.message);
      }
    } catch (e) {
      console.warn('Supabase testimonials fetch failed, using local cache:', e);
    }
  }

  const all = loadLocal<Testimonial[]>(STORAGE_KEYS.TESTIMONIALS, INITIAL_TESTIMONIALS);
  return all.filter((t) => t.isPublished).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getPublicPromotions(): Promise<Promotion[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('is_active', true);
      if (!error && data) {
        return data.map((d) => ({
          id: d.id,
          name: d.name,
          discountType: d.discount_type,
          discountValue: d.discount_value,
          applicablePackageIds: d.applicable_package_ids || ['all'],
          startDate: d.start_date,
          endDate: d.end_date,
          isActive: d.is_active
        }));
      }
    } catch (e) {
      console.warn('Supabase promo fetch failed:', e);
    }
  }

  const now = new Date();
  const all = loadLocal<Promotion[]>(STORAGE_KEYS.PROMOTIONS, INITIAL_PROMOTIONS);
  return all.filter((p) => {
    if (!p.isActive) return false;
    const start = new Date(p.startDate);
    const end = new Date(p.endDate);
    return now >= start && now <= end;
  });
}

export async function getSiteSettings(): Promise<SiteSettings> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .limit(1)
        .single();
      if (!error && data) {
        return {
          siteName: data.site_name || INITIAL_SETTINGS.siteName,
          heroTitle: data.hero_title || INITIAL_SETTINGS.heroTitle,
          heroDescription: data.hero_description || INITIAL_SETTINGS.heroDescription,
          whatsappNumber: data.whatsapp_number || INITIAL_SETTINGS.whatsappNumber,
          discordUrl: data.discord_url || INITIAL_SETTINGS.discordUrl,
          vayyyDevUrl: data.vayyy_dev_url || INITIAL_SETTINGS.vayyyDevUrl,
          otherTitle: data.other_title || INITIAL_SETTINGS.otherTitle,
          otherDescription: data.other_description || INITIAL_SETTINGS.otherDescription,
          adminPasswordHash: data.admin_password_hash || INITIAL_SETTINGS.adminPasswordHash
        };
      }
    } catch (e) {
      console.warn('Supabase settings fetch failed:', e);
    }
  }

  return loadLocal<SiteSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
}

// ---------------- Promo Code Validation & Status ----------------

export interface PromoValidationResult {
  valid: boolean;
  message: string;
  promoCode?: PromoCode;
  discountAmount?: number;
  finalPrice?: number;
}

let serverTimeOffsetMs = 0;
let serverTimeSynced = false;

// Synchronize with server time using HTTP HEAD to avoid client clock manipulation
export async function syncServerTime(): Promise<void> {
  try {
    const start = Date.now();
    const res = await fetch(window.location.href, { method: 'HEAD', cache: 'no-store' });
    const dateHeader = res.headers.get('date');
    if (dateHeader) {
      const serverDate = new Date(dateHeader).getTime();
      const latency = (Date.now() - start) / 2;
      serverTimeOffsetMs = serverDate + latency - Date.now();
      serverTimeSynced = true;
    }
  } catch {
    // If offline or blocked, fallback to local system time
  }
}

export function getServerTime(): Date {
  return new Date(Date.now() + serverTimeOffsetMs);
}

export function getPromoStatus(promo: PromoCode, referenceDate: Date = getServerTime()): 'scheduled' | 'active' | 'expired' | 'disabled' {
  if (!promo.isActive) return 'disabled';
  const nowMs = referenceDate.getTime();
  const startMs = promo.validFrom ? new Date(promo.validFrom).getTime() : 0;
  const endMs = promo.validUntil ? new Date(promo.validUntil).getTime() : Infinity;

  if (nowMs < startMs) return 'scheduled';
  if (nowMs > endMs) return 'expired';
  return 'active';
}

export async function validatePromoCode(
  inputCode: string,
  packageId: string,
  packagePrice: number
): Promise<PromoValidationResult> {
  const cleanCode = inputCode.trim().toUpperCase();
  if (!cleanCode) {
    return { valid: false, message: 'Kode promo tidak boleh kosong.' };
  }

  // Ensure server time offset is established
  if (!serverTimeSynced) {
    await syncServerTime();
  }
  const now = getServerTime();

  let promoList: PromoCode[] = [];
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', cleanCode)
        .limit(1);
      if (!error && data && data.length > 0) {
        promoList = data.map((d) => ({
          id: d.id,
          code: d.code,
          discountType: d.discount_type,
          discountValue: d.discount_value,
          applicablePackageIds: d.applicable_package_ids || ['all'],
          validFrom: d.valid_from,
          validUntil: d.valid_until,
          isActive: d.is_active
        }));
      }
    } catch (e) {
      console.warn('Supabase promo validation error:', e);
    }
  }

  if (promoList.length === 0) {
    promoList = loadLocal<PromoCode[]>(STORAGE_KEYS.PROMO_CODES, INITIAL_PROMO_CODES);
  }

  const promo = promoList.find((p) => p.code.trim().toUpperCase() === cleanCode);
  if (!promo) {
    return { valid: false, message: 'Kode promo tidak ditemukan.' };
  }

  if (!promo.isActive) {
    return { valid: false, message: 'Promo sedang dinonaktifkan.' };
  }

  const nowMs = now.getTime();
  const startMs = promo.validFrom ? new Date(promo.validFrom).getTime() : 0;
  const endMs = promo.validUntil ? new Date(promo.validUntil).getTime() : Infinity;

  if (nowMs < startMs) {
    return { valid: false, message: 'Promo belum dimulai.' };
  }

  if (nowMs > endMs) {
    return { valid: false, message: 'Promo sudah kedaluwarsa.' };
  }

  if (!promo.applicablePackageIds.includes('all') && !promo.applicablePackageIds.includes(packageId)) {
    return { valid: false, message: 'Promo tidak berlaku untuk paket ini.' };
  }

  if (typeof promo.discountValue !== 'number' || promo.discountValue <= 0) {
    return { valid: false, message: 'Data diskon promo tidak valid.' };
  }

  let discount = 0;
  if (promo.discountType === 'percentage') {
    discount = Math.round((packagePrice * promo.discountValue) / 100);
  } else {
    discount = promo.discountValue;
  }

  discount = Math.max(0, Math.min(discount, packagePrice));
  const finalPrice = Math.max(0, packagePrice - discount);

  return {
    valid: true,
    message: 'Kode promo berhasil diterapkan.',
    promoCode: promo,
    discountAmount: discount,
    finalPrice
  };
}

// ---------------- Admin Authentication ----------------

let failedLoginAttempts = 0;
let lockoutUntilTime = 0;

export async function loginAdmin(password: string, email?: string): Promise<{ success: boolean; message: string }> {
  // Check rate limit / lockout
  const now = Date.now();
  if (now < lockoutUntilTime) {
    const remainingSeconds = Math.ceil((lockoutUntilTime - now) / 1000);
    return {
      success: false,
      message: `Terlalu banyak percobaan gagal. Akses dikunci sementara. Silakan coba ${remainingSeconds} detik lagi.`
    };
  }

  // If Supabase Auth is active and email provided
  if (isSupabaseConfigured() && supabase && email) {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) {
        failedLoginAttempts++;
        if (failedLoginAttempts >= 5) {
          lockoutUntilTime = Date.now() + 30 * 1000;
          failedLoginAttempts = 0;
        }
        return { success: false, message: error.message };
      }
      failedLoginAttempts = 0;
      const token = crypto.randomUUID();
      const session = {
        token,
        email,
        expiresAt: Date.now() + 1000 * 60 * 60 * 4 // 4 hours active session
      };
      sessionStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(session));
      localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
      notifyDataUpdated();
      return { success: true, message: 'Berhasil login melalui Supabase Auth.' };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, message: msg };
    }
  }

  // Standalone secure SHA-256 validation against stored settings
  const settings = await getSiteSettings();
  const inputHash = await sha256(password);

  if (inputHash === settings.adminPasswordHash) {
    failedLoginAttempts = 0;
    const token = crypto.randomUUID();
    const session = {
      token,
      email: email || 'admin@vayyy.store',
      expiresAt: Date.now() + 1000 * 60 * 60 * 4 // 4 hours active session
    };
    sessionStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(session));
    localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
    notifyDataUpdated();
    return { success: true, message: 'Login admin berhasil.' };
  }

  failedLoginAttempts++;
  if (failedLoginAttempts >= 5) {
    lockoutUntilTime = Date.now() + 30 * 1000; // 30s lockout
    failedLoginAttempts = 0;
    return {
      success: false,
      message: '5x percobaan salah berturut-turut. Akses ditangguhkan selama 30 detik untuk keamanan.'
    };
  }

  return { success: false, message: 'Password admin tidak valid. Silakan periksa kembali.' };
}

export function checkAdminAuth(): AdminAuthState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEYS.AUTH_SESSION) || localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
    if (!raw) return { isAuthenticated: false };
    const session = JSON.parse(raw);
    if (!session.token || !session.expiresAt || session.expiresAt < Date.now()) {
      sessionStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
      localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
      return { isAuthenticated: false };
    }
    return {
      isAuthenticated: true,
      userEmail: session.email,
      token: session.token
    };
  } catch {
    return { isAuthenticated: false };
  }
}

export function logoutAdmin(): void {
  sessionStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
  localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
  if (isSupabaseConfigured() && supabase) {
    supabase.auth.signOut().catch(() => {});
  }
  notifyDataUpdated();
}

export const revokeAdminSession = logoutAdmin;

export async function updateAdminPassword(oldPass: string, newPass: string): Promise<{ success: boolean; message: string }> {
  const auth = checkAdminAuth();
  if (!auth.isAuthenticated) {
    return { success: false, message: 'Anda harus login sebagai admin.' };
  }
  if (!newPass || newPass.length < 6) {
    return { success: false, message: 'Password baru minimal 6 karakter.' };
  }

  const settings = await getSiteSettings();
  const oldHash = await sha256(oldPass);

  if (oldHash !== settings.adminPasswordHash) {
    return { success: false, message: 'Password lama tidak cocok.' };
  }

  const newHash = await sha256(newPass);
  settings.adminPasswordHash = newHash;
  await saveSiteSettings(settings);

  return { success: true, message: 'Password admin berhasil diperbarui!' };
}

// ---------------- Admin CRUD Operations ----------------

export async function getAllPackages(): Promise<ServicePackage[]> {
  const all = loadLocal<ServicePackage[]>(STORAGE_KEYS.PACKAGES, INITIAL_PACKAGES);
  return all.sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function saveServicePackage(pkg: ServicePackage): Promise<void> {
  const all = await getAllPackages();
  const index = all.findIndex((p) => p.id === pkg.id);
  if (index >= 0) {
    all[index] = pkg;
  } else {
    all.push(pkg);
  }
  saveLocal(STORAGE_KEYS.PACKAGES, all);

  if (isSupabaseConfigured() && supabase) {
    await supabase.from('service_packages').upsert({
      id: pkg.id,
      name: pkg.name,
      subtitle: pkg.subtitle,
      price: pkg.price,
      is_starting_price: pkg.isStartingPrice || false,
      description: pkg.description,
      warranty: pkg.warranty,
      badge: pkg.badge || null,
      is_featured: pkg.isFeatured || false,
      benefits: pkg.benefits,
      is_active: pkg.isActive,
      sort_order: pkg.sortOrder,
      note: pkg.note || null
    });
  }
}

export async function deleteServicePackage(id: string): Promise<void> {
  const all = await getAllPackages();
  const filtered = all.filter((p) => p.id !== id);
  saveLocal(STORAGE_KEYS.PACKAGES, filtered);

  if (isSupabaseConfigured() && supabase) {
    await supabase.from('service_packages').delete().eq('id', id);
  }
}

export async function getAllTestimonials(): Promise<Testimonial[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('date', { ascending: false });
      if (!error && data) {
        const mapped = data.map((d) => ({
          id: d.id,
          customerName: d.customer_name,
          rating: Number(d.rating),
          reviewText: d.review_text,
          date: d.date,
          isPublished: Boolean(d.is_published),
          serviceName: d.service_name || undefined
        }));
        saveLocal(STORAGE_KEYS.TESTIMONIALS, mapped);
        return mapped;
      }
      if (error) {
        console.warn('Supabase getAllTestimonials error:', error.message);
      }
    } catch (e) {
      console.warn('Supabase getAllTestimonials fetch failed, using local cache:', e);
    }
  }

  const all = loadLocal<Testimonial[]>(STORAGE_KEYS.TESTIMONIALS, INITIAL_TESTIMONIALS);
  return all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function saveTestimonial(testi: Testimonial): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    const payload = {
      id: testi.id,
      customer_name: testi.customerName.trim(),
      rating: Number(testi.rating),
      review_text: testi.reviewText.trim(),
      date: testi.date,
      is_published: Boolean(testi.isPublished),
      service_name: testi.serviceName ? testi.serviceName.trim() : null
    };

    const { error } = await supabase.from('testimonials').upsert(payload);
    if (error) {
      console.error('Supabase error saving testimonial:', error);
      throw new Error(`Database Supabase: ${error.message}`);
    }
  }

  const all = loadLocal<Testimonial[]>(STORAGE_KEYS.TESTIMONIALS, INITIAL_TESTIMONIALS);
  const index = all.findIndex((t) => t.id === testi.id);
  if (index >= 0) {
    all[index] = testi;
  } else {
    all.unshift(testi);
  }
  saveLocal(STORAGE_KEYS.TESTIMONIALS, all);
  notifyDataUpdated();
}

export async function deleteTestimonial(id: string): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('testimonials').delete().eq('id', id);
    if (error) {
      console.error('Supabase error deleting testimonial:', error);
      throw new Error(`Database Supabase: ${error.message}`);
    }
  }

  const all = loadLocal<Testimonial[]>(STORAGE_KEYS.TESTIMONIALS, INITIAL_TESTIMONIALS);
  const filtered = all.filter((t) => t.id !== id);
  saveLocal(STORAGE_KEYS.TESTIMONIALS, filtered);
  notifyDataUpdated();
}

export async function getAllPromotions(): Promise<Promotion[]> {
  return loadLocal<Promotion[]>(STORAGE_KEYS.PROMOTIONS, INITIAL_PROMOTIONS);
}

export async function savePromotion(promo: Promotion): Promise<void> {
  const all = await getAllPromotions();
  const index = all.findIndex((p) => p.id === promo.id);
  if (index >= 0) {
    all[index] = promo;
  } else {
    all.push(promo);
  }
  saveLocal(STORAGE_KEYS.PROMOTIONS, all);

  if (isSupabaseConfigured() && supabase) {
    await supabase.from('promotions').upsert({
      id: promo.id,
      name: promo.name,
      discount_type: promo.discountType,
      discount_value: promo.discountValue,
      applicable_package_ids: promo.applicablePackageIds,
      start_date: promo.startDate,
      end_date: promo.endDate,
      is_active: promo.isActive
    });
  }
}

export async function deletePromotion(id: string): Promise<void> {
  const all = await getAllPromotions();
  const filtered = all.filter((p) => p.id !== id);
  saveLocal(STORAGE_KEYS.PROMOTIONS, filtered);

  if (isSupabaseConfigured() && supabase) {
    await supabase.from('promotions').delete().eq('id', id);
  }
}

export async function getAllPromoCodes(): Promise<PromoCode[]> {
  return loadLocal<PromoCode[]>(STORAGE_KEYS.PROMO_CODES, INITIAL_PROMO_CODES);
}

export async function savePromoCode(code: PromoCode): Promise<void> {
  const all = await getAllPromoCodes();
  const index = all.findIndex((c) => c.id === code.id);
  if (index >= 0) {
    all[index] = code;
  } else {
    all.push(code);
  }
  saveLocal(STORAGE_KEYS.PROMO_CODES, all);

  if (isSupabaseConfigured() && supabase) {
    await supabase.from('promo_codes').upsert({
      id: code.id,
      code: code.code,
      discount_type: code.discountType,
      discount_value: code.discountValue,
      applicable_package_ids: code.applicablePackageIds,
      valid_from: code.validFrom,
      valid_until: code.validUntil,
      is_active: code.isActive
    });
  }
}

export async function deletePromoCode(id: string): Promise<void> {
  const all = await getAllPromoCodes();
  const filtered = all.filter((c) => c.id !== id);
  saveLocal(STORAGE_KEYS.PROMO_CODES, filtered);

  if (isSupabaseConfigured() && supabase) {
    await supabase.from('promo_codes').delete().eq('id', id);
  }
}

export async function getAllFaqs(): Promise<FaqItem[]> {
  const all = loadLocal<FaqItem[]>(STORAGE_KEYS.FAQS, INITIAL_FAQS);
  return all.sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function saveFaq(faq: FaqItem): Promise<void> {
  const all = await getAllFaqs();
  const index = all.findIndex((f) => f.id === faq.id);
  if (index >= 0) {
    all[index] = faq;
  } else {
    all.push(faq);
  }
  saveLocal(STORAGE_KEYS.FAQS, all);

  if (isSupabaseConfigured() && supabase) {
    await supabase.from('faqs').upsert({
      id: faq.id,
      question: faq.question,
      answer: faq.answer,
      sort_order: faq.sortOrder
    });
  }
}

export async function deleteFaq(id: string): Promise<void> {
  const all = await getAllFaqs();
  const filtered = all.filter((f) => f.id !== id);
  saveLocal(STORAGE_KEYS.FAQS, filtered);

  if (isSupabaseConfigured() && supabase) {
    await supabase.from('faqs').delete().eq('id', id);
  }
}

export async function saveSiteSettings(settings: SiteSettings): Promise<void> {
  saveLocal(STORAGE_KEYS.SETTINGS, settings);

  if (isSupabaseConfigured() && supabase) {
    await supabase.from('site_settings').upsert({
      id: 1,
      site_name: settings.siteName,
      hero_title: settings.heroTitle,
      hero_description: settings.heroDescription,
      whatsapp_number: settings.whatsappNumber,
      discord_url: settings.discordUrl,
      vayyy_dev_url: settings.vayyyDevUrl,
      other_title: settings.otherTitle,
      other_description: settings.otherDescription,
      admin_password_hash: settings.adminPasswordHash
    });
  }
  notifyDataUpdated();
}
