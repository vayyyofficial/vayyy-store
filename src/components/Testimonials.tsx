import React from 'react';
import { Star, MessageSquareQuote, Calendar, CheckCircle2 } from 'lucide-react';
import { Testimonial } from '../types';

interface TestimonialsProps {
  testimonials: Testimonial[];
}

export const Testimonials: React.FC<TestimonialsProps> = ({ testimonials }) => {
  const published = testimonials.filter(
    (t) => t.isPublished && t.rating >= 1 && t.rating <= 5
  );

  const totalCount = published.length;
  const ratingSum = published.reduce((acc, curr) => acc + curr.rating, 0);
  const averageRating = totalCount > 0 ? (ratingSum / totalCount).toFixed(2) : null;

  return (
    <section className="section-wrapper" id="testimoni">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Client Reviews</span>
          <h2 className="section-title">Testimoni & Kepuasan Pelanggan</h2>
          <p className="section-description">
            Ulasan nyata dari pelanggan yang telah mempercayakan proyek dan kebutuhan digital mereka kepada Vayyy Store.
          </p>
        </div>

        {totalCount > 0 ? (
          <>
            {/* Rating Summary Banner */}
            <div className="testimonials-summary-card">
              <div className="summary-stat-block">
                <div className="summary-rating-number">{averageRating}</div>
                <div className="summary-stars-row">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={20}
                      fill={
                        star <= Math.round(Number(averageRating))
                          ? 'var(--color-primary)'
                          : 'none'
                      }
                      stroke="var(--color-primary)"
                    />
                  ))}
                </div>
                <div className="summary-label">Rata-rata Rating (Skala 5.0)</div>
              </div>

              <div className="summary-stat-block">
                <div className="summary-rating-number">{totalCount}</div>
                <div className="summary-label">Total Testimoni Terpublikasi</div>
              </div>

              <div
                className="summary-stat-block"
                style={{ textAlign: 'left', maxWidth: '340px' }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '6px'
                  }}
                >
                  <CheckCircle2 size={20} color="var(--color-green)" />
                  <span
                    style={{
                      fontWeight: 700,
                      color: 'var(--color-text)',
                      fontSize: '0.96rem'
                    }}
                  >
                    100% Ulasan Terverifikasi
                  </span>
                </div>
                <p
                  style={{
                    fontSize: '0.86rem',
                    color: 'var(--color-text-secondary)',
                    lineHeight: 1.5
                  }}
                >
                  Seluruh skor rating dikalkulasikan secara otomatis dan transparan dari ulasan pelanggan yang telah terbit.
                </p>
              </div>
            </div>

            {/* Testimonials Grid */}
            <div className="testimonials-grid">
              {published.map((item) => (
                <div key={item.id} className="testimonial-card">
                  <div className="testimonial-card-header">
                    <div>
                      <h4 className="customer-name">{item.customerName}</h4>
                      {item.serviceName && (
                        <div className="testimonial-service-tag">{item.serviceName}</div>
                      )}
                    </div>

                    <div
                      className="testimonial-stars"
                      aria-label={`Rating ${item.rating} dari 5 bintang`}
                    >
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={16}
                          fill={star <= item.rating ? 'var(--color-primary)' : 'none'}
                          stroke="var(--color-primary)"
                        />
                      ))}
                    </div>
                  </div>

                  <p className="testimonial-text">"{item.reviewText}"</p>

                  <div className="testimonial-date">
                    <Calendar size={14} />
                    <span>
                      {new Date(item.date).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* Empty state */
          <div className="empty-testimonials-box">
            <MessageSquareQuote size={44} />
            <h3>Belum Ada Testimoni</h3>
            <p>
              Saat ini belum ada testimoni yang dipublikasikan. Ulasan dari pelanggan yang telah memesan layanan akan tampil secara otomatis di sini.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
