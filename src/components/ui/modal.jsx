'use client';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';

export function Modal({ open, onClose, children, className }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className={cn('relative bg-white rounded-xl shadow-xl p-6 w-full max-w-lg mx-4', className)}>
        {children}
      </div>
    </div>
  );
}
