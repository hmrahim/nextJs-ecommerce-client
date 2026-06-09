'use client';

import { useState, useEffect } from 'react';
import { useSettings, useTestEmail, useApiKeys } from '@/hooks/useSettings';

const Icon = ({ d, size = 20 }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={d} />
  </svg>
);

const ICONS = {
  store:         'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z',
  localisation:  'M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129',
  email:         'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  payment:       'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
  shipping:      'M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3m3 10v-5l-3-3m0 0l-3 3m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z',
  notifications: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
  security:      'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  media:         'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
  apikeys:       'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z',
};

const SECTIONS = [
  { id: 'store',         label: 'Store',         icon: 'store'         },
  { id: 'localisation',  label: 'Localisation',  icon: 'localisation'  },
  { id: 'email',         label: 'Email / SMTP',  icon: 'email'         },
  { id: 'payment',       label: 'Payments',      icon: 'payment'       },
  { id: 'shipping',      label: 'Shipping',      icon: 'shipping'      },
  { id: 'notifications', label: 'Notifications', icon: 'notifications' },
  { id: 'security',      label: 'Security',      icon: 'security'      },
  { id: 'media',         label: 'Media',         icon: 'media'         },
  { id: 'api-keys',      label: 'API Keys',      icon: 'apikeys'       },
];

function Card({ children, className = '' }) {
  return (
    <div className={`rounded-xl border border-slate-700/40 bg-slate-800/40 backdrop-blur-sm ${className}`}>
      {children}
    </div>
  );
}

