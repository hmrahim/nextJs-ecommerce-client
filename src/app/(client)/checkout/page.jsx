'use client';
/**
 * 📁 src/app/(client)/checkout/page.jsx
 *
 * Multi-step checkout with live map location picker.
 * Steps: Address (with map) → Delivery → Payment → Confirm
 */

import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  CreditCard, Wallet, Banknote, Truck, ShieldCheck,
  MapPin, Loader2, CheckCircle2, Tag, ChevronRight,
  User, Package, ArrowLeft, Navigation, Search,
  Plus, X, Home, Building2, Edit3,
} from 'lucide-react';

import { useCart, CART_KEY } from '@/hooks/useCart';
import { useCouponStore } from '@/store/couponStore';
import { orderService } from '@/services/orderService';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const FREE_SHIP_THRESHOLD = 999;

/* ═══════════════════════════════════════════════════════════════
   MAP COMPONENT  (loaded client-side only — no SSR)
   Uses Leaflet via CDN loaded in useEffect
═══════════════════════════════════════════════════════════════ */
function LocationPickerMap({ value, onChange }) {
  const mapRef    = useRef(null);
  const leafletRef = useRef(null);    // L instance
  const mapObjRef  = useRef(null);    // map instance
  const markerRef  = useRef(null);    // draggable marker
  const [loading,  setLoading]  = useState(true);
  const [locating, setLocating] = useState(false);
  const [search,   setSearch]   = useState('');
  const [searching, setSearching] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const searchTimer = useRef(null);

  /* ── Load Leaflet CSS + JS from CDN ── */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadLeaflet = async () => {
      // inject CSS
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id   = 'leaflet-css';
        link.rel  = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // inject JS
      if (!window.L) {
        await new Promise((res, rej) => {
          const s   = document.createElement('script');
          s.src     = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          s.onload  = res;
          s.onerror = rej;
          document.head.appendChild(s);
        });
      }

      const L = window.L;
      leafletRef.current = L;

      if (mapObjRef.current) return; // already init

      const defaultLat = value?.lat ?? 23.8103;
      const defaultLng = value?.lng ?? 90.4125; // Dhaka

      const map = L.map(mapRef.current, { zoomControl: true }).setView([defaultLat, defaultLng], 14);
      mapObjRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      /* custom pin icon */
      const icon = L.divIcon({
        className: '',
        html: `<div style="
          width:36px;height:36px;border-radius:50% 50% 50% 0;
          background:#16a34a;border:3px solid #fff;
          box-shadow:0 2px 8px rgba(0,0,0,.35);
          transform:rotate(-45deg);
          display:flex;align-items:center;justify-content:center;">
          <div style="width:10px;height:10px;background:#fff;border-radius:50%;transform:rotate(45deg)"></div>
        </div>`,
        iconSize:   [36, 36],
        iconAnchor: [18, 36],
      });

      const marker = L.marker([defaultLat, defaultLng], { draggable: true, icon }).addTo(map);
      markerRef.current = marker;

      const reverseGeocode = async (lat, lng) => {
        try {
          const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const d = await r.json();
          return d.display_name ?? '';
        } catch { return ''; }
      };

      const updateLocation = async (lat, lng) => {
        const address = await reverseGeocode(lat, lng);
        onChange({ lat, lng, address });
      };

      marker.on('dragend', () => {
        const { lat, lng } = marker.getLatLng();
        updateLocation(lat, lng);
      });

      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        updateLocation(lat, lng);
      });

      if (!value?.lat) updateLocation(defaultLat, defaultLng);
      setLoading(false);
    };

    loadLeaflet().catch(() => setLoading(false));
    return () => { /* cleanup handled by ref checks */ };
  }, []);  // eslint-disable-line

  /* ── GPS locate ── */
  const handleLocate = useCallback(() => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const { latitude: lat, longitude: lng } = coords;
        mapObjRef.current?.setView([lat, lng], 16);
        markerRef.current?.setLatLng([lat, lng]);
        try {
          const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const d = await r.json();
          onChange({ lat, lng, address: d.display_name ?? '' });
        } catch { onChange({ lat, lng, address: '' }); }
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [onChange]);

  /* ── Search (Nominatim) ── */
  const handleSearch = useCallback((q) => {
    setSearch(q);
    clearTimeout(searchTimer.current);
    if (q.length < 3) { setSuggestions([]); return; }
    setSearching(true);
    searchTimer.current = setTimeout(async () => {
      try {
        const r = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&countrycodes=bd`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const list = await r.json();
        setSuggestions(list);
      } catch { setSuggestions([]); }
      setSearching(false);
    }, 500);
  }, []);

  const pickSuggestion = useCallback((item) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    mapObjRef.current?.setView([lat, lng], 16);
    markerRef.current?.setLatLng([lat, lng]);
    onChange({ lat, lng, address: item.display_name });
    setSuggestions([]);
    setSearch(item.display_name);
  }, [onChange]);

  return (
    <div className="space-y-2">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="area / Find route…"
          className="w-full rounded-lg border border-border bg-background pl-9 pr-4 py-2.5 text-sm
            outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
        />
        {searching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
        {suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1 z-[1000] rounded-xl border border-border bg-card shadow-xl overflow-hidden">
            {suggestions.map((s, i) => (
              <button key={i} onClick={() => pickSuggestion(s)}
                className="w-full flex items-start gap-2 px-3 py-2.5 hover:bg-emerald-50 transition-colors text-left border-b border-border last:border-0">
                <MapPin className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span className="text-xs leading-snug line-clamp-2">{s.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map container */}
      <div className="relative rounded-xl overflow-hidden border border-border shadow-sm" style={{ height: 280 }}>
        {loading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-muted/80 gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            <span className="text-xs text-muted-foreground">Map is loading…</span>
          </div>
        )}
        <div ref={mapRef} className="h-full w-full" />

        {/* GPS button */}
        <button
          onClick={handleLocate}
          disabled={locating}
          className="absolute bottom-3 right-3 z-[500] flex items-center gap-1.5 rounded-lg
            bg-white border border-border shadow-md px-3 py-2 text-xs font-semibold
            hover:bg-emerald-50 hover:border-emerald-400 hover:text-emerald-700
            disabled:opacity-60 transition-all"
        >
          {locating
            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
            : <Navigation className="h-3.5 w-3.5 text-emerald-600" />}
          My location
        </button>

        {/* hint */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[500] pointer-events-none">
          <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-[11px] font-medium text-muted-foreground shadow border border-border whitespace-nowrap">
            📍 Pin The drag do or map In click do
          </div>
        </div>
      </div>

      {/* Selected address display */}
      {value?.address && (
        <div className="flex items-start gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2.5">
          <MapPin className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-emerald-800 leading-snug">{value.address}</p>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STEP CONFIG
═══════════════════════════════════════════════════════════════ */
const STEPS = [
  { id: 1, key: 'address',  label: 'Address',  icon: <MapPin     className="h-4 w-4" /> },
  { id: 2, key: 'delivery', label: 'Delivery', icon: <Truck      className="h-4 w-4" /> },
  { id: 3, key: 'payment',  label: 'Payment',  icon: <CreditCard className="h-4 w-4" /> },
  { id: 4, key: 'confirm',  label: 'Confirm',  icon: <CheckCircle2 className="h-4 w-4" /> },
];

const DELIVERY_OPTIONS = [
  { id: 'standard', label: 'Standard Delivery', sub: '3–5 business days', price: 0,   badge: null },
  { id: 'express',  label: 'Express Delivery',   sub: '1–2 business days', price: 120, badge: 'Popular' },
  { id: 'sameday',  label: 'Same-Day Delivery',  sub: 'Order before 12 PM', price: 200, badge: 'Fastest' },
];

const PAYMENT_OPTIONS = [
  { id: 'card', icon: <CreditCard className="h-5 w-5" />, label: 'Credit / Debit Card', sub: 'Visa, Mastercard, AMEX' },
  { id: 'mfs',  icon: <Wallet     className="h-5 w-5" />, label: 'Mobile Banking',       sub: 'bKash, Nagad, Rocket' },
  { id: 'cod',  icon: <Banknote   className="h-5 w-5" />, label: 'Cash on Delivery',     sub: 'Pay when you receive' },
  { id: 'bank', icon: '🏦',                               label: 'Bank Transfer',         sub: 'Direct bank payment' },
];

/* ═══════════════════════════════════════════════════════════════
   SHARED SMALL COMPONENTS
═══════════════════════════════════════════════════════════════ */
function Field({ label, placeholder, full, type = 'text', value, onChange, required, ...rest }) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <label className="block text-xs font-semibold text-muted-foreground mb-1">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      <input
        type={type} value={value ?? ''} onChange={onChange}
        className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none
          focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
        placeholder={placeholder || label}
        {...rest}
      />
    </div>
  );
}

function StepBar({ current }) {
  return (
    <div className="flex items-center w-full">
      {STEPS.map((step, idx) => {
        const done    = step.id < current;
        const active  = step.id === current;
        return (
          <div key={step.id} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <div className={`h-9 w-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 text-sm font-bold
                ${done   ? 'bg-emerald-600 border-emerald-600 text-white' : ''}
                ${active ? 'bg-white border-emerald-600 text-emerald-700 shadow-md shadow-emerald-200' : ''}
                ${!done && !active ? 'bg-muted border-border text-muted-foreground' : ''}`}
              >
                {done ? <CheckCircle2 className="h-5 w-5" /> : step.id}
              </div>
              <span className={`hidden sm:block text-[11px] font-semibold whitespace-nowrap
                ${active ? 'text-emerald-700' : done ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`h-0.5 flex-1 mx-1 transition-all duration-500 ${done ? 'bg-emerald-500' : 'bg-border'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ORDER SUMMARY SIDEBAR
═══════════════════════════════════════════════════════════════ */
function OrderSummary({ items, subtotal, shippingCost, coupon, couponDiscount, total }) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="px-5 py-4 bg-muted/40 border-b border-border">
        <h3 className="font-display text-base font-bold flex items-center gap-2">
          <Package className="h-4 w-4 text-emerald-600" />
          Your Order
          <span className="ml-auto text-xs font-normal text-muted-foreground bg-background border border-border rounded-full px-2 py-0.5">
            {items.reduce((s, i) => s + i.quantity, 0)} items
          </span>
        </h3>
      </div>

      <div className="px-5 py-3 space-y-3 max-h-52 overflow-y-auto">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Cart empty।{' '}<Link href="/cart" className="text-emerald-600 underline">Cart Go to</Link>
          </p>
        ) : items.map((it) => (
          <div key={it.key} className="flex gap-3 items-start">
            <div className="relative flex-shrink-0">
              <img src={it.product.image || '/placeholder.png'}
                className="h-12 w-12 rounded-lg object-cover bg-muted" alt={it.product.name} />
              <span className="absolute -top-1.5 -right-1.5 grid h-5 w-5 place-items-center rounded-full bg-emerald-600 text-[10px] font-bold text-white ring-2 ring-white">
                {it.quantity}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium line-clamp-2 leading-snug">{it.product.name}</p>
              {it.variant?.attrs && (
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {Object.entries(it.variant.attrs).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                </p>
              )}
            </div>
            <span className="text-sm font-bold text-emerald-700 whitespace-nowrap">
              SAR {it.lineTotal.toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      {coupon && (
        <div className="mx-5 mb-3 flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
          <Tag className="h-3.5 w-3.5" />{coupon.code} — {coupon.label}
        </div>
      )}

      <div className="px-5 py-4 border-t border-border space-y-2 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span><span>SAR {subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Shipping</span>
          <span className={shippingCost === 0 ? 'text-emerald-700 font-semibold' : ''}>
            {shippingCost === 0 ? 'FREE' : `SAR ${shippingCost}`}
          </span>
        </div>
        {couponDiscount > 0 && (
          <div className="flex justify-between text-emerald-700 font-semibold">
            <span>Coupon discount</span><span>-SAR {couponDiscount.toLocaleString()}</span>
          </div>
        )}
        <div className="flex justify-between border-t border-border pt-3 font-bold text-base">
          <span>Total</span>
          <span className="text-emerald-700">SAR {total.toLocaleString()}</span>
        </div>
      </div>

      {couponDiscount > 0 && (
        <div className="mx-5 mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 text-center">
          🎉 Coupon At SAR {couponDiscount.toLocaleString()} save!
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STEP 1 — ADDRESS  (with map + optional extra address)
═══════════════════════════════════════════════════════════════ */
function StepAddress({ form, setForm, onNext }) {
  const [showExtra, setShowExtra] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const setLocation = useCallback(
    (loc) => setForm((f) => ({ ...f, location: loc })),
    [setForm]
  );

  /* location is REQUIRED; name + phone also required */
  const valid = form.location?.lat && form.firstName && form.lastName && form.phone;

  const addrTypes = [
    { key: 'home',   icon: <Home      className="h-3.5 w-3.5" />, label: '🏠 Home'   },
    { key: 'office', icon: <Building2 className="h-3.5 w-3.5" />, label: '🏢 Office' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">

      {/* ── 1. Map location picker ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-bold">1</span>
          <h2 className="text-sm font-bold uppercase tracking-wider">
            Choose delivery location <span className="text-rose-500">*</span>
          </h2>
        </div>
        <LocationPickerMap value={form.location} onChange={setLocation} />
        {!form.location?.lat && (
          <p className="mt-2 text-xs text-rose-500 font-medium flex items-center gap-1">
            ⚠ Map Your correct location in this mark Do — it is required for delivery।
          </p>
        )}
      </div>

      {/* ── 2. Contact info ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-bold">2</span>
          <h2 className="text-sm font-bold uppercase tracking-wider">Contact information</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="First Name" value={form.firstName} onChange={set('firstName')} required />
          <Field label="Last Name"  value={form.lastName}  onChange={set('lastName')}  required />
          <Field label="Phone" type="tel" placeholder="+880 1XXX-XXXXXX"
            value={form.phone} onChange={set('phone')} required />
          <Field label="Email (optional)" type="email" placeholder="you@example.com"
            value={form.email} onChange={set('email')} />
        </div>
      </div>

      {/* ── 3. Extra address (optional) ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted border border-border text-muted-foreground text-xs font-bold">3</span>
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Additional address</h2>
          <span className="text-xs text-muted-foreground">(optional)</span>
        </div>

        {!showExtra ? (
          <button
            onClick={() => setShowExtra(true)}
            className="flex items-center gap-2 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/50
              px-4 py-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 hover:border-emerald-500
              transition-all w-full justify-center group"
          >
            <Plus className="h-4 w-4 group-hover:scale-110 transition-transform" />
            Flat number / Floor / Lane — extra details Add
          </button>
        ) : (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-4 space-y-3
            animate-in fade-in slide-in-from-top-2 duration-200">
            {/* address type chips */}
            <div className="flex gap-2">
              {addrTypes.map(({ key, label }) => (
                <button key={key}
                  onClick={() => setForm((f) => ({ ...f, addrType: key }))}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors
                    ${form.addrType === key
                      ? 'border-emerald-600 bg-emerald-600 text-white'
                      : 'border-border hover:border-emerald-400 bg-white'}`}>
                  {label}
                </button>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="home / Flat number" placeholder="such as: Flat 3B, House 12"
                value={form.houseNo} onChange={set('houseNo')} full />
              <Field label="Road / Lane" placeholder="such as: Road 5, Dhanmondi"
                value={form.road} onChange={set('road')} />
              <Field label="area / police station" placeholder="such as: Mohammadpur"
                value={form.area} onChange={set('area')} />
              <Field label="City" placeholder="Dhaka"
                value={form.city} onChange={set('city')} />
              <Field label="Postal Code" placeholder="1207"
                value={form.postal} onChange={set('postal')} />
              <Field label="Landmark" placeholder="Nearby familiar places"
                value={form.landmark} onChange={set('landmark')} />
              <Field label="Delivery Note" placeholder="If the gate is closed call do…"
                full value={form.note} onChange={set('note')} />
            </div>

            <button onClick={() => setShowExtra(false)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-rose-600 transition-colors">
              <X className="h-3.5 w-3.5" /> Close
            </button>
          </div>
        )}
      </div>

      {/* ── Next ── */}
      <button
        onClick={onNext}
        disabled={!valid}
        className="w-full rounded-xl bg-emerald-600 py-3.5 font-bold text-white hover:bg-emerald-700
          disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-sm"
      >
        Delivery Method Choose <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STEP 2 — DELIVERY
═══════════════════════════════════════════════════════════════ */
function StepDelivery({ delivery, setDelivery, freeShip, onNext, onBack }) {
  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
      <div>
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <Truck className="h-4 w-4" /> Delivery Method Choose
        </h2>
        <div className="space-y-3">
          {DELIVERY_OPTIONS.map((d) => (
            <label key={d.id}
              className={`flex items-center justify-between rounded-xl border-2 p-4 cursor-pointer transition-all duration-200
                ${delivery === d.id
                  ? 'border-emerald-600 bg-emerald-50/70 shadow-sm shadow-emerald-100'
                  : 'border-border hover:border-emerald-300 bg-card'}`}>
              <div className="flex items-center gap-3">
                <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all
                  ${delivery === d.id ? 'border-emerald-600' : 'border-border'}`}>
                  {delivery === d.id && <div className="h-2.5 w-2.5 rounded-full bg-emerald-600" />}
                </div>
                <input type="radio" name="delivery" value={d.id}
                  checked={delivery === d.id} onChange={() => setDelivery(d.id)} className="sr-only" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{d.label}</span>
                    {d.badge && (
                      <span className="rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5">
                        {d.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{d.sub}</div>
                </div>
              </div>
              <span className={`font-bold text-sm ${d.price === 0 || freeShip ? 'text-emerald-700' : ''}`}>
                {d.price === 0 || freeShip ? 'FREE' : `SAR ${d.price}`}
              </span>
            </label>
          ))}
        </div>
        {freeShip && (
          <p className="mt-3 text-xs text-emerald-700 font-semibold bg-emerald-50 rounded-lg px-3 py-2 text-center">
            🎉 Your order In free shipping is!
          </p>
        )}
      </div>
      <div className="flex gap-3">
        <button onClick={onBack}
          className="flex items-center gap-1.5 rounded-xl border border-border px-4 py-3.5 text-sm font-semibold hover:bg-muted/60 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button onClick={onNext}
          className="flex-1 rounded-xl bg-emerald-600 py-3.5 font-bold text-white hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-sm">
          Payment Method Choose <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STEP 3 — PAYMENT
═══════════════════════════════════════════════════════════════ */
function StepPayment({ payment, setPayment, cardForm, setCardForm, onNext, onBack }) {
  const setCard = (k) => (e) => setCardForm((f) => ({ ...f, [k]: e.target.value }));
  const valid = payment !== 'card' || (cardForm.number && cardForm.expiry && cardForm.cvv);

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
      <div>
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <CreditCard className="h-4 w-4" /> Payment Method
        </h2>
        <div className="space-y-2">
          {PAYMENT_OPTIONS.map((p) => (
            <label key={p.id}
              className={`flex items-center gap-3 rounded-xl border-2 p-4 cursor-pointer transition-all duration-200
                ${payment === p.id
                  ? 'border-emerald-600 bg-emerald-50/70 shadow-sm shadow-emerald-100'
                  : 'border-border hover:border-emerald-300 bg-card'}`}>
              <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0
                ${payment === p.id ? 'border-emerald-600' : 'border-border'}`}>
                {payment === p.id && <div className="h-2.5 w-2.5 rounded-full bg-emerald-600" />}
              </div>
              <input type="radio" name="pay" value={p.id}
                checked={payment === p.id} onChange={() => setPayment(p.id)} className="sr-only" />
              <span className={`text-lg ${typeof p.icon === 'string' ? '' : 'text-emerald-700'}`}>{p.icon}</span>
              <div>
                <div className="font-semibold text-sm">{p.label}</div>
                <div className="text-[11px] text-muted-foreground">{p.sub}</div>
              </div>
            </label>
          ))}
        </div>

        {payment === 'card' && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-3
            animate-in fade-in slide-in-from-top-2 duration-200">
            <p className="text-xs font-semibold text-muted-foreground">Card Details</p>
            <Field label="Card Number" placeholder="1234 5678 9012 3456" full
              value={cardForm.number} onChange={setCard('number')} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Expiry" placeholder="MM / YY" value={cardForm.expiry} onChange={setCard('expiry')} />
              <Field label="CVV" placeholder="•••" value={cardForm.cvv} onChange={setCard('cvv')} />
            </div>
            <Field label="Cardholder Name" placeholder="John Doe" full
              value={cardForm.name} onChange={setCard('name')} />
          </div>
        )}
        {payment === 'mfs' && (
          <div className="mt-4 rounded-xl border border-pink-200 bg-pink-50/50 p-4 text-xs text-pink-800 space-y-1
            animate-in fade-in slide-in-from-top-2 duration-200">
            <p className="font-bold">Mobile Banking Instructions</p>
            <p>Order confirm If so, to your number payment link will be sent।</p>
          </div>
        )}
      </div>
      <div className="flex gap-3">
        <button onClick={onBack}
          className="flex items-center gap-1.5 rounded-xl border border-border px-4 py-3.5 text-sm font-semibold hover:bg-muted/60 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button onClick={onNext} disabled={!valid}
          className="flex-1 rounded-xl bg-emerald-600 py-3.5 font-bold text-white hover:bg-emerald-700
            disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-sm">
          Order Review do <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STEP 4 — CONFIRM
═══════════════════════════════════════════════════════════════ */
function StepConfirm({ form, delivery, payment, total, shippingCost, couponDiscount, onPlace, placing, onBack }) {
  const dOpt = DELIVERY_OPTIONS.find((d) => d.id === delivery);
  const pOpt = PAYMENT_OPTIONS.find((p) => p.id === payment);

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
      <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Order Review
      </h2>

      <div className="grid gap-3 sm:grid-cols-2">
        {/* location */}
        <div className="rounded-xl border border-border bg-muted/30 p-4 sm:col-span-2">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">📍 Delivery location</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{form.location?.address}</p>
          {form.houseNo && (
            <p className="text-xs font-medium mt-1">
              {[form.houseNo, form.road, form.area, form.city].filter(Boolean).join(', ')}
            </p>
          )}
          {form.landmark && <p className="text-[11px] text-muted-foreground mt-0.5">Landmark: {form.landmark}</p>}
          {form.note && <p className="text-[11px] text-amber-700 mt-0.5">📝 {form.note}</p>}
        </div>

        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">👤 contact</p>
          <p className="font-semibold text-sm">{form.firstName} {form.lastName}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{form.phone}</p>
          {form.email && <p className="text-xs text-muted-foreground">{form.email}</p>}
        </div>

        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">🚚 Delivery</p>
          <p className="font-semibold text-sm">{dOpt?.label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{dOpt?.sub}</p>
          <p className="mt-1.5 text-xs font-bold text-emerald-700">
            {shippingCost === 0 ? 'FREE' : `SAR ${shippingCost}`}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">💳 Payment</p>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-emerald-700">{pOpt?.icon}</span>
          <span className="font-semibold text-sm">{pOpt?.label}</span>
        </div>
        <div className="space-y-1.5 border-t border-border pt-3 text-sm">
          {couponDiscount > 0 && (
            <div className="flex justify-between text-emerald-700 font-semibold">
              <span>Coupon discount</span><span>-SAR {couponDiscount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between text-muted-foreground">
            <span>Shipping</span>
            <span>{shippingCost === 0 ? 'FREE' : `SAR ${shippingCost}`}</span>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-2 font-bold text-base">
            <span>Total to pay</span>
            <span className="text-emerald-700 text-xl">SAR {total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack}
          className="flex items-center gap-1.5 rounded-xl border border-border px-4 py-3.5 text-sm font-semibold hover:bg-muted/60 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button onClick={onPlace} disabled={placing}
          className="flex-1 rounded-xl bg-amber-400 py-3.5 font-bold text-emerald-950 hover:bg-amber-300
            disabled:opacity-60 transition-all flex items-center justify-center gap-2 shadow-md shadow-amber-200 text-base">
          {placing
            ? <><Loader2 className="h-5 w-5 animate-spin" /> Please wait…</>
            : '✓ Order Confirm do'}
        </button>
      </div>

      <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck className="h-4 w-4 text-emerald-600" />
        256-bit SSL Encrypted · Secure Checkout
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════ */
export default function CheckoutPage() {
  const router     = useRouter();
  const qc         = useQueryClient();
  const { data, isLoading } = useCart();
  const { coupon, removeCoupon } = useCouponStore();

  const items    = data?.items    ?? [];
  const subtotal = data?.subtotal ?? 0;

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    email: '', phone: '', firstName: '', lastName: '',
    location: null,           // { lat, lng, address }
    addrType: 'home',
    houseNo: '', road: '', area: '', city: '', postal: '',
    landmark: '', note: '',
  });
  const [delivery, setDelivery] = useState('standard');
  const [payment,  setPayment]  = useState('card');
  const [cardForm, setCardForm] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [placing,  setPlacing]  = useState(false);

  const couponDiscount = coupon?.discount ?? 0;
  const freeShip       = coupon?.type === 'shipping' || subtotal >= FREE_SHIP_THRESHOLD;
  const deliveryCost   = DELIVERY_OPTIONS.find((d) => d.id === delivery)?.price ?? 0;
  const shippingCost   = freeShip ? 0 : deliveryCost;
  const total          = Math.max(0, subtotal + shippingCost - couponDiscount);

  const handlePlaceOrder = async () => {
    if (placing) return;
    setPlacing(true);

    // ── Build order payload ───────────────────────────────────
    const orderPayload = {
      // Line items — product snapshot (name/image saved at order time)
      items: items.map((i) => ({
        productId:   i.productId,
        variantSku:  i.variantSku || 'default',
        productName: i.product.name,
        productImage:i.product.image || '',
        variantAttrs:i.variant?.attrs ?? null,
        quantity:    i.quantity,
        unitPrice:   i.price,
        lineTotal:   i.lineTotal,
      })),

      // Shipping address
      shippingAddress: {
        firstName: form.firstName.trim(),
        lastName:  form.lastName.trim(),
        phone:     form.phone.trim(),
        email:     form.email.trim() || null,
        addrType:  form.addrType,
        // Map pin
        lat:       form.location?.lat ?? null,
        lng:       form.location?.lng ?? null,
        mapAddress:form.location?.address ?? null,
        // Manual extra fields (optional)
        houseNo:   form.houseNo.trim()  || null,
        road:      form.road.trim()     || null,
        area:      form.area.trim()     || null,
        city:      form.city.trim()     || null,
        postalCode:form.postal.trim()   || null,
        landmark:  form.landmark.trim() || null,
        note:      form.note.trim()     || null,
      },

      // Delivery & payment
      deliveryMethod: delivery,
      paymentMethod:  payment,

      // Financials
      subtotal,
      shippingCost,
      couponCode:     coupon?.code    ?? null,
      couponDiscount,
      total,
    };

    try {
      const { data: res } = await orderService.create(orderPayload);

      // ── Success path ──────────────────────────────────────
      // 1. Clear cart in React-Query cache immediately (optimistic)
      qc.setQueryData(CART_KEY, { items: [], itemCount: 0, subtotal: 0 });
      // 2. Clear coupon store
      removeCoupon();
      // 3. Navigate to success page with real order ID/number
      const orderId = res?.data?.orderNumber ?? res?.data?._id ?? res?.data?.id ?? 'UNKNOWN';
      router.push(`/checkout/success?id=${orderId}`);

    } catch (err) {
      const status  = err?.response?.status;
      const message = err?.response?.data?.message;

      if (status === 409) {
        // Stock conflict — item out of stock since cart was loaded
        toast.error(message || 'of a product stock Has finished। Cart Check।');
      } else if (status === 400) {
        toast.error(message || 'Order information incorrect। Try again।');
      } else if (status === 401) {
        toast.error('Login Do and again try do।');
        router.push('/auth/login');
      } else {
        toast.error(message || 'Order place could not be done। Please try again later।');
      }

      setPlacing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container-x py-20 flex items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />Loading…
      </div>
    );
  }

  return (
    <div className="container-x py-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">Checkout</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Step {step} of {STEPS.length} — {STEPS[step - 1].label}
          </p>
        </div>
        <Link href="/cart"
          className="text-xs font-semibold text-muted-foreground hover:text-emerald-700 flex items-center gap-1 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Cart Go back to
        </Link>
      </div>

      <div className="mb-8 px-2">
        <StepBar current={step} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          {step === 1 && <StepAddress form={form} setForm={setForm} onNext={() => setStep(2)} />}
          {step === 2 && (
            <StepDelivery delivery={delivery} setDelivery={setDelivery}
              freeShip={freeShip} onNext={() => setStep(3)} onBack={() => setStep(1)} />
          )}
          {step === 3 && (
            <StepPayment payment={payment} setPayment={setPayment}
              cardForm={cardForm} setCardForm={setCardForm}
              onNext={() => setStep(4)} onBack={() => setStep(2)} />
          )}
          {step === 4 && (
            <StepConfirm form={form} delivery={delivery} payment={payment}
              total={total} shippingCost={shippingCost} couponDiscount={couponDiscount}
              onPlace={handlePlaceOrder} placing={placing} onBack={() => setStep(3)} />
          )}
        </div>

        <aside className="lg:sticky lg:top-28 h-fit">
          <OrderSummary items={items} subtotal={subtotal} shippingCost={shippingCost}
            coupon={coupon} couponDiscount={couponDiscount} total={total} />
        </aside>
      </div>
    </div>
  );
}