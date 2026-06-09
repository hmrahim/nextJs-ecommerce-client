// 📁 PATH: src/components/admin/profile/PaymentPanel.jsx
'use client';
import { useState } from 'react';

const NETWORK_STYLES = {
  visa:       { label: 'VISA',   bg: 'bg-indigo-600' },
  mastercard: { label: 'MC',     bg: 'bg-orange-600' },
  amex:       { label: 'AMEX',   bg: 'bg-sky-600' },
  default:    { label: 'CARD',   bg: 'bg-slate-600' },
};

function CardItem({ card, onDelete }) {
  const net = NETWORK_STYLES[card.type?.toLowerCase()] || NETWORK_STYLES.default;

  return (
    <div className="flex items-center gap-3 p-4 rounded-xl border border-[#1e1e2e] bg-[#0d0d16]">
      <div className={`w-10 h-7 rounded-lg ${net.bg} flex items-center justify-center
        text-white text-[10px] font-bold flex-shrink-0`}>
        {net.label}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-slate-200 text-sm font-medium font-mono">
          •••• •••• •••• {card.last4 || '****'}
        </p>
        <p className="text-slate-500 text-xs mt-0.5">
          Expires {card.expMonth || '**'} / {card.expYear || '**'}
        </p>
      </div>
      {card.isDefault && (
        <span className="text-xs px-2.5 py-0.5 rounded-full border bg-violet-500/10 text-violet-400 border-violet-500/20 flex-shrink-0">
          Default
        </span>
      )}
      <button
        onClick={() => onDelete(card.type)}
        className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
}

// Dummy demo cards if no real data
const DEMO_CARDS = [
  { _id: '1', type: 'visa',       last4: '4242', expMonth: '08', expYear: '27', isDefault: true },
  { _id: '2', type: 'mastercard', last4: '8853', expMonth: '03', expYear: '26', isDefault: false },
];

export default function PaymentPanel({ profile, onDeleteCard }) {
  const [showAdd, setShowAdd] = useState(false);
  const cards = (profile?.savedCards?.length ? profile.savedCards : DEMO_CARDS);

  return (
    <div className="space-y-4">
      {/* Cards list */}
      <div className="rounded-xl border border-[#1e1e2e] bg-[#13131a] overflow-hidden">
        <div className="px-5 py-3 border-b border-[#1e1e2e] bg-[#0f0f18] flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
            Saved cards ({cards.length})
          </h3>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add card
          </button>
        </div>
        <div className="p-4 space-y-2.5">
          {cards.map(c => (
            <CardItem key={c._id} card={c} onDelete={onDeleteCard} />
          ))}
        </div>
      </div>

      {/* Wallet */}
      <div className="rounded-xl border border-[#1e1e2e] bg-[#13131a] p-5">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">Wallet balance</h3>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-bold text-white">৳ {(profile?.walletBalance ?? 850).toLocaleString()}</p>
            <p className="text-slate-500 text-sm mt-1">Available to spend</p>
          </div>
          <button className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-xl transition-colors">
            Add funds
          </button>
        </div>
        <div className="mt-4 pt-4 border-t border-[#1e1e2e] grid grid-cols-2 gap-3">
          <div>
            <p className="text-slate-500 text-xs">Total earned (cashback)</p>
            <p className="text-slate-300 text-sm font-medium mt-0.5">৳ 1,240</p>
          </div>
          <div>
            <p className="text-slate-500 text-xs">Total spent</p>
            <p className="text-slate-300 text-sm font-medium mt-0.5">৳ 12,450</p>
          </div>
        </div>
      </div>

      {/* Add card modal stub */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="relative bg-[#0e0e17] border border-[#1e1e2e] rounded-2xl w-full max-w-md p-6"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-white font-semibold mb-4">Add new card</h3>
            <p className="text-slate-500 text-sm mb-4">Card tokenization is handled via Stripe. Clicking below will open the secure Stripe element.</p>
            <div className="bg-[#0d0d16] border border-[#1e1e2e] rounded-xl p-4 text-slate-600 text-sm text-center">
              Stripe Card Element renders here
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowAdd(false)}
                className="flex-1 px-4 py-2.5 border border-[#1e1e2e] text-slate-400 text-sm rounded-xl hover:bg-white/5 transition-colors">
                Cancel
              </button>
              <button onClick={() => setShowAdd(false)}
                className="flex-1 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-xl transition-colors">
                Save card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
