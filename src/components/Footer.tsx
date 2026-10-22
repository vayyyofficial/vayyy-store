import React from 'react';
import { DiscordIcon, WhatsAppIcon, StoreLogo } from './BrandIcons';

interface FooterProps {
  vayyyDevUrl: string;
  discordUrl: string;
  whatsappNumber: string;
  onOpenAdminAccess: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  vayyyDevUrl,
  discordUrl,
  whatsappNumber,
  onOpenAdminAccess
}) => {
  const currentYear = new Date().getFullYear();
  const cleanPhone = whatsappNumber.replace(/\D/g, '');

  const handleScrollTo = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      const offset = 76;
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - offset,
        behavior: 'smooth'
      });
    }
  };

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top-grid">
          {/* Col 1: Brand Info */}
          <div className="footer-brand-col">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <StoreLogo
                size={34}
                alt="Vayyy Store Logo"
                className="footer-brand-logo"
              />
              <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-text)' }}>
                Vayyy.Store
              </span>
            </div>
            <p>
              Layanan teknis profesional untuk pengembangan website, pembuatan bot, setup server, dan solusi digital yang cepat, aman, dan berkualitas.
            </p>
          </div>

          {/* Col 2: Navigation */}
          <div className="footer-col">
            <h4>Navigasi</h4>
            <ul className="footer-col-links">
              <li>
                <a href="#home" onClick={(e) => handleScrollTo(e, 'home')}>
                  Home
                </a>
              </li>
              <li>
                <a href="#pricelist" onClick={(e) => handleScrollTo(e, 'pricelist')}>
                  Pricelist
                </a>
              </li>
              <li>
                <a href="#testimoni" onClick={(e) => handleScrollTo(e, 'testimoni')}>
                  Testimoni
                </a>
              </li>
              <li>
                <a href="#faq" onClick={(e) => handleScrollTo(e, 'faq')}>
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Ekosistem & Komunitas */}
          <div className="footer-col">
            <h4>Komunitas</h4>
            <ul className="footer-col-links">
              <li>
                <a
                  href={discordUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Server Discord Resmi"
                >
                  <DiscordIcon size={17} color="var(--icon-discord)" />
                  <span>Discord Store</span>
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${cleanPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="WhatsApp Admin"
                >
                  <WhatsAppIcon size={17} color="var(--icon-whatsapp)" />
                  <span>WhatsApp Chat</span>
                </a>
              </li>
              <li>
                <a
                  href={vayyyDevUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Website Portfolio Utama Vayyy.Dev"
                >
                  <span>Vayyy.Dev</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Keamanan & Garansi */}
          <div className="footer-col">
            <h4>Komitmen</h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              Seluruh transaksi pemesanan dilayani secara transparan dengan masa garansi terjamin sesuai paket yang dipilih.
            </p>
          </div>
        </div>

        {/* Footer Bottom Line */}
        <div className="footer-bottom-row">
          <div className="footer-copyright">
            &copy; {currentYear} <strong>Vayyy Store</strong>. All rights reserved.
            {/* Subtle Circular Admin Dot Button */}
            <button
              id="footer-admin-dot-btn"
              type="button"
              className="footer-admin-dot"
              onClick={onOpenAdminAccess}
              aria-label="Admin access"
              title="Admin access"
            />
          </div>

          <div style={{ fontSize: '0.84rem', color: 'var(--color-text-muted)' }}>
            Designed for high performance & commercial digital services.
          </div>
        </div>
      </div>
    </footer>
  );
};
