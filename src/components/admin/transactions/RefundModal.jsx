'use client';

import { useState } from 'react';

export default function RefundModal({ txn, onClose, onConfirm }) {
  const [amount, setAmount] = useState(txn?.amount || 0);
  const [reason, setReason] = useState('customer_request');
  const [note, setNote] = useState('');

  if (!txn) return null;

  const submit = (e) => {
    e.preventDefault();
    if (amount <= 0 || amount > txn.amount) return;
    onConfirm({ txnId: txn.id, amount: Number(amount), reason, note });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#16161f] border border-white/10 rounded-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 className="text-white text-lg font-semibold">Issue Refund</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none">×</button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div className="bg-[#111118] border border-white/5 rounded-lg p-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-400">Transaction</span><span className="text-white">{txn.id}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Original Amount</span><span className="text-white">SAR {txn.amount.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Customer</span><span className="text-white">{txn.customer.name}</span></div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Refund Amount (SAR )</label>
            <input type="number" min="1" max={txn.amount} value={amount} onChange={e => setAmount(e.target.value)}
              className="w-full bg-[#111118] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500/50" />
            <p className="text-xs text-gray-500 mt-1">Max SAR {txn.amount.toLocaleString()} • Partial refunds allowed</p>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Reason</label>
            <select value={reason} onChange={e => setReason(e.target.value)}
              className="w-full bg-[#111118] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500/50">
              <option value="customer_request">Customer Request</option>
              <option value="duplicate">Duplicate Charge</option>
              <option value="fraudulent">Fraudulent</option>
              <option value="product_unavailable">Product Unavailable</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Internal Note</label>
            <textarea rows={3} value={note} onChange={e => setNote(e.target.value)}
              placeholder="Reason details for internal records..."
              className="w-full bg-[#111118] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50" />
          </div>

          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 text-xs text-orange-300">
            ⚠ Refunds are processed to the original payment method and typically take 5-10 business days.
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg text-sm">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium">Confirm Refund</button>
          </div>
        </form>
      </div>
    </div>
  );
}
