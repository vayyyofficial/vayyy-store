import React, { useState } from 'react';
import { Plus, Trash2, Edit2, X, HelpCircle, FileText, CheckCircle2 } from 'lucide-react';
import { FaqItem, SiteSettings } from '../../types';
import { saveFaq, deleteFaq, saveSiteSettings } from '../../services/storage';

interface FaqContentManagerProps {
  faqs: FaqItem[];
  settings: SiteSettings;
}

export const FaqContentManager: React.FC<FaqContentManagerProps> = ({ faqs, settings }) => {
  const [activeSubTab, setActiveSubTab] = useState<'faq' | 'content'>('faq');
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);
  const [contentForm, setContentForm] = useState<SiteSettings>({ ...settings });
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleCreateFaq = () => {
    const newFaq: FaqItem = {
      id: `faq-${Date.now()}`,
      question: '',
      answer: '',
      sortOrder: faqs.length + 1
    };
    setEditingFaq(newFaq);
    setStatusMsg(null);
  };

  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaq) return;

    if (!editingFaq.question.trim() || !editingFaq.answer.trim()) {
      setStatusMsg({ type: 'error', text: 'Pertanyaan dan jawaban FAQ harus diisi.' });
      return;
    }

    await saveFaq(editingFaq);
    setStatusMsg({ type: 'success', text: 'FAQ berhasil disimpan!' });
    setEditingFaq(null);
  };

  const handleDeleteFaq = async (faq: FaqItem) => {
    if (confirm(`Hapus pertanyaan "${faq.question}"?`)) {
      await deleteFaq(faq.id);
      setStatusMsg({ type: 'success', text: `FAQ berhasil dihapus.` });
    }
  };

  const handleSaveContent = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveSiteSettings(contentForm);
    setStatusMsg({ type: 'success', text: 'Konten dan copywriting website berhasil diperbarui!' });
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--color-text-white)', margin: 0 }}>
            Manajemen FAQ & Konten Website
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            Kelola daftar pertanyaan yang sering diajukan (FAQ) serta narasi dan deskripsi utama website.
          </p>
        </div>

        {/* Sub-tab Switcher */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className={activeSubTab === 'faq' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            onClick={() => setActiveSubTab('faq')}
          >
            <HelpCircle size={15} />
            <span>Kelola FAQ ({faqs.length})</span>
          </button>
          <button
            type="button"
            className={activeSubTab === 'content' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            onClick={() => setActiveSubTab('content')}
          >
            <FileText size={15} />
            <span>Teks & Konten Web</span>
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className={`promo-alert ${statusMsg.type}`} style={{ marginBottom: '16px' }}>
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* SUB-TAB 1: FAQ MANAGER */}
      {activeSubTab === 'faq' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '14px' }}>
            <button
              type="button"
              className="btn-primary anim-hover"
              style={{ padding: '7px 16px', fontSize: '0.84rem' }}
              onClick={handleCreateFaq}
            >
              <Plus size={15} />
              <span>Tambah Pertanyaan FAQ</span>
            </button>
          </div>

          {editingFaq && (
            <form
              onSubmit={handleSaveFaq}
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-primary-border)',
                borderRadius: 'var(--radius-md)',
                padding: '24px',
                marginBottom: '20px'
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
                <h4 style={{ color: 'var(--color-primary)', fontSize: '1.05rem', margin: 0 }}>
                  {editingFaq.id.startsWith('faq-') && !faqs.some((f) => f.id === editingFaq.id)
                    ? 'Tambah FAQ Baru'
                    : 'Edit FAQ'}
                </h4>
                <button
                  type="button"
                  onClick={() => setEditingFaq(null)}
                  style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="admin-form-group">
                <label>Pertanyaan (Question)</label>
                <input
                  type="text"
                  value={editingFaq.question}
                  onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                  placeholder="Contoh: Berapa lama waktu pengerjaan?"
                  required
                />
              </div>

              <div className="admin-form-group" style={{ marginTop: '12px' }}>
                <label>Jawaban (Answer)</label>
                <textarea
                  rows={4}
                  value={editingFaq.answer}
                  onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                  placeholder="Tuliskan jawaban yang ramah dan jelas..."
                  required
                />
              </div>

              <div className="admin-form-group" style={{ marginTop: '12px', maxWidth: '180px' }}>
                <label>Urutan (Sort Order)</label>
                <input
                  type="number"
                  min="1"
                  value={editingFaq.sortOrder}
                  onChange={(e) =>
                    setEditingFaq({ ...editingFaq, sortOrder: parseInt(e.target.value) || 1 })
                  }
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
                <button
                  type="submit"
                  className="btn-primary anim-hover"
                  style={{ padding: '8px 20px', fontSize: '0.86rem' }}
                >
                  Simpan FAQ
                </button>
                <button
                  type="button"
                  className="btn-secondary anim-hover"
                  style={{ padding: '8px 16px', fontSize: '0.86rem' }}
                  onClick={() => setEditingFaq(null)}
                >
                  Batal
                </button>
              </div>
            </form>
          )}

          {/* FAQ Table */}
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>Urutan</th>
                  <th>Pertanyaan</th>
                  <th>Jawaban Singkat</th>
                  <th style={{ width: '100px' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {faqs.map((faq) => (
                  <tr key={faq.id}>
                    <td>#{faq.sortOrder}</td>
                    <td style={{ fontWeight: 600 }}>{faq.question}</td>
                    <td style={{ fontSize: '0.84rem', color: 'var(--color-text-muted)' }}>
                      {faq.answer.length > 90 ? `${faq.answer.slice(0, 90)}...` : faq.answer}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => setEditingFaq({ ...faq })}
                          title="Edit"
                          style={{
                            padding: '6px',
                            background: 'var(--color-surface)',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-text-white)',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer'
                          }}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteFaq(faq)}
                          title="Hapus"
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: CONTENT & COPYWRITING MANAGER */}
      {activeSubTab === 'content' && (
        <form
          onSubmit={handleSaveContent}
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '24px'
          }}
        >
          <div style={{ marginBottom: '18px' }}>
            <h4 style={{ margin: '0 0 4px', fontSize: '1.05rem', color: 'var(--color-text-white)' }}>
              Copywriting & Konten Utama
            </h4>
            <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--color-text-muted)' }}>
              Ubah judul banner, deskripsi landing page, serta teks katalog layanan lainnya.
            </p>
          </div>

          <div className="admin-form-group" style={{ marginBottom: '16px' }}>
            <label>Nama Website / Brand</label>
            <input
              type="text"
              value={contentForm.siteName}
              onChange={(e) => setContentForm({ ...contentForm, siteName: e.target.value })}
              required
            />
          </div>

          <div className="admin-form-group" style={{ marginBottom: '16px' }}>
            <label>Hero Title (Judul Banner Utama)</label>
            <input
              type="text"
              value={contentForm.heroTitle}
              onChange={(e) => setContentForm({ ...contentForm, heroTitle: e.target.value })}
              required
            />
          </div>

          <div className="admin-form-group" style={{ marginBottom: '16px' }}>
            <label>Hero Description (Deskripsi Layanan)</label>
            <textarea
              rows={3}
              value={contentForm.heroDescription}
              onChange={(e) => setContentForm({ ...contentForm, heroDescription: e.target.value })}
              required
            />
          </div>

          <div className="admin-form-group" style={{ marginBottom: '16px' }}>
            <label>Judul Modal Layanan Lainnya (Other)</label>
            <input
              type="text"
              value={contentForm.otherTitle}
              onChange={(e) => setContentForm({ ...contentForm, otherTitle: e.target.value })}
              required
            />
          </div>

          <div className="admin-form-group" style={{ marginBottom: '20px' }}>
            <label>Deskripsi Modal Layanan Lainnya</label>
            <textarea
              rows={2}
              value={contentForm.otherDescription}
              onChange={(e) => setContentForm({ ...contentForm, otherDescription: e.target.value })}
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary anim-hover"
            style={{ padding: '9px 24px', fontSize: '0.88rem' }}
          >
            Simpan Konten Website
          </button>
        </form>
      )}
    </div>
  );
};
