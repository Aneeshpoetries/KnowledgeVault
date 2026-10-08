'use client';

import { useEffect, useRef } from 'react';

/** Native modal focus trapping, Escape dismissal, inert background, and focus restoration. */
export function Modal({ open, onClose, label, children, className = '' }: {
  open: boolean; onClose: () => void; label: string; children: React.ReactNode; className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
    return () => { if (dialog.open) dialog.close(); };
  }, [open]);
  return <dialog ref={ref} aria-label={label} className={`vault-dialog ${className}`} onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => {
    if (event.target === ref.current) {
      const bounds = ref.current.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
    }
  }}>{open && children}</dialog>;
}
