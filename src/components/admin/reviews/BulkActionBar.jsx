'use client';
import { useState } from 'react';

export default function BulkActionBar({ selectedCount, onBulkAction, onClearSelection }) {
  const [loading, setLoading] = useState('');

  if (selectedCount === 0) return null;

  const handle = async (action) => {
    if (action === 'delete' && !confirm(`Delete ${selectedCount} review(s) permanently?`)) return;
    setLoading(action);
    await onBulkAction(action);
    setLoading('');
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-violet-500/10 border border-violet-500/20">
      <span className="text-sm font-semibold text-violet-300">
        {selectedCount} selected
      </span>
      <div className="flex items-center gap-2 ml-auto">
        <button
          onClick={() => handle('approve')}
          disabled={!!loading}
          className="px-3 py-1.5 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
        >
          {loading === 'approve' ? (
            <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
          Approve All
        </button>
        <button
          onClick={() => handle('reject')}
          disabled={!!loading}
          className="px-3 py-1.5 rounded-lg bg-red-600/70 hover:bg-red-600 disabled:opacity-50 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
        >
          {loading === 'reject' ? (
            <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          Reject All
        </button>
        <button
          onClick={() => handle('delete')}
          disabled={!!loading}
          className="px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 disabled:opacity-50 text-xs font-semibold transition-colors flex items-center gap-1.5"
        >
          {loading === 'delete' ? (
            <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          )}
          Delete All
        </button>
        <button
          onClick={onClearSelection}
          className="px-3 py-1.5 rounded-lg border border-[#1e1e2e] text-slate-500 hover:text-slate-300 text-xs transition-colors"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
