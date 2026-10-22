import React from 'react';
import { ArrowRight, ShieldCheck, Zap, Code2 } from 'lucide-react';
import { DiscordIcon } from './BrandIcons';

interface HeroProps {
  title: string;
  description: string;
  discordUrl: string;
}

export const Hero: React.FC<HeroProps> = ({ title, description, discordUrl }) => {
  const handleScrollToPricelist = (e: React.MouseEvent) => {
    e.preventDefault();
    const targetEl = document.getElementById('pricelist');
    if (targetEl) {
      const navbarOffset = 76;
      const targetPos = targetEl.getBoundingClientRect().top + window.scrollY - navbarOffset;
      window.scrollTo({ top: targetPos, behavior: 'smooth' });
    }
  };

  const words = title.split(' ');
  const mainTitle = words.slice(0, 2).join(' ');
  const accentTitle = words.slice(2).join(' ');

  return (
    <section className="hero-section" id="home">
      <div className="container">
        <div className="hero-pill">
          <span className="hero-pill-indicator" />
          <span>Layanan Digital & Pengembangan Web Profesional</span>
        </div>

        <h1 className="hero-title">
          {mainTitle} <span className="accent">{accentTitle}</span>
        </h1>

        <p className="hero-description">{description}</p>

        <div className="hero-cta-group">
          <a
            id="hero-btn-lihat-harga"
            href="#pricelist"
            onClick={handleScrollToPricelist}
            className="btn-primary"
          >
            <span>Lihat Harga</span>
            <ArrowRight size={18} />
          </a>

          <a
            id="hero-btn-discord"
            href={discordUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            <DiscordIcon size={18} color="var(--icon-discord)" />
            <span>Join Discord</span>
          </a>
        </div>

        {/* Commercial Brand Value Props */}
        <div className="hero-values-row">
          <div className="hero-value-item">
            <ShieldCheck size={18} className="hero-value-icon" />
            <span>Garansi Teknis Resmi</span>
          </div>
          <div className="hero-value-item">
            <Code2 size={18} className="hero-value-icon" />
            <span>Clean Code & Siap Skala</span>
          </div>
          <div className="hero-value-item">
            <Zap size={18} className="hero-value-icon" />
            <span>Pengerjaan Cepat & Tepat</span>
          </div>
        </div>
      </div>
    </section>
  );
};
