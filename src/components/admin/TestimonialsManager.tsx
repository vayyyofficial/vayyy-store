import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Star, X, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { Testimonial } from '../../types';
import { saveTestimonial, deleteTestimonial } from '../../services/storage';

interface TestimonialsManagerProps {
  testimonials: Testimonial[];
}

export const TestimonialsManager: React.FC<TestimonialsManagerProps> = ({
  testimonials
}) => {
  const [editingTesti, setEditingTesti] = useState<Testimonial | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleCreate = () => {
    const today = new Date().toISOString().split('T')[0];
    const newTesti: Testimonial = {
      id: crypto.randomUUID(),
      customerName: 'Klien Baru',
      rating: 5,
      reviewText: 'Pengerjaan website sangat rapi, cepat, dan sesuai dengan ekspektasi!',
      date: today,
      isPublished: true,
      serviceName: 'Paket Standard'
    };
    setEditingTesti(newTesti);
    setStatusMsg(null);
  };

  const handleEdit = (t: Testimonial) => {
    setEditingTesti({ ...t });
    setStatusMsg(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTesti) return;

    if (!editingTesti.customerName.trim() || !editingTesti.reviewText.trim()) {
      setStatusMsg({ type: 'error', text: 'Nama customer dan isi ulasan tidak boleh kosong.' });
      return;
    }

    if (editingTesti.rating < 1 || editingTesti.rating > 5) {
      setStatusMsg({ type: 'error', text: 'Rating harus antara 1 sampai 5 bintang.' });
      return;
    }

    try {
      await saveTestimonial(editingTesti);
      setStatusMsg({
        type: 'success',
        text: `Testimoni dari "${editingTesti.customerName}" berhasil disimpan!`
      });
      setEditingTesti(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setStatusMsg({
        type: 'error',
        text: `Gagal menyimpan testimoni: ${msg}`
      });
    }
  };

  const handleDelete = async (t: Testimonial) => {
    if (confirm(`Hapus testimoni dari "${t.customerName}"?`)) {
      try {
        await deleteTestimonial(t.id);
        setStatusMsg({ type: 'success', text: `Testimoni dari "${t.customerName}" telah dihapus.` });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setStatusMsg({ type: 'error', text: `Gagal menghapus testimoni: ${msg}` });
      }
    }
  };

  const handleTogglePublish = async (t: Testimonial) => {
    try {
      const updated = { ...t, isPublished: !t.isPublished };
      await saveTestimonial(updated);
      setStatusMsg({
        type: 'success',
        text: `Status testimoni "${t.customerName}" diubah menjadi ${!t.isPublished ? 'Dipublikasikan' : 'Disembunyikan'}.`
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setStatusMsg({ type: 'error', text: `Gagal mengubah status publikasi: ${msg}` });
    }
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px'
        }}
      >
        <h3 style={{ fontSize: '1.2rem', color: 'var(--color-text-white)' }}>
          Manajemen Testimoni Pelanggan
        </h3>
        <button
          id="admin-btn-add-testi"
          type="button"
          className="btn-primary anim-hover"
          style={{ padding: '8px 16px', fontSize: '0.86rem' }}
          onClick={handleCreate}
        >
          <Plus size={16} />
          <span>Tambah Testimoni</span>
        </button>
      </div>

      {statusMsg && (
        <div className={`promo-alert ${statusMsg.type}`} style={{ marginBottom: '16px' }}>
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Editor Modal/Panel */}
      {editingTesti && (
        <form
          onSubmit={handleSave}
          style={{
            background: 'var(--color-surface-inner)',
            border: '1px solid var(--color-primary-border)',
            borderRadius: 'var(--radius-md)',
            padding: '24px',
            marginBottom: '26px'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px'
            }}
          >
            <h4 style={{ color: 'var(--color-primary)', fontSize: '1.05rem' }}>
              Edit Testimoni: {editingTesti.customerName}
            </h4>
            <button
              type="button"
              onClick={() => setEditingTesti(null)}
              style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px'
            }}
          >
            <div className="admin-form-group">
              <label>Nama Customer</label>
              <input
                id="admin-testi-customer-name"
                type="text"
                value={editingTesti.customerName}
                onChange={(e) =>
                  setEditingTesti({ ...editingTesti, customerName: e.target.value })
                }
                required
              />
            </div>

            <div className="admin-form-group">
              <label>Layanan yang Dipesan</label>
              <input
                id="admin-testi-service-name"
                type="text"
                placeholder="cth: Paket Advanced, Setup Minecraft"
                value={editingTesti.serviceName || ''}
                onChange={(e) =>
                  setEditingTesti({ ...editingTesti, serviceName: e.target.value })
                }
              />
            </div>

            <div className="admin-form-group">
              <label>Rating (1 - 5 Bintang)</label>
              <select
                id="admin-testi-rating"
                value={editingTesti.rating}
                onChange={(e) =>
                  setEditingTesti({ ...editingTesti, rating: parseInt(e.target.value) || 5 })
                }
              >
                <option value={5}>5 Bintang (Sangat Puas)</option>
                <option value={4}>4 Bintang (Puas)</option>
                <option value={3}>3 Bintang (Cukup)</option>
                <option value={2}>2 Bintang (Kurang)</option>
                <option value={1}>1 Bintang (Tidak Puas)</option>
              </select>
            </div>

            <div className="admin-form-group">
              <label>Tanggal Testimoni</label>
              <input
                type="date"
                value={editingTesti.date}
                onChange={(e) => setEditingTesti({ ...editingTesti, date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label>Isi Ulasan / Testimoni</label>
            <textarea
              id="admin-testi-review-text"
              rows={3}
              value={editingTesti.reviewText}
              onChange={(e) =>
                setEditingTesti({ ...editingTesti, reviewText: e.target.value })
              }
              required
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={editingTesti.isPublished}
                onChange={(e) =>
                  setEditingTesti({ ...editingTesti, isPublished: e.target.checked })
                }
              />
              <span>Publikasikan ke Website (Tampil di Publik & Dihitung ke Rating Toko)</span>
            </label>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              id="admin-testi-submit-btn"
              type="submit"
              className="btn-primary anim-hover"
              style={{ padding: '9px 24px', fontSize: '0.88rem' }}
            >
              Simpan Testimoni
            </button>
            <button
              type="button"
              className="btn-secondary anim-hover"
              style={{ padding: '9px 18px', fontSize: '0.88rem' }}
              onClick={() => setEditingTesti(null)}
            >
              Batal
            </button>
          </div>
        </form>
      )}

      {/* Testimonials Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Rating</th>
              <th>Layanan</th>
              <th>Tanggal</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {testimonials.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: '#777' }}>
                  Belum ada testimoni. Klik "Tambah Testimoni" di atas untuk menambahkan review baru.
                </td>
              </tr>
            ) : (
              testimonials.map((t) => (
                <tr key={t.id}>
                  <td>
                    <strong>{t.customerName}</strong>
                    <div style={{ fontSize: '0.78rem', color: '#888', maxWidth: '300px' }}>
                      "{t.reviewText.substring(0, 70)}
                      {t.reviewText.length > 70 ? '...' : ''}"
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '2px', color: 'var(--color-primary)' }}>
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} size={13} fill="var(--color-primary)" />
                      ))}
                    </div>
                  </td>
                  <td>{t.serviceName || '-'}</td>
                  <td>{t.date}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleTogglePublish(t)}
                      style={{
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-pill)',
                        border: 'none',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: t.isPublished
                          ? 'rgba(46, 204, 113, 0.15)'
                          : 'rgba(231, 76, 60, 0.15)',
                        color: t.isPublished ? '#2ecc71' : '#e74c3c'
                      }}
                    >
                      {t.isPublished ? <Eye size={12} /> : <EyeOff size={12} />}
                      <span>{t.isPublished ? 'Published' : 'Draft'}</span>
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => handleEdit(t)}
                        style={{
                          padding: '6px',
                          background: 'var(--color-surface)',
                          border: '1px solid var(--color-border)',
                          color: '#fff',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer'
                        }}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(t)}
                        style={{
                          padding: '6px',
                          background: 'var(--color-surface)',
                          border: '1px solid var(--color-border)',
                          color: '#e74c3c',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer'
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
