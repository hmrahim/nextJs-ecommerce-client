'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Edit2, Trash2, Camera, ThumbsUp } from 'lucide-react';
import toast from 'react-hot-toast';

const REVIEWS = [
  { id: 1, product: 'Wireless Noise-Cancel Headphones', orderId: 'ORD-10001', image: 'https://picsum.photos/seed/r1/200', rating: 5, date: 'Jun 09, 2026', title: 'Best headphones I have used', body: 'Crisp sound and the noise cancellation is amazing. Battery lasts more than a week.', helpful: 24, photos: 2 },
  { id: 2, product: '4K Monitor 27"', orderId: 'ORD-10005', image: 'https://picsum.photos/seed/r2/200', rating: 4, date: 'May 14, 2026', title: 'Great display, stand is wobbly', body: 'Color accuracy is excellent for the price. The included stand is a bit shaky.', helpful: 11, photos: 0 },
];

const PENDING = [
  { id: 3, product: 'Smart Watch Series 9', orderId: 'ORD-10003', image: 'https://picsum.photos/seed/r3/200', deliveredAt: 'Jun 02, 2026' },
  { id: 4, product: 'USB-C Cable 2m', orderId: 'ORD-10002', image: 'https://picsum.photos/seed/r4/200', deliveredAt: 'Jun 07, 2026' },
];

const TABS = [
  { id: 'published', label: 'My reviews', count: REVIEWS.length },
  { id: 'pending', label: 'To review', count: PENDING.length },
];

function Stars({ n, size = 'w-4 h-4' }) {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`${size} ${i <= n ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const [tab, setTab] = useState('published');
  const [writeFor, setWriteFor] = useState(null);
  const [rating, setRating] = useState(5);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-border p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold">My Reviews</h1>
            <p className="text-xs text-slate-500 mt-0.5">Share your experience and help others shop smart.</p>
          </div>
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2">
            <Stars n={5} />
            <div className="text-xs">
              <p className="font-bold text-amber-900">4.5 average</p>
              <p className="text-amber-700">From {REVIEWS.length} reviews</p>
            </div>
          </div>
        </div>
        <div className="mt-4 flex gap-1">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${tab === t.id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
              {t.label} <span className="ml-1 opacity-70">({t.count})</span>
            </button>
          ))}
        </div>
      </div>

      {tab === 'published' && (
        <div className="space-y-3">
          {REVIEWS.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl border border-border p-5">
              <div className="flex items-start gap-4">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                  <Image src={r.image} alt={r.product} fill className="object-cover" sizes="64px" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm line-clamp-1">{r.product}</p>
                  <p className="text-xs text-slate-500">Order {r.orderId} · Reviewed {r.date}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Stars n={r.rating} />
                    <span className="text-xs font-semibold">{r.title}</span>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-700 leading-relaxed">{r.body}</p>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                {r.photos > 0 && <span className="inline-flex items-center gap-1"><Camera className="w-3.5 h-3.5" /> {r.photos} photos</span>}
                <span className="inline-flex items-center gap-1"><ThumbsUp className="w-3.5 h-3.5" /> {r.helpful} found helpful</span>
                <div className="ml-auto flex gap-2">
                  <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border hover:bg-slate-50 font-semibold"><Edit2 className="w-3 h-3" /> Edit</button>
                  <button onClick={() => toast.success('Review deleted')} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-rose-600 hover:bg-rose-50 font-semibold"><Trash2 className="w-3 h-3" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'pending' && (
        <div className="space-y-3">
          {PENDING.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl border border-border p-5 flex flex-wrap items-center gap-4">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                <Image src={p.image} alt={p.product} fill className="object-cover" sizes="64px" />
              </div>
              <div className="flex-1 min-w-[200px]">
                <p className="font-semibold text-sm">{p.product}</p>
                <p className="text-xs text-slate-500">Delivered {p.deliveredAt} · {p.orderId}</p>
              </div>
              <button onClick={() => { setWriteFor(p); setRating(5); }} className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700">Write a review</button>
            </div>
          ))}
        </div>
      )}

      {writeFor && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setWriteFor(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-bold text-lg">Review {writeFor.product}</h2>
            <div className="mt-4 space-y-3">
              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">Your rating</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <button key={i} onClick={() => setRating(i)}>
                      <Star className={`w-7 h-7 ${i <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <label className="text-sm block">
                <span className="block mb-1 font-medium text-slate-700">Title</span>
                <input className="w-full rounded-lg border border-border px-3 py-2" placeholder="Sum it up in a few words" />
              </label>
              <label className="text-sm block">
                <span className="block mb-1 font-medium text-slate-700">Your review</span>
                <textarea rows={4} className="w-full rounded-lg border border-border px-3 py-2" placeholder="What did you like or dislike?" />
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setWriteFor(null)} className="px-4 py-2 rounded-lg border border-border text-sm">Cancel</button>
              <button onClick={() => { setWriteFor(null); toast.success('Review submitted'); }} className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold">Submit review</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
