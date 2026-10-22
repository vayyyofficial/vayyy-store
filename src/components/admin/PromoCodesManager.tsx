import React, { useState } from 'react';
import { Plus, Trash2, Edit2, X, Ticket } from 'lucide-react';
import { PromoCode, ServicePackage } from '../../types';
import { savePromoCode, deletePromoCode, getPromoStatus } from '../../services/storage';

interface PromoCodesManagerProps {
  promoCodes: PromoCode[];
  packages: ServicePackage[];
}

export const PromoCodesManager: React.FC<PromoCodesManagerProps> = ({
  promoCodes,
  packages
}) => {
  const [editingCode, setEditingCode] = useState<PromoCode | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const getNowDatetimeLocal = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const getFutureDatetimeLocal = (daysAhead: number) => {
    const target = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);
    const year = target.getFullYear();
    const month = String(target.getMonth() + 1).padStart(2, '0');
    const day = String(target.getDate()).padStart(2, '0');
    const hours = String(target.getHours()).padStart(2, '0');
    const minutes = String(target.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleCreate = () => {
    const newCode: PromoCode = {
      id: `code-${Date.now()}`,
      code: 'PROMOBARU',
      discountType: 'percentage',
      discountValue: 10,
      applicablePackageIds: ['all'],
      validFrom: getNowDatetimeLocal(),
      validUntil: getFutureDatetimeLocal(30),
      isActive: true
    };
    setEditingCode(newCode);
    setStatusMsg(null);
  };

  const handleEdit = (c: PromoCode) => {
    setEditingCode({
      ...c,
      validFrom: c.validFrom ? (c.validFrom.includes('T') ? c.validFrom : `${c.validFrom}T00:00`) : getNowDatetimeLocal(),
      validUntil: c.validUntil ? (c.validUntil.includes('T') ? c.validUntil : `${c.validUntil}T23:59`) : getFutureDatetimeLocal(30)
    });
    setStatusMsg(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCode) return;

    const cleanCode = editingCode.code.trim().toUpperCase();
    if (!cleanCode) {
      setStatusMsg({ type: 'error', text: 'Kode promo tidak boleh kosong.' });
      return;
    }

    if (editingCode.discountValue <= 0) {
      setStatusMsg({ type: 'error', text: 'Nilai diskon harus lebih besar dari 0.' });
      return;
    }

    if (!editingCode.validFrom || !editingCode.validUntil) {
      setStatusMsg({ type: 'error', text: 'Tanggal & waktu mulai serta kedaluwarsa harus diisi.' });
      return;
    }

    if (new Date(editingCode.validUntil) <= new Date(editingCode.validFrom)) {
      setStatusMsg({ type: 'error', text: 'Waktu kedaluwarsa harus setelah waktu mulai.' });
      return;
    }

    if (!editingCode.applicablePackageIds || editingCode.applicablePackageIds.length === 0) {
      setStatusMsg({ type: 'error', text: 'Pilih minimal satu paket atau "Semua Paket".' });
      return;
    }

    await savePromoCode({ ...editingCode, code: cleanCode });
    setStatusMsg({ type: 'success', text: `Kode promo "${cleanCode}" berhasil disimpan!` });
    setEditingCode(null);
  };

  const handleDelete = async (c: PromoCode) => {
    if (confirm(`Hapus kode promo "${c.code}"?`)) {
      await deletePromoCode(c.id);
      setStatusMsg({ type: 'success', text: `Kode promo "${c.code}" dihapus.` });
    }
  };

  const togglePackage = (pkgId: string) => {
    if (!editingCode) return;
    if (pkgId === 'all') {
      setEditingCode({ ...editingCode, applicablePackageIds: ['all'] });
      return;
    }

    let updated = editingCode.applicablePackageIds.filter((id) => id !== 'all');
    if (updated.includes(pkgId)) {
      updated = updated.filter((id) => id !== pkgId);
      if (updated.length === 0) updated = ['all'];
    } else {
      updated.push(pkgId);
    }
    setEditingCode({ ...editingCode, applicablePackageIds: updated });
  };

  const renderStatusBadge = (promo: PromoCode) => {
    const status = getPromoStatus(promo);
    switch (status) {
      case 'active':
        return (
          <span
            style={{
              padding: '3px 8px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.74rem',
              fontWeight: 600,
              background: 'rgba(46, 204, 113, 0.15)',
              color: '#2ecc71',
              border: '1px solid rgba(46, 204, 113, 0.3)'
            }}
          >
            Active
          </span>
        );
      case 'scheduled':
        return (
          <span
            style={{
              padding: '3px 8px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.74rem',
              fontWeight: 600,
              background: 'rgba(52, 152, 219, 0.15)',
              color: '#3498db',
              border: '1px solid rgba(52, 152, 219, 0.3)'
            }}
          >
            Scheduled
          </span>
        );
      case 'expired':
        return (
          <span
            style={{
              padding: '3px 8px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.74rem',
              fontWeight: 600,
              background: 'rgba(230, 126, 34, 0.15)',
              color: '#e67e22',
              border: '1px solid rgba(230, 126, 34, 0.3)'
            }}
          >
            Expired
          </span>
        );
      case 'disabled':
        return (
          <span
            style={{
              padding: '3px 8px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.74rem',
              fontWeight: 600,
              background: 'rgba(231, 76, 60, 0.15)',
              color: '#e74c3c',
              border: '1px solid rgba(231, 76, 60, 0.3)'
            }}
          >
            Disabled
          </span>
        );
    }
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
            Manajemen Kode Promo Berbasis Masa Berlaku
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            Atur kode diskon dengan validasi waktu mulai dan waktu kedaluwarsa otomatis.
          </p>
        </div>
        <button
          type="button"
          className="btn-primary anim-hover"
          style={{ padding: '8px 18px', fontSize: '0.86rem' }}
          onClick={handleCreate}
        >
          <Plus size={16} />
          <span>Buat Kode Promo</span>
        </button>
      </div>

      {statusMsg && (
        <div className={`promo-alert ${statusMsg.type}`} style={{ marginBottom: '16px' }}>
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Editor Modal/Panel */}
      {editingCode && (
        <form
          onSubmit={handleSave}
          style={{
            background: 'var(--color-surface)',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Ticket size={20} color="var(--color-primary)" />
              <h4 style={{ color: 'var(--color-primary)', fontSize: '1.05rem', margin: 0 }}>
                {editingCode.id.startsWith('code-') && !promoCodes.some(c => c.id === editingCode.id) ? 'Buat Kode Promo Baru' : `Edit Kupon: ${editingCode.code}`}
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setEditingCode(null)}
              style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}
              aria-label="Tutup"
            >
              <X size={18} />
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '16px'
            }}
          >
            <div className="admin-form-group">
              <label>Kode Kupon (Huruf Kapital)</label>
              <input
                type="text"
                value={editingCode.code}
                onChange={(e) =>
                  setEditingCode({ ...editingCode, code: e.target.value.toUpperCase().replace(/\s+/g, '') })
                }
                style={{ textTransform: 'uppercase', fontFamily: 'monospace', fontWeight: 700 }}
                placeholder="CONTOH: PROMO2026"
                required
              />
            </div>

            <div className="admin-form-group">
              <label>Jenis Diskon</label>
              <select
                value={editingCode.discountType}
                onChange={(e) =>
                  setEditingCode({
                    ...editingCode,
                    discountType: e.target.value as 'percentage' | 'fixed'
                  })
                }
              >
                <option value="percentage">Persentase (%)</option>
                <option value="fixed">Nominal Tetap (Rp)</option>
              </select>
            </div>

            <div className="admin-form-group">
              <label>
                Besaran Diskon ({editingCode.discountType === 'percentage' ? '%' : 'Rp'})
              </label>
              <input
                type="number"
                min="1"
                max={editingCode.discountType === 'percentage' ? 100 : undefined}
                value={editingCode.discountValue}
                onChange={(e) =>
                  setEditingCode({
                    ...editingCode,
                    discountValue: parseInt(e.target.value) || 0
                  })
                }
                required
              />
            </div>

            <div className="admin-form-group">
              <label>Waktu Mulai Promo (Server Time)</label>
              <input
                type="datetime-local"
                value={editingCode.validFrom}
                onChange={(e) => setEditingCode({ ...editingCode, validFrom: e.target.value })}
                required
              />
            </div>

            <div className="admin-form-group">
              <label>Waktu Kedaluwarsa Promo (Server Time)</label>
              <input
                type="datetime-local"
                value={editingCode.validUntil}
                onChange={(e) => setEditingCode({ ...editingCode, validUntil: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Applicable Packages Selection */}
          <div style={{ marginTop: '16px', marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', color: 'var(--color-text-white)' }}>
              Paket Yang Memenuhi Syarat:
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <button
                type="button"
                onClick={() => togglePackage('all')}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: editingCode.applicablePackageIds.includes('all') ? 'var(--color-primary)' : 'var(--color-border)',
                  background: editingCode.applicablePackageIds.includes('all') ? 'var(--color-primary-glow)' : 'var(--color-surface)',
                  color: editingCode.applicablePackageIds.includes('all') ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  fontWeight: editingCode.applicablePackageIds.includes('all') ? 700 : 500
                }}
              >
                Semua Paket
              </button>
              {packages.map((pkg) => {
                const isSelected = editingCode.applicablePackageIds.includes(pkg.id);
                return (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => togglePackage(pkg.id)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-pill)',
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-border)',
                      background: isSelected ? 'var(--color-primary-glow)' : 'var(--color-surface)',
                      color: isSelected ? 'var(--color-primary)' : 'var(--color-text-muted)',
                      fontWeight: isSelected ? 700 : 500
                    }}
                  >
                    {pkg.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={editingCode.isActive}
                onChange={(e) =>
                  setEditingCode({ ...editingCode, isActive: e.target.checked })
                }
              />
              <span style={{ fontSize: '0.9rem', color: 'var(--color-text-white)' }}>
                Status Administratif Aktif (Jika dicentang, promo berjalan sesuai jadwal waktu mulai & selesai)
              </span>
            </label>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="submit"
              className="btn-primary anim-hover"
              style={{ padding: '9px 24px', fontSize: '0.88rem' }}
            >
              Simpan Kode Promo
            </button>
            <button
              type="button"
              className="btn-secondary anim-hover"
              style={{ padding: '9px 18px', fontSize: '0.88rem' }}
              onClick={() => setEditingCode(null)}
            >
              Batal
            </button>
          </div>
        </form>
      )}

      {/* Codes Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Kode Promo</th>
              <th>Diskon</th>
              <th>Paket Syarat</th>
              <th>Waktu Mulai</th>
              <th>Kedaluwarsa</th>
              <th>Status Promo</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {promoCodes.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: '#777' }}>
                  Belum ada kode promo terdaftar. Klik "Buat Kode Promo" di atas.
                </td>
              </tr>
            ) : (
              promoCodes.map((c) => {
                const formatDateTime = (val: string) => {
                  if (!val) return '-';
                  try {
                    const d = new Date(val);
                    return d.toLocaleString('id-ID', {
                      dateStyle: 'short',
                      timeStyle: 'short'
                    });
                  } catch {
                    return val;
                  }
                };

                const applicableDesc = c.applicablePackageIds.includes('all')
                  ? 'Semua Paket'
                  : c.applicablePackageIds
                      .map((id) => packages.find((p) => p.id === id)?.name || id)
                      .join(', ');

                return (
                  <tr key={c.id}>
                    <td>
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          color: 'var(--color-primary)',
                          fontSize: '0.94rem'
                        }}
                      >
                        {c.code}
                      </span>
                    </td>
                    <td>
                      {c.discountType === 'percentage'
                        ? `${c.discountValue}%`
                        : `Rp${c.discountValue.toLocaleString('id-ID')}`}
                    </td>
                    <td style={{ fontSize: '0.84rem', color: 'var(--color-text-muted)' }}>
                      {applicableDesc}
                    </td>
                    <td style={{ fontSize: '0.84rem' }}>
                      {formatDateTime(c.validFrom)}
                    </td>
                    <td style={{ fontSize: '0.84rem' }}>
                      {formatDateTime(c.validUntil)}
                    </td>
                    <td>{renderStatusBadge(c)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => handleEdit(c)}
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
                          onClick={() => handleDelete(c)}
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
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
