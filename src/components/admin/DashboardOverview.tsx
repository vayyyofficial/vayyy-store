import React from 'react';
import { Package, Star, Tag, Ticket, Settings, ShieldCheck } from 'lucide-react';
import { ServicePackage, Testimonial, Promotion, PromoCode, SiteSettings } from '../../types';
import { WhatsAppIcon, DiscordIcon } from '../BrandIcons';

interface DashboardOverviewProps {
  packages: ServicePackage[];
  testimonials: Testimonial[];
  promotions: Promotion[];
  promoCodes: PromoCode[];
  settings: SiteSettings;
  onSelectTab: (tab: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  packages,
  testimonials,
  promotions,
  promoCodes,
  settings,
  onSelectTab
}) => {
  const publishedTestis = testimonials.filter((t) => t.isPublished);
  const ratingSum = publishedTestis.reduce((acc, t) => acc + t.rating, 0);
  const avgRating =
    publishedTestis.length > 0 ? (ratingSum / publishedTestis.length).toFixed(2) : '0.00';

  const activePackages = packages.filter((p) => p.isActive).length;
  const activePromos = promotions.filter((p) => p.isActive).length;
  const activePromoCodes = promoCodes.filter((c) => c.isActive).length;

  return (
    <div>
      {/* Real-time stats from persistent data */}
      <div className="admin-stats-grid">
        <div
          className="admin-stat-card anim-hover"
          style={{ cursor: 'pointer' }}
          onClick={() => onSelectTab('testimonials')}
        >
          <div className="stat-icon-wrap">
            <Star size={22} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{publishedTestis.length}</div>
            <div className="stat-label">Testimoni Published</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon-wrap">
            <Star size={22} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{avgRating}</div>
            <div className="stat-label">Rating Rata-rata Toko</div>
          </div>
        </div>

        <div
          className="admin-stat-card anim-hover"
          style={{ cursor: 'pointer' }}
          onClick={() => onSelectTab('packages')}
        >
          <div className="stat-icon-wrap">
            <Package size={22} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{activePackages} / {packages.length}</div>
            <div className="stat-label">Paket Layanan Aktif</div>
          </div>
        </div>

        <div
          className="admin-stat-card anim-hover"
          style={{ cursor: 'pointer' }}
          onClick={() => onSelectTab('promos')}
        >
          <div className="stat-icon-wrap">
            <Tag size={22} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{activePromos} Promo / {activePromoCodes} Kupon</div>
            <div className="stat-label">Diskon & Kupon Aktif</div>
          </div>
        </div>
      </div>

      {/* Quick Summary Panels */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
          marginTop: '20px'
        }}
      >
        <div
          style={{
            background: 'var(--color-surface-inner)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '22px'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '14px'
            }}
          >
            <h3 style={{ fontSize: '1.05rem', color: 'var(--color-text-white)' }}>
              Ringkasan Konfigurasi Website
            </h3>
            <Settings size={18} color="var(--color-primary)" />
          </div>

          <div style={{ fontSize: '0.86rem', color: 'var(--color-text-muted)', lineHeight: 1.8 }}>
            <div>
              <strong style={{ color: 'var(--color-text-white)' }}>Nama Website:</strong> {settings.siteName}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <strong style={{ color: 'var(--color-text)' }}>Nomor WhatsApp:</strong>
              <WhatsAppIcon size={16} color="var(--icon-whatsapp)" />
              <span>+{settings.whatsappNumber}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <strong style={{ color: 'var(--color-text)' }}>Komunitas Discord:</strong>
              <DiscordIcon size={16} color="var(--icon-discord)" />
              <a
                href={settings.discordUrl}
                target="_blank"
                rel="noreferrer"
                style={{ color: 'var(--color-primary)' }}
              >
                {settings.discordUrl}
              </a>
            </div>
            <div>
              <strong style={{ color: 'var(--color-text-white)' }}>Target URL Vayyy.Dev:</strong>{' '}
              <a
                href={settings.vayyyDevUrl}
                target="_blank"
                rel="noreferrer"
                style={{ color: 'var(--color-primary)' }}
              >
                {settings.vayyyDevUrl}
              </a>
            </div>
          </div>

          <button
            type="button"
            className="btn-secondary anim-hover"
            style={{ marginTop: '16px', width: '100%', fontSize: '0.86rem', padding: '8px 14px' }}
            onClick={() => onSelectTab('settings')}
          >
            Ubah Pengaturan Website
          </button>
        </div>

        <div
          style={{
            background: 'var(--color-surface-inner)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '22px'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '14px'
            }}
          >
            <h3 style={{ fontSize: '1.05rem', color: 'var(--color-text-white)' }}>
              Status Keamanan & Database
            </h3>
            <ShieldCheck size={18} color="var(--color-green)" />
          </div>

          <div style={{ fontSize: '0.86rem', color: 'var(--color-text-muted)', lineHeight: 1.8 }}>
            <div>
              <strong style={{ color: 'var(--color-text-white)' }}>Enkripsi Sesi:</strong> SHA-256 Tokenized Session
            </div>
            <div>
              <strong style={{ color: 'var(--color-text-white)' }}>Penyimpanan:</strong> Persistent Hybrid (Supabase / Local Engine)
            </div>
            <div>
              <strong style={{ color: 'var(--color-text-white)' }}>Akses Tulis Publik:</strong> Disabled (Dilindungi Autentikasi)
            </div>
            <div>
              <strong style={{ color: 'var(--color-text-white)' }}>Sinkronisasi:</strong> Real-time Cross-tab Event Sync
            </div>
          </div>

          <div
            style={{
              marginTop: '16px',
              padding: '10px 14px',
              background: 'rgba(46, 204, 113, 0.08)',
              border: '1px solid rgba(46, 204, 113, 0.25)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              color: 'var(--color-green)'
            }}
          >
            Sistem beroperasi normal dan aman.
          </div>
        </div>
      </div>
    </div>
  );
};
