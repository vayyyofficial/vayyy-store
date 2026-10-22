import {
  ServicePackage,
  PackageBenefitItem,
  BenefitType,
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

// ---------------- Benefit Normalization & Parsing ----------------

/**
 * Normalizes package benefits into a clean array of PackageBenefitItem.
 * Handles:
 * - Plain objects: { text: "...", type: "included" }
 * - JSON stringified items: '{"text":"...","type":"included"}'
 * - Double-stringified JSON items
 * - Plain strings from legacy seeds: 'Maksimal 2 sub-halaman'
 * - Stringified JSON arrays
 */
export function parsePackageBenefits(raw: unknown): PackageBenefitItem[] {
  if (!raw) return [];
  let list: unknown = raw;
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) list = parsed;
        else list = [raw];
      } catch {
        list = [raw];
      }
    } else {
      list = [raw];
    }
  }
  if (!Array.isArray(list)) return [];

  const parseItem = (item: unknown): PackageBenefitItem | null => {
    if (!item) return null;
    let text = '';
    let type: BenefitType = 'included';

    if (typeof item === 'object' && item !== null) {
      const obj = item as Record<string, unknown>;
      text = String(obj.text ?? '').trim();
      if (obj.type === 'excluded' || obj.type === 'info' || obj.type === 'included') {
        type = obj.type;
      }
    } else if (typeof item === 'string') {
      const trimmed = item.trim();
      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        try {
          const parsed = JSON.parse(trimmed);
          if (parsed && typeof parsed === 'object') {
            text = String(parsed.text ?? '').trim();
            if (parsed.type === 'excluded' || parsed.type === 'info' || parsed.type === 'included') {
              type = parsed.type;
            }
          } else {
            text = trimmed;
          }
        } catch {
          text = trimmed;
        }
      } else {
        text = trimmed;
      }
    }

    // Protection against legacy double-encoded JSON string inside text
    while (typeof text === 'string' && text.trim().startsWith('{') && text.trim().endsWith('}')) {
      try {
        const inner = JSON.parse(text);
        if (inner && typeof inner === 'object' && inner.text) {
          text = String(inner.text).trim();
          if (inner.type === 'excluded' || inner.type === 'info' || inner.type === 'included') {
            type = inner.type;
          }
        } else {
          break;
        }
      } catch {
        break;
      }
    }

    if (!['included', 'excluded', 'info'].includes(type)) {
      type = 'included';
    }

    if (!text) return null;
    return { text, type };
  };

  return (list as unknown[]).map(parseItem).filter((b): b is PackageBenefitItem => b !== null);
}

// ---------------- Synchronous Cache Getters for Instant Performance (SWR) ----------------
export function getInitialCachedPackages(): ServicePackage[] {
  const all = loadLocal<ServicePackage[]>(STORAGE_KEYS.PACKAGES, INITIAL_PACKAGES);
  return all
    .filter((p) => p.isActive)
    .map((p) => ({ ...p, benefits: parsePackageBenefits(p.benefits) }))
    .sort((a, b) => a.sortOrder - b.sortOrder);
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
  const loaded = loadLocal<SiteSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  if (loaded.vayyyDevUrl === 'https://vayyy.dev') {
    loaded.vayyyDevUrl = 'https://vayyy.vercel.app';
  }
  return loaded;
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
          price: Number(item.price),
          isStartingPrice: Boolean(item.is_starting_price),
          description: item.description,
          warranty: item.warranty,
          badge: item.badge || undefined,
          isFeatured: Boolean(item.is_featured),
          benefits: parsePackageBenefits(item.benefits),
          isActive: Boolean(item.is_active),
          sortOrder: Number(item.sort_order),
          note: item.note || undefined
        }));
      }
    } catch (e) {
      console.warn('Supabase fetch failed, falling back to local:', e);
    }
  }

  const all = loadLocal<ServicePackage[]>(STORAGE_KEYS.PACKAGES, INITIAL_PACKAGES);
  return all
    .filter((p) => p.isActive)
    .map((p) => ({ ...p, benefits: parsePackageBenefits(p.benefits) }))
    .sort((a, b) => a.sortOrder - b.sortOrder);
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
        const rawUrl = data.vayyy_dev_url || INITIAL_SETTINGS.vayyyDevUrl;
        return {
          siteName: data.site_name || INITIAL_SETTINGS.siteName,
          heroTitle: data.hero_title || INITIAL_SETTINGS.heroTitle,
          heroDescription: data.hero_description || INITIAL_SETTINGS.heroDescription,
          whatsappNumber: data.whatsapp_number || INITIAL_SETTINGS.whatsappNumber,
          discordUrl: data.discord_url || INITIAL_SETTINGS.discordUrl,
          vayyyDevUrl: rawUrl === 'https://vayyy.dev' ? 'https://vayyy.vercel.app' : rawUrl,
          otherTitle: data.other_title || INITIAL_SETTINGS.otherTitle,
          otherDescription: data.other_description || INITIAL_SETTINGS.otherDescription,
          adminPasswordHash: data.admin_password_hash || INITIAL_SETTINGS.adminPasswordHash
        };
      }
    } catch (e) {
      console.warn('Supabase settings fetch failed:', e);
    }
  }

  const loaded = loadLocal<SiteSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  if (loaded.vayyyDevUrl === 'https://vayyy.dev') {
    loaded.vayyyDevUrl = 'https://vayyy.vercel.app';
  }
  return loaded;
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

