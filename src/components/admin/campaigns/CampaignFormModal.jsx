// 📁 PATH: src/components/admin/campaigns/CampaignFormModal.jsx
// ⚠️  This is a completely new file

'use client';
import { useState, useEffect } from 'react';

const CHANNELS = [
  { value: 'email',    label: 'Email',    icon: '📧' },
  { value: 'sms',      label: 'SMS',      icon: '💬' },
  { value: 'push',     label: 'Push',     icon: '🔔' },
  { value: 'whatsapp', label: 'WhatsApp', icon: '🟢' },
  { value: 'in_app',   label: 'In-App',   icon: '🛍' },
];
const SEGMENTS = [
  'All Customers', 'New Customers (last 30d)', 'VIP / Top Spenders', 'Inactive (60d+)',
  'Abandoned Cart Users', 'Repeat Buyers', 'Subscribers Only', 'Mobile App Users',
];
const GOALS = [
  { value: 'awareness', label: 'Brand Awareness' },
  { value: 'sales',     label: 'Drive Sales' },
  { value: 'retention', label: 'Customer Retention' },
  { value: 'winback',   label: 'Win-back Inactive' },
  { value: 'launch',    label: 'Product Launch' },
];

const empty = {
  name: '', channel: 'email', goal: 'sales', subject: '', message: '', ctaText: 'Shop Now', ctaUrl: '/',
  segment: 'All Customers', audienceSize: 0, scheduledAt: '', timezone: 'Asia/Dhaka',
  couponCode: '', utmCampaign: '', sendNow: false, status: 'draft',
};

const ipt = 'w-full h-10 px-3 rounded-lg border border-[#1e1e2e] bg-[#111118] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/50 transition-colors';
const lbl = 'block text-xs font-medium text-slate-400 mb-1.5';

