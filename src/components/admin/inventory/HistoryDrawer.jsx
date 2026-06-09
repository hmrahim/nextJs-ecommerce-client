
'use client';
import { AdjTypeBadge } from './StockBadge';

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60)     return `${Math.floor(diff)}s ago`;
  if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function HistoryDrawer({ item, history = [], onClose }) {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-sm h-full bg-[#0d0d14] border-l border-[#1e1e2e] flex flex-col shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-5 border-b border-[#1e1e2e] flex items-start justify-between flex-shrink-0">
          <div>
            <h2 className="text-base font-semibold text-white">Adjustment History</h2>
            <p className="text-xs text-slate-500 mt-0.5 font-mono">{item.variantSku}</p>
            <p className="text-xs text-slate-400 mt-0.5">{item.productName}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 transition-colors flex-shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Timeline */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center border border-[#1e1e2e]">
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-slate-500 text-sm">No history yet</p>
            </div>
          ) : (
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-[15px] top-2 bottom-2 w-px bg-[#1e1e2e]" />
              <div className="space-y-4">
                {history.map((entry, idx) => {
                  const isPositive = entry.delta > 0;
                  return (
                    <div key={entry._id} className="flex gap-4 items-start">
                      {/* Dot */}
                      <div className={`w-8 h-8 rounded-full border flex items-center justify-center flex-shrink-0 z-10 ${
                        isPositive
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-red-500/10    border-red-500/30    text-red-400'
                      }`}>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {isPositive
                            ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v12M6 12l6-6 6 6" />
                            : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 18V6M6 12l6 6 6-6" />
                          }
                        </svg>
                      </div>
                      {/* Content */}
                      <div className="flex-1 min-w-0 rounded-xl bg-[#111118] border border-[#1e1e2e] p-3">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <AdjTypeBadge type={entry.type} />
                          <span className={`text-base font-bold tabular-nums ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                            {isPositive ? '+' : ''}{entry.delta.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
                          <span>{entry.before} → <span className="text-white font-semibold">{entry.after}</span></span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">{entry.reason}</p>
                        <div className="flex items-center justify-between mt-2 text-xs text-slate-600">
                          <span>{entry.user}</span>
                          <span>{timeAgo(entry.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
