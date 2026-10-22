import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  Layers,
  Ticket,
  Star,
  HelpCircle,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Lock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import {
  ServicePackage,
  Testimonial,
  Promotion,
  PromoCode,
  SiteSettings,
  FaqItem,
  AdminAuthState
} from '../../types';
import { checkAdminAuth, loginAdmin, logoutAdmin } from '../../services/storage';
import { DashboardOverview } from './DashboardOverview';
import { PackagesManager } from './PackagesManager';
import { BenefitsManager } from './BenefitsManager';
import { PromoCodesManager } from './PromoCodesManager';
import { TestimonialsManager } from './TestimonialsManager';
import { FaqContentManager } from './FaqContentManager';
import { SettingsManager } from './SettingsManager';
import { StoreLogo } from '../StoreLogo';

interface AdminPanelPageProps {
  packages: ServicePackage[];
  testimonials: Testimonial[];
  promotions: Promotion[];
  promoCodes: PromoCode[];
  faqs: FaqItem[];
  settings: SiteSettings;
  onNavigateHome: () => void;
}

export type AdminTab =
  | 'dashboard'
  | 'packages'
  | 'benefits'
  | 'promos'
  | 'testimonials'
  | 'faq'
  | 'settings';

export const AdminPanelPage: React.FC<AdminPanelPageProps> = ({
  packages,
  testimonials,
  promotions,
  promoCodes,
  faqs,
  settings,
  onNavigateHome
}) => {
  const [authState, setAuthState] = useState<AdminAuthState>(() => checkAdminAuth());
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Unauthenticated Login Form states
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check auth state on mount and window focus
  useEffect(() => {
    const verifyAuth = () => {
      const current = checkAdminAuth();
      setAuthState(current);
    };

    verifyAuth();
    window.addEventListener('focus', verifyAuth);
    return () => window.removeEventListener('focus', verifyAuth);
  }, []);

  const handleDirectLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginPassword.trim()) {
      setLoginError('Silakan masukkan password admin.');
      return;
    }

    setIsSubmitting(true);
    setLoginError(null);

    const res = await loginAdmin(loginPassword);
    setIsSubmitting(false);

    if (res.success) {
      setAuthState(checkAdminAuth());
      setLoginPassword('');
    } else {
      setLoginError(res.message);
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    setAuthState({ isAuthenticated: false });
    setShowLogoutConfirm(false);
    onNavigateHome();
  };

  // -------------------------------------------------------------
  // If NOT authenticated, show dedicated secure login view on /panel
  // -------------------------------------------------------------
  if (!authState.isAuthenticated) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-bg)',
          padding: '24px'
        }}
      >
        <div
          style={{
            maxWidth: '440px',
            width: '100%',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '36px 30px',
            boxShadow: 'var(--shadow-lg)',
            textAlign: 'center'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <StoreLogo
              size={46}
              alt="Vayyy Store Logo"
            />
          </div>

          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'var(--color-primary-glow)',
              border: '1px solid var(--color-primary-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px',
              color: 'var(--color-primary-strong)'
            }}
          >
            <Lock size={22} />
          </div>

          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-text)', margin: '0 0 6px' }}>
            Autentikasi Admin Panel
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', margin: '0 0 20px', lineHeight: 1.5 }}>
            Halaman <code>/panel</code> dilindungi. Masukkan password setup admin untuk mengelola website Vayyy.Store.
          </p>

          {loginError && (
            <div className="promo-alert error" style={{ marginBottom: '18px', textAlign: 'left' }}>
              <AlertCircle size={17} style={{ flexShrink: 0 }} />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleDirectLogin} style={{ textAlign: 'left' }}>
            <div className="admin-form-group" style={{ marginBottom: '18px' }}>
              <label htmlFor="panel-password-input">Password Admin</label>
              <input
                id="panel-password-input"
                type="password"
                placeholder="Masukkan password admin"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                autoFocus
                required
              />
            </div>

            <button
              type="submit"
              className="btn-primary anim-hover"
              disabled={isSubmitting}
              style={{ width: '100%', padding: '12px', fontSize: '0.94rem', marginBottom: '12px' }}
            >
              {isSubmitting ? 'Memverifikasi...' : 'Masuk ke Dashboard'}
            </button>

            <button
              type="button"
              className="btn-secondary anim-hover"
              onClick={onNavigateHome}
              style={{ width: '100%', padding: '11px', fontSize: '0.9rem' }}
            >
              Kembali ke Halaman Utama
            </button>
          </form>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Authenticated Admin Dashboard Layout
  // -------------------------------------------------------------
  const navItems = [
    { id: 'dashboard' as AdminTab, label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'packages' as AdminTab, label: 'Paket & Harga', icon: <Package size={18} /> },
    { id: 'benefits' as AdminTab, label: 'Benefit', icon: <Layers size={18} /> },
    { id: 'promos' as AdminTab, label: 'Diskon & Kode Promo', icon: <Ticket size={18} /> },
    { id: 'testimonials' as AdminTab, label: 'Testimoni', icon: <Star size={18} /> },
    { id: 'faq' as AdminTab, label: 'FAQ dan Konten', icon: <HelpCircle size={18} /> },
    { id: 'settings' as AdminTab, label: 'Pengaturan', icon: <Settings size={18} /> }
  ];

  return (
    <div className="admin-panel-layout">
      {/* 1. TOP HEADER */}
      <header className="admin-panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            type="button"
            className="admin-mobile-toggle-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle Sidebar"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <StoreLogo
              size={32}
              alt="Vayyy Store Logo"
              className="admin-brand-logo"
            />
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-text)' }}>
              Vayyy.Store <span style={{ color: 'var(--color-primary-strong)', fontSize: '0.85rem' }}>/ Panel</span>
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            className="btn-secondary anim-hover"
            onClick={onNavigateHome}
            style={{ padding: '7px 14px', fontSize: '0.84rem' }}
            title="Buka halaman utama publik"
          >
            <span>Lihat Website</span>
            <ExternalLink size={13} />
          </button>

          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#EF4444',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.84rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
            title="Keluar dari sesi admin"
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* 2. BODY CONTAINER: SIDEBAR + MAIN CONTENT */}
      <div className="admin-panel-body">
        {/* Sidebar */}
        <aside className={`admin-panel-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="admin-sidebar-nav">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`admin-nav-item ${isActive ? 'active' : ''}`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}

            <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(true)}
                className="admin-nav-item logout"
              >
                <LogOut size={18} />
                <span>Logout Sesi</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="admin-panel-content">
          <div className="admin-content-card">
            {activeTab === 'dashboard' && (
              <DashboardOverview
                packages={packages}
                testimonials={testimonials}
                promotions={promotions}
                promoCodes={promoCodes}
                settings={settings}
                onSelectTab={(tab) => {
                  if (tab === 'packages') setActiveTab('packages');
                  if (tab === 'promos') setActiveTab('promos');
                  if (tab === 'testimonials') setActiveTab('testimonials');
                  if (tab === 'settings') setActiveTab('settings');
                }}
              />
            )}

            {activeTab === 'packages' && <PackagesManager packages={packages} />}

            {activeTab === 'benefits' && <BenefitsManager packages={packages} />}

            {activeTab === 'promos' && (
              <PromoCodesManager promoCodes={promoCodes} packages={packages} />
            )}

            {activeTab === 'testimonials' && (
              <TestimonialsManager testimonials={testimonials} />
            )}

            {activeTab === 'faq' && (
              <FaqContentManager faqs={faqs} settings={settings} />
            )}

            {activeTab === 'settings' && (
              <SettingsManager settings={settings} faqs={faqs} />
            )}
          </div>
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="modal-overlay" onClick={() => setShowLogoutConfirm(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '400px', textAlign: 'center', padding: '28px' }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.12)',
                color: '#EF4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px'
              }}
            >
              <LogOut size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--color-text)', margin: '0 0 8px' }}>
              Konfirmasi Logout Admin
            </h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--color-text-secondary)', margin: '0 0 20px', lineHeight: 1.5 }}>
              Sesi admin akan dicabut. Anda harus memasukkan password lagi untuk mengakses panel berikutnya.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn-primary"
                style={{ background: '#EF4444', color: '#fff', border: 'none', padding: '9px 20px' }}
                onClick={handleLogout}
              >
                Ya, Logout
              </button>
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '9px 18px' }}
                onClick={() => setShowLogoutConfirm(false)}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanelPage;