export interface PromoQuotaInfo {
  maxUses: number;
  usedCount: number;
  remainingQuota: number;
  isUnlimited: boolean;
  isExhausted: boolean;
  isLowQuota: boolean;
  warningThreshold: number;
}

export function getPromoQuotaInfo(promo: PromoCode): PromoQuotaInfo {
  const maxUses = Number(promo.maxUses ?? 0);
  const usedCount = Number(promo.usedCount ?? 0);
  const isUnlimited = maxUses <= 0;
  const remainingQuota = isUnlimited ? Infinity : Math.max(0, maxUses - usedCount);
  const isExhausted = !isUnlimited && remainingQuota <= 0;
  const threshold = Number(promo.warningThreshold ?? 3);
  const isLowQuota = !isUnlimited && !isExhausted && remainingQuota <= threshold;

  return {
    maxUses,
    usedCount,
    remainingQuota,
    isUnlimited,
    isExhausted,
    isLowQuota,
    warningThreshold: threshold
  };
}

export function mapDbRowToPromoCode(d: Record<string, any>): PromoCode {
  return {
    id: d.id,
    code: d.code,
    name: d.name || d.code,
    discountType: d.discount_type || 'percentage',
    discountValue: Number(d.discount_value || 0),
    applicablePackageIds: Array.isArray(d.applicable_package_ids) ? d.applicable_package_ids : ['all'],
    validFrom: d.valid_from || null,
    validUntil: d.valid_until || null,
    maxUses: Number(d.max_uses ?? 0),
    usedCount: Number(d.used_count ?? 0),
    warningThreshold: Number(d.warning_threshold ?? 3),
    showPublicAnnouncement: d.show_public_announcement !== false,
    isActive: Boolean(d.is_active)
  };
}

