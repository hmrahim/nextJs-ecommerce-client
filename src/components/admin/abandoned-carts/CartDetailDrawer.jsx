// 📁 PATH: src/components/admin/abandoned-carts/CartDetailDrawer.jsx
'use client';
export default function CartDetailDrawer({ cart, onClose }) {
  if (!cart) return null;
  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative ml-auto w-full max-w-md h-full bg-[#16161f] border-l border-[#1e1e2e] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e1e2e]">
          <h2 className="text-lg font-bold text-white">Cart Details</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="rounded-lg border border-[#1e1e2e] bg-[#111118] p-4">
            <p className="text-xs text-slate-500">Customer</p>
            <p className="text-sm font-semibold text-white">{cart.customerName || 'Guest'}</p>
            <p className="text-xs text-slate-400 mt-1">{cart.email || '—'}</p>
            <p className="text-xs text-slate-400">{cart.phone || '—'}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-[#1e1e2e] bg-[#111118] p-3"><p className="text-xs text-slate-500">Cart Value</p><p className="text-lg font-bold text-orange-400">৳{new Intl.NumberFormat().format(cart.cartValue)}</p></div>
            <div className="rounded-lg border border-[#1e1e2e] bg-[#111118] p-3"><p className="text-xs text-slate-500">Items</p><p className="text-lg font-bold text-white">{cart.itemsCount}</p></div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">Cart Items</p>
            <div className="space-y-2">
              {(cart.items || []).map((it, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-[#1e1e2e] bg-[#111118]">
                  <div><p className="text-sm text-white">{it.name}</p><p className="text-xs text-slate-500">Qty {it.qty} × ৳{it.price}</p></div>
                  <p className="text-sm font-semibold text-orange-400">৳{new Intl.NumberFormat().format(it.qty * it.price)}</p>
                </div>
              ))}
            </div>
          </div>
          {cart.recoveryLog?.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">Recovery Timeline</p>
              <div className="space-y-2">
                {cart.recoveryLog.map((l, i) => (
                  <div key={i} className="flex gap-3 p-3 rounded-lg border border-[#1e1e2e] bg-[#111118]">
                    <div className="w-2 h-2 rounded-full bg-orange-400 mt-1.5" />
                    <div className="flex-1"><p className="text-sm text-white">{l.type.toUpperCase()} — {l.note}</p><p className="text-xs text-slate-500">{new Date(l.at).toLocaleString('en-BD')}</p></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
