import React, { useState, useEffect } from 'react';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { StoreLogo } from './StoreLogo';

interface NavbarProps {
  vayyyDevUrl: string;
}

export const Navbar: React.FC<NavbarProps> = ({ vayyyDevUrl }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  // Theme toggle state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('vayyy_theme') === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('vayyy_theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('vayyy_theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      const sections = ['faq', 'testimoni', 'pricelist', 'home'];
      const scrollPos = window.scrollY + 100;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(sectionId);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    if (sectionId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const targetEl = document.getElementById(sectionId);
    if (targetEl) {
      const navbarOffset = 76;
      const targetPos = targetEl.getBoundingClientRect().top + window.scrollY - navbarOffset;
      window.scrollTo({ top: targetPos, behavior: 'smooth' });
    }
  };

  return (
    <nav className={`site-navbar ${isScrolled ? 'scrolled' : ''}`} aria-label="Main Navigation">
      <div className="navbar-inner">
        <a
          id="nav-link-brand"
          href="#home"
          className="navbar-brand"
          onClick={(e) => handleNavClick(e, 'home')}
        >
          <StoreLogo
            size={36}
            alt="Vayyy Store Logo"
            className="navbar-brand-logo"
          />
          <span className="navbar-brand-text">Vayyy.Store</span>
        </a>

        <div className={`navbar-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <a
            id="nav-link-home"
            href="#home"
            className={`navbar-link ${activeSection === 'home' ? 'active' : ''}`}
            onClick={(e) => handleNavClick(e, 'home')}
          >
            Home
          </a>
          <a
            id="nav-link-pricelist"
            href="#pricelist"
            className={`navbar-link ${activeSection === 'pricelist' ? 'active' : ''}`}
            onClick={(e) => handleNavClick(e, 'pricelist')}
          >
            Pricelist
          </a>
          <a
            id="nav-link-testimoni"
            href="#testimoni"
            className={`navbar-link ${activeSection === 'testimoni' ? 'active' : ''}`}
            onClick={(e) => handleNavClick(e, 'testimoni')}
          >
            Testimoni
          </a>
          <a
            id="nav-link-faq"
            href="#faq"
            className={`navbar-link ${activeSection === 'faq' ? 'active' : ''}`}
            onClick={(e) => handleNavClick(e, 'faq')}
          >
            FAQ
          </a>
        </div>

        <div className="navbar-actions">
          {/* Theme Switcher Toggle */}
          <button
            id="theme-toggle-btn"
            type="button"
            className="theme-toggle-btn"
            onClick={() => setIsDarkMode(!isDarkMode)}
            aria-label={isDarkMode ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'}
            title={isDarkMode ? 'Mode Terang' : 'Mode Gelap'}
          >
            {isDarkMode ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* Vayyy.Dev Button (Solid yellow background, black text, rounded, NO arrow icon) */}
          <a
            id="nav-btn-vayyy-dev"
            href={!vayyyDevUrl || vayyyDevUrl === 'https://vayyy.dev' ? 'https://vayyy.vercel.app' : vayyyDevUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="vayyy-dev-btn"
            title="Kunjungi Vayyy.Dev"
          >
            Vayyy.Dev
          </a>

          {/* Mobile Menu Button */}
          <button
            id="nav-btn-mobile-toggle"
            type="button"
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Mobile Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </nav>
  );
};
