export type BenefitType = 'included' | 'excluded' | 'info';

export interface PackageBenefitItem {
  text: string;
  type: BenefitType;
}

export interface ServicePackage {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  isStartingPrice?: boolean;
  description: string;
  warranty: string;
  badge?: string;
  isFeatured?: boolean;
  benefits: PackageBenefitItem[];
  isActive: boolean;
  sortOrder: number;
  note?: string;
}

export interface Promotion {
  id: string;
  name: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  applicablePackageIds: string[]; // ['all'] or array of package ids
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export type PromoStatus = 'scheduled' | 'active' | 'expired' | 'disabled';

export interface PromoCode {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  applicablePackageIds: string[];
  validFrom: string; // ISO string / YYYY-MM-DDTHH:mm
  validUntil: string; // ISO string / YYYY-MM-DDTHH:mm
  isActive: boolean;
}

export interface Testimonial {
  id: string;
  customerName: string;
  rating: number; // 1 to 5
  reviewText: string;
  date: string;
  isPublished: boolean;
  serviceName?: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
}

export interface SiteSettings {
  siteName: string;
  heroTitle: string;
  heroDescription: string;
  whatsappNumber: string;
  discordUrl: string;
  vayyyDevUrl: string;
  otherTitle: string;
  otherDescription: string;
  adminPasswordHash: string; // SHA-256 hash
}

export interface AdminAuthState {
  isAuthenticated: boolean;
  userEmail?: string;
  token?: string;
}
