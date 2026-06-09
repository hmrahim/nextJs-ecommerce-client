'use client';

import { useMemo, useState } from 'react';
import { DUMMY_TRANSACTIONS, getTxnStats, PAYMENT_METHODS } from '@/components/admin/transactions/_dummyData';
import TransactionFilters from '@/components/admin/transactions/TransactionFilters';
import TransactionTable from '@/components/admin/transactions/TransactionTable';
import TransactionDetailModal from '@/components/admin/transactions/TransactionDetailModal';
import RefundModal from '@/components/admin/transactions/RefundModal';

const INITIAL_FILTERS = {
  search: '', status: '', method: '', type: '',
  range: 'all', minAmount: '', maxAmount: '',
};

export default function TransactionsPage() {
  const [txns, setTxns]       = useState(DUMMY_TRANSACTIONS);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [page, setPage]       = useState(1);
  const [detail, setDetail]   = useState(null);
  const [refund, setRefund]   = useState(null);
  const [toast, setToast]     = useState('');

  const filtered = useMemo(() => {
    const now = Date.now();
    const ranges = { today: 1, '7d': 7, '30d': 30, '90d': 90 };

    return txns.filter(t => {
      if (filters.status && t.status !== filters.status) return false;
      if (filters.method && t.paymentMethod !== filters.method) return false;
      if (filters.type   && t.type !== filters.type) return false;
      if (filters.minAmount && t.amount < Number(filters.minAmount)) return false;
      if (filters.maxAmount && t.amount > Number(filters.maxAmount)) return false;
      if (filters.range !== 'all') {
        const days = ranges[filters.range];
        if (days && (now - new Date(t.createdAt).getTime()) > days * 86400000) return false;
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const hay = `${t.id} ${t.orderId} ${t.invoiceId} ${t.referenceId} ${t.gatewayTxnId} ${t.customer.name} ${t.customer.email} ${t.customer.phone}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [txns, filters]);

  const stats = useMemo(() => getTxnStats(filtered), [filtered]);

  const resetFilters = () => { setFilters(INITIAL_FILTERS); setPage(1); };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const handleExport = () => {
    const header = ['ID','Order','Customer','Phone','Method','Type','Status','Amount','Fee','Net','Date'];
    const rows = filtered.map(t => [
      t.id, t.orderId, t.customer.name, t.customer.phone,
      t.paymentMethodName, t.type, t.status,
      t.amount, t.fee, t.net, t.createdAt,
    ]);
    const csv = [header, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `transactions-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
    showToast('Exported CSV successfully');
  };

  const handleRefund = ({ txnId, amount, reason, note }) => {
    setTxns(prev => prev.map(t => {
      if (t.id !== txnId) return t;
      const isFull = amount >= t.amount;
      const newTimeline = [...t.timeline, {
        time: new Date().toISOString(),
        title: isFull ? 'Refund Issued' : 'Partial Refund Issued',
        desc: `৳${amount.toLocaleString()} refunded - ${reason}${note ? ` (${note})` : ''}`,
      }];
      return { ...t, status: isFull ? 'REFUNDED' : t.status, notes: note || t.notes, timeline: newTimeline, updatedAt: new Date().toISOString() };
    }));
    setRefund(null);
    setDetail(null);
    showToast(`Refund of ৳${amount.toLocaleString()} processed`);
  };

  // Method breakdown
  const methodStats = useMemo(() => {
    const map = {};
    PAYMENT_METHODS.forEach(m => { map[m.id] = { ...m, count: 0, amount: 0 }; });
    filtered.filter(t => t.status === 'SUCCESS').forEach(t => {
      if (map[t.paymentMethod]) { map[t.paymentMethod].count++; map[t.paymentMethod].amount += t.amount; }
    });
    return Object.values(map).sort((a, b) => b.amount - a.amount);
  }, [filtered]);

  const maxMethodAmount = Math.max(...methodStats.map(m => m.amount), 1);

  return (
    <div className="min-h-screen bg-[#0e0e14] text-white p-4 md:p-6">
      {toast && (
        <div className="fixed top-4 right-4 z-[60] bg-green-500/10 border border-green-500/30 text-green-300 px-4 py-2 rounded-lg text-sm shadow-lg">
          {toast}
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Transactions</h1>
        <p className="text-sm text-gray-400 mt-1">Monitor payments, refunds, and settlements across all gateways</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
        <StatCard label="Total Txns"    value={stats.total}        sub={`${stats.successRate}% success`} />
        <StatCard label="Gross Revenue" value={`৳${stats.gross.toLocaleString()}`} sub="from successful" color="text-green-400" />
        <StatCard label="Net Revenue"   value={`৳${stats.net.toLocaleString()}`}   sub={`Fees ৳${stats.fees.toLocaleString()}`} color="text-orange-400" />
        <StatCard label="Pending"       value={stats.pendingCount} sub="awaiting" color="text-yellow-400" />
        <StatCard label="Refunds"       value={stats.refundCount}  sub={`৳${stats.refundAmt.toLocaleString()}`} color="text-purple-400" />
        <StatCard label="Disputes"      value={stats.disputeCount} sub="needs action" color="text-red-400" />
      </div>

      {/* Method breakdown */}
      <div className="bg-[#16161f] border border-white/5 rounded-xl p-4 mb-4">
        <h3 className="text-sm font-semibold text-white mb-3">Revenue by Payment Method</h3>
        <div className="space-y-2">
          {methodStats.filter(m => m.count > 0).slice(0, 6).map(m => (
            <div key={m.id} className="flex items-center gap-3">
              <div className="w-32 flex items-center gap-2 text-xs text-gray-300">
                <span>{m.icon}</span>{m.name}
              </div>
              <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-orange-500 to-orange-400" style={{ width: `${(m.amount / maxMethodAmount) * 100}%` }} />
              </div>
              <div className="w-32 text-right text-xs">
                <span className="text-white font-medium">৳{m.amount.toLocaleString()}</span>
                <span className="text-gray-500 ml-2">({m.count})</span>
              </div>
            </div>
          ))}
          {methodStats.filter(m => m.count > 0).length === 0 && (
            <p className="text-xs text-gray-500 text-center py-4">No successful transactions in current filter</p>
          )}
        </div>
      </div>

      <TransactionFilters filters={filters} setFilters={(f) => { setFilters(f); setPage(1); }} onExport={handleExport} onReset={resetFilters} />

      <TransactionTable
        rows={filtered}
        onView={setDetail}
        onRefund={setRefund}
        page={page}
        setPage={setPage}
        perPage={10}
      />

      <TransactionDetailModal txn={detail} onClose={() => setDetail(null)} onRefund={setRefund} />
      <RefundModal txn={refund} onClose={() => setRefund(null)} onConfirm={handleRefund} />
    </div>
  );
}

function StatCard({ label, value, sub, color = 'text-white' }) {
  return (
    <div className="bg-[#16161f] border border-white/5 rounded-xl p-4">
      <div className="text-xs text-gray-400">{label}</div>
      <div className={`text-xl font-bold mt-1 ${color}`}>{value}</div>
      {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
    </div>
  );
}