export function getPromoStatus(
  promo: PromoCode,
  referenceDate: Date = getServerTime()
): 'active' | 'scheduled' | 'expired' | 'disabled' | 'exhausted' {
  if (!promo.isActive) return 'disabled';

  const quota = getPromoQuotaInfo(promo);
  if (quota.isExhausted) return 'exhausted';

  const nowMs = referenceDate.getTime();
  if (promo.validFrom) {
    const startMs = new Date(promo.validFrom).getTime();
    if (!isNaN(startMs) && nowMs < startMs) return 'scheduled';
  }
  if (promo.validUntil) {
    const endMs = new Date(promo.validUntil).getTime();
    if (!isNaN(endMs) && nowMs > endMs) return 'expired';
  }

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
        promoList = data.map(mapDbRowToPromoCode);
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

  const quota = getPromoQuotaInfo(promo);
  if (quota.isExhausted) {
    return { valid: false, message: 'Maaf, kuota kupon promo ini sudah habis.' };
  }

  const nowMs = now.getTime();
  if (promo.validFrom) {
    const startMs = new Date(promo.validFrom).getTime();
    if (!isNaN(startMs) && nowMs < startMs) {
      return { valid: false, message: 'Promo belum dimulai.' };
    }
  }

  if (promo.validUntil) {
    const endMs = new Date(promo.validUntil).getTime();
    if (!isNaN(endMs) && nowMs > endMs) {
      return { valid: false, message: 'Promo sudah kedaluwarsa.' };
    }
  }

  if (
    packageId !== 'all' &&
    !promo.applicablePackageIds.includes('all') &&
    !promo.applicablePackageIds.includes(packageId)
  ) {
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

  const quotaMessage = quota.isUnlimited
    ? ''
    : ` (Tersisa ${quota.remainingQuota} kupon)`;

  return {
    valid: true,
    message: `Kode promo "${promo.code}" berhasil diterapkan!${quotaMessage}`,
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
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('service_packages')
        .select('*')
        .order('sort_order', { ascending: true });
      if (!error && data && data.length > 0) {
        const mapped: ServicePackage[] = data.map((item) => ({
          id: item.id,
          name: item.name,
          subtitle: item.subtitle,
          price: Number(item.price),
          isStartingPrice: Boolean(item.is_starting_price),
          description: item.description,
          warranty: item.warranty,
          badge: item.badge || undefined,
          isFeatured: Boolean(item.is_featured),
          benefits: parsePackageBenefits(item.benefits),
          isActive: Boolean(item.is_active),
          sortOrder: Number(item.sort_order),
          note: item.note || undefined
        }));
        saveLocal(STORAGE_KEYS.PACKAGES, mapped);
        return mapped;
      }
    } catch (e) {
      console.warn('Supabase getAllPackages error:', e);
    }
  }

  const all = loadLocal<ServicePackage[]>(STORAGE_KEYS.PACKAGES, INITIAL_PACKAGES);
  return all
    .map((p) => ({ ...p, benefits: parsePackageBenefits(p.benefits) }))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function saveServicePackage(pkg: ServicePackage): Promise<void> {
  if (!pkg.name || !pkg.name.trim()) {
    throw new Error('Nama paket tidak boleh kosong.');
  }
  if (typeof pkg.price !== 'number' || pkg.price < 0 || isNaN(pkg.price)) {
    throw new Error('Harga paket tidak valid.');
  }
  const cleanBenefits = parsePackageBenefits(pkg.benefits);
  if (cleanBenefits.length === 0) {
    throw new Error('Paket harus memiliki minimal satu benefit.');
  }

  const sanitizedPkg: ServicePackage = {
    ...pkg,
    name: pkg.name.trim(),
    subtitle: pkg.subtitle.trim(),
    description: pkg.description.trim(),
    warranty: pkg.warranty.trim(),
    badge: pkg.badge ? pkg.badge.trim() : undefined,
    note: pkg.note ? pkg.note.trim() : undefined,
    benefits: cleanBenefits
  };

  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('service_packages').upsert({
      id: sanitizedPkg.id,
      name: sanitizedPkg.name,
      subtitle: sanitizedPkg.subtitle,
      price: sanitizedPkg.price,
      is_starting_price: Boolean(sanitizedPkg.isStartingPrice),
      description: sanitizedPkg.description,
      warranty: sanitizedPkg.warranty,
      badge: sanitizedPkg.badge || null,
      is_featured: Boolean(sanitizedPkg.isFeatured),
      benefits: sanitizedPkg.benefits,
      is_active: Boolean(sanitizedPkg.isActive),
      sort_order: Number(sanitizedPkg.sortOrder),
      note: sanitizedPkg.note || null,
      updated_at: new Date().toISOString()
    });

    if (error) {
      console.error('Supabase error saving service package:', error);
      throw new Error(`Database Supabase: ${error.message}`);
    }
  }

  const all = loadLocal<ServicePackage[]>(STORAGE_KEYS.PACKAGES, INITIAL_PACKAGES);
  const index = all.findIndex((p) => p.id === sanitizedPkg.id);
  if (index >= 0) {
    all[index] = sanitizedPkg;
  } else {
    all.push(sanitizedPkg);
  }
  saveLocal(STORAGE_KEYS.PACKAGES, all);
  notifyDataUpdated();
}

