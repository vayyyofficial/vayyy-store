import React, { useState } from 'react';
import { Check, X, Info, Shield, Tag, Layers, CheckCircle2, AlertCircle } from 'lucide-react';
import { ServicePackage, PromoCode, PackageBenefitItem, BenefitType } from '../types';
import { validatePromoCode, PromoValidationResult, parsePackageBenefits, getPromoQuotaInfo } from '../services/storage';
import { WhatsAppIcon } from './BrandIcons';

interface PricelistProps {
  packages: ServicePackage[];
  whatsappNumber: string;
  onOpenOther: () => void;
  promoCodes?: PromoCode[];
}

export const Pricelist: React.FC<PricelistProps> = ({
  packages,
  whatsappNumber,
  onOpenOther,
  promoCodes = []
}) => {
  const [promoInput, setPromoInput] = useState('');
  const [promoValidation, setPromoValidation] = useState<PromoValidationResult | null>(null);
  const [activePromo, setActivePromo] = useState<PromoCode | null>(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;

    setIsValidatingPromo(true);
    // Validate with packageId 'all' and dummy price 100000 to verify validity and obtain promoCode
    const result = await validatePromoCode(promoInput.trim(), 'all', 100000);
    setPromoValidation(result);
    if (result.valid && result.promoCode) {
      setActivePromo(result.promoCode);
    } else {
      setActivePromo(null);
    }
    setIsValidatingPromo(false);
  };

  const getPackagePricing = (pkg: ServicePackage) => {
    if (!activePromo) {
      return {
        hasDiscount: false,
        finalPrice: pkg.price,
        discountAmount: 0
      };
    }

    const isApplicable =
      activePromo.applicablePackageIds.includes('all') ||
      activePromo.applicablePackageIds.includes(pkg.id);

    if (!isApplicable) {
      return {
        hasDiscount: false,
        finalPrice: pkg.price,
        discountAmount: 0
      };
    }

    let discount = 0;
    if (activePromo.discountType === 'percentage') {
      discount = Math.round((pkg.price * activePromo.discountValue) / 100);
    } else {
      discount = activePromo.discountValue;
    }

    discount = Math.max(0, Math.min(discount, pkg.price));
    const finalPrice = Math.max(0, pkg.price - discount);

    return {
      hasDiscount: discount > 0,
      finalPrice,
      discountAmount: discount
    };
  };

  const generateWhatsAppUrl = (pkg: ServicePackage) => {
    const { hasDiscount, finalPrice, discountAmount } = getPackagePricing(pkg);
    const cleanNumber = whatsappNumber.replace(/\D/g, '');

    let text = '';
    if (pkg.id === 'custom') {
      if (hasDiscount && activePromo) {
        text = `Halo Vayyy, saya tertarik memesan jasa website Custom mulai dari Rp${pkg.price.toLocaleString('id-ID')} dengan kode promo ${activePromo.code} (Potongan Diskon: Rp${discountAmount.toLocaleString('id-ID')}). Saya ingin konsultasi rincian kebutuhan dan estimasi biaya.`;
      } else {
        text = `Halo Vayyy, saya tertarik memesan jasa website Custom mulai dari Rp${pkg.price.toLocaleString('id-ID')}. Saya ingin konsultasi rincian kebutuhan dan estimasi biaya.`;
      }
    } else {
      if (hasDiscount && activePromo) {
        text = `Halo Vayyy, saya ingin memesan jasa website paket ${pkg.name}.\nRincian: Harga Asli Rp${pkg.price.toLocaleString('id-ID')}, Diskon Promo ${activePromo.code} sebesar Rp${discountAmount.toLocaleString('id-ID')}, Total Estimasi: Rp${finalPrice.toLocaleString('id-ID')}.\n(Catatan: Menunggu konfirmasi ketersediaan & detail pesanan).`;
      } else {
        text = `Halo Vayyy, saya ingin memesan jasa website paket ${pkg.name} (Rp${pkg.price.toLocaleString('id-ID')}).`;
      }
    }

    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
  };

  const isExpert = (pkg: ServicePackage) => {
    return (
      pkg.id === 'expert' ||
      pkg.name.toLowerCase().includes('expert') ||
      Boolean(pkg.badge && pkg.badge.toUpperCase().includes('TOP TIER'))
    );
  };

  const isPopular = (pkg: ServicePackage) => {
    return (
      pkg.isFeatured ||
      pkg.id === 'advanced' ||
      Boolean(
        pkg.badge &&
          (pkg.badge.toUpperCase().includes('PALING LARIS') ||
            pkg.badge.toUpperCase().includes('POPULER'))
      )
    );
  };

  const renderBadge = (pkg: ServicePackage) => {
    if (!pkg.badge) return null;

    const expert = isExpert(pkg);
    const popular = isPopular(pkg);

    let badgeClass = 'badge-neutral';
    if (expert) {
      badgeClass = 'badge-top-tier';
    } else if (popular) {
      badgeClass = 'badge-solid-yellow badge-paling-laris';
    }

    return (
      <div className="package-badge-wrap">
        <span className={`package-badge ${badgeClass}`}>
          {pkg.badge}
        </span>
      </div>
    );
  };

  const renderBenefitItem = (rawItem: PackageBenefitItem | string, index: number) => {
    const parsedList = parsePackageBenefits([rawItem]);
    const parsed = parsedList[0] || (typeof rawItem === 'string' ? { text: rawItem, type: 'included' as BenefitType } : rawItem);
    const text = parsed.text;
    const type = parsed.type || 'included';

    let icon = <Check size={16} className="benefit-icon icon-included" />;
    let itemClass = 'benefit-item included';

    if (type === 'excluded') {
      icon = <X size={16} className="benefit-icon icon-excluded" />;
      itemClass = 'benefit-item excluded';
    } else if (type === 'info') {
      icon = <Info size={16} className="benefit-icon icon-info" />;
      itemClass = 'benefit-item info';
    }

    return (
      <li key={index} className={itemClass}>
        {icon}
        <span>{text}</span>
      </li>
    );
  };

  const renderPricingCard = (pkg: ServicePackage, isCustomCard = false) => {
    const { hasDiscount, finalPrice } = getPackagePricing(pkg);
    const expert = isExpert(pkg);
    const popular = isPopular(pkg) && !expert;

    let tierClass = '';
    if (expert) {
      tierClass = 'high-tier expert-tier';
    } else if (popular) {
      tierClass = 'popular-tier featured';
    }

    return (
      <div
        key={pkg.id}
        className={`pricing-card ${tierClass} ${isCustomCard ? 'custom-package-card' : ''}`}
      >
        {/* Distinct Badge */}
        {renderBadge(pkg)}

        <div className="pricing-card-header">
          <h3 className="package-name">{pkg.name}</h3>
          <div className="package-subtitle">{pkg.subtitle}</div>
          <p className="package-desc">{pkg.description}</p>
        </div>

        {/* Warranty Badge above Price */}
        <div>
          <div className="warranty-badge">
            <Shield size={14} />
            <span>Garansi: {pkg.warranty}</span>
          </div>
        </div>

        {/* Price Box */}
        <div className="price-box">
          {pkg.isStartingPrice && (
            <div className="price-label-start">Mulai Dari</div>
          )}

          {hasDiscount && (
            <div className="price-original-striked">
              Rp{pkg.price.toLocaleString('id-ID')}
            </div>
          )}

          <div className="price-value-row">
            <span className="price-currency">Rp</span>
            <span className="price-amount">
              {finalPrice.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        {/* Benefits & Limitations List */}
        <ul className="benefits-list">
          {pkg.benefits.map((b, idx) => renderBenefitItem(b, idx))}
        </ul>

        {/* Note if provided */}
        {pkg.note && <div className="package-note">{pkg.note}</div>}

        {/* Order WhatsApp Button */}
        <div className="pricing-card-footer">
          <a
            id={`order-btn-${pkg.id}`}
            href={generateWhatsAppUrl(pkg)}
            target="_blank"
            rel="noopener noreferrer"
            className="order-btn"
            title={`Pesan paket ${pkg.name} via WhatsApp`}
          >
            <WhatsAppIcon size={18} color="var(--icon-whatsapp)" />
            <span>Order Sekarang</span>
          </a>
        </div>
      </div>
    );
  };

  // Symmetrical 3-2-1 layout data preparation
  const activePackages = packages
    .filter((p) => p.isActive !== false)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const customPackage = activePackages.find((p) => p.id === 'custom');
  const mainPackages = activePackages.filter((p) => p.id !== 'custom');

  // Row 1: First 3 packages (Basic, Standard, Advanced)
  const row1 = mainPackages.slice(0, 3);
  // Row 2: Next packages (Pro, Expert)
  const row2 = mainPackages.slice(3);

  return (
    <section className="section-wrapper surface-bg" id="pricelist">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Pricing & Services</span>
          <h2 className="section-title">Pilihan Paket Layanan Website</h2>
          <p className="section-description">
            Pilih paket pembuatan website profesional yang dirancang sesuai dengan skala, anggaran, dan target digital kamu.
          </p>
        </div>

        {/* Public Promo Quota Announcements */}
        {(() => {
          const activeAnnouncements = (promoCodes || []).filter((p) => {
            if (!p.isActive || p.showPublicAnnouncement === false) return false;
            const q = getPromoQuotaInfo(p);
            return !q.isUnlimited && q.remainingQuota > 0;
          });

          if (activeAnnouncements.length === 0) return null;

          return (
            <div className="promo-announcement-container" style={{ marginBottom: '22px' }}>
              {activeAnnouncements.map((promo) => {
                const q = getPromoQuotaInfo(promo);
                const discountLabel =
                  promo.discountType === 'percentage'
                    ? `${promo.discountValue}%`
                    : `Rp${promo.discountValue.toLocaleString('id-ID')}`;

                return (
                  <div
                    key={promo.id}
                    className="promo-alert success"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 18px',
                      borderRadius: 'var(--radius-md)',
                      background: q.isLowQuota ? 'rgba(245, 196, 0, 0.12)' : 'rgba(46, 204, 113, 0.12)',
                      border: q.isLowQuota ? '1px solid rgba(245, 196, 0, 0.35)' : '1px solid rgba(46, 204, 113, 0.35)',
                      color: 'var(--color-text-white)',
                      fontSize: '0.9rem',
                      flexWrap: 'wrap',
                      gap: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Tag size={18} color={q.isLowQuota ? '#F5C400' : '#2ecc71'} />
                      <span>
                        {q.isLowQuota ? (
                          <strong style={{ color: '#F5C400', marginRight: '6px' }}>⚡ Promo Terbatas!</strong>
                        ) : (
                          <strong style={{ color: '#2ecc71', marginRight: '6px' }}>🎉 Promo Spesial!</strong>
                        )}
                        Gunakan kupon <code style={{ color: 'var(--color-primary)', fontWeight: 700, padding: '2px 6px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px' }}>{promo.code}</code> untuk diskon {discountLabel}.{' '}
                        Tersisa <strong style={{ color: q.isLowQuota ? '#F5C400' : '#2ecc71' }}>{q.remainingQuota} kupon</strong> untuk pelanggan berikutnya!
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPromoInput(promo.code);
                      }}
                      style={{
                        background: 'none',
                        border: '1px solid var(--color-primary-border)',
                        color: 'var(--color-primary)',
                        padding: '4px 12px',
                        borderRadius: 'var(--radius-pill)',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Gunakan Kupon
                    </button>
                  </div>
                );
              })}
            </div>
          );
        })()}

        {/* Toolbar: Promo Code Input & Other Services Tab */}
        <div className="pricelist-toolbar">
          <form onSubmit={handleApplyPromo} className="promo-input-box">
            <Tag size={17} color="var(--color-primary-strong)" />
            <input
              id="promo-code-input"
              type="text"
              placeholder="Punya kupon promo? (cth: VAYYYLAUNCH)"
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value)}
              aria-label="Masukkan kode promo"
            />
            <button
              id="promo-apply-btn"
              type="submit"
              className="promo-apply-btn"
              disabled={isValidatingPromo}
            >
              {isValidatingPromo ? 'Memeriksa...' : 'Terapkan'}
            </button>
          </form>

          <button
            id="btn-layanan-lainnya"
            type="button"
            className="other-tab-btn"
            onClick={onOpenOther}
            title="Lihat produk & layanan digital lain"
          >
            <Layers size={18} />
            <span>Layanan Lainnya (Other)</span>
          </button>

          {promoValidation && (
            <div
              id="promo-validation-alert"
              className={`promo-alert ${promoValidation.valid ? 'success' : 'error'}`}
            >
              {promoValidation.valid ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <span>{promoValidation.message}</span>
            </div>
          )}
        </div>

        {/* Symmetrical 3-2-1 Pricing Cards Layout */}
        <div className="pricing-layout-container">
          {/* Row 1: Basic, Standard, Advanced */}
          {row1.length > 0 && (
            <div className="pricing-row pricing-row-1">
              {row1.map((pkg) => renderPricingCard(pkg, false))}
            </div>
          )}

          {/* Row 2: Pro, Expert (truly centered in viewport/container) */}
          {row2.length > 0 && (
            <div className="pricing-row pricing-row-2">
              {row2.map((pkg) => renderPricingCard(pkg, false))}
            </div>
          )}

          {/* Row 3: Custom (centered on last row with proportional width) */}
          {customPackage && (
            <div className="pricing-row pricing-row-custom">
              {renderPricingCard(customPackage, true)}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
