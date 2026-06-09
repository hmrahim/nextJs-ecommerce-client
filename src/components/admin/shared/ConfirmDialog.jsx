'use client';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';

export default function ConfirmDialog({ open, onClose, onConfirm, title = 'Are you sure?', message }) {
  return (
    <Modal open={open} onClose={onClose}>
      <h2 className="text-lg font-bold mb-2">{title}</h2>
      {message && <p className="text-gray-500 text-sm mb-6">{message}</p>}
      <div className="flex gap-3 justify-end">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="danger" onClick={() => { onConfirm(); onClose(); }}>Confirm</Button>
      </div>
    </Modal>
  );
}
