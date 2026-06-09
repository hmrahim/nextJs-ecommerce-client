// 📁 PATH: src/components/admin/profile/AddressesPanel.jsx
'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

const ADDRESS_TYPES = ['home', 'office', 'other'];
const COUNTRIES = ['Bangladesh', 'Saudi Arabia', 'India', 'UAE', 'USA', 'UK'];

const EMPTY_FORM = {
  type: 'home', street: '', city: '', state: '',
  postalCode: '', country: 'Bangladesh', phone: '',
};

function AddressCard({ address, onEdit, onDelete, onSetDefault }) {
  const typeBadgeMap = {
    home:   'bg-violet-500/10 text-violet-400 border-violet-500/20',
    office: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    other:  'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };

  return (
    <div className={`rounded-xl border p-4 transition-colors ${
      address.isDefault
        ? 'border-violet-500/30 bg-violet-500/5'
        : 'border-[#1e1e2e] bg-[#13131a]'
    }`}>
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium capitalize ${typeBadgeMap[address.type] || typeBadgeMap.other}`}>
            {address.type}
          </span>
          {address.isDefault && (
            <span className="text-xs px-2.5 py-0.5 rounded-full border bg-violet-600/20 text-violet-300 border-violet-500/30 font-medium">
              Default
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {!address.isDefault && (
            <button
              onClick={() => onSetDefault(address._id)}
              className="px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-lg transition-colors"
            >
              Set default
            </button>
          )}
          <button
            onClick={() => onEdit(address)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-sky-400 hover:bg-sky-500/10 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(address._id)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      <p className="text-slate-200 text-sm">{address.street}</p>
      <p className="text-slate-500 text-sm mt-0.5">
        {[address.city, address.state].filter(Boolean).join(', ')}
        {address.postalCode ? ` — ${address.postalCode}` : ''}
      </p>
      <p className="text-slate-600 text-sm">{address.country}</p>
      {address.phone && (
        <p className="text-slate-500 text-xs mt-1.5">{address.phone}</p>
      )}
    </div>
  );
}

function AddressFormModal({ editData, onClose, onSubmit }) {
  const { register, watch, setValue, handleSubmit: rhfHandleSubmit } = useForm({
    defaultValues: editData || EMPTY_FORM,
  });
  const form = watch();

  const handleSave = rhfHandleSubmit((data) => {
    if (!data.street || !data.city || !data.country) return;
    onSubmit(data);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative bg-[#0e0e17] border border-[#1e1e2e] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e1e2e]">
          <h3 className="text-white font-semibold">{editData?._id ? 'Edit address' : 'Add new address'}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1.5">Type</label>
            <div className="flex gap-2">
              {ADDRESS_TYPES.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setValue('type', t, { shouldDirty: true })}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium border capitalize transition-colors ${
                    form.type === t
                      ? 'bg-violet-500/20 border-violet-500/40 text-violet-300'
                      : 'border-[#1e1e2e] text-slate-500 hover:text-slate-300 hover:bg-white/5'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          {[
            { label: 'Street address', name: 'street', placeholder: 'House, Road, Block…' },
            { label: 'City', name: 'city', placeholder: 'Dhaka' },
            { label: 'State / Division', name: 'state', placeholder: 'Dhaka Division' },
            { label: 'Postal code', name: 'postalCode', placeholder: '1209' },
            { label: 'Phone (for delivery)', name: 'phone', placeholder: '+880 1700…' },
          ].map(f => (
            <div key={f.name}>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1.5">{f.label}</label>
              <input
                {...register(f.name)}
                placeholder={f.placeholder}
                className="w-full bg-[#0d0d16] border border-[#1e1e2e] rounded-lg px-3.5 py-2.5 text-sm text-slate-200
                  placeholder-slate-600 outline-none focus:border-violet-500/60 transition-colors"
              />
            </div>
          ))}
          <div>
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1.5">Country</label>
            <select
              {...register('country')}
              className="w-full bg-[#0d0d16] border border-[#1e1e2e] rounded-lg px-3.5 py-2.5 text-sm text-slate-200
                outline-none focus:border-violet-500/60 transition-colors"
            >
              {COUNTRIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-[#1e1e2e] text-slate-400 text-sm rounded-xl hover:bg-white/5 transition-colors">
              Cancel
            </button>
            <button type="button" onClick={handleSave}
              className="flex-1 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-xl transition-colors">
              {editData?._id ? 'Update address' : 'Add address'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AddressesPanel({ profile, onAddAddress, onUpdateAddress, onDeleteAddress, onSetDefaultAddress }) {
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData]   = useState(null);

  const addresses = profile?.addresses || [];

  const handleEdit = (addr) => { setEditData(addr); setShowModal(true); };
  const handleAdd  = ()     => { setEditData(null); setShowModal(true); };

  const handleSubmit = async (form) => {
    if (editData?._id) {
      await onUpdateAddress(editData._id, form);
    } else {
      await onAddAddress(form);
    }
    setShowModal(false);
    setEditData(null);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[#1e1e2e] bg-[#13131a] overflow-hidden">
        <div className="px-5 py-3 border-b border-[#1e1e2e] bg-[#0f0f18] flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
            Saved addresses ({addresses.length})
          </h3>
          <button
            onClick={handleAdd}
            className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add new
          </button>
        </div>
        <div className="p-4 space-y-3">
          {addresses.length === 0 ? (
            <div className="text-center py-8 text-slate-600">
              <svg className="w-10 h-10 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <p className="text-sm">No addresses saved yet</p>
              <button onClick={handleAdd} className="mt-3 text-violet-400 text-sm hover:text-violet-300 transition-colors">
                + Add your first address
              </button>
            </div>
          ) : (
            addresses.map(addr => (
              <AddressCard
                key={addr._id}
                address={addr}
                onEdit={handleEdit}
                onDelete={onDeleteAddress}
                onSetDefault={onSetDefaultAddress}
              />
            ))
          )}
        </div>
      </div>

      {showModal && (
        <AddressFormModal
          editData={editData}
          onClose={() => { setShowModal(false); setEditData(null); }}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
