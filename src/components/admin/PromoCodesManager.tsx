import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  X,
  Ticket,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  MinusCircle,
  PlusCircle,
  Bell
} from 'lucide-react';
import { PromoCode, ServicePackage } from '../../types';
import {
  savePromoCode,
  deletePromoCode,
  getPromoStatus,
  getPromoQuotaInfo,
  confirmUseCoupon,
  restoreCoupon
} from '../../services/storage';

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
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Top KPI calculations
  const totalCodes = promoCodes.length;
  const activeCodes = promoCodes.filter((c) => c.isActive).length;
  const totalUsedCoupons = promoCodes.reduce((acc, c) => acc + (c.usedCount || 0), 0);
  const lowQuotaPromos = promoCodes.filter((c) => {
    if (!c.isActive) return false;
    const q = getPromoQuotaInfo(c);
    return q.isLowQuota;
  });
  const exhaustedPromos = promoCodes.filter((c) => {
    if (!c.isActive) return false;
    const q = getPromoQuotaInfo(c);
    return q.isExhausted;
  });

  const handleCreate = () => {
    const newCode: PromoCode = {
      id: crypto.randomUUID(),
      code: 'PROMOBARU',
      name: 'Promo Diskon Website',
      discountType: 'percentage',
      discountValue: 10,
      applicablePackageIds: ['all'],
      maxUses: 10,
      usedCount: 0,
      warningThreshold: 3,
      showPublicAnnouncement: true,
      validFrom: null,
      validUntil: null,
      isActive: true
    };
    setEditingCode(newCode);
    setStatusMsg(null);
  };

  const handleEdit = (c: PromoCode) => {
    setEditingCode({
      ...c,
      name: c.name || c.code,
      maxUses: Number(c.maxUses ?? 10),
      usedCount: Number(c.usedCount ?? 0),
      warningThreshold: Number(c.warningThreshold ?? 3),
      showPublicAnnouncement: c.showPublicAnnouncement !== false,
      validFrom: c.validFrom || null,
      validUntil: c.validUntil || null
    });
    setStatusMsg(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCode) return;

    const cleanCode = editingCode.code.trim().toUpperCase().replace(/\s+/g, '');
    if (!cleanCode) {
      setStatusMsg({ type: 'error', text: 'Kode promo tidak boleh kosong.' });
      return;
    }

    if (editingCode.discountValue <= 0) {
      setStatusMsg({ type: 'error', text: 'Nilai diskon harus lebih besar dari 0.' });
      return;
    }

    if (editingCode.maxUses < 0) {
      setStatusMsg({ type: 'error', text: 'Kuota kupon awal tidak boleh bernilai negatif.' });
      return;
    }

    if (editingCode.warningThreshold && editingCode.warningThreshold < 1) {
      setStatusMsg({ type: 'error', text: 'Batas peringatan kuota minimal 1 kupon.' });
      return;
    }

    // Optional date range validation
    if (editingCode.validFrom && editingCode.validUntil) {
      if (new Date(editingCode.validUntil) <= new Date(editingCode.validFrom)) {
        setStatusMsg({ type: 'error', text: 'Waktu kedaluwarsa harus setelah waktu mulai.' });
        return;
      }
    }

    if (!editingCode.applicablePackageIds || editingCode.applicablePackageIds.length === 0) {
      setStatusMsg({ type: 'error', text: 'Pilih minimal satu paket atau "Semua Paket".' });
      return;
    }

    try {
      await savePromoCode({
        ...editingCode,
        code: cleanCode,
        name: editingCode.name ? editingCode.name.trim() : cleanCode
      });
      setStatusMsg({ type: 'success', text: `Promo "${cleanCode}" berhasil disimpan secara permanen!` });
      setEditingCode(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setStatusMsg({ type: 'error', text: `Gagal menyimpan promo: ${msg}` });
    }
  };

  const handleDelete = async (c: PromoCode) => {
    if (confirm(`Yakin ingin menghapus promo "${c.name || c.code}" (${c.code})?`)) {
      try {
        await deletePromoCode(c.id);
        setStatusMsg({ type: 'success', text: `Promo "${c.code}" berhasil dihapus.` });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setStatusMsg({ type: 'error', text: `Gagal menghapus promo: ${msg}` });
      }
    }
  };

  const handleConfirmUse = async (c: PromoCode) => {
    const q = getPromoQuotaInfo(c);
    if (!q.isUnlimited && q.remainingQuota <= 0) {
      setStatusMsg({ type: 'error', text: `Kuota promo "${c.code}" sudah habis.` });
      return;
    }

    const nextRemaining = q.isUnlimited ? 'Tanpa Batas' : `${q.remainingQuota - 1} kupon`;
    const ok = window.confirm(
      `Konfirmasi transaksi untuk kupon "${c.code}"?\n\n` +
      `Satu kupon akan dicatat sebagai transaksi valid.\n` +
      `Sisa kuota berikutnya: ${nextRemaining}.`
    );
    if (!ok) return;

    setProcessingId(c.id);
    try {
      const res = await confirmUseCoupon(c.id, 1);
      if (res.success) {
        setStatusMsg({ type: 'success', text: res.message });
      } else {
        setStatusMsg({ type: 'error', text: res.message });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setStatusMsg({ type: 'error', text: `Gagal mengonfirmasi kupon: ${msg}` });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRestore = async (c: PromoCode) => {
    if (c.usedCount <= 0) {
      setStatusMsg({ type: 'error', text: `Tidak ada kupon terpakai yang dapat dikembalikan untuk "${c.code}".` });
      return;
    }

    const q = getPromoQuotaInfo(c);
    const nextRemaining = q.isUnlimited ? 'Tanpa Batas' : `${q.remainingQuota + 1} kupon`;
    const ok = window.confirm(
      `Kembalikan 1 kupon untuk promo "${c.code}"?\n\n` +
      `Tindakan ini digunakan jika transaksi sebelumnya dibatalkan atau direfund.\n` +
      `Sisa kuota berikutnya: ${nextRemaining}.`
    );
    if (!ok) return;

    setProcessingId(c.id);
    try {
      const res = await restoreCoupon(c.id, 1);
      if (res.success) {
        setStatusMsg({ type: 'success', text: res.message });
      } else {
        setStatusMsg({ type: 'error', text: res.message });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setStatusMsg({ type: 'error', text: `Gagal mengembalikan kupon: ${msg}` });
    } finally {
      setProcessingId(null);
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
            Aktif
          </span>
        );
      case 'exhausted':
        return (
          <span
            style={{
              padding: '3px 8px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.74rem',
              fontWeight: 600,
              background: 'rgba(239, 68, 68, 0.18)',
              color: '#ef4444',
              border: '1px solid rgba(239, 68, 68, 0.4)'
            }}
          >
            Kuota Habis
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
            Terjadwal
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
            Kedaluwarsa
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
              background: 'rgba(150, 150, 150, 0.15)',
              color: '#aaa',
              border: '1px solid rgba(150, 150, 150, 0.3)'
            }}
          >
            Nonaktif
          </span>
        );
    }
  };

  return (
    <div>
      {/* Top Header */}
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
            Manajemen Kuota Promo & Kupon Diskon
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            Kelola kuota klaim kupon manual untuk transaksi pelanggan, diskon, dan pengumuman ketersediaan kuota publik.
          </p>
        </div>
        <button
          type="button"
          className="btn-primary anim-hover"
          style={{ padding: '8px 18px', fontSize: '0.86rem' }}
          onClick={handleCreate}
        >
          <Plus size={16} />
          <span>Buat Promo Baru</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="admin-stats-grid" style={{ marginBottom: '22px' }}>
        <div className="admin-stat-card">
          <div className="stat-icon-wrap" style={{ color: 'var(--color-primary)', background: 'var(--color-primary-glow)' }}>
            <Ticket size={20} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{totalCodes}</div>
            <div className="stat-label">Total Promo Terdaftar</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon-wrap" style={{ color: '#10B981', background: 'rgba(16, 185, 129, 0.12)' }}>
            <CheckCircle2 size={20} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{activeCodes}</div>
            <div className="stat-label">Promo Status Aktif</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon-wrap" style={{ color: '#3B82F6', background: 'rgba(59, 130, 246, 0.12)' }}>
            <MinusCircle size={20} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{totalUsedCoupons} Kupon</div>
            <div className="stat-label">Total Kuota Terpakai (Transaksi)</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div
            className="stat-icon-wrap"
            style={{
              color: exhaustedPromos.length > 0 ? '#EF4444' : lowQuotaPromos.length > 0 ? '#F5C400' : '#10B981',
              background: exhaustedPromos.length > 0 ? 'rgba(239, 68, 68, 0.12)' : lowQuotaPromos.length > 0 ? 'rgba(245, 196, 0, 0.12)' : 'rgba(16, 185, 129, 0.12)'
            }}
          >
            {exhaustedPromos.length > 0 ? <AlertCircle size={20} /> : lowQuotaPromos.length > 0 ? <AlertTriangle size={20} /> : <Bell size={20} />}
          </div>
          <div className="stat-info">
            <div className="stat-value">
              {exhaustedPromos.length > 0 ? `${exhaustedPromos.length} Habis` : lowQuotaPromos.length > 0 ? `${lowQuotaPromos.length} Menipis` : 'Normal'}
            </div>
            <div className="stat-label">Peringatan Kuota</div>
          </div>
        </div>
      </div>

      {/* Admin Low Quota & Exhausted Warnings */}
      {exhaustedPromos.map((promo) => (
        <div
          key={`exhausted-${promo.id}`}
          className="promo-alert error"
          style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}
        >
          <AlertCircle size={18} />
          <span>
            <strong>Kuota Promo Habis:</strong> Promo <code>{promo.code}</code> ({promo.name || promo.code}) telah mencapai batas maksimal ({promo.maxUses} kupon). Pengunjung tidak dapat mengklaim kupon ini kecuali kuota ditambah atau dikembalikan.
          </span>
        </div>
      ))}

      {lowQuotaPromos.map((promo) => {
        const q = getPromoQuotaInfo(promo);
        return (
          <div
            key={`low-${promo.id}`}
            className="promo-alert"
            style={{
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'rgba(245, 196, 0, 0.12)',
              border: '1px solid rgba(245, 196, 0, 0.35)',
              color: '#F5C400'
            }}
          >
            <AlertTriangle size={18} />
            <span>
              <strong>Peringatan Kuota Menipis:</strong> Promo <code>{promo.code}</code> ({promo.name || promo.code}) hampir habis — <strong>tersisa {q.remainingQuota} kupon</strong> (Batas peringatan: {q.warningThreshold} kupon).
            </span>
          </div>
        );
      })}

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
                {editingCode.id && !promoCodes.some((c) => c.id === editingCode.id)
                  ? 'Buat Promo Kuota Baru'
                  : `Edit Promo: ${editingCode.code}`}
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
              <label>Nama Promo</label>
              <input
                type="text"
                value={editingCode.name || ''}
                onChange={(e) => setEditingCode({ ...editingCode, name: e.target.value })}
                placeholder="CONTOH: Promo Website Launching"
                required
              />
            </div>

            <div className="admin-form-group">
              <label>Kode Kupon (Huruf Kapital)</label>
              <input
                type="text"
                value={editingCode.code}
                onChange={(e) =>
                  setEditingCode({
                    ...editingCode,
                    code: e.target.value.toUpperCase().replace(/\s+/g, '')
                  })
                }
                style={{ textTransform: 'uppercase', fontFamily: 'monospace', fontWeight: 700 }}
                placeholder="CONTOH: WEBSITE10"
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
              <label>Kuota Awal Kupon (0 = Tanpa Batas)</label>
              <input
                type="number"
                min="0"
                value={editingCode.maxUses}
                onChange={(e) =>
                  setEditingCode({
                    ...editingCode,
                    maxUses: Math.max(0, parseInt(e.target.value) || 0)
                  })
                }
                placeholder="10"
                required
              />
            </div>

            <div className="admin-form-group">
              <label>Batas Peringatan Kuota Menipis</label>
              <input
                type="number"
                min="1"
                value={editingCode.warningThreshold ?? 3}
                onChange={(e) =>
                  setEditingCode({
                    ...editingCode,
                    warningThreshold: Math.max(1, parseInt(e.target.value) || 3)
                  })
                }
                placeholder="3"
                required
              />
            </div>

            <div className="admin-form-group">
              <label>Waktu Mulai Promo (Opsional)</label>
              <input
                type="datetime-local"
                value={editingCode.validFrom || ''}
                onChange={(e) =>
                  setEditingCode({
                    ...editingCode,
                    validFrom: e.target.value || null
                  })
                }
              />
            </div>

            <div className="admin-form-group">
              <label>Waktu Kedaluwarsa Promo (Opsional)</label>
              <input
                type="datetime-local"
                value={editingCode.validUntil || ''}
                onChange={(e) =>
                  setEditingCode({
                    ...editingCode,
                    validUntil: e.target.value || null
                  })
                }
              />
            </div>
          </div>

          {/* Applicable Packages Selection */}
          <div style={{ marginTop: '16px', marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.85rem',
                fontWeight: 600,
                marginBottom: '8px',
                color: 'var(--color-text-white)'
              }}
            >
              Paket Layanan Yang Memenuhi Syarat:
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
                  borderColor: editingCode.applicablePackageIds.includes('all')
                    ? 'var(--color-primary)'
                    : 'var(--color-border)',
                  background: editingCode.applicablePackageIds.includes('all')
                    ? 'var(--color-primary-glow)'
                    : 'var(--color-surface)',
                  color: editingCode.applicablePackageIds.includes('all')
                    ? 'var(--color-primary)'
                    : 'var(--color-text-muted)',
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

          {/* Options Toggles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={editingCode.showPublicAnnouncement !== false}
                onChange={(e) =>
                  setEditingCode({ ...editingCode, showPublicAnnouncement: e.target.checked })
                }
              />
              <span style={{ fontSize: '0.9rem', color: 'var(--color-text-white)' }}>
                Tampilkan Banner Pengumuman Kuota di Halaman Publik (Pricelist) jika promo aktif & kuota masih ada
              </span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={editingCode.isActive}
                onChange={(e) =>
                  setEditingCode({ ...editingCode, isActive: e.target.checked })
                }
              />
              <span style={{ fontSize: '0.9rem', color: 'var(--color-text-white)' }}>
                Status Administratif Aktif (Kupon dapat divalidasi oleh pengunjung dan admin)
              </span>
            </label>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="submit"
              className="btn-primary anim-hover"
              style={{ padding: '9px 24px', fontSize: '0.88rem' }}
            >
              Simpan Promo
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

      {/* Promo Codes & Quota Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nama & Kode Promo</th>
              <th>Diskon</th>
              <th>Kuota Kupon (Awal / Terpakai / Sisa)</th>
              <th>Paket Berlaku</th>
              <th>Pengumuman Publik</th>
              <th>Status Promo</th>
              <th style={{ minWidth: '180px' }}>Aksi Kelola Kuota & Data</th>
            </tr>
          </thead>
          <tbody>
            {promoCodes.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: '#777' }}>
                  Belum ada promo terdaftar. Klik "Buat Promo Baru" di atas untuk menambahkan kuota promo.
                </td>
              </tr>
            ) : (
              promoCodes.map((c) => {
                const q = getPromoQuotaInfo(c);

                const applicableDesc = c.applicablePackageIds.includes('all')
                  ? 'Semua Paket'
                  : c.applicablePackageIds
                      .map((id) => packages.find((p) => p.id === id)?.name || id)
                      .join(', ');

                return (
                  <tr key={c.id}>
                    <td>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--color-text-white)', fontSize: '0.92rem' }}>
                          {c.name || c.code}
                        </div>
                        <div
                          style={{
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            color: 'var(--color-primary)',
                            fontSize: '0.88rem',
                            marginTop: '2px'
                          }}
                        >
                          {c.code}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>
                        {c.discountType === 'percentage'
                          ? `${c.discountValue}%`
                          : `Rp${c.discountValue.toLocaleString('id-ID')}`}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.86rem' }}>
                        <div>
                          Awal: <strong>{q.isUnlimited ? '∞' : q.maxUses}</strong> | Terpakai:{' '}
                          <strong>{q.usedCount}</strong>
                        </div>
                        <div style={{ marginTop: '3px' }}>
                          Sisa:{' '}
                          <strong
                            style={{
                              color: q.isExhausted ? '#ef4444' : q.isLowQuota ? '#f5c400' : '#10b981',
                              fontSize: '0.92rem'
                            }}
                          >
                            {q.isUnlimited ? 'Tanpa Batas' : `${q.remainingQuota} kupon`}
                          </strong>
                          {q.isLowQuota && (
                            <span
                              style={{
                                marginLeft: '6px',
                                fontSize: '0.72rem',
                                color: '#f5c400',
                                background: 'rgba(245, 196, 0, 0.12)',
                                padding: '2px 6px',
                                borderRadius: '4px'
                              }}
                            >
                              Menipis
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                      {applicableDesc}
                    </td>
                    <td>
                      {c.showPublicAnnouncement !== false ? (
                        <span style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 600 }}>
                          ✓ Ditampilkan
                        </span>
                      ) : (
                        <span style={{ color: '#888', fontSize: '0.8rem' }}>
                          ✕ Disembunyikan
                        </span>
                      )}
                    </td>
                    <td>{renderStatusBadge(c)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                        {/* Minus Coupon / Confirm Transaction */}
                        <button
                          type="button"
                          onClick={() => handleConfirmUse(c)}
                          disabled={processingId === c.id || (!q.isUnlimited && q.remainingQuota <= 0)}
                          title="Konfirmasi 1 Kupon Transaksi (-1 Sisa)"
                          style={{
                            padding: '5px 8px',
                            background: (!q.isUnlimited && q.remainingQuota <= 0) ? 'rgba(255,255,255,0.04)' : 'rgba(16, 185, 129, 0.15)',
                            border: '1px solid',
                            borderColor: (!q.isUnlimited && q.remainingQuota <= 0) ? '#444' : 'rgba(16, 185, 129, 0.4)',
                            color: (!q.isUnlimited && q.remainingQuota <= 0) ? '#555' : '#10b981',
                            borderRadius: 'var(--radius-sm)',
                            cursor: (!q.isUnlimited && q.remainingQuota <= 0) ? 'not-allowed' : 'pointer',
                            fontSize: '0.76rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontWeight: 600
                          }}
                        >
                          <MinusCircle size={13} />
                          <span>-1 Kupon</span>
                        </button>

                        {/* Plus Coupon / Restore Transaction */}
                        <button
                          type="button"
                          onClick={() => handleRestore(c)}
                          disabled={processingId === c.id || c.usedCount <= 0}
                          title="Kembalikan 1 Kupon (+1 Sisa)"
                          style={{
                            padding: '5px 8px',
                            background: c.usedCount <= 0 ? 'rgba(255,255,255,0.04)' : 'rgba(59, 130, 246, 0.15)',
                            border: '1px solid',
                            borderColor: c.usedCount <= 0 ? '#444' : 'rgba(59, 130, 246, 0.4)',
                            color: c.usedCount <= 0 ? '#555' : '#3b82f6',
                            borderRadius: 'var(--radius-sm)',
                            cursor: c.usedCount <= 0 ? 'not-allowed' : 'pointer',
                            fontSize: '0.76rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontWeight: 600
                          }}
                        >
                          <PlusCircle size={13} />
                          <span>+1 Kupon</span>
                        </button>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => handleEdit(c)}
                          title="Edit Informasi Promo"
                          style={{
                            padding: '5px 8px',
                            background: 'var(--color-surface)',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-text-white)',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            fontSize: '0.76rem'
                          }}
                        >
                          <Edit2 size={13} />
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleDelete(c)}
                          title="Hapus Promo"
                          style={{
                            padding: '5px 8px',
                            background: 'var(--color-surface)',
                            border: '1px solid var(--color-border)',
                            color: '#e74c3c',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            fontSize: '0.76rem'
                          }}
                        >
                          <Trash2 size={13} />
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
