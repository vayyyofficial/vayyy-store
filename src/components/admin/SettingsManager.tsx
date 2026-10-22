import React, { useState } from 'react';
import { Save, Plus, Trash2, Edit2, Lock, KeyRound, HelpCircle, Globe } from 'lucide-react';
import { SiteSettings, FaqItem } from '../../types';
import { saveSiteSettings, saveFaq, deleteFaq, updateAdminPassword } from '../../services/storage';
import { WhatsAppIcon, DiscordIcon } from '../BrandIcons';

interface SettingsManagerProps {
  settings: SiteSettings;
  faqs: FaqItem[];
}

export const SettingsManager: React.FC<SettingsManagerProps> = ({
  settings,
  faqs
}) => {
  const [formSettings, setFormSettings] = useState<SiteSettings>({ ...settings });
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);

  // Password update states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveSiteSettings(formSettings);
    setStatusMsg({ type: 'success', text: 'Pengaturan website berhasil disimpan!' });
  };

  const handleCreateFaq = () => {
    const newFaq: FaqItem = {
      id: `faq-${Date.now()}`,
      question: 'Pertanyaan baru?',
      answer: 'Jawaban atas pertanyaan...',
      sortOrder: faqs.length + 1
    };
    setEditingFaq(newFaq);
  };

  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaq) return;
    await saveFaq(editingFaq);
    setEditingFaq(null);
    setStatusMsg({ type: 'success', text: 'FAQ berhasil diperbarui!' });
  };

  const handleDeleteFaq = async (faq: FaqItem) => {
    if (confirm(`Hapus pertanyaan "${faq.question}"?`)) {
      await deleteFaq(faq.id);
      setStatusMsg({ type: 'success', text: 'FAQ berhasil dihapus.' });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Konfirmasi password baru tidak cocok.' });
      return;
    }

    const res = await updateAdminPassword(oldPassword, newPassword);
    if (res.success) {
      setPasswordMsg({ type: 'success', text: res.message });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPasswordMsg({ type: 'error', text: res.message });
    }
  };

  return (
    <div>
      <h3 style={{ fontSize: '1.2rem', color: 'var(--color-text-white)', marginBottom: '20px' }}>
        Pengaturan Website & FAQ
      </h3>

      {statusMsg && (
        <div className={`promo-alert ${statusMsg.type}`} style={{ marginBottom: '16px' }}>
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* General Site Config Form */}
      <form
        onSubmit={handleSaveSettings}
        style={{
          background: 'var(--color-surface-inner)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '24px',
          marginBottom: '28px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Globe size={18} color="var(--color-primary)" />
          <h4 style={{ color: 'var(--color-text-white)', fontSize: '1.05rem' }}>
            Informasi Umum & Kontak Terpusat
          </h4>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px'
          }}
        >
          <div className="admin-form-group">
            <label>Nama Website</label>
            <input
              type="text"
              value={formSettings.siteName}
              onChange={(e) => setFormSettings({ ...formSettings, siteName: e.target.value })}
              required
            />
          </div>

          <div className="admin-form-group">
            <label>Headline Utama (Hero Title)</label>
            <input
              type="text"
              value={formSettings.heroTitle}
              onChange={(e) => setFormSettings({ ...formSettings, heroTitle: e.target.value })}
              required
            />
          </div>

          <div className="admin-form-group">
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <WhatsAppIcon size={15} color="var(--icon-whatsapp)" />
              <span>Nomor WhatsApp Toko (Awali 62 tanpa +)</span>
            </label>
            <input
              type="text"
              value={formSettings.whatsappNumber}
              onChange={(e) =>
                setFormSettings({ ...formSettings, whatsappNumber: e.target.value.replace(/\D/g, '') })
              }
              required
            />
          </div>

          <div className="admin-form-group">
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <DiscordIcon size={15} color="var(--icon-discord)" />
              <span>Tautan Discord Komunitas</span>
            </label>
            <input
              type="url"
              value={formSettings.discordUrl}
              onChange={(e) => setFormSettings({ ...formSettings, discordUrl: e.target.value })}
              required
            />
          </div>

          <div className="admin-form-group">
            <label>URL Tujuan Vayyy.Dev (Teks Display: vayyy.dev)</label>
            <input
              type="url"
              value={formSettings.vayyyDevUrl}
              onChange={(e) => setFormSettings({ ...formSettings, vayyyDevUrl: e.target.value })}
              placeholder="https://vayyy.vercel.app"
              required
            />
          </div>
        </div>

        <div className="admin-form-group">
          <label>Deskripsi Hero</label>
          <textarea
            rows={2}
            value={formSettings.heroDescription}
            onChange={(e) =>
              setFormSettings({ ...formSettings, heroDescription: e.target.value })
            }
            required
          />
        </div>

        <button
          type="submit"
          className="btn-primary anim-hover"
          style={{ padding: '9px 24px', fontSize: '0.88rem' }}
        >
          <Save size={15} />
          <span>Simpan Konfigurasi Umum</span>
        </button>
      </form>

      {/* FAQ Management */}
      <div
        style={{
          background: 'var(--color-surface-inner)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '24px',
          marginBottom: '28px'
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HelpCircle size={18} color="var(--color-primary)" />
            <h4 style={{ color: 'var(--color-text-white)', fontSize: '1.05rem' }}>
              Daftar FAQ (Pertanyaan Umum)
            </h4>
          </div>
          <button
            type="button"
            className="btn-secondary anim-hover"
            style={{ padding: '6px 14px', fontSize: '0.82rem' }}
            onClick={handleCreateFaq}
          >
            <Plus size={14} />
            <span>Tambah FAQ</span>
          </button>
        </div>

        {editingFaq && (
          <form
            onSubmit={handleSaveFaq}
            style={{
              padding: '16px',
              background: 'var(--color-surface-hover)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-primary-border)',
              marginBottom: '16px'
            }}
          >
            <div className="admin-form-group">
              <label>Pertanyaan</label>
              <input
                type="text"
                value={editingFaq.question}
                onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                required
              />
            </div>
            <div className="admin-form-group">
              <label>Jawaban</label>
              <textarea
                rows={3}
                value={editingFaq.answer}
                onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                required
              />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="submit"
                className="btn-primary anim-hover"
                style={{ padding: '6px 16px', fontSize: '0.82rem' }}
              >
                Simpan
              </button>
              <button
                type="button"
                className="btn-secondary anim-hover"
                style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                onClick={() => setEditingFaq(null)}
              >
                Batal
              </button>
            </div>
          </form>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {faqs.map((f) => (
            <div
              key={f.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: 'var(--color-surface-hover)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <div>
                <strong style={{ color: 'var(--color-text)', fontSize: '0.92rem' }}>
                  {f.question}
                </strong>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem', marginTop: '2px' }}>
                  {f.answer.substring(0, 90)}...
                </p>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={() => setEditingFaq(f)}
                  style={{
                    padding: '6px',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer'
                  }}
                >
                  <Edit2 size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteFaq(f)}
                  style={{
                    padding: '6px',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    color: '#e74c3c',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer'
                  }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Password Security Form */}
      <form
        onSubmit={handleChangePassword}
        style={{
          background: 'var(--color-surface-inner)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '24px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <KeyRound size={18} color="var(--color-primary)" />
          <h4 style={{ color: 'var(--color-text-white)', fontSize: '1.05rem' }}>
            Keamanan & Ganti Password Admin
          </h4>
        </div>

        {passwordMsg && (
          <div className={`promo-alert ${passwordMsg.type}`} style={{ marginBottom: '14px' }}>
            <span>{passwordMsg.text}</span>
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px'
          }}
        >
          <div className="admin-form-group">
            <label>Password Saat Ini</label>
            <input
              type="password"
              placeholder="Masukkan password lama"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
          </div>

          <div className="admin-form-group">
            <label>Password Baru (Min 6 Karakter)</label>
            <input
              type="password"
              placeholder="Masukkan password baru"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="admin-form-group">
            <label>Ulangi Password Baru</label>
            <input
              type="password"
              placeholder="Konfirmasi password baru"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn-secondary anim-hover"
          style={{ padding: '9px 24px', fontSize: '0.88rem' }}
        >
          <Lock size={15} />
          <span>Perbarui Password Admin</span>
        </button>
      </form>
    </div>
  );
};
