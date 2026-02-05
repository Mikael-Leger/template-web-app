'use client';

import { useEffect, useRef, useState } from 'react';
import './confirmation-modal.scss';

export interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warn' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const [mouseDownOnOverlay, setMouseDownOnOverlay] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    // Focus cancel button when modal opens
    if (cancelButtonRef.current) {
      cancelButtonRef.current.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const handleOverlayMouseDown = (e: React.MouseEvent) => {
    // Only set true if the mousedown was directly on the overlay
    if (e.target === e.currentTarget) {
      setMouseDownOnOverlay(true);
    }
  };

  const handleOverlayMouseUp = (e: React.MouseEvent) => {
    // Only close if both mousedown and mouseup were on the overlay
    if (mouseDownOnOverlay && e.target === e.currentTarget) {
      onCancel();
    }
    setMouseDownOnOverlay(false);
  };

  return (
    <div
      className="confirmation-modal-overlay"
      onMouseDown={handleOverlayMouseDown}
      onMouseUp={handleOverlayMouseUp}
    >
      <div
        className="confirmation-modal"
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <h2 id="modal-title" className="confirmation-modal-title">
          {title}
        </h2>
        <p className="confirmation-modal-message">{message}</p>
        <div className="confirmation-modal-actions">
          <button
            ref={cancelButtonRef}
            className="confirmation-modal-btn confirmation-modal-btn--cancel"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            className={`confirmation-modal-btn confirmation-modal-btn--${variant}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