export async function deleteServicePackage(id: string): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('service_packages').delete().eq('id', id);
    if (error) {
      console.error('Supabase error deleting service package:', error);
      throw new Error(`Database Supabase: ${error.message}`);
    }
  }

  const all = loadLocal<ServicePackage[]>(STORAGE_KEYS.PACKAGES, INITIAL_PACKAGES);
  const filtered = all.filter((p) => p.id !== id);
  saveLocal(STORAGE_KEYS.PACKAGES, filtered);
  notifyDataUpdated();
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
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        const mapped = data.map(mapDbRowToPromoCode);
        saveLocal(STORAGE_KEYS.PROMO_CODES, mapped);
        return mapped;
      }
    } catch (e) {
      console.warn('Supabase getAllPromoCodes error:', e);
    }
  }

  return loadLocal<PromoCode[]>(STORAGE_KEYS.PROMO_CODES, INITIAL_PROMO_CODES);
}

export async function savePromoCode(code: PromoCode): Promise<void> {
  const cleanCode = code.code.trim().toUpperCase();
  if (!cleanCode) {
    throw new Error('Kode promo tidak boleh kosong.');
  }
  if (code.discountValue <= 0) {
    throw new Error('Nilai diskon harus lebih besar dari 0.');
  }

  // Ensure ID is a valid UUID
  const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(code.id);
  const safeId = isValidUuid ? code.id : crypto.randomUUID();

  const maxUses = Math.max(0, Number(code.maxUses || 0));
  const usedCount = Math.max(0, Number(code.usedCount || 0));

  const sanitized: PromoCode = {
    ...code,
    id: safeId,
    code: cleanCode,
    name: code.name ? code.name.trim() : cleanCode,
    maxUses,
    usedCount,
    warningThreshold: Math.max(1, Number(code.warningThreshold ?? 3)),
    showPublicAnnouncement: code.showPublicAnnouncement !== false,
    validFrom: code.validFrom || null,
    validUntil: code.validUntil || null
  };

  if (isSupabaseConfigured() && supabase) {
    const fullPayload = {
      id: sanitized.id,
      code: sanitized.code,
      name: sanitized.name,
      discount_type: sanitized.discountType,
      discount_value: sanitized.discountValue,
      applicable_package_ids: sanitized.applicablePackageIds,
      valid_from: sanitized.validFrom,
      valid_until: sanitized.validUntil,
      max_uses: sanitized.maxUses,
      used_count: sanitized.usedCount,
      warning_threshold: sanitized.warningThreshold,
      show_public_announcement: sanitized.showPublicAnnouncement,
      is_active: sanitized.isActive,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase.from('promo_codes').upsert(fullPayload);
    if (error) {
      // If column doesn't exist yet in Supabase (PGRST204), fallback to core columns
      if (error.code === 'PGRST204') {
        const corePayload = {
          id: sanitized.id,
          code: sanitized.code,
          discount_type: sanitized.discountType,
          discount_value: sanitized.discountValue,
          applicable_package_ids: sanitized.applicablePackageIds,
          valid_from: sanitized.validFrom,
          valid_until: sanitized.validUntil,
          max_uses: sanitized.maxUses,
          used_count: sanitized.usedCount,
          is_active: sanitized.isActive,
          updated_at: new Date().toISOString()
        };
        const { error: coreErr } = await supabase.from('promo_codes').upsert(corePayload);
        if (coreErr) {
          console.error('Supabase savePromoCode core fallback error:', coreErr);
          throw new Error(`Database Supabase: ${coreErr.message}`);
        }
      } else {
        console.error('Supabase savePromoCode error:', error);
        throw new Error(`Database Supabase: ${error.message}`);
      }
    }
  }

  const all = loadLocal<PromoCode[]>(STORAGE_KEYS.PROMO_CODES, INITIAL_PROMO_CODES);
  const index = all.findIndex((c) => c.id === sanitized.id || c.code === sanitized.code);
  if (index >= 0) {
    all[index] = sanitized;
  } else {
    all.push(sanitized);
  }
  saveLocal(STORAGE_KEYS.PROMO_CODES, all);
  notifyDataUpdated();
}

export async function deletePromoCode(id: string): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('promo_codes').delete().eq('id', id);
    if (error) {
      console.error('Supabase deletePromoCode error:', error);
      throw new Error(`Database Supabase: ${error.message}`);
    }
  }

  const all = loadLocal<PromoCode[]>(STORAGE_KEYS.PROMO_CODES, INITIAL_PROMO_CODES);
  const filtered = all.filter((c) => c.id !== id);
  saveLocal(STORAGE_KEYS.PROMO_CODES, filtered);
  notifyDataUpdated();
}

