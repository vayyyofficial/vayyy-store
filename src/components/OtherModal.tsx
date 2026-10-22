import React, { useEffect } from 'react';
import { X, Layers, ExternalLink } from 'lucide-react';
import { DiscordIcon, PaymentIcon } from './BrandIcons';

interface OtherModalProps {
  isOpen: boolean;
  onClose: () => void;
  discordUrl: string;
}

export const OtherModal: React.FC<OtherModalProps> = ({
  isOpen,
  onClose,
  discordUrl
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      id="other-services-modal-overlay"
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="other-modal-title"
    >
      <div
        id="other-services-modal-content"
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          id="close-other-modal-btn"
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Tutup jendela layanan lainnya"
        >
          <X size={18} />
        </button>

        <div className="other-modal-header">
          <div className="other-icon-wrap">
            <Layers size={28} />
          </div>
          <h2 className="other-modal-title" id="other-modal-title">
            Produk & Layanan Digital Lainnya
          </h2>
          <p className="other-modal-desc">
            Selain website, Vayyy Store juga menyediakan aneka solusi teknis dan layanan digital lainnya yang dapat dikonsultasikan secara langsung.
          </p>
        </div>

        <div className="other-services-tags">
          <span className="service-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <DiscordIcon size={14} color="var(--icon-discord)" />
            <span>Bot Discord Kustom</span>
          </span>
          <span className="service-pill">Setup Minecraft Server</span>
          <span className="service-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <PaymentIcon size={14} color="var(--color-primary-strong)" />
            <span>Akun & App Premium</span>
          </span>
          <span className="service-pill">Desain Grafis Digital</span>
          <span className="service-pill">Make Skins Minecraft</span>
          <span className="service-pill">Konsultasi Teknis IT</span>
        </div>

        <div className="discord-cta-box">
          <p>
            Katalog lengkap, harga terkini, dan ketersediaan stok untuk layanan di atas dapat ditanyakan langsung kepada tim kami melalui server Discord resmi Vayyy Store.
          </p>
          <a
            id="modal-btn-join-discord"
            href={discordUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-discord"
          >
            <DiscordIcon size={18} color="var(--icon-discord)" />
            <span>Join Discord Vayyy Store</span>
            <ExternalLink size={15} />
          </a>
        </div>
      </div>
    </div>
  );
};