export default function CampaignFormModal({ campaign, onSave, onClose }) {
  const [form, setForm] = useState(empty);
  const [tab, setTab]   = useState('content');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (campaign) {
      setForm({
        ...empty, ...campaign,
        scheduledAt: campaign.scheduledAt ? new Date(campaign.scheduledAt).toISOString().slice(0, 16) : '',
      });
    } else setForm(empty);
  }, [campaign]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Campaign name required';
    if (form.channel === 'email' && !form.subject.trim()) e.subject = 'Email subject required';
    if (!form.message.trim()) e.message = 'Message body required';
    if (!form.sendNow && !form.scheduledAt) e.scheduledAt = 'Pick a schedule time or enable Send Now';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (asDraft = false) => {
    if (!asDraft && !validate()) return;
    setSaving(true);
    try {
      await onSave({
        ...form,
        status: asDraft ? 'draft' : form.sendNow ? 'running' : 'scheduled',
        scheduledAt: form.scheduledAt ? new Date(form.scheduledAt).toISOString() : null,
      });
    } finally { setSaving(false); }
  };

  const charLimit = form.channel === 'sms' ? 160 : form.channel === 'push' ? 178 : 5000;
  const charsLeft = charLimit - (form.message?.length || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative bg-[#16161f] border border-[#1e1e2e] rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e1e2e]">
          <div>
            <h2 className="text-lg font-bold text-white">{campaign ? 'Edit Campaign' : 'New Campaign'}</h2>
            <p className="text-xs text-slate-500">Reach customers with personalized messages.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#1e1e2e] px-6">
          {['content', 'audience', 'schedule'].map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-3 text-sm font-medium capitalize border-b-2 transition-colors ${tab === t ? 'border-orange-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
              {t === 'content' ? '✍️ Content' : t === 'audience' ? '🎯 Audience' : '⏱ Schedule'}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2 space-y-5">
            {tab === 'content' && (
              <>
                <div>
                  <label className={lbl}>Campaign Name *</label>
                  <input value={form.name} onChange={e => set('name', e.target.value)} className={ipt} placeholder="e.g. Eid Sale 2026 Launch" />
                  {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}>Channel</label>
                    <div className="grid grid-cols-5 gap-2">
                      {CHANNELS.map(c => (
                        <button key={c.value} type="button" onClick={() => set('channel', c.value)}
                          className={`flex flex-col items-center py-2 rounded-lg border transition-colors ${form.channel === c.value ? 'border-orange-500 bg-orange-500/10' : 'border-[#1e1e2e] bg-[#111118] hover:border-slate-700'}`}>
                          <span className="text-lg">{c.icon}</span>
                          <span className={`text-[10px] mt-0.5 ${form.channel === c.value ? 'text-orange-400' : 'text-slate-500'}`}>{c.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={lbl}>Goal</label>
                    <select value={form.goal} onChange={e => set('goal', e.target.value)} className={ipt}>
                      {GOALS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                    </select>
                  </div>
                </div>

                {form.channel === 'email' && (
                  <div>
                    <label className={lbl}>Email Subject *</label>
                    <input value={form.subject} onChange={e => set('subject', e.target.value)} className={ipt} placeholder="🔥 Up to 50% off — today only" />
                    {errors.subject && <p className="text-xs text-red-400 mt-1">{errors.subject}</p>}
                  </div>
                )}

                <div>
                  <label className={lbl}>Message * <span className="text-slate-600">({charsLeft} chars left)</span></label>
                  <textarea rows={form.channel === 'email' ? 8 : 4} value={form.message} onChange={e => set('message', e.target.value)} maxLength={charLimit}
                    className={`${ipt} h-auto py-2 resize-none`} placeholder={`Write your ${form.channel} message here…`} />
                  {errors.message && <p className="text-xs text-red-400 mt-1">{errors.message}</p>}
                </div>

                {(form.channel === 'email' || form.channel === 'push' || form.channel === 'in_app') && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={lbl}>CTA Button Text</label>
                      <input value={form.ctaText} onChange={e => set('ctaText', e.target.value)} className={ipt} />
                    </div>
                    <div>
                      <label className={lbl}>CTA Link</label>
                      <input value={form.ctaUrl} onChange={e => set('ctaUrl', e.target.value)} className={ipt} placeholder="/products" />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}>Coupon Code (optional)</label>
                    <input value={form.couponCode} onChange={e => set('couponCode', e.target.value.toUpperCase())} className={`${ipt} font-mono`} placeholder="EID50" />
                  </div>
                  <div>
                    <label className={lbl}>UTM Campaign</label>
                    <input value={form.utmCampaign} onChange={e => set('utmCampaign', e.target.value)} className={ipt} placeholder="eid_2026_email" />
                  </div>
                </div>
              </>
            )}

            {tab === 'audience' && (
              <>
                <div>
                  <label className={lbl}>Segment</label>
                  <div className="grid grid-cols-2 gap-2">
                    {SEGMENTS.map(s => (
                      <button key={s} type="button" onClick={() => set('segment', s)}
                        className={`px-3 py-2.5 rounded-lg border text-sm text-left transition-colors ${form.segment === s ? 'border-orange-500 bg-orange-500/10 text-orange-400' : 'border-[#1e1e2e] bg-[#111118] text-slate-300 hover:border-slate-700'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={lbl}>Estimated Audience Size</label>
                  <input type="number" min={0} value={form.audienceSize} onChange={e => set('audienceSize', +e.target.value)} className={ipt} />
                  <p className="text-xs text-slate-500 mt-1">Backend automatically calculates real audience based on segment when launched.</p>
                </div>
              </>
            )}

            {tab === 'schedule' && (
              <>
                <label className="flex items-center gap-3 p-4 rounded-lg border border-[#1e1e2e] bg-[#111118] cursor-pointer">
                  <input type="checkbox" checked={form.sendNow} onChange={e => set('sendNow', e.target.checked)} className="rounded border-slate-600 bg-transparent text-orange-500 focus:ring-orange-500/30" />
                  <div>
                    <p className="text-sm font-medium text-white">Send Immediately</p>
                    <p className="text-xs text-slate-500">Launch as soon as you save the campaign.</p>
                  </div>
                </label>
                {!form.sendNow && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={lbl}>Scheduled At *</label>
                      <input type="datetime-local" value={form.scheduledAt} onChange={e => set('scheduledAt', e.target.value)} className={ipt} />
                      {errors.scheduledAt && <p className="text-xs text-red-400 mt-1">{errors.scheduledAt}</p>}
                    </div>
                    <div>
                      <label className={lbl}>Timezone</label>
                      <select value={form.timezone} onChange={e => set('timezone', e.target.value)} className={ipt}>
                        <option value="Asia/Dhaka">Asia/Dhaka (SAR)</option>
                        <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                        <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                        <option value="UTC">UTC</option>
                      </select>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Live preview */}
          <div className="lg:col-span-1">
            <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">Live Preview</p>
            <div className="rounded-xl border border-[#1e1e2e] bg-gradient-to-br from-[#111118] to-[#0a0a10] p-4">
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-[#1e1e2e]">
                <span className="text-xl">{CHANNELS.find(c => c.value === form.channel)?.icon}</span>
                <span className="text-xs text-slate-500 uppercase">{form.channel}</span>
              </div>
              {form.channel === 'email' && (
                <>
                  <p className="text-xs text-slate-500">Subject</p>
                  <p className="text-sm font-semibold text-white mb-3 break-words">{form.subject || 'Your subject preview…'}</p>
                </>
              )}
              <p className="text-sm text-slate-300 whitespace-pre-wrap break-words min-h-[80px]">{form.message || `Your ${form.channel} message preview appears here…`}</p>
              {form.ctaText && (form.channel === 'email' || form.channel === 'push' || form.channel === 'in_app') && (
                <button className="mt-4 w-full py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium">{form.ctaText}</button>
              )}
              {form.couponCode && (
                <div className="mt-3 p-2 rounded-md border border-dashed border-orange-500/40 text-center">
                  <p className="text-[10px] text-slate-500">USE CODE</p>
                  <p className="font-mono font-bold text-orange-400">{form.couponCode}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#1e1e2e]">
          <p className="text-xs text-slate-500">Audience: <span className="text-slate-300 font-medium">{form.segment}</span></p>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-lg border border-[#1e1e2e] text-slate-400 text-sm hover:bg-white/5">Cancel</button>
            <button onClick={() => handleSubmit(true)} disabled={saving} className="px-4 py-2 rounded-lg border border-[#1e1e2e] text-slate-300 text-sm hover:bg-white/5">Save Draft</button>
            <button onClick={() => handleSubmit(false)} disabled={saving} className="px-5 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium disabled:opacity-60">
              {saving ? 'Saving…' : form.sendNow ? '🚀 Launch Now' : '⏱ Schedule'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
