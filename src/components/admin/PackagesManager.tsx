import React, { useState } from 'react';
import { Plus, Trash2, Edit2, ArrowUp, ArrowDown, Check, X, Info, Shield, Star } from 'lucide-react';
import { ServicePackage, PackageBenefitItem, BenefitType } from '../../types';
import { saveServicePackage, deleteServicePackage } from '../../services/storage';

interface PackagesManagerProps {
  packages: ServicePackage[];
}

export const PackagesManager: React.FC<PackagesManagerProps> = ({ packages }) => {
  const [editingPkg, setEditingPkg] = useState<ServicePackage | null>(null);
  const [newBenefitText, setNewBenefitText] = useState('');
  const [newBenefitType, setNewBenefitType] = useState<BenefitType>('included');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const normalizeBenefits = (benefits: any[]): PackageBenefitItem[] => {
    if (!Array.isArray(benefits)) return [];
    return benefits.map((b) => {
      if (typeof b === 'string') {
        return { text: b, type: 'included' as BenefitType };
      }
      return {
        text: b.text || '',
        type: (b.type === 'excluded' || b.type === 'info' ? b.type : 'included') as BenefitType
      };
    });
  };

  const handleEdit = (pkg: ServicePackage) => {
    setEditingPkg({ ...pkg, benefits: normalizeBenefits(pkg.benefits) });
    setStatusMsg(null);
  };

  const handleCreateNew = () => {
    const newId = `package-${Date.now()}`;
    const newPkg: ServicePackage = {
      id: newId,
      name: 'Paket Baru',
      subtitle: 'Kategori Layanan',
      price: 150000,
      description: 'Deskripsi paket layanan website.',
      warranty: '7 hari',
      benefits: [
        { text: 'Fitur utama', type: 'included' },
        { text: 'Tampilan responsif', type: 'included' },
        { text: 'Domain gratis tidak termasuk', type: 'excluded' }
      ],
      isActive: true,
      sortOrder: packages.length + 1
    };
    setEditingPkg(newPkg);
    setStatusMsg(null);
  };

  const handleAddBenefit = () => {
    if (!newBenefitText.trim() || !editingPkg) return;
    setEditingPkg({
      ...editingPkg,
      benefits: [
        ...editingPkg.benefits,
        { text: newBenefitText.trim(), type: newBenefitType }
      ]
    });
    setNewBenefitText('');
  };

  const handleRemoveBenefit = (index: number) => {
    if (!editingPkg) return;
    const nextBenefits = editingPkg.benefits.filter((_, idx) => idx !== index);
    setEditingPkg({ ...editingPkg, benefits: nextBenefits });
  };

  const handleMoveBenefit = (index: number, direction: 'up' | 'down') => {
    if (!editingPkg) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= editingPkg.benefits.length) return;

    const list = [...editingPkg.benefits];
    const [moved] = list.splice(index, 1);
    list.splice(targetIdx, 0, moved);

    setEditingPkg({ ...editingPkg, benefits: list });
  };

  const handleChangeBenefitType = (index: number, type: BenefitType) => {
    if (!editingPkg) return;
    const list = [...editingPkg.benefits];
    list[index] = { ...list[index], type };
    setEditingPkg({ ...editingPkg, benefits: list });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPkg) return;

    if (editingPkg.price < 0) {
      setStatusMsg({ type: 'error', text: 'Harga tidak boleh bernilai negatif.' });
      return;
    }

    if (editingPkg.benefits.length === 0) {
      setStatusMsg({ type: 'error', text: 'Paket harus memiliki minimal satu benefit/ketentuan.' });
      return;
    }

    await saveServicePackage(editingPkg);
    setStatusMsg({ type: 'success', text: `Paket ${editingPkg.name} berhasil disimpan!` });
    setEditingPkg(null);
  };

  const handleDelete = async (pkg: ServicePackage) => {
    if (confirm(`Yakin ingin menghapus paket "${pkg.name}"?`)) {
      await deleteServicePackage(pkg.id);
      setStatusMsg({ type: 'success', text: `Paket ${pkg.name} berhasil dihapus.` });
    }
  };

  const handleToggleActive = async (pkg: ServicePackage) => {
    const updated = { ...pkg, isActive: !pkg.isActive };
    await saveServicePackage(updated);
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
        <div>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--color-text-white)', margin: 0 }}>
            Manajemen Paket Layanan Website
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            Kelola harga, deskripsi, garansi, serta klasifikasi benefit (Termasuk, Tidak Termasuk, Info).
          </p>
        </div>
        <button
          type="button"
          className="btn-primary anim-hover"
          style={{ padding: '8px 16px', fontSize: '0.86rem' }}
          onClick={handleCreateNew}
        >
          <Plus size={16} />
          <span>Tambah Paket</span>
        </button>
      </div>

      {statusMsg && (
        <div
          className={`promo-alert ${statusMsg.type}`}
          style={{ marginBottom: '16px' }}
        >
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Editor Modal/Form */}
      {editingPkg && (
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
            <h4 style={{ color: 'var(--color-primary)', fontSize: '1.05rem', margin: 0 }}>
              Edit Paket: {editingPkg.name}
            </h4>
            <button
              type="button"
              onClick={() => setEditingPkg(null)}
              style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}
              aria-label="Tutup"
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
              <label>Nama Paket</label>
              <input
                type="text"
                value={editingPkg.name}
                onChange={(e) => setEditingPkg({ ...editingPkg, name: e.target.value })}
                required
              />
            </div>

            <div className="admin-form-group">
              <label>Subjudul (Kategori)</label>
              <input
                type="text"
                value={editingPkg.subtitle}
                onChange={(e) => setEditingPkg({ ...editingPkg, subtitle: e.target.value })}
                required
              />
            </div>

            <div className="admin-form-group">
              <label>Harga (Rp)</label>
              <input
                type="number"
                min="0"
                step="1000"
                value={editingPkg.price}
                onChange={(e) =>
                  setEditingPkg({ ...editingPkg, price: parseInt(e.target.value) || 0 })
                }
                required
              />
            </div>

            <div className="admin-form-group">
              <label>Masa Garansi</label>
              <input
                type="text"
                value={editingPkg.warranty}
                onChange={(e) => setEditingPkg({ ...editingPkg, warranty: e.target.value })}
                placeholder="Contoh: 14 hari"
                required
              />
            </div>

            <div className="admin-form-group">
              <label>Badge Label (Opsional)</label>
              <input
                type="text"
                value={editingPkg.badge || ''}
                onChange={(e) => setEditingPkg({ ...editingPkg, badge: e.target.value })}
                placeholder="Contoh: PALING LARIS, TOP TIER"
              />
            </div>

            <div className="admin-form-group">
              <label>Urutan Tampil (Sort Order)</label>
              <input
                type="number"
                min="1"
                value={editingPkg.sortOrder}
                onChange={(e) =>
                  setEditingPkg({ ...editingPkg, sortOrder: parseInt(e.target.value) || 1 })
                }
                required
              />
            </div>
          </div>

          <div className="admin-form-group" style={{ marginTop: '16px' }}>
            <label>Deskripsi Singkat</label>
            <textarea
              rows={2}
              value={editingPkg.description}
              onChange={(e) => setEditingPkg({ ...editingPkg, description: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '24px', margin: '14px 0', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={editingPkg.isStartingPrice || false}
                onChange={(e) =>
                  setEditingPkg({ ...editingPkg, isStartingPrice: e.target.checked })
                }
              />
              <span style={{ fontSize: '0.88rem' }}>Harga Mulai Dari ("Mulai Rp...")</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={editingPkg.isFeatured || false}
                onChange={(e) =>
                  setEditingPkg({ ...editingPkg, isFeatured: e.target.checked })
                }
              />
              <span style={{ fontSize: '0.88rem' }}>Paket Unggulan (Highlight Card)</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={editingPkg.isActive}
                onChange={(e) =>
                  setEditingPkg({ ...editingPkg, isActive: e.target.checked })
                }
              />
              <span style={{ fontSize: '0.88rem' }}>Status Aktif (Tampil di Pricelist)</span>
            </label>
          </div>

          {/* Benefits Editor */}
          <div style={{ marginTop: '20px', marginBottom: '20px' }}>
            <label
              style={{
                display: 'block',
                fontWeight: 600,
                marginBottom: '8px',
                color: 'var(--color-primary)'
              }}
            >
              Daftar Benefit & Ketentuan ({editingPkg.benefits.length} item)
            </label>

            {/* Input benefit baru */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '12px',
                flexWrap: 'wrap'
              }}
            >
              <select
                value={newBenefitType}
                onChange={(e) => setNewBenefitType(e.target.value as BenefitType)}
                style={{
                  padding: '8px 12px',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--color-text-white)',
                  fontSize: '0.85rem'
                }}
              >
                <option value="included">✓ Termasuk (Benefit)</option>
                <option value="excluded">✕ Tidak Termasuk (Bukan Benefit)</option>
                <option value="info">ℹ Info / Catatan</option>
              </select>
              <input
                type="text"
                placeholder="Tulis nama benefit atau ketentuan..."
                value={newBenefitText}
                onChange={(e) => setNewBenefitText(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: '220px',
                  padding: '8px 12px',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--color-text-white)',
                  fontSize: '0.85rem'
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddBenefit();
                  }
                }}
              />
              <button
                type="button"
                className="btn-secondary anim-hover"
                style={{ padding: '8px 16px', fontSize: '0.84rem' }}
                onClick={handleAddBenefit}
              >
                Tambah
              </button>
            </div>

            {/* Benefit Items List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {editingPkg.benefits.map((b, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: 'var(--color-surface)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    fontSize: '0.86rem',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background:
                          b.type === 'included'
                            ? 'rgba(46, 204, 113, 0.15)'
                            : b.type === 'excluded'
                            ? 'rgba(239, 68, 68, 0.15)'
                            : 'rgba(52, 152, 219, 0.15)'
                      }}
                    >
                      {b.type === 'included' ? (
                        <Check size={12} color="#2ecc71" />
                      ) : b.type === 'excluded' ? (
                        <X size={12} color="#ef4444" />
                      ) : (
                        <Info size={12} color="#3498db" />
                      )}
                    </span>
                    <span style={{ color: b.type === 'excluded' ? 'var(--color-text-muted)' : 'var(--color-text-white)' }}>
                      {b.text}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <select
                      value={b.type}
                      onChange={(e) => handleChangeBenefitType(idx, e.target.value as BenefitType)}
                      style={{
                        padding: '4px 8px',
                        fontSize: '0.78rem',
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--color-text-muted)'
                      }}
                    >
                      <option value="included">Termasuk</option>
                      <option value="excluded">Tidak Termasuk</option>
                      <option value="info">Info / Catatan</option>
                    </select>

                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveBenefit(idx, 'up')}
                      title="Pindah ke atas"
                      style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      type="button"
                      disabled={idx === editingPkg.benefits.length - 1}
                      onClick={() => handleMoveBenefit(idx, 'down')}
                      title="Pindah ke bawah"
                      style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}
                    >
                      <ArrowDown size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveBenefit(idx)}
                      title="Hapus"
                      style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="submit"
              className="btn-primary anim-hover"
              style={{ padding: '9px 24px', fontSize: '0.88rem' }}
            >
              Simpan Perubahan
            </button>
            <button
              type="button"
              className="btn-secondary anim-hover"
              style={{ padding: '9px 18px', fontSize: '0.88rem' }}
              onClick={() => setEditingPkg(null)}
            >
              Batal
            </button>
          </div>
        </form>
      )}

      {/* Packages Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Urutan</th>
              <th>Nama Paket</th>
              <th>Harga</th>
              <th>Garansi</th>
              <th>Badge</th>
              <th>Benefit</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {packages.map((pkg) => (
              <tr key={pkg.id}>
                <td>#{pkg.sortOrder}</td>
                <td>
                  <strong>{pkg.name}</strong>
                  {pkg.isFeatured && (
                    <span
                      style={{
                        marginLeft: 6,
                        fontSize: '0.72rem',
                        color: 'var(--color-primary)'
                      }}
                    >
                      (Unggulan)
                    </span>
                  )}
                  <div style={{ fontSize: '0.76rem', color: '#888' }}>{pkg.subtitle}</div>
                </td>
                <td>
                  {pkg.isStartingPrice ? 'Mulai ' : ''}Rp{pkg.price.toLocaleString('id-ID')}
                </td>
                <td>{pkg.warranty}</td>
                <td>{pkg.badge || '-'}</td>
                <td>{pkg.benefits.length} item</td>
                <td>
                  <button
                    type="button"
                    onClick={() => handleToggleActive(pkg)}
                    style={{
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-pill)',
                      border: 'none',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      background: pkg.isActive ? 'rgba(46, 204, 113, 0.15)' : 'rgba(231, 76, 60, 0.15)',
                      color: pkg.isActive ? '#2ecc71' : '#e74c3c'
                    }}
                  >
                    {pkg.isActive ? 'Aktif' : 'Nonaktif'}
                  </button>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => handleEdit(pkg)}
                      title="Edit Paket"
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
                      onClick={() => handleDelete(pkg)}
                      title="Hapus Paket"
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
  );
};
