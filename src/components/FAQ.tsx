import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FaqItem } from '../types';

interface FAQProps {
  faqs: FaqItem[];
}

export const FAQ: React.FC<FAQProps> = ({ faqs }) => {
  const [openIds, setOpenIds] = useState<string[]>(['faq-1']);

  const toggleAccordion = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleAccordion(id);
    }
  };

  return (
    <section className="section-wrapper" id="faq">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Frequently Asked Questions</span>
          <h2 className="section-title">Pertanyaan yang Sering Diajukan</h2>
          <p className="section-description">
            Temukan jawaban cepat atas pertanyaan seputar pemesanan, teknis pembuatan website, pembayaran, dan garansi layanan.
          </p>
        </div>

        <div className="faq-container">
          {faqs.map((faq) => {
            const isOpen = openIds.includes(faq.id);

            return (
              <div
                key={faq.id}
                className={`faq-card ${isOpen ? 'open' : ''}`}
              >
                <button
                  type="button"
                  className="faq-question-btn"
                  onClick={() => toggleAccordion(faq.id)}
                  onKeyDown={(e) => handleKeyDown(e, faq.id)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${faq.id}`}
                  id={`faq-btn-${faq.id}`}
                >
                  <span>{faq.question}</span>
                  <ChevronDown size={20} className="faq-chevron" />
                </button>

                <div
                  id={`faq-answer-${faq.id}`}
                  role="region"
                  aria-labelledby={`faq-btn-${faq.id}`}
                  className="faq-answer-panel"
                >
                  <p>{faq.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
