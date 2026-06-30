// 📁 PATH: src/app/(admin)/dashboard/quotations/page.jsx
// 📋 Quotation Management — Admin Panel
//    Pending quotation click → opens pricing form with expandable product cards
//    Each product card has unitPrice + discount fields
//    Approve disabled until ALL products have price > 0

'use client';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  FileText, Search, Eye, CheckCircle, XCircle, Clock,
  Loader2, RefreshCw, Package, ChevronLeft, ChevronRight,
  ChevronDown, ChevronUp, AlertCircle, Tag, DollarSign,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { quotationService } from '@/services/quotationService';

/* ─── Helpers ─── */
const fmt = (n) => `SAR ${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
const dateFmt = (d) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

/* ─── Status config ─── */
const QT_STATUS = {
  pending:  { label: 'Pending',  icon: <Clock size={12} />,       cls: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  approved: { label: 'Approved', icon: <CheckCircle size={12} />, cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  accepted: { label: 'Accepted', icon: <CheckCircle size={12} />, cls: 'bg-sky-500/15 text-sky-300 border-sky-500/30' },
  rejected: { label: 'Rejected', icon: <XCircle size={12} />,     cls: 'bg-red-500/15 text-red-300 border-red-500/30' },
  expired:  { label: 'Expired',  icon: <Clock size={12} />,       cls: 'bg-slate-500/15 text-slate-400 border-slate-500/30' },
};

function StatusPill({ status }) {
  const s = QT_STATUS[status] || QT_STATUS.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-semibold ${s.cls}`}>
      {s.icon} {s.label}
    </span>
  );
}

