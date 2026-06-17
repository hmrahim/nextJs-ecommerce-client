'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Check, Truck, Package, MapPin, Download, MessageSquare,
  X, Clock, ChevronLeft, AlertCircle, RefreshCw, CreditCard,
  ShoppingBag, Copy, CheckCheck
} from 'lucide-react';
import { orderService } from '@/services/orderService';
import { generateInvoicePDF } from '@/lib/invoiceGenerator';

/* ── Status helpers ─────────────────────────────────────────── */
const STATUS_STEPS = ['pending', 'confirmed', 'shipped', 'delivered'];
const STEP_LABELS  = { pending: 'Order Placed', confirmed: 'Confirmed', shipped: 'Out for Delivery', delivered: 'Delivered' };
const STEP_ICONS   = { pending: Clock, confirmed: Check, shipped: Truck, delivered: CheckCheck };

const STATUS_BADGE = {
  pending:   'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  shipped:   'bg-sky-100 text-sky-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-rose-100 text-rose-700',
  refunded:  'bg-purple-100 text-purple-700',
};

const PAYMENT_METHOD_LABELS = {
  cod: 'Cash on Delivery', bkash: 'bKash', nagad: 'Nagad',
  rocket: 'Rocket', card: 'Card', bank: 'Bank Transfer', online: 'Online Payment',
};

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-SA', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatShortDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-SA', { day: 'numeric', month: 'short', year: 'numeric' });
}

