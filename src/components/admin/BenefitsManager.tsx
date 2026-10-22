import React, { useState } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, Check, X, Info, Layers, CheckCircle2 } from 'lucide-react';
import { ServicePackage, PackageBenefitItem, BenefitType } from '../../types';
import { saveServicePackage, parsePackageBenefits } from '../../services/storage';

interface BenefitsManagerProps {
  packages: ServicePackage[];
}

export const BenefitsManager: React.FC<BenefitsManagerProps> = ({ packages }) => {
  const [selectedPkgId, setSelectedPkgId] = useState<string>(packages[0]?.id || 'basic');
  const [newText, setNewText] = useState('');
  const [newType, setNewType] = useState<BenefitType>('included');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const selectedPkg = packages.find((p) => p.id === selectedPkgId) || packages[0];

  // Global counts
  const allBenefitItems = packages.flatMap((p) => parsePackageBenefits(p.benefits));
  const totalIncluded = allBenefitItems.filter((b) => b.type === 'included').length;
  const totalExcluded = allBenefitItems.filter((b) => b.type === 'excluded').length;
  const totalInfo = allBenefitItems.filter((b) => b.type === 'info').length;

  const handleAdd = async () => {
    if (!newText.trim() || !selectedPkg) return;
    const current = parsePackageBenefits(selectedPkg.benefits);
    const updatedBenefits: PackageBenefitItem[] = [
      ...current,
      { text: newText.trim(), type: newType }
    ];

    try {
      await saveServicePackage({
        ...selectedPkg,
        benefits: updatedBenefits
      });
      setNewText('');
      setStatusMsg({ type: 'success', text: `Benefit baru ditambahkan ke paket ${selectedPkg.name}.` });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setStatusMsg({ type: 'error', text: `Gagal menambahkan benefit: ${msg}` });
    }
  };

  const handleRemove = async (idx: number) => {
    if (!selectedPkg) return;
    const current = parsePackageBenefits(selectedPkg.benefits);
    const updated = current.filter((_, i) => i !== idx);

    try {
      await saveServicePackage({
        ...selectedPkg,
        benefits: updated
      });
      setStatusMsg({ type: 'success', text: `Item benefit berhasil dihapus.` });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setStatusMsg({ type: 'error', text: `Gagal menghapus benefit: ${msg}` });
    }
  };

  const handleMove = async (idx: number, dir: 'up' | 'down') => {
    if (!selectedPkg) return;
    const targetIdx = dir === 'up' ? idx - 1 : idx + 1;
    const current = parsePackageBenefits(selectedPkg.benefits);
    if (targetIdx < 0 || targetIdx >= current.length) return;

    const [moved] = current.splice(idx, 1);
    current.splice(targetIdx, 0, moved);

    try {
      await saveServicePackage({
        ...selectedPkg,
        benefits: current
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setStatusMsg({ type: 'error', text: `Gagal memindahkan benefit: ${msg}` });
    }
  };

  const handleChangeType = async (idx: number, type: BenefitType) => {
    if (!selectedPkg) return;
    const current = parsePackageBenefits(selectedPkg.benefits);
    current[idx] = { ...current[idx], type };

    try {
      await saveServicePackage({
        ...selectedPkg,
        benefits: current
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setStatusMsg({ type: 'error', text: `Gagal mengubah tipe benefit: ${msg}` });
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
            Manajemen Benefit & Ketentuan Layanan
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            Kelola klasifikasi benefit tiap paket: Termasuk (✓), Keterbatasan / Tidak Termasuk (✕), dan Catatan Informasi (ℹ).
          </p>
        </div>
      </div>

      {statusMsg && (
        <div className={`promo-alert ${statusMsg.type}`} style={{ marginBottom: '16px' }}>
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="admin-stats-grid" style={{ marginBottom: '24px' }}>
        <div className="admin-stat-card">
          <div className="stat-icon-wrap" style={{ color: '#10B981', background: 'rgba(16, 185, 129, 0.12)' }}>
            <Check size={20} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{totalIncluded}</div>
            <div className="stat-label">Fitur Termasuk (Included)</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon-wrap" style={{ color: '#EF4444', background: 'rgba(239, 68, 68, 0.12)' }}>
            <X size={20} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{totalExcluded}</div>
            <div className="stat-label">Keterbatasan (Excluded)</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon-wrap" style={{ color: '#3B82F6', background: 'rgba(59, 130, 246, 0.12)' }}>
            <Info size={20} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{totalInfo}</div>
            <div className="stat-label">Catatan Informasi (Info)</div>
          </div>
        </div>
      </div>

      {/* Package Selector Tabs */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {packages.map((pkg) => {
          const isSelected = pkg.id === selectedPkg?.id;
          return (
            <button
              key={pkg.id}
              type="button"
              onClick={() => setSelectedPkgId(pkg.id)}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.86rem',
                fontWeight: isSelected ? 700 : 500,
                border: '1px solid',
                borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-border)',
                background: isSelected ? 'var(--color-primary-glow)' : 'var(--color-surface)',
                color: isSelected ? 'var(--color-primary)' : 'var(--color-text-muted)',
                cursor: 'pointer'
              }}
            >
              {pkg.name} ({pkg.benefits?.length || 0})
            </button>
          );
        })}
      </div>

      {/* Selected Package Benefit Editor */}
      {selectedPkg && (
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '24px'
          }}
        >
          <div style={{ marginBottom: '18px' }}>
            <h4 style={{ margin: '0 0 4px', fontSize: '1.1rem', color: 'var(--color-text-white)' }}>
              Benefit Paket: <span style={{ color: 'var(--color-primary)' }}>{selectedPkg.name}</span>
            </h4>
            <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--color-text-muted)' }}>
              Harga: Rp{selectedPkg.price.toLocaleString('id-ID')} &bull; Garansi: {selectedPkg.warranty}
            </p>
          </div>

          {/* Add Benefit Item */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as BenefitType)}
              style={{
                padding: '9px 12px',
                background: 'var(--color-surface-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--color-text-white)',
                fontSize: '0.85rem'
              }}
            >
              <option value="included">✓ Termasuk (Benefit)</option>
              <option value="excluded">✕ Tidak Termasuk (Keterbatasan)</option>
              <option value="info">ℹ Info / Catatan</option>
            </select>
            <input
              type="text"
              placeholder="Tulis benefit atau batasan paket..."
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              style={{
                flex: 1,
                minWidth: '240px',
                padding: '9px 14px',
                background: 'var(--color-surface-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--color-text-white)',
                fontSize: '0.85rem'
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAdd();
                }
              }}
            />
            <button
              type="button"
              className="btn-primary anim-hover"
              style={{ padding: '9px 18px', fontSize: '0.85rem' }}
              onClick={handleAdd}
            >
              <Plus size={16} />
              <span>Tambah Item</span>
            </button>
          </div>

          {/* List of Benefit Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {parsePackageBenefits(selectedPkg.benefits || []).map((item, idx) => {
              const text = item.text;
              const type: BenefitType = item.type || 'included';

              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: 'var(--color-surface-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        background:
                          type === 'included'
                            ? 'rgba(16, 185, 129, 0.15)'
                            : type === 'excluded'
                            ? 'rgba(239, 68, 68, 0.15)'
                            : 'rgba(59, 130, 246, 0.15)'
                      }}
                    >
                      {type === 'included' ? (
                        <Check size={13} color="#10B981" />
                      ) : type === 'excluded' ? (
                        <X size={13} color="#EF4444" />
                      ) : (
                        <Info size={13} color="#3B82F6" />
                      )}
                    </span>
                    <span style={{ fontSize: '0.88rem', color: type === 'excluded' ? 'var(--color-text-muted)' : 'var(--color-text-white)' }}>
                      {text}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <select
                      value={type}
                      onChange={(e) => handleChangeType(idx, e.target.value as BenefitType)}
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
                      onClick={() => handleMove(idx, 'up')}
                      title="Pindah ke atas"
                      style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: '4px' }}
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      type="button"
                      disabled={idx === selectedPkg.benefits.length - 1}
                      onClick={() => handleMove(idx, 'down')}
                      title="Pindah ke bawah"
                      style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: '4px' }}
                    >
                      <ArrowDown size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(idx)}
                      title="Hapus"
                      style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
