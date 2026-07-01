import { ReactNode } from 'react';

export function AdminModal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-homify-text/40 backdrop-blur-sm p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-homify-card w-full max-w-md rounded-modal p-6 shadow-2xl border border-homify-border text-homify-text"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        <h3 className="text-lg font-bold text-homify-text mb-4">{title}</h3>
        {children}
      </div>
    </div>
  );
}

export function AdminModalActions({
  onCancel,
  onConfirm,
  confirmLabel,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel: string;
}) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 py-2.5 rounded-btn border border-homify-border text-homify-muted font-medium"
      >
        Annuler
      </button>
      <button
        type="button"
        onClick={onConfirm}
        className="flex-1 py-2.5 rounded-btn bg-homify-primary text-white font-semibold"
      >
        {confirmLabel}
      </button>
    </div>
  );
}