function SectionHeader({ title, subtitle }) {
  return (
    <div className="px-6 py-5 border-b border-slate-700/40">
      <h2 className="text-base font-semibold text-white">{title}</h2>
      {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start py-4 border-b border-slate-700/20 last:border-0">
      <div>
        <label className="text-sm font-medium text-slate-200">{label}</label>
        {hint && <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{hint}</p>}
      </div>
      <div className="md:col-span-2">{children}</div>
    </div>
  );
}

function Input({ value, onChange, placeholder, type = 'text', disabled, className = '' }) {
  return (
    <input
      type={type}
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full bg-slate-900/60 border border-slate-700/60 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500
        focus:outline-none focus:ring-1 focus:ring-violet-500/60 focus:border-violet-500/60 transition
        disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    />
  );
}

function Textarea({ value, onChange, placeholder, rows = 3 }) {
  return (
    <textarea
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full bg-slate-900/60 border border-slate-700/60 rounded-lg px-3 py-2 text-sm text-white
        placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500/60 focus:border-violet-500/60
        transition resize-none"
    />
  );
}

function Select({ value, onChange, options }) {
  return (
    <select
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      className="w-full bg-slate-900/60 border border-slate-700/60 rounded-lg px-3 py-2 text-sm text-white
        focus:outline-none focus:ring-1 focus:ring-violet-500/60 focus:border-violet-500/60 transition"
    >
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer w-fit">
      <div
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors duration-200 cursor-pointer ${checked ? 'bg-violet-600' : 'bg-slate-700'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </div>
      {label && <span className="text-sm text-slate-300">{label}</span>}
    </label>
  );
}

function SaveButton({ onClick, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium
        transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading
        ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
        : 'Save Changes'
      }
    </button>
  );
}

function SkeletonBlock() {
  return (
    <div className="animate-pulse space-y-4 p-6">
      {[1,2,3,4].map(i => (
        <div key={i} className="grid grid-cols-3 gap-4 py-4 border-b border-slate-700/20">
          <div className="space-y-2">
            <div className="h-3 bg-slate-700 rounded w-24" />
            <div className="h-2 bg-slate-700/50 rounded w-36" />
          </div>
          <div className="col-span-2 h-9 bg-slate-700/50 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

// ─── Section panels ───────────────────────────────────────────────────────────

function StoreSettings() {
  const { data, isLoading, update, isUpdating } = useSettings('store');
  const [form, setForm] = useState({});
  useEffect(() => { if (data) setForm(data); }, [data]);
  const set = key => val => setForm(f => ({ ...f, [key]: val }));
  return (
    <Card>
      <SectionHeader title="Store Information" subtitle="Basic details about your store — shown in emails, invoices, and the storefront." />
      {isLoading ? <SkeletonBlock /> : (
        <div className="px-6 py-2">
          <Field label="Store Name" hint="Displayed in the browser tab and transactional emails.">
            <Input value={form.name} onChange={set('name')} placeholder="Moom24" />
          </Field>
          <Field label="Tagline" hint="A short description shown on the homepage hero.">
            <Input value={form.tagline} onChange={set('tagline')} placeholder="Your one-stop shop" />
          </Field>
          <Field label="Store Email" hint="Primary contact email published on the site.">
            <Input value={form.email} onChange={set('email')} type="email" placeholder="hello@moom24.com" />
          </Field>
          <Field label="Support Phone">
            <Input value={form.phone} onChange={set('phone')} placeholder="+880 1XXX XXXXXX" />
          </Field>
          <Field label="Business Address" hint="Used on invoices and tax documents.">
            <Textarea value={form.address} onChange={set('address')} placeholder="123 Main Street, Dhaka, Bangladesh" />
          </Field>
          <Field label="Store Logo URL" hint="Publicly accessible URL for your logo (SVG or PNG recommended).">
            <Input value={form.logoUrl} onChange={set('logoUrl')} placeholder="https://cdn.example.com/logo.svg" />
          </Field>
          <Field label="Store Status" hint="Maintenance mode shows a holding page to visitors.">
            <Toggle checked={form.isLive ?? true} onChange={set('isLive')} label={form.isLive ? 'Live — accepting orders' : 'Maintenance mode'} />
          </Field>
        </div>
      )}
      <div className="px-6 py-4 border-t border-slate-700/40 flex justify-end">
        <SaveButton onClick={() => update(form)} loading={isUpdating} />
      </div>
    </Card>
  );
}

function LocalisationSettings() {
  const { data, isLoading, update, isUpdating } = useSettings('localisation');
  const [form, setForm] = useState({});
  useEffect(() => { if (data) setForm(data); }, [data]);
  const set = key => val => setForm(f => ({ ...f, [key]: val }));
  return (
    <Card>
      <SectionHeader title="Localisation" subtitle="Currency, timezone, and date formatting used across the platform." />
      {isLoading ? <SkeletonBlock /> : (
        <div className="px-6 py-2">
          <Field label="Currency" hint="ISO 4217 code — changing this does NOT convert existing prices.">
            <Select value={form.currency} onChange={set('currency')} options={[
              { value: 'BDT', label: 'BDT — Bangladeshi Taka (৳)' },
              { value: 'USD', label: 'USD — US Dollar ($)' },
              { value: 'EUR', label: 'EUR — Euro (€)' },
              { value: 'GBP', label: 'GBP — British Pound (£)' },
              { value: 'SAR', label: 'SAR — Saudi Riyal (﷼)' },
              { value: 'AED', label: 'AED — UAE Dirham (د.إ)' },
            ]} />
          </Field>
          <Field label="Currency Symbol">
            <Input value={form.currencySymbol} onChange={set('currencySymbol')} placeholder="৳" />
          </Field>
          <Field label="Timezone">
            <Select value={form.timezone} onChange={set('timezone')} options={[
              { value: 'Asia/Dhaka',       label: 'Asia/Dhaka (UTC+6)' },
              { value: 'Asia/Kolkata',     label: 'Asia/Kolkata (UTC+5:30)' },
              { value: 'Asia/Riyadh',      label: 'Asia/Riyadh (UTC+3)' },
              { value: 'Asia/Dubai',       label: 'Asia/Dubai (UTC+4)' },
              { value: 'Europe/London',    label: 'Europe/London (UTC+0/+1)' },
              { value: 'America/New_York', label: 'America/New_York (UTC-5/-4)' },
            ]} />
          </Field>
          <Field label="Date Format">
            <Select value={form.dateFormat} onChange={set('dateFormat')} options={[
              { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
              { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
              { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO 8601)' },
            ]} />
          </Field>
          <Field label="Language">
            <Select value={form.language} onChange={set('language')} options={[
              { value: 'en', label: 'English' },
              { value: 'bn', label: 'বাংলা (Bangla)' },
              { value: 'ar', label: 'العربية (Arabic)' },
            ]} />
          </Field>
          <Field label="Tax Inclusive Pricing" hint="If enabled, product prices are shown inclusive of VAT/tax.">
            <Toggle checked={form.taxInclusive ?? false} onChange={set('taxInclusive')} label="Prices include tax" />
          </Field>
          <Field label="Default Tax Rate (%)" hint="Applied at checkout if not overridden per product.">
            <Input value={form.defaultTaxRate} onChange={set('defaultTaxRate')} type="number" placeholder="0" />
          </Field>
        </div>
      )}
      <div className="px-6 py-4 border-t border-slate-700/40 flex justify-end">
        <SaveButton onClick={() => update(form)} loading={isUpdating} />
      </div>
    </Card>
  );
}

function EmailSettings() {
  const { data, isLoading, update, isUpdating } = useSettings('email');
  const { mutate: sendTest, isPending: isTesting } = useTestEmail();
  const [form, setForm] = useState({});
  const [testAddr, setTestAddr] = useState('');
  useEffect(() => { if (data) setForm(data); }, [data]);
  const set = key => val => setForm(f => ({ ...f, [key]: val }));
  return (
    <Card>
      <SectionHeader title="Email / SMTP" subtitle="Outbound email configuration for order confirmations, password resets, and notifications." />
      {isLoading ? <SkeletonBlock /> : (
        <div className="px-6 py-2">
          <Field label="From Name" hint="Display name in the recipient's inbox.">
            <Input value={form.fromName} onChange={set('fromName')} placeholder="Moom24" />
          </Field>
          <Field label="From Address">
            <Input value={form.fromAddress} onChange={set('fromAddress')} type="email" placeholder="no-reply@moom24.com" />
          </Field>
          <Field label="Reply-To Address">
            <Input value={form.replyTo} onChange={set('replyTo')} type="email" placeholder="support@moom24.com" />
          </Field>
          <Field label="SMTP Host">
            <Input value={form.smtpHost} onChange={set('smtpHost')} placeholder="smtp.sendgrid.net" />
          </Field>
          <Field label="SMTP Port">
            <Select value={String(form.smtpPort ?? '587')} onChange={v => set('smtpPort')(Number(v))} options={[
              { value: '587', label: '587 (STARTTLS — recommended)' },
              { value: '465', label: '465 (SSL)' },
              { value: '25',  label: '25 (Unencrypted)' },
            ]} />
          </Field>
          <Field label="SMTP Username">
            <Input value={form.smtpUser} onChange={set('smtpUser')} placeholder="apikey" />
          </Field>
          <Field label="SMTP Password">
            <Input value={form.smtpPass} onChange={set('smtpPass')} type="password" placeholder="••••••••••••" />
          </Field>
          <Field label="Send Test Email" hint="Verify SMTP settings before going live.">
            <div className="flex gap-2">
              <Input value={testAddr} onChange={setTestAddr} type="email" placeholder="your@email.com" className="flex-1" />
              <button
                onClick={() => sendTest(testAddr)}
                disabled={isTesting || !testAddr}
                className="px-3 py-2 text-sm rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition disabled:opacity-50 whitespace-nowrap"
              >{isTesting ? 'Sending...' : 'Send Test'}</button>
            </div>
          </Field>
        </div>
      )}
      <div className="px-6 py-4 border-t border-slate-700/40 flex justify-end">
        <SaveButton onClick={() => update(form)} loading={isUpdating} />
      </div>
    </Card>
  );
}

function PaymentSettings() {
  const { data, isLoading, update, isUpdating } = useSettings('payment');
  const [form, setForm] = useState({});
  useEffect(() => { if (data) setForm(data); }, [data]);
  const set = key => val => setForm(f => ({ ...f, [key]: val }));
  const setNested = (parent, key) => val => setForm(f => ({ ...f, [parent]: { ...(f[parent] ?? {}), [key]: val } }));
  return (
    <Card>
      <SectionHeader title="Payment Gateways" subtitle="Configure and enable payment providers available at checkout. Credentials are encrypted at rest." />
      {isLoading ? <SkeletonBlock /> : (
        <div className="px-6 py-2">
          <div className="py-4 border-b border-slate-700/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">Stripe</span>
                <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">Recommended</span>
              </div>
              <Toggle checked={form.stripe?.enabled ?? false} onChange={setNested('stripe', 'enabled')} />
            </div>
            <Field label="Publishable Key"><Input value={form.stripe?.publishableKey} onChange={setNested('stripe', 'publishableKey')} placeholder="pk_live_..." /></Field>
            <Field label="Secret Key"><Input value={form.stripe?.secretKey} onChange={setNested('stripe', 'secretKey')} type="password" placeholder="sk_live_..." /></Field>
            <Field label="Webhook Secret"><Input value={form.stripe?.webhookSecret} onChange={setNested('stripe', 'webhookSecret')} type="password" placeholder="whsec_..." /></Field>
            <Field label="Test Mode"><Toggle checked={form.stripe?.testMode ?? true} onChange={setNested('stripe', 'testMode')} label="Use test keys" /></Field>
          </div>
          <div className="py-4 border-b border-slate-700/20">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-white">bKash</span>
              <Toggle checked={form.bkash?.enabled ?? false} onChange={setNested('bkash', 'enabled')} />
            </div>
            <Field label="App Key"><Input value={form.bkash?.appKey} onChange={setNested('bkash', 'appKey')} placeholder="bKash App Key" /></Field>
            <Field label="App Secret"><Input value={form.bkash?.appSecret} onChange={setNested('bkash', 'appSecret')} type="password" placeholder="bKash App Secret" /></Field>
            <Field label="Username"><Input value={form.bkash?.username} onChange={setNested('bkash', 'username')} placeholder="01XXXXXXXXX" /></Field>
            <Field label="Password"><Input value={form.bkash?.password} onChange={setNested('bkash', 'password')} type="password" placeholder="••••••••" /></Field>
            <Field label="Sandbox Mode"><Toggle checked={form.bkash?.sandbox ?? true} onChange={setNested('bkash', 'sandbox')} label="Use sandbox" /></Field>
          </div>
          <div className="py-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-white">Cash on Delivery</span>
              <Toggle checked={form.cod?.enabled ?? false} onChange={setNested('cod', 'enabled')} />
            </div>
            <Field label="COD Surcharge (৳)" hint="Extra fee charged for cash payments (0 for none).">
              <Input value={form.cod?.surcharge} onChange={setNested('cod', 'surcharge')} type="number" placeholder="0" />
            </Field>
            <Field label="Max Order Value for COD (৳)" hint="Orders above this amount will not allow COD. Leave blank for no limit.">
              <Input value={form.cod?.maxOrderValue} onChange={setNested('cod', 'maxOrderValue')} type="number" placeholder="5000" />
            </Field>
          </div>
        </div>
      )}
      <div className="px-6 py-4 border-t border-slate-700/40 flex justify-end">
        <SaveButton onClick={() => update(form)} loading={isUpdating} />
      </div>
    </Card>
  );
}

function ShippingSettings() {
  const { data, isLoading, update, isUpdating } = useSettings('shipping');
  const [form, setForm] = useState({});
  useEffect(() => { if (data) setForm(data); }, [data]);
  const set = key => val => setForm(f => ({ ...f, [key]: val }));
  const setNested = (parent, key) => val => setForm(f => ({ ...f, [parent]: { ...(f[parent] ?? {}), [key]: val } }));
  return (
    <Card>
      <SectionHeader title="Shipping" subtitle="Default shipping rules, free-shipping thresholds, and courier integrations." />
      {isLoading ? <SkeletonBlock /> : (
        <div className="px-6 py-2">
          <Field label="Default Shipping Fee (৳)"><Input value={form.defaultFee} onChange={set('defaultFee')} type="number" placeholder="60" /></Field>
          <Field label="Free Shipping Threshold (৳)" hint="Orders above this amount qualify for free shipping. Set to 0 to disable.">
            <Input value={form.freeThreshold} onChange={set('freeThreshold')} type="number" placeholder="999" />
          </Field>
          <Field label="Processing Time" hint="Displayed to customers at checkout.">
            <Select value={form.processingTime} onChange={set('processingTime')} options={[
              { value: '1-2 business days', label: '1–2 Business Days' },
              { value: '2-3 business days', label: '2–3 Business Days' },
              { value: '3-5 business days', label: '3–5 Business Days' },
              { value: 'same day',          label: 'Same Day' },
            ]} />
          </Field>
          <Field label="Estimated Delivery" hint="Shown on product pages and order confirmation.">
            <Input value={form.deliveryEstimate} onChange={set('deliveryEstimate')} placeholder="3–7 business days" />
          </Field>
          <div className="pt-4 mt-2 border-t border-slate-700/30">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-white">Pathao Courier</p>
                <p className="text-xs text-slate-500">BD last-mile courier integration</p>
              </div>
              <Toggle checked={form.pathao?.enabled ?? false} onChange={setNested('pathao', 'enabled')} />
            </div>
            <Field label="Client ID"><Input value={form.pathao?.clientId} onChange={setNested('pathao', 'clientId')} placeholder="Pathao Client ID" /></Field>
            <Field label="Client Secret"><Input value={form.pathao?.clientSecret} onChange={setNested('pathao', 'clientSecret')} type="password" placeholder="Pathao Client Secret" /></Field>
            <Field label="Merchant ID"><Input value={form.pathao?.merchantId} onChange={setNested('pathao', 'merchantId')} placeholder="Pathao Merchant ID" /></Field>
            <Field label="Sandbox Mode"><Toggle checked={form.pathao?.sandbox ?? true} onChange={setNested('pathao', 'sandbox')} label="Use sandbox" /></Field>
          </div>
        </div>
      )}
      <div className="px-6 py-4 border-t border-slate-700/40 flex justify-end">
        <SaveButton onClick={() => update(form)} loading={isUpdating} />
      </div>
    </Card>
  );
}

function NotificationSettings() {
  const { data, isLoading, update, isUpdating } = useSettings('notifications');
  const [form, setForm] = useState({});
  useEffect(() => { if (data) setForm(data); }, [data]);
  const setNested = (parent, key) => val => setForm(f => ({ ...f, [parent]: { ...(f[parent] ?? {}), [key]: val } }));
  const Row = ({ group, label }) => (
    <div className="flex items-center justify-between py-3 border-b border-slate-700/20 last:border-0">
      <span className="text-sm text-slate-300">{label}</span>
      <div className="flex items-center gap-6">
        <Toggle checked={form[group]?.email ?? true} onChange={setNested(group, 'email')} label="Email" />
        <Toggle checked={form[group]?.push ?? false} onChange={setNested(group, 'push')} label="Push" />
      </div>
    </div>
  );
  return (
    <Card>
      <SectionHeader title="Notifications" subtitle="Choose which events trigger email or push notifications for admins and customers." />
      {isLoading ? <SkeletonBlock /> : (
        <div className="px-6 py-4">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Customer Notifications</p>
          <Row group="orderPlaced"    label="Order Placed" />
          <Row group="orderConfirmed" label="Order Confirmed" />
          <Row group="orderShipped"   label="Order Shipped" />
          <Row group="orderDelivered" label="Order Delivered" />
          <Row group="orderCancelled" label="Order Cancelled / Refunded" />
          <Row group="passwordReset"  label="Password Reset" />
          <Row group="reviewRequest"  label="Review Request (post-delivery)" />
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mt-6 mb-3">Admin Alerts</p>
          <Row group="newOrder"       label="New Order Received" />
          <Row group="lowStock"       label="Low Stock Alert" />
          <Row group="newReview"      label="New Review Submitted" />
          <Row group="newUser"        label="New User Registration" />
          <Row group="paymentFailed"  label="Payment Failed" />
        </div>
      )}
      <div className="px-6 py-4 border-t border-slate-700/40 flex justify-end">
        <SaveButton onClick={() => update(form)} loading={isUpdating} />
      </div>
    </Card>
  );
}

function SecuritySettings() {
  const { data, isLoading, update, isUpdating } = useSettings('security');
  const [form, setForm] = useState({});
  useEffect(() => { if (data) setForm(data); }, [data]);
  const set = key => val => setForm(f => ({ ...f, [key]: val }));
  return (
    <Card>
      <SectionHeader title="Security" subtitle="Authentication, session management, and account protection policies." />
      {isLoading ? <SkeletonBlock /> : (
        <div className="px-6 py-2">
          <Field label="Require Email Verification" hint="New accounts must verify email before placing orders.">
            <Toggle checked={form.requireEmailVerification ?? true} onChange={set('requireEmailVerification')} />
          </Field>
          <Field label="Enforce 2FA for Admins" hint="All admin accounts must configure two-factor authentication.">
            <Toggle checked={form.enforce2FA ?? false} onChange={set('enforce2FA')} />
          </Field>
          <Field label="Session Timeout (minutes)" hint="Idle admin sessions expire after this duration.">
            <Select value={String(form.sessionTimeout ?? '60')} onChange={v => set('sessionTimeout')(Number(v))} options={[
              { value: '30',  label: '30 minutes' },
              { value: '60',  label: '1 hour' },
              { value: '120', label: '2 hours' },
              { value: '480', label: '8 hours' },
              { value: '0',   label: 'Never (not recommended)' },
            ]} />
          </Field>
          <Field label="Max Login Attempts" hint="Account temporarily locked after this many failed attempts.">
            <Select value={String(form.maxLoginAttempts ?? '5')} onChange={v => set('maxLoginAttempts')(Number(v))} options={[
              { value: '3',  label: '3 attempts' },
              { value: '5',  label: '5 attempts' },
              { value: '10', label: '10 attempts' },
            ]} />
          </Field>
          <Field label="Lockout Duration (minutes)">
            <Select value={String(form.lockoutDuration ?? '15')} onChange={v => set('lockoutDuration')(Number(v))} options={[
              { value: '5',  label: '5 minutes' },
              { value: '15', label: '15 minutes' },
              { value: '30', label: '30 minutes' },
              { value: '60', label: '1 hour' },
            ]} />
          </Field>
          <Field label="Admin IP Whitelist" hint="Comma-separated IPs. Leave blank to allow all.">
            <Textarea value={form.adminIpWhitelist} onChange={set('adminIpWhitelist')} placeholder="Leave blank to allow all IPs" rows={2} />
          </Field>
          <Field label="Audit Log Retention (days)" hint="How long admin activity logs are kept.">
            <Select value={String(form.auditRetentionDays ?? '90')} onChange={v => set('auditRetentionDays')(Number(v))} options={[
              { value: '30',  label: '30 days' },
              { value: '90',  label: '90 days' },
              { value: '180', label: '180 days' },
              { value: '365', label: '1 year' },
            ]} />
          </Field>
        </div>
      )}
      <div className="px-6 py-4 border-t border-slate-700/40 flex justify-end">
        <SaveButton onClick={() => update(form)} loading={isUpdating} />
      </div>
    </Card>
  );
}

function MediaSettings() {
  const { data, isLoading, update, isUpdating } = useSettings('media');
  const [form, setForm] = useState({});
  useEffect(() => { if (data) setForm(data); }, [data]);
  const set = key => val => setForm(f => ({ ...f, [key]: val }));
  const setNested = (parent, key) => val => setForm(f => ({ ...f, [parent]: { ...(f[parent] ?? {}), [key]: val } }));
  return (
    <Card>
      <SectionHeader title="Media & Uploads" subtitle="Configure Cloudinary and control file upload limits." />
      {isLoading ? <SkeletonBlock /> : (
        <div className="px-6 py-2">
          <Field label="Storage Provider">
            <Select value={form.provider ?? 'cloudinary'} onChange={set('provider')} options={[
              { value: 'cloudinary', label: 'Cloudinary' },
              { value: 'local',      label: 'Local Storage' },
              { value: 's3',         label: 'AWS S3' },
            ]} />
          </Field>
          {(form.provider === 'cloudinary' || !form.provider) && (<>
            <Field label="Cloud Name"><Input value={form.cloudinary?.cloudName} onChange={setNested('cloudinary', 'cloudName')} placeholder="your-cloud-name" /></Field>
            <Field label="API Key"><Input value={form.cloudinary?.apiKey} onChange={setNested('cloudinary', 'apiKey')} placeholder="1234567890" /></Field>
            <Field label="API Secret"><Input value={form.cloudinary?.apiSecret} onChange={setNested('cloudinary', 'apiSecret')} type="password" placeholder="••••••••••••••" /></Field>
            <Field label="Upload Preset" hint="For unsigned uploads from the client side.">
              <Input value={form.cloudinary?.uploadPreset} onChange={setNested('cloudinary', 'uploadPreset')} placeholder="moom24_unsigned" />
            </Field>
          </>)}
          <Field label="Max File Size (MB)" hint="Maximum size for a single product image upload.">
            <Select value={String(form.maxFileSizeMB ?? '5')} onChange={v => set('maxFileSizeMB')(Number(v))} options={[
              { value: '2',  label: '2 MB' },
              { value: '5',  label: '5 MB' },
              { value: '10', label: '10 MB' },
              { value: '20', label: '20 MB' },
            ]} />
          </Field>
          <Field label="Allowed File Types">
            <Input value={form.allowedTypes} onChange={set('allowedTypes')} placeholder="image/jpeg, image/png, image/webp, image/gif" />
          </Field>
          <Field label="Auto-compress Uploads" hint="Automatically optimize images on upload via Cloudinary transformations.">
            <Toggle checked={form.autoCompress ?? true} onChange={set('autoCompress')} />
          </Field>
        </div>
      )}
      <div className="px-6 py-4 border-t border-slate-700/40 flex justify-end">
        <SaveButton onClick={() => update(form)} loading={isUpdating} />
      </div>
    </Card>
  );
}

function ApiKeysSettings() {
  const { keys, isLoading, createKey, revokeKey, isCreating } = useApiKeys();
  const [newKeyName, setNewKeyName] = useState('');
  const [revealedKey, setRevealedKey] = useState(null);
  const handleCreate = () => {
    if (!newKeyName.trim()) return;
    createKey(newKeyName, {
      onSuccess: (data) => { setRevealedKey(data?.rawKey); setNewKeyName(''); }
    });
  };
  return (
    <Card>
      <SectionHeader title="API Keys" subtitle="Machine-to-machine keys for integrating external services with the Moom24 API." />
      <div className="px-6 py-4">
        {revealedKey && (
          <div className="mb-4 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <p className="text-xs font-semibold text-amber-400 mb-1">Copy this key now — it will not be shown again.</p>
            <code className="text-xs text-amber-300 break-all font-mono">{revealedKey}</code>
            <button onClick={() => navigator.clipboard.writeText(revealedKey)} className="mt-2 text-xs text-amber-400 hover:text-amber-300 underline block">
              Copy to clipboard
            </button>
          </div>
        )}
        <div className="flex gap-2 mb-6">
          <Input value={newKeyName} onChange={setNewKeyName} placeholder="Key name (e.g. Mobile App, Webhook Integration)" className="flex-1" />
          <button
            onClick={handleCreate}
            disabled={isCreating || !newKeyName.trim()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition disabled:opacity-50 whitespace-nowrap"
          >{isCreating ? 'Creating...' : '+ New Key'}</button>
        </div>
        {isLoading ? (
          <div className="animate-pulse space-y-3">{[1,2].map(i => <div key={i} className="h-14 rounded-lg bg-slate-700/50" />)}</div>
        ) : keys.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">No API keys created yet.</div>
        ) : (
          <div className="space-y-2">
            {keys.map(k => (
              <div key={k.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-700/40">
                <div>
                  <p className="text-sm font-medium text-white">{k.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5 font-mono">
                    {k.prefix}••••••••  ·  Created {new Date(k.createdAt).toLocaleDateString()}
                    {k.lastUsedAt && <> · Last used {new Date(k.lastUsedAt).toLocaleDateString()}</>}
                  </p>
                </div>
                <button onClick={() => revokeKey(k.id)} className="text-xs text-red-400 hover:text-red-300 transition px-2 py-1 rounded hover:bg-red-500/10">
                  Revoke
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

const PANELS = {
  store:         StoreSettings,
  localisation:  LocalisationSettings,
  email:         EmailSettings,
  payment:       PaymentSettings,
  shipping:      ShippingSettings,
  notifications: NotificationSettings,
  security:      SecuritySettings,
  media:         MediaSettings,
  'api-keys':    ApiKeysSettings,
};

export default function SettingsPage() {
  const [active, setActive] = useState('store');
  const Panel = PANELS[active];
  return (
    <div className="flex gap-6 h-full min-h-0">
      <aside className="w-52 shrink-0">
        <nav className="sticky top-0 space-y-1">
          {SECTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left text-sm transition
                ${active === s.id
                  ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/40'
                }`}
            >
              <span className={active === s.id ? 'text-violet-400' : 'text-slate-500'}>
                <Icon d={ICONS[s.icon]} size={16} />
              </span>
              {s.label}
            </button>
          ))}
        </nav>
      </aside>
      <main className="flex-1 min-w-0 space-y-4 overflow-y-auto pb-10">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Settings</h1>
          <p className="text-sm text-slate-400 mt-0.5">{SECTIONS.find(s => s.id === active)?.label} configuration</p>
        </div>
        <Panel />
      </main>
    </div>
  );
}