/**
 * Manually confirms 1 or more coupon usages for a confirmed transaction.
 * Permanently increments used_count in Supabase and local cache.
 */
export async function confirmUseCoupon(
  promoId: string,
  amount: number = 1
): Promise<{ success: boolean; message: string; remainingQuota: number }> {
  if (amount <= 0) {
    return { success: false, message: 'Jumlah kupon harus lebih besar dari 0.', remainingQuota: 0 };
  }

  const all = await getAllPromoCodes();
  const promo = all.find((p) => p.id === promoId);
  if (!promo) {
    return { success: false, message: 'Kode promo tidak ditemukan.', remainingQuota: 0 };
  }

  const quota = getPromoQuotaInfo(promo);
  if (!quota.isUnlimited && quota.remainingQuota < amount) {
    return {
      success: false,
      message: `Gagal: Kuota kupon tidak mencukupi. Sisa kuota hanya ${quota.remainingQuota} kupon.`,
      remainingQuota: quota.remainingQuota
    };
  }

  const newUsedCount = quota.usedCount + amount;
  const newRemaining = quota.isUnlimited ? Infinity : Math.max(0, quota.maxUses - newUsedCount);

  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase
      .from('promo_codes')
      .update({
        used_count: newUsedCount,
        updated_at: new Date().toISOString()
      })
      .eq('id', promo.id);

    if (error) {
      console.error('Supabase confirmUseCoupon error:', error);
      throw new Error(`Database Supabase: ${error.message}`);
    }
  }

  promo.usedCount = newUsedCount;
  saveLocal(STORAGE_KEYS.PROMO_CODES, all);
  notifyDataUpdated();

  return {
    success: true,
    message: `Transaksi berhasil dikonfirmasi (${amount} kupon digunakan). Sisa kuota: ${newRemaining} kupon.`,
    remainingQuota: newRemaining
  };
}

/**
 * Manually restores 1 or more coupon usages if a transaction was canceled.
 * Permanently decrements used_count in Supabase and local cache.
 */
export async function restoreCoupon(
  promoId: string,
  amount: number = 1
): Promise<{ success: boolean; message: string; remainingQuota: number }> {
  if (amount <= 0) {
    return { success: false, message: 'Jumlah kupon harus lebih besar dari 0.', remainingQuota: 0 };
  }

  const all = await getAllPromoCodes();
  const promo = all.find((p) => p.id === promoId);
  if (!promo) {
    return { success: false, message: 'Kode promo tidak ditemukan.', remainingQuota: 0 };
  }

  const quota = getPromoQuotaInfo(promo);
  if (quota.usedCount <= 0) {
    return {
      success: false,
      message: 'Gagal: Tidak ada kupon yang terpakai untuk dikembalikan (kuota terpakai = 0).',
      remainingQuota: quota.remainingQuota
    };
  }

  const restoreActual = Math.min(quota.usedCount, amount);
  const newUsedCount = Math.max(0, quota.usedCount - restoreActual);
  const newRemaining = quota.isUnlimited ? Infinity : Math.max(0, quota.maxUses - newUsedCount);

  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase
      .from('promo_codes')
      .update({
        used_count: newUsedCount,
        updated_at: new Date().toISOString()
      })
      .eq('id', promo.id);

    if (error) {
      console.error('Supabase restoreCoupon error:', error);
      throw new Error(`Database Supabase: ${error.message}`);
    }
  }

  promo.usedCount = newUsedCount;
  saveLocal(STORAGE_KEYS.PROMO_CODES, all);
  notifyDataUpdated();

  return {
    success: true,
    message: `${restoreActual} kupon berhasil dikembalikan. Sisa kuota: ${newRemaining} kupon.`,
    remainingQuota: newRemaining
  };
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