/* ── Cancel confirmation modal ────────────────────────────── */
function CancelModal({ onConfirm, onClose, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
        <h3 className="text-lg font-bold text-slate-900">Order Cancel will do?</h3>
        <p className="mt-2 text-sm text-slate-600">once cancel if done, then no more undo cannot be done।</p>
        <div className="mt-5 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-slate-50">no, let it be</button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 disabled:opacity-60"
          >
            {loading ? 'Cancelling...' : 'Yes, Cancel do'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const router  = useRouter();
  const [order,    setOrder]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [canceling, setCanceling] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [copied,   setCopied]   = useState(false);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);

  const handleDownloadInvoice = async () => {
    if (!order || downloadingInvoice) return;
    try {
      setDownloadingInvoice(true);
      generateInvoicePDF(order);
    } catch (e) {
      console.error('Invoice generate failed:', e);
      alert('Invoice download failed. Please try again.');
    } finally {
      setDownloadingInvoice(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await orderService.getById(id);
        setOrder(res.data?.data);
      } catch (err) {
        setError(err?.response?.data?.message || 'Order details load could not be done।');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleCancel = async () => {
    setCanceling(true);
    try {
      const res = await orderService.cancelOrder(id);
      setOrder(res.data?.data);
      setShowModal(false);
    } catch (err) {
      alert(err?.response?.data?.message || 'Cancel could not be done।');
    } finally {
      setCanceling(false);
    }
  };

  const copyOrderNumber = () => {
    if (!order?.orderNumber) return;
    navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* ── Loading ─── */
  if (loading) return (
    <div className="bg-white rounded-2xl border border-border p-16 text-center">
      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
      <p className="mt-3 text-sm text-slate-500">Order details loading is happening...</p>
    </div>
  );

  /* ── Error ─── */
  if (error) return (
    <div className="bg-white rounded-2xl border border-border p-12 text-center">
      <AlertCircle className="mx-auto w-10 h-10 text-rose-400" />
      <p className="mt-3 font-semibold text-slate-700">{error}</p>
      <div className="mt-4 flex justify-center gap-3">
        <button onClick={() => router.back()} className="px-4 py-2 rounded-lg border border-border text-sm font-semibold hover:bg-slate-50">
          <ChevronLeft className="inline w-4 h-4 mr-1" /> Back
        </button>
        <button onClick={() => window.location.reload()} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold">
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    </div>
  );

  if (!order) return null;

  /* ── Progress bar ─── */
  const isCancelled = order.status === 'cancelled' || order.status === 'refunded';
  const currentStep = isCancelled ? -1 : STATUS_STEPS.indexOf(order.status);

  const addr = order.shippingAddress;
  const fullAddr = [addr?.houseNo, addr?.road, addr?.area, addr?.city, addr?.postalCode]
    .filter(Boolean).join(', ') || addr?.mapAddress || '—';

  return (
    <>
      {showModal && (
        <CancelModal
          onConfirm={handleCancel}
          onClose={() => setShowModal(false)}
          loading={canceling}
        />
      )}

      <div className="space-y-6">
        {/* ── Header card ── */}
        <div className="bg-white rounded-2xl border border-border p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <Link href="/account/orders" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-orange-600">
                <ChevronLeft className="w-3.5 h-3.5" /> All Orders
              </Link>
              <div className="mt-1 flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900">{order.orderNumber}</h1>
                <button onClick={copyOrderNumber} title="Copy order number" className="text-slate-400 hover:text-slate-600">
                  {copied ? <CheckCheck className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-sm text-slate-500">
                Placed {formatShortDate(order.createdAt)}
                {order.deliveredAt && ` · Delivered ${formatShortDate(order.deliveredAt)}`}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <span className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize ${STATUS_BADGE[order.status] || 'bg-slate-100 text-slate-600'}`}>
                {order.status}
              </span>
              {['pending', 'confirmed'].includes(order.status) && (
                <button
                  onClick={() => setShowModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 text-xs font-semibold hover:bg-rose-50"
                >
                  <X className="w-3.5 h-3.5" /> Cancel Order
                </button>
              )}
            </div>
          </div>

          {/* ── Progress stepper ── */}
          {!isCancelled && (
            <div className="mt-6 overflow-x-auto">
              <ol className="grid grid-cols-4 gap-2 min-w-[480px]">
                {STATUS_STEPS.map((step, i) => {
                  const Icon = STEP_ICONS[step];
                  const done = i < currentStep;
                  const active = i === currentStep;
                  return (
                    <li key={step} className="text-center">
                      <div className="relative flex items-center justify-center">
                        {i > 0 && (
                          <div className={`absolute right-1/2 top-4.5 h-0.5 w-full -translate-y-1/2 ${done ? 'bg-orange-500' : 'bg-slate-200'}`} />
                        )}
                        <div className={`relative z-10 mx-auto w-10 h-10 rounded-full flex items-center justify-center shadow-sm
                          ${done ? 'bg-orange-500 text-white' : active ? 'bg-orange-500 text-white ring-4 ring-orange-100' : 'bg-slate-100 text-slate-400'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                      </div>
                      <p className={`mt-2 text-[11px] font-medium ${i <= currentStep ? 'text-slate-900' : 'text-slate-400'}`}>
                        {STEP_LABELS[step]}
                      </p>
                      {step === 'confirmed' && order.rider?.riderName && i <= currentStep && (
                        <p className="text-[10px] text-slate-500 mt-0.5">{order.rider.riderName}</p>
                      )}
                    </li>
                  );
                })}
              </ol>
            </div>
          )}

          {isCancelled && (
            <div className="mt-5 flex items-center gap-3 p-4 bg-rose-50 rounded-xl border border-rose-100">
              <X className="w-5 h-5 text-rose-500 flex-shrink-0" />
              <div>
                <p className="font-semibold text-rose-700 capitalize">{order.status}</p>
                {order.cancelledAt && <p className="text-xs text-rose-500">{formatDate(order.cancelledAt)} on date cancel has been।</p>}
              </div>
            </div>
          )}
        </div>

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items list */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-border overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-slate-500" />
                <h2 className="font-bold text-slate-900">Order Items ({order.items?.length})</h2>
              </div>
              <div className="divide-y divide-border">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="p-4 flex items-center gap-4">
                    <div className="relative w-16 h-16 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.productImage ? (
                        <Image src={item.productImage} alt={item.productName} fill className="object-cover" sizes="64px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-7 h-7 text-slate-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm line-clamp-2">{item.productName}</p>
                      {item.variantAttrs && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          {Object.entries(item.variantAttrs).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                        </p>
                      )}
                      <p className="text-xs text-slate-500 mt-0.5">Qty {item.quantity} × SAR {item.unitPrice?.toLocaleString()}</p>
                    </div>
                    <p className="font-bold text-slate-900 flex-shrink-0">SAR {item.lineTotal?.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Status history */}
            {order.statusHistory?.length > 0 && (
              <div className="bg-white rounded-2xl border border-border overflow-hidden">
                <div className="px-5 py-4 border-b border-border">
                  <h2 className="font-bold text-slate-900">Order Timeline</h2>
                </div>
                <div className="p-5 space-y-4">
                  {[...order.statusHistory].reverse().map((h, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-orange-400 mt-1.5 flex-shrink-0" />
                        {i < order.statusHistory.length - 1 && <div className="w-px flex-1 bg-slate-100 mt-1" />}
                      </div>
                      <div className="pb-4">
                        <p className="text-sm font-semibold capitalize text-slate-800">{h.status}</p>
                        {h.note && <p className="text-xs text-slate-500 mt-0.5">{h.note}</p>}
                        <p className="text-xs text-slate-400 mt-0.5">{formatDate(h.changedAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-4">
            {/* Order summary */}
            <div className="bg-white rounded-2xl border border-border p-5">
              <h3 className="font-bold text-slate-900 mb-3">Order Summary</h3>
              <dl className="text-sm space-y-2">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Subtotal ({order.items?.length} items)</dt>
                  <dd>SAR {order.subtotal?.toLocaleString()}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Shipping</dt>
                  <dd>{order.shippingCost === 0 ? <span className="text-emerald-600 font-medium">Free</span> : `SAR ${order.shippingCost}`}</dd>
                </div>
                {order.couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <dt>Coupon {order.couponCode && `(${order.couponCode})`}</dt>
                    <dd>-SAR {order.couponDiscount?.toLocaleString()}</dd>
                  </div>
                )}
                <div className="flex justify-between border-t border-border pt-2 font-bold text-base">
                  <dt>Total</dt>
                  <dd className="text-emerald-700">SAR {order.total?.toLocaleString()}</dd>
                </div>
              </dl>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-2xl border border-border p-5">
              <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> Payment
              </h3>
              <div className="text-sm space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Method</span>
                  <span className="font-medium">{PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status</span>
                  <span className={`font-semibold capitalize ${order.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {order.paymentStatus || '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* Shipping address */}
            <div className="bg-white rounded-2xl border border-border p-5">
              <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Delivery Address
              </h3>
              <div className="text-sm text-slate-600 space-y-1">
                <p className="font-semibold text-slate-800">{addr?.firstName} {addr?.lastName}</p>
                {addr?.phone && <p>{addr.phone}</p>}
                <p>{fullAddr}</p>
                {addr?.landmark && <p className="text-slate-500">Landmark: {addr.landmark}</p>}
                {addr?.note && <p className="text-slate-500">Note: {addr.note}</p>}
              </div>
            </div>

            {/* Rider info — if assigned */}
            {order.rider?.riderName && (
              <div className="bg-white rounded-2xl border border-border p-5">
                <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Truck className="w-4 h-4" /> Delivery Rider
                </h3>
                <div className="text-sm space-y-1.5 text-slate-600">
                  <p className="font-semibold text-slate-800">{order.rider.riderName}</p>
                  {order.rider.riderPhone && <p>{order.rider.riderPhone}</p>}
                  {order.rider.vehicleType && <p className="capitalize text-slate-500">{order.rider.vehicleType}</p>}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <button
                onClick={handleDownloadInvoice}
                disabled={downloadingInvoice}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold shadow-sm hover:from-orange-600 hover:to-orange-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                {downloadingInvoice ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" /> Download Invoice
                  </>
                )}
              </button>
              <Link
                href="/contact"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-slate-50"
              >
                <MessageSquare className="w-4 h-4" /> Support
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
