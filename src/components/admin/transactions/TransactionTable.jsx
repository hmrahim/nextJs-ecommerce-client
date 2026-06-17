'use client';

import { PAYMENT_METHODS, TRANSACTION_STATUS, TRANSACTION_TYPES } from './_dummyData';

const methodMap = Object.fromEntries(PAYMENT_METHODS.map(m => [m.id, m]));

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function TransactionTable({ rows, onView, onRefund, page, setPage, perPage }) {
  const totalPages = Math.max(1, Math.ceil(rows.length / perPage));
  const slice = rows.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="bg-[#16161f] border border-white/5 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#111118] border-b border-white/5">
            <tr className="text-left text-gray-400 text-xs uppercase">
              <th className="px-4 py-3 font-medium">Transaction</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Method</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium text-right">Amount</th>
              <th className="px-4 py-3 font-medium text-right">Net</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {slice.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-12 text-center text-gray-500">No transactions found</td></tr>
            )}
            {slice.map(t => {
              const m = methodMap[t.paymentMethod];
              const s = TRANSACTION_STATUS[t.status];
              const ty = TRANSACTION_TYPES[t.type];
              return (
                <tr key={t.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    <div className="text-white font-medium">{t.id}</div>
                    <div className="text-xs text-gray-500">{t.orderId}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-white">{t.customer.name}</div>
                    <div className="text-xs text-gray-500">{t.customer.phone}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs ${m.color}`}>
                      <span>{m.icon}</span><span>{m.name}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${ty.color}`}>{ty.label}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="text-white font-medium">SAR {t.amount.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">Fee SAR {t.fee}</div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-green-400 font-medium">SAR {t.net.toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-1 rounded-md border text-xs ${s.color}`}>{s.label}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-300 text-xs whitespace-nowrap">{formatDate(t.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => onView(t)}
                        className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded text-xs">View</button>
                      {t.status === 'SUCCESS' && (
                        <button onClick={() => onRefund(t)}
                          className="px-2.5 py-1 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-400 rounded text-xs">Refund</button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-white/5 bg-[#111118]">
        <div className="text-xs text-gray-400">
          Showing {slice.length === 0 ? 0 : (page - 1) * perPage + 1}-{(page - 1) * perPage + slice.length} of {rows.length}
        </div>
        <div className="flex items-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded text-xs disabled:opacity-40 disabled:cursor-not-allowed">Previous</button>
          <span className="text-xs text-gray-300">Page {page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded text-xs disabled:opacity-40 disabled:cursor-not-allowed">Next</button>
        </div>
      </div>
    </div>
  );
}
