import React, { useState, useEffect, useCallback } from 'react';
import {
  ServicePackage,
  Testimonial,
  Promotion,
  PromoCode,
  SiteSettings,
  FaqItem
} from './types';
import {
  initSeedData,
  STORE_UPDATE_EVENT,
  getPublicPackages,
  getAllPackages,
  getPublicTestimonials,
  getAllTestimonials,
  getPublicPromotions,
  getAllPromotions,
  getAllPromoCodes,
  getPublicFaqs,
  getSiteSettings,
  checkAdminAuth,
  getInitialCachedPackages,
  getInitialCachedTestimonials,
  getInitialCachedFaqs,
  getInitialCachedSettings,
  getInitialCachedPromoCodes
} from './services/storage';

import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Pricelist } from './components/Pricelist';
import { OtherModal } from './components/OtherModal';
import { Testimonials } from './components/Testimonials';
import { FAQ } from './components/FAQ';
import { Footer } from './components/Footer';
import { AdminAccessModal } from './components/admin/AdminAccessModal';

// Performance: Lazy load admin panel so public visitors do not download admin code in initial bundle
const AdminPanelPage = React.lazy(() => import('./components/admin/AdminPanelPage'));

export const App: React.FC = () => {
  // SPA Routing: track current pathname
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname);

  // Modals state
  const [isOtherOpen, setIsOtherOpen] = useState(false);
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);

  // App Data states (initialized synchronously with memory cache for 0ms initial render / SWR)
  const [packages, setPackages] = useState<ServicePackage[]>(() =>
    getInitialCachedPackages().filter(p => p.isActive)
  );
  const [allPackagesForAdmin, setAllPackagesForAdmin] = useState<ServicePackage[]>(() =>
    getInitialCachedPackages()
  );
  const [testimonials, setTestimonials] = useState<Testimonial[]>(() =>
    getInitialCachedTestimonials().filter(t => t.isPublished)
  );
  const [allTestimonialsForAdmin, setAllTestimonialsForAdmin] = useState<Testimonial[]>(() =>
    getInitialCachedTestimonials()
  );
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(() => getInitialCachedPromoCodes());
  const [faqs, setFaqs] = useState<FaqItem[]>(() => getInitialCachedFaqs());
  const [settings, setSettings] = useState<SiteSettings>(() => getInitialCachedSettings());

  // Listen to browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Fetch all data from persistence layer
  const refreshData = useCallback(async () => {
    initSeedData();

    const [pubPkgs, allPkgs, pubTestis, allTestis, promos, codes, faqList, siteConf] =
      await Promise.all([
        getPublicPackages(),
        getAllPackages(),
        getPublicTestimonials(),
        getAllTestimonials(),
        getPublicPromotions(),
        getAllPromoCodes(),
        getPublicFaqs(),
        getSiteSettings()
      ]);

    setPackages(pubPkgs);
    setAllPackagesForAdmin(allPkgs);
    setTestimonials(pubTestis);
    setAllTestimonialsForAdmin(allTestis);
    setPromotions(promos);
    setPromoCodes(codes);
    setFaqs(faqList);
    setSettings(siteConf);
  }, []);

  useEffect(() => {
    refreshData();

    const handleUpdate = () => {
      refreshData();
    };

    window.addEventListener(STORE_UPDATE_EVENT, handleUpdate);
    return () => window.removeEventListener(STORE_UPDATE_EVENT, handleUpdate);
  }, [refreshData]);

  // Handle click on the hidden admin dot in the footer: always require authentication
  const handleOpenAdminAccess = () => {
    setIsAccessModalOpen(true);
  };

  // On successful password authentication from modal, navigate to /panel
  const handleAdminAccessSuccess = () => {
    setIsAccessModalOpen(false);
    navigateTo('/panel');
  };

  // ROUTE 1: Dedicated Admin Panel Page (/panel)
  if (currentPath === '/panel' || currentPath.startsWith('/panel/')) {
    return (
      <React.Suspense
        fallback={
          <div
            style={{
              minHeight: '100vh',
              background: '#090a0c',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#F5C400',
              fontFamily: 'Inter, sans-serif'
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                border: '3px solid rgba(245, 196, 0, 0.2)',
                borderTopColor: '#F5C400',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
                marginBottom: '1rem'
              }}
            />
            <p style={{ color: '#8F9CAE', fontSize: '0.9rem', margin: 0 }}>Memuat Panel Admin...</p>
          </div>
        }
      >
        <AdminPanelPage
          packages={allPackagesForAdmin}
          testimonials={allTestimonialsForAdmin}
          promotions={promotions}
          promoCodes={promoCodes}
          faqs={faqs}
          settings={settings}
          onNavigateHome={() => navigateTo('/')}
        />
      </React.Suspense>
    );
  }

  // ROUTE 2: Public Website Landing Page (/)
  return (
    <>
      {/* 1. Navigation Bar with Theme Switcher, assets/logo.png, and Vayyy.Dev Button without arrow */}
      <Navbar vayyyDevUrl={settings.vayyyDevUrl} />

      {/* 2. Main Page Content */}
      <main id="page-content">
        {/* Hero Section */}
        <Hero
          title={settings.heroTitle}
          description={settings.heroDescription}
          discordUrl={settings.discordUrl}
        />

        {/* Pricelist Section: 5 main packages on top, Custom below, typed benefits, Expert outline badge */}
        <Pricelist
          packages={packages}
          whatsappNumber={settings.whatsappNumber}
          onOpenOther={() => setIsOtherOpen(true)}
        />

        {/* Testimonials Section */}
        <Testimonials testimonials={testimonials} />

        {/* FAQ Section */}
        <FAQ faqs={faqs} />

        {/* Footer with assets/logo.png and subtle admin dot button */}
        <Footer
          vayyyDevUrl={settings.vayyyDevUrl}
          discordUrl={settings.discordUrl}
          whatsappNumber={settings.whatsappNumber}
          onOpenAdminAccess={handleOpenAdminAccess}
        />
      </main>

      {/* 3. Other Services Modal */}
      <OtherModal
        isOpen={isOtherOpen}
        onClose={() => setIsOtherOpen(false)}
        discordUrl={settings.discordUrl}
      />

      {/* 4. Admin Access Password Modal (Triggered by Footer Dot, redirects to /panel on success) */}
      <AdminAccessModal
        isOpen={isAccessModalOpen}
        onClose={() => setIsAccessModalOpen(false)}
        onSuccess={handleAdminAccessSuccess}
      />
    </>
  );
};

export default App;
