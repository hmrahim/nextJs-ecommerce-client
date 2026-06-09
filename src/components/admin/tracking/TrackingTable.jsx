// 📁 PATH: src/components/admin/tracking/TrackingTable.jsx
'use client';
import { TRACKING_STATUSES, PRIORITIES } from './_dummyData';

function timeAgo(iso) {
  if (!iso) return '—';
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function etaText(iso, status) {
  if (status === 'delivered' || status === 'returned' || status === 'cancelled') return '—';
  if (!iso) return '—';
  const diff = (new Date(iso).getTime() - Date.now()) / 3600000;
  if (diff < 0) return <span className="text-red-400">Overdue {Math.abs(Math.round(diff))}h</span>;
  if (diff < 24) return <span className="text-amber-400">In {Math.round(diff)}h</span>;
  return <span className="text-slate-400">In {Math.round(diff / 24)}d</span>;
}

export default function TrackingTable({ shipments, loading, onView }) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-[#1e1e2e] bg-[#111118] p-8 flex items-center justify-center gap-3 text-slate-500">
        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
        Loading shipments…
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#1e1e2e] bg-[#111118] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e1e2e]">
              {['Tracking', 'Customer', 'Items', 'Courier', 'Status', 'Location', 'Value', 'Priority', 'ETA', 'Updated', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e1e2e]">
            {shipments.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-500">
                    <svg className="w-10 h-10 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1" /></svg>
                    No shipments found
                  </div>
                </td>
              </tr>
            ) : shipments.map(s => {
              const st = TRACKING_STATUSES[s.status];
              const pr = PRIORITIES[s.priority];
              const lastEvent = s.events?.[0];

              return (
                <tr key={s._id} onClick={() => onView(s)} className="cursor-pointer group hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-mono text-orange-400 text-xs font-bold">{s.trackingNumber}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{s.orderId}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-white text-sm font-medium">{s.customer.name}</p>
                    <p className="text-[10px] text-slate-500">{s.customer.phone}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-slate-300 max-w-[160px] truncate" title={s.items.map(i => i.name).join(', ')}>
                      {s.items[0].name}
                    </p>
                    <p className="text-[10px] text-slate-500">{s.items.length} item{s.items.length > 1 ? 's' : ''} · {s.weight}kg</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-slate-300">{s.courier}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{s.courierCode}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${st.cls}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${st.dot} ${['in_transit', 'out_for_delivery'].includes(s.status) ? 'animate-pulse' : ''}`} />
                      {st.icon} {st.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-slate-300 max-w-[140px] truncate" title={s.currentLocation}>📍 {s.currentLocation}</p>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <p className="text-sm text-white font-semibold">৳{s.value.toLocaleString()}</p>
                    {s.isCod && <p className="text-[10px] text-amber-400">COD</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${pr.cls}`}>{pr.label}</span>
                  </td>
                  <td className="px-4 py-3 text-xs whitespace-nowrap">{etaText(s.estimatedDelivery, s.status)}</td>
                  <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{timeAgo(lastEvent?.timestamp || s.createdAt)}</td>
                  <td className="px-4 py-3">
                    <button onClick={(e) => { e.stopPropagation(); onView(s); }} className="opacity-0 group-hover:opacity-100 px-2 py-1 rounded text-orange-400 text-xs font-semibold hover:bg-orange-500/10 transition-all">
                      Track →
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
