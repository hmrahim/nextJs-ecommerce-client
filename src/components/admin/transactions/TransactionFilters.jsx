'use client';

import { PAYMENT_METHODS, TRANSACTION_STATUS, TRANSACTION_TYPES } from './_dummyData';

export default function TransactionFilters({ filters, setFilters, onExport, onReset }) {
  const update = (k, v) => setFilters(p => ({ ...p, [k]: v }));

  return (
    <div className="bg-[#16161f] border border-white/5 rounded-xl p-4 mb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
        <div className="lg:col-span-2">
          <label className="block text-xs text-gray-400 mb-1">Search</label>
          <input
            type="text"
            placeholder="Txn ID, Order, Customer, Phone..."
            value={filters.search}
            onChange={e => update('search', e.target.value)}
            className="w-full bg-[#111118] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Status</label>
          <select value={filters.status} onChange={e => update('status', e.target.value)}
            className="w-full bg-[#111118] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500/50">
            <option value="">All Status</option>
            {Object.entries(TRANSACTION_STATUS).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Payment Method</label>
          <select value={filters.method} onChange={e => update('method', e.target.value)}
            className="w-full bg-[#111118] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500/50">
            <option value="">All Methods</option>
            {PAYMENT_METHODS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Type</label>
          <select value={filters.type} onChange={e => update('type', e.target.value)}
            className="w-full bg-[#111118] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500/50">
            <option value="">All Types</option>
            {Object.entries(TRANSACTION_TYPES).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Date Range</label>
          <select value={filters.range} onChange={e => update('range', e.target.value)}
            className="w-full bg-[#111118] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500/50">
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Min Amount (৳)</label>
          <input type="number" value={filters.minAmount} onChange={e => update('minAmount', e.target.value)}
            className="w-full bg-[#111118] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500/50" />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Max Amount (৳)</label>
          <input type="number" value={filters.maxAmount} onChange={e => update('maxAmount', e.target.value)}
            className="w-full bg-[#111118] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500/50" />
        </div>
        <div className="md:col-span-2 flex items-end gap-2">
          <button onClick={onReset}
            className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg text-sm transition-colors">
            Reset Filters
          </button>
          <button onClick={onExport}
            className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors">
            Export CSV
          </button>
        </div>
      </div>
    </div>
  );
}
