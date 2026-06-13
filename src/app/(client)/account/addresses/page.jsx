'use client';
import { useState } from 'react';
import { Plus, MapPin, Edit2, Trash2, Star } from 'lucide-react';

const INITIAL = [
  { id: 1, label: 'Home', name: 'John Doe', street: '1234 Market St', city: 'San Francisco, CA 94103', phone: '+1 555 0100', default: true },
  { id: 2, label: 'Office', name: 'John Doe', street: '500 Howard St', city: 'San Francisco, CA 94105', phone: '+1 555 0101', default: false },
];

export default function AddressesPage() {
  const [items, setItems] = useState(INITIAL);
  const [open, setOpen] = useState(false);
  const remove = (id) => setItems(items.filter((i) => i.id !== id));
  const makeDefault = (id) => setItems(items.map((i) => ({ ...i, default: i.id === id })));

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-border p-5 flex items-center justify-between">
        <h1 className="text-xl font-bold">Saved addresses</h1>
        <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-orange-500"><Plus className="w-4 h-4" /> Add new</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((a) => (
          <div key={a.id} className="bg-white rounded-2xl border border-border p-5 relative">
            {a.default && <span className="absolute top-3 right-3 inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full bg-emerald-50 text-emerald-700"><Star className="w-3 h-3" /> Default</span>}
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-orange-500" /><span className="font-bold">{a.label}</span></div>
            <p className="mt-3 text-sm font-semibold text-slate-900">{a.name}</p>
            <p className="text-sm text-slate-600">{a.street}</p>
            <p className="text-sm text-slate-600">{a.city}</p>
            <p className="text-sm text-slate-500 mt-1">{a.phone}</p>
            <div className="mt-4 flex gap-2 text-xs">
              <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border hover:bg-slate-50"><Edit2 className="w-3.5 h-3.5" /> Edit</button>
              {!a.default && <button onClick={() => makeDefault(a.id)} className="px-3 py-1.5 rounded-lg border border-border hover:bg-slate-50">Make default</button>}
              <button onClick={() => remove(a.id)} className="ml-auto inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-rose-600 hover:bg-rose-50"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
      </div>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-bold text-lg">Add new address</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              {['Label', 'Full name', 'Street', 'City, State, ZIP', 'Phone'].map((l, i) => (
                <label key={l} className={i >= 2 ? 'col-span-2' : ''}>
                  <span className="block mb-1 font-medium text-slate-700">{l}</span>
                  <input className="w-full rounded-lg border border-border px-3 py-2" />
                </label>
              ))}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg border border-border text-sm">Cancel</button>
              <button onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
