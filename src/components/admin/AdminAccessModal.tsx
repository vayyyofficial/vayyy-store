import React, { useState, useEffect } from 'react';
import { X, Lock, KeyRound } from 'lucide-react';
import { loginAdmin } from '../../services/storage';
import { StoreLogo } from '../StoreLogo';

interface AdminAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminAccessModal: React.FC<AdminAccessModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setErrorMessage(null);
    }
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMessage('Silakan masukkan password admin.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const result = await loginAdmin(password);
    setIsSubmitting(false);

    if (result.success) {
      setPassword('');
      onSuccess();
    } else {
      setErrorMessage(result.message);
    }
  };

  return (
    <div
      id="admin-access-modal-overlay"
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-access-title"
    >
      <div
        id="admin-access-modal-content"
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '420px', padding: '32px' }}
      >
        <button
          id="close-admin-access-btn"
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Tutup modal akses admin"
        >
          <X size={18} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
            <StoreLogo size={46} alt="Vayyy Store Logo" />
          </div>
          <h2
            id="admin-access-title"
            style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '6px' }}
          >
            Admin Access
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
            Masukkan kredensial otorisasi untuk mengelola paket layanan, promo, dan testimoni.
          </p>
        </div>

        {errorMessage && (
          <div
            id="admin-access-error-msg"
            className="promo-alert error"
            style={{ marginBottom: '18px' }}
          >
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="admin-form-group">
            <label htmlFor="admin-access-password-input">Password</label>
            <input
              id="admin-access-password-input"
              type="password"
              placeholder="Masukkan password admin"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              required
            />
          </div>

          <button
            id="admin-access-submit-btn"
            type="submit"
            className="btn-primary"
            disabled={isSubmitting}
            style={{ width: '100%', padding: '12px', marginTop: '6px' }}
          >
            <KeyRound size={17} />
            <span>{isSubmitting ? 'Memverifikasi...' : 'Masuk'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