/* ─── Stat Card ─── */
function StatCard({ label, value, icon, color }) {
  return (
    <div className={`rounded-xl border ${color.border} bg-gradient-to-br ${color.from} to-transparent p-4`}>
      <div className="flex items-center justify-between mb-2"><span className="text-xl">{icon}</span></div>
      <p className={`text-xl font-bold ${color.text}`}>{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   PRODUCT PRICING CARD — expandable per-item form
════════════════════════════════════════════════════════ */
function ProductPricingCard({ item, index, register, watch, errors, expanded, onToggle }) {
  const unitPrice = watch(`items.${index}.unitPrice`);
  const discount = watch(`items.${index}.discount`);
  const qty = watch(`items.${index}.qty`);
  const hasPrice = Number(unitPrice) > 0;
  const lineTotal = (Number(unitPrice) || 0) * (Number(qty) || 1) * (1 - (Number(discount) || 0) / 100);

  return (
    <div className={`rounded-xl border transition-all ${hasPrice ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-slate-700 bg-slate-800/40'}`}>
      {/* Card Header — always visible */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-700/30 transition-colors rounded-t-xl"
      >
        {/* Status indicator */}
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${hasPrice ? 'bg-emerald-500/20' : 'bg-amber-500/20'}`}>
          {hasPrice
            ? <CheckCircle size={16} className="text-emerald-400" />
            : <DollarSign size={16} className="text-amber-400" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-slate-100 truncate">{item.name}</p>
            {hasPrice ? (
              <span className="text-[9px] font-bold px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full uppercase">Priced</span>
            ) : (
              <span className="text-[9px] font-bold px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded-full uppercase">Price Required</span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {item.sku && <span>SKU: {item.sku} · </span>}
            {item.qty} {item.unit} · Target: {item.targetPrice ? fmt(item.targetPrice) : '—'}
          </p>
        </div>

        <div className="text-right shrink-0 mr-2">
          {hasPrice ? (
            <p className="text-sm font-bold text-emerald-400">{fmt(lineTotal)}</p>
          ) : (
            <p className="text-xs text-amber-400 italic">Set price</p>
          )}
        </div>

        {expanded ? <ChevronUp size={16} className="text-slate-400 shrink-0" /> : <ChevronDown size={16} className="text-slate-400 shrink-0" />}
      </button>

      {/* Expanded Content — pricing form */}
      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-slate-700/50 space-y-4">
          {/* Product details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <p className="text-slate-500 mb-0.5">Quantity</p>
              <p className="font-semibold text-slate-200">{item.qty} <span className="uppercase text-slate-500">{item.unit}</span></p>
            </div>
            {item.targetPrice > 0 && (
              <div>
                <p className="text-slate-500 mb-0.5">Customer Target</p>
                <p className="font-semibold text-amber-400">{fmt(item.targetPrice)}/unit</p>
              </div>
            )}
            {item.sku && (
              <div>
                <p className="text-slate-500 mb-0.5">SKU</p>
                <p className="font-semibold text-slate-200">{item.sku}</p>
              </div>
            )}
            {item.variantTitle && (
              <div>
                <p className="text-slate-500 mb-0.5">Variant</p>
                <p className="font-semibold text-slate-200">{item.variantTitle}</p>
              </div>
            )}
          </div>

          {/* Specs */}
          {item.specs?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {item.specs.map((s, i) => (
                <span key={i} className="inline-flex items-center gap-1 text-[10px] font-medium bg-slate-700/60 text-slate-300 px-2 py-0.5 rounded-full">
                  <Tag size={9} className="text-slate-500" />
                  <span className="text-slate-500">{s.key}:</span>
                  <span className="font-semibold">{s.value}</span>
                </span>
              ))}
            </div>
          )}

          {item.itemNote && (
            <div className="bg-slate-700/40 rounded-lg px-3 py-2 text-xs text-slate-400">
              📝 {item.itemNote}
            </div>
          )}

          {/* Price inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Unit Price (SAR) <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                {...register(`items.${index}.unitPrice`, {
                  required: 'Price is required',
                  min: { value: 0.01, message: 'Must be > 0' },
                })}
                className={`w-full bg-slate-700 border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none transition-colors ${
                  errors?.items?.[index]?.unitPrice
                    ? 'border-rose-500 focus:border-rose-400'
                    : 'border-slate-600 focus:border-emerald-500'
                }`}
              />
              {errors?.items?.[index]?.unitPrice && (
                <p className="text-[10px] text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle size={10} /> {errors.items[index].unitPrice.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Discount %
              </label>
              <input
                type="number"
                min="0"
                max="100"
                placeholder="0"
                {...register(`items.${index}.discount`, {
                  min: { value: 0, message: '≥ 0' },
                  max: { value: 100, message: '≤ 100' },
                })}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Line total preview */}
          {hasPrice && (
            <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
              <span className="text-xs text-slate-400">Line Total</span>
              <span className="text-sm font-bold text-emerald-400">{fmt(lineTotal)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   QUOTATION FORM MODAL — opens when admin clicks pending quotation
   Each product is an expandable card with price fields
   Approve disabled until ALL products have price > 0
════════════════════════════════════════════════════════ */
function QuotationFormModal({ quotation, onClose, onApprove, onReject }) {
  const [loading, setLoading] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});
  const [showReject, setShowReject] = useState(false);
  const [rejectNote, setRejectNote] = useState('');
  const [rejecting, setRejecting] = useState(false);

  const defaultItems = quotation.items.map((it) => ({
    name: it.name,
    sku: it.sku || '',
    qty: it.qty,
    unit: it.unit || 'pcs',
    unitPrice: it.unitPrice || 0,
    discount: it.discount || 0,
  }));

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      items: defaultItems,
      shipping: quotation.shipping || 0,
      validDays: 7,
      note: '',
    },
    mode: 'onChange',
  });

  const watchedItems = watch('items');
  const watchedShipping = watch('shipping');

  // Check if ALL products have price > 0
  const allPriced = watchedItems.every((it) => Number(it.unitPrice) > 0);
  const pricedCount = watchedItems.filter((it) => Number(it.unitPrice) > 0).length;
  const totalCount = watchedItems.length;

  const subtotal = watchedItems.reduce(
    (s, it) => s + (Number(it.unitPrice) || 0) * (Number(it.qty) || 1) * (1 - (Number(it.discount) || 0) / 100),
    0
  );
  const tax = subtotal * 0.15;
  const total = subtotal + tax + (Number(watchedShipping) || 0);

  function toggleItem(idx) {
    setExpandedItems((prev) => ({ ...prev, [idx]: !prev[idx] }));
  }

  function expandAll() {
    const all = {};
    defaultItems.forEach((_, i) => { all[i] = true; });
    setExpandedItems(all);
  }

  function collapseAll() {
    setExpandedItems({});
  }

  async function onFormSubmit(data) {
    if (!allPriced) {
      toast.error('Please set price for all products before approving.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        items: data.items.map((it, idx) => ({
          ...quotation.items[idx],
          unitPrice: Number(it.unitPrice) || 0,
          discount: Number(it.discount) || 0,
          total: (Number(it.unitPrice) || 0) * (Number(it.qty) || 1) * (1 - (Number(it.discount) || 0) / 100),
        })),
        subtotal,
        tax,
        shipping: Number(data.shipping) || 0,
        total,
        note: data.note?.trim() || '',
        validDays: Number(data.validDays) || 7,
      };
      const res = await quotationService.adminApprove(quotation.id || quotation._id, payload);
      toast.success('Quotation approved & sent to customer!');
      onApprove(quotation.id || quotation._id, { ...payload, ...res?.data?.data });
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to approve quotation.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleReject() {
    setRejecting(true);
    try {
      await quotationService.adminReject(quotation.id || quotation._id, rejectNote);
      toast.success('Quotation rejected.');
      onReject(quotation.id || quotation._id, rejectNote);
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to reject.');
    } finally {
      setRejecting(false);
    }
  }

  const isPending = quotation.status === 'pending';
  const customerName = quotation.companyInfo?.companyName || quotation.customer?.name || 'Customer';
  const customerEmail = quotation.companyInfo?.contactPerson || quotation.customer?.email || '';
  const customerPhone = quotation.companyInfo?.contactPhone || quotation.customer?.phone || '';
  const customerAddr = quotation.companyInfo?.address || '';

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative w-full max-w-3xl my-6 bg-[#1e293b] rounded-xl shadow-2xl text-slate-100 border border-slate-700" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">
                {isPending ? 'Review & Price Quotation' : 'Quotation Details'}
              </h2>
              <StatusPill status={quotation.status} />
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {quotation.quotationNumber || quotation.id || quotation._id} · {customerName}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-xl leading-none">✕</button>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)}>
          <div className="p-6 space-y-5">

            {/* Customer Info */}
            <div className="bg-slate-800/50 rounded-xl p-4">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Customer Info</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div><p className="text-slate-500">Company</p><p className="font-semibold text-slate-200">{customerName}</p></div>
                <div><p className="text-slate-500">Contact</p><p className="font-semibold text-slate-200">{customerEmail}</p></div>
                <div><p className="text-slate-500">Phone</p><p className="font-semibold text-slate-200">{customerPhone}</p></div>
                {quotation.companyInfo?.vatNumber && <div><p className="text-slate-500">VAT</p><p className="font-mono font-semibold text-slate-200">{quotation.companyInfo.vatNumber}</p></div>}
                {customerAddr && <div className="sm:col-span-2"><p className="text-slate-500">Address</p><p className="font-semibold text-slate-200">{customerAddr}</p></div>}
              </div>
            </div>

            {/* Customer Note */}
            {quotation.notes && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-sm text-amber-300">
                <span className="font-semibold">📝 Customer Note: </span>{quotation.notes}
              </div>
            )}

            {/* Products Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Products</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    allPriced
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {pricedCount}/{totalCount} priced
                  </span>
                </div>
                {isPending && (
                  <div className="flex gap-1.5">
                    <button type="button" onClick={expandAll} className="text-[10px] font-semibold text-slate-400 hover:text-slate-200 px-2 py-1 rounded-md hover:bg-slate-700 transition-colors">Expand All</button>
                    <button type="button" onClick={collapseAll} className="text-[10px] font-semibold text-slate-400 hover:text-slate-200 px-2 py-1 rounded-md hover:bg-slate-700 transition-colors">Collapse All</button>
                  </div>
                )}
              </div>

              {!allPriced && isPending && (
                <div className="flex items-center gap-2 mb-3 px-3 py-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <AlertCircle size={14} className="text-amber-400 shrink-0" />
                  <p className="text-xs text-amber-300">
                    <span className="font-bold">Price required for all products.</span> Open each product card and set the unit price. Quotation cannot be approved without pricing.
                  </p>
                </div>
              )}

              <div className="space-y-2">
                {defaultItems.map((it, idx) => (
                  <ProductPricingCard
                    key={idx}
                    item={it}
                    index={idx}
                    register={register}
                    watch={watch}
                    errors={errors}
                    expanded={!!expandedItems[idx]}
                    onToggle={() => toggleItem(idx)}
                  />
                ))}
              </div>
            </div>

            {/* Shipping & Valid Days */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Shipping Cost (SAR)</label>
                <input
                  type="number" min="0" step="0.01"
                  {...register('shipping', { min: { value: 0, message: 'Must be ≥ 0' } })}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Valid For (days)</label>
                <input
                  type="number" min="1" max="90"
                  {...register('validDays', {
                    required: 'Required',
                    min: { value: 1, message: 'At least 1 day' },
                    max: { value: 90, message: 'Max 90 days' },
                  })}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
                {errors.validDays && <p className="text-[10px] text-rose-400 mt-0.5">{errors.validDays.message}</p>}
              </div>
            </div>

            {/* Totals */}
            <div className="bg-slate-800/50 rounded-xl p-4 space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-400"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
              <div className="flex justify-between text-slate-400"><span>VAT (15%)</span><span>{fmt(tax)}</span></div>
              <div className="flex justify-between text-slate-400"><span>Shipping</span><span>{fmt(watchedShipping)}</span></div>
              <div className="flex justify-between font-bold text-white text-base border-t border-slate-700 pt-2 mt-2">
                <span>Grand Total</span><span className="text-emerald-400">{fmt(total)}</span>
              </div>
            </div>

            {/* Admin Note */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Note to Customer (optional)</label>
              <textarea
                rows={2}
                {...register('note')}
                placeholder="e.g. Prices valid for 7 days. Bulk discount applied."
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white resize-none focus:outline-none focus:border-emerald-500 placeholder-slate-600"
              />
            </div>

            {/* Reject inline form */}
            {showReject && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 space-y-3">
                <p className="text-xs font-semibold text-red-400">Reject this quotation</p>
                <input
                  value={rejectNote}
                  onChange={(e) => setRejectNote(e.target.value)}
                  placeholder="Reason for rejection (optional)"
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-400 placeholder-slate-600"
                />
                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowReject(false)} className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-700">Cancel</button>
                  <button type="button" onClick={handleReject} disabled={rejecting}
                    className="px-4 py-1.5 text-xs font-semibold bg-red-600 hover:bg-red-500 text-white rounded-lg disabled:opacity-60">
                    {rejecting ? 'Rejecting…' : 'Confirm Reject'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-4 px-6 py-4 border-t border-slate-700">
            <div className="flex items-center gap-2">
              {isPending && !showReject && (
                <button type="button" onClick={() => setShowReject(true)}
                  className="px-4 py-2 text-sm text-red-400 hover:text-red-300 rounded-lg hover:bg-red-500/10 transition-colors">
                  ✕ Reject
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-300 rounded-lg hover:bg-slate-700">Close</button>
              {isPending && (
                <button
                  type="submit"
                  disabled={loading || !allPriced}
                  title={!allPriced ? 'Set price for all products first' : 'Approve and send to customer'}
                  className={`flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg transition-colors ${
                    allPriced
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-60'
                      : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {loading ? <><Loader2 size={14} className="animate-spin" /> Approving…</> : '✅ Approve & Send'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════════════ */
export default function QuotationsAdminPage() {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [statsData, setStatsData] = useState({ total: 0, pending: 0, approved: 0, accepted: 0 });
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });

  const fetchQuotations = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: pagination.page, limit: pagination.limit };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const res = await quotationService.adminGetAll(params);
      const data = res?.data?.data ?? [];
      const pag = res?.data?.pagination ?? {};
      setQuotations(Array.isArray(data) ? data : []);
      setPagination((prev) => ({
        ...prev,
        total: pag.total ?? data.length,
        pages: pag.pages ?? 1,
        page: pag.page ?? prev.page,
      }));

      try {
        const statsRes = await quotationService.adminStats();
        const s = statsRes?.data?.data ?? {};
        setStatsData({
          total: s.total ?? data.length,
          pending: s.pending ?? data.filter((q) => q.status === 'pending').length,
          approved: s.approved ?? data.filter((q) => q.status === 'approved').length,
          accepted: s.accepted ?? data.filter((q) => q.status === 'accepted').length,
        });
      } catch {
        setStatsData({
          total: data.length,
          pending: data.filter((q) => q.status === 'pending').length,
          approved: data.filter((q) => q.status === 'approved').length,
          accepted: data.filter((q) => q.status === 'accepted').length,
        });
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load quotations');
      setQuotations([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search, pagination.page, pagination.limit]);

  useEffect(() => { fetchQuotations(); }, [fetchQuotations]);

  function handleApproveSubmit(id, data) {
    setQuotations((prev) =>
      prev.map((q) => {
        const qId = q.id || q._id;
        if (qId !== id) return q;
        return {
          ...q, ...data, status: 'approved',
          approvedAt: new Date().toISOString(),
          validUntil: new Date(Date.now() + (data.validDays || 7) * 86400000).toISOString(),
          adminNote: data.note || q.adminNote,
        };
      })
    );
    setStatsData((prev) => ({ ...prev, pending: Math.max(0, prev.pending - 1), approved: prev.approved + 1 }));
  }

  function handleReject(id, note) {
    setQuotations((prev) =>
      prev.map((q) => {
        const qId = q.id || q._id;
        if (qId !== id) return q;
        return { ...q, status: 'rejected', adminNote: note || q.adminNote };
      })
    );
    setStatsData((prev) => ({ ...prev, pending: Math.max(0, prev.pending - 1) }));
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Quotation Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">Review customer requests, set pricing per product, and approve quotations</p>
        </div>
        <button onClick={fetchQuotations} className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors">
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Requests" value={statsData.total} icon="📋" color={{ border: 'border-slate-700', from: 'from-slate-800/60', text: 'text-slate-200' }} />
        <StatCard label="Pending Review" value={statsData.pending} icon="⏳" color={{ border: 'border-amber-500/30', from: 'from-amber-500/10', text: 'text-amber-300' }} />
        <StatCard label="Approved" value={statsData.approved} icon="✅" color={{ border: 'border-emerald-500/30', from: 'from-emerald-500/10', text: 'text-emerald-300' }} />
        <StatCard label="Accepted by Customer" value={statsData.accepted} icon="🤝" color={{ border: 'border-sky-500/30', from: 'from-sky-500/10', text: 'text-sky-300' }} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by ID, company name, phone…"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500" />
        </div>
        <div className="flex gap-1 flex-wrap">
          {['all', 'pending', 'approved', 'accepted', 'rejected', 'expired'].map((s) => (
            <button key={s} onClick={() => { setStatusFilter(s); setPagination((p) => ({ ...p, page: 1 })); }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${statusFilter === s ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700'}`}>{s}</button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-slate-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-emerald-500" />
            <span className="ml-3 text-sm text-slate-400">Loading quotations…</span>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-800/80 text-[11px] text-slate-400 uppercase tracking-wider">
                <th className="px-4 py-3 text-left">Quotation ID</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Items</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {quotations.length === 0 ? (
                <tr><td colSpan={7} className="py-16 text-center text-slate-500">
                  <FileText size={36} className="mx-auto text-slate-600 mb-3" />
                  <p className="font-medium">No quotations found</p>
                  <p className="text-xs text-slate-600 mt-1">Customer quotation requests will appear here</p>
                </td></tr>
              ) : quotations.map((q) => {
                const qId = q.id || q._id;
                const isPending = q.status === 'pending';
                const customerDisplay = q.companyInfo?.companyName || q.customer?.name || '—';
                const customerSub = q.companyInfo?.contactPhone || q.customer?.email || '';
                return (
                  <tr key={qId} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3"><span className="font-mono text-xs font-bold text-emerald-400">{q.quotationNumber || qId}</span></td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-200 text-xs">{customerDisplay}</p>
                      <p className="text-slate-500 text-[11px]">{customerSub}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-slate-400 text-xs">{q.items?.length || 0} item{(q.items?.length || 0) > 1 ? 's' : ''}</p>
                      {q.items?.length > 0 && <p className="text-slate-600 text-[10px] truncate max-w-[140px]">{q.items.map((it) => it.name).join(', ')}</p>}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-200 text-xs">
                      {q.total > 0 ? fmt(q.total) : <span className="text-slate-500 italic">Pending</span>}
                    </td>
                    <td className="px-4 py-3 text-center"><StatusPill status={q.status} /></td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{dateFmt(q.createdAt)}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setSelected(q)}
                        className={`px-3 py-1.5 text-[11px] font-semibold rounded-md transition-colors ${
                          isPending
                            ? 'bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600'
                        }`}
                      >
                        {isPending ? <><DollarSign size={12} className="inline mr-0.5" /> Price & Review</> : <><Eye size={12} className="inline mr-0.5" /> View</>}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">Page {pagination.page} of {pagination.pages} · {pagination.total} total</p>
          <div className="flex gap-1">
            <button onClick={() => setPagination((p) => ({ ...p, page: Math.max(1, p.page - 1) }))} disabled={pagination.page <= 1}
              className="px-3 py-1.5 text-xs rounded-lg bg-slate-800 text-slate-300 border border-slate-700 disabled:opacity-40 hover:bg-slate-700"><ChevronLeft size={14} /></button>
            <button onClick={() => setPagination((p) => ({ ...p, page: Math.min(pagination.pages, p.page + 1) }))} disabled={pagination.page >= pagination.pages}
              className="px-3 py-1.5 text-xs rounded-lg bg-slate-800 text-slate-300 border border-slate-700 disabled:opacity-40 hover:bg-slate-700"><ChevronRight size={14} /></button>
          </div>
        </div>
      )}

      {/* Single unified modal — form for pending, read-only for others */}
      {selected && (
        <QuotationFormModal
          quotation={selected}
          onClose={() => setSelected(null)}
          onApprove={handleApproveSubmit}
          onReject={handleReject}
        />
      )}
    </div>
  );
}