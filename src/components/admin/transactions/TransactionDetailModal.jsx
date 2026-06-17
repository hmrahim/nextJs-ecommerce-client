'use client';

import { PAYMENT_METHODS, TRANSACTION_STATUS, TRANSACTION_TYPES } from './_dummyData';

const methodMap = Object.fromEntries(PAYMENT_METHODS.map(m => [m.id, m]));

function fmt(iso) {
  return new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function TransactionDetailModal({ txn, onClose, onRefund }) {
  if (!txn) return null;
  const m = methodMap[txn.paymentMethod];
  const s = TRANSACTION_STATUS[txn.status];
  const ty = TRANSACTION_TYPES[txn.type];
  const riskColor = txn.riskScore > 70 ? 'text-red-400' : txn.riskScore > 40 ? 'text-yellow-400' : 'text-green-400';

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start md:items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-[#16161f] border border-white/10 rounded-2xl w-full max-w-4xl my-8" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div>
            <h2 className="text-white text-lg font-semibold">{txn.id}</h2>
            <p className="text-xs text-gray-400">Reference: {txn.referenceId}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-md border text-xs ${s.color}`}>{s.label}</span>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none">×</button>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: Amount + breakdown */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-[#111118] border border-white/5 rounded-xl p-4">
              <div className="text-xs text-gray-400 mb-1">Total Amount</div>
              <div className="text-3xl font-bold text-white">SAR {txn.amount.toLocaleString()}</div>
              <div className={`text-xs mt-1 font-medium ${ty.color}`}>{ty.label}</div>
            </div>
            <div className="bg-[#111118] border border-white/5 rounded-xl p-4 space-y-2 text-sm">
              <Row label="Subtotal"     value={`SAR ${(txn.amount - txn.tax).toLocaleString()}`} />
              <Row label="Tax (5%)"     value={`SAR ${txn.tax.toLocaleString()}`} />
              <Row label="Gateway Fee"  value={`-SAR ${txn.fee.toLocaleString()}`} cls="text-red-400" />
              <div className="border-t border-white/5 pt-2 mt-2">
                <Row label="Net to Merchant" value={`SAR ${txn.net.toLocaleString()}`} cls="text-green-400 font-semibold" />
              </div>
            </div>
            <div className="bg-[#111118] border border-white/5 rounded-xl p-4">
              <div className="text-xs text-gray-400 mb-2">Risk Score</div>
              <div className="flex items-center justify-between">
                <div className={`text-2xl font-bold ${riskColor}`}>{txn.riskScore}/100</div>
                <div className={`text-xs ${riskColor}`}>{txn.riskScore > 70 ? 'High' : txn.riskScore > 40 ? 'Medium' : 'Low'}</div>
              </div>
              <div className="mt-2 h-2 bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full ${txn.riskScore > 70 ? 'bg-red-500' : txn.riskScore > 40 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${txn.riskScore}%` }} />
              </div>
            </div>
          </div>

          {/* MIDDLE: Info */}
          <div className="lg:col-span-2 space-y-4">
            <Section title="Customer">
              <Row label="Name"  value={txn.customer.name} />
              <Row label="Email" value={txn.customer.email} />
              <Row label="Phone" value={txn.customer.phone} />
            </Section>

            <Section title="Payment Details">
              <Row label="Method" value={<span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-xs ${m.color}`}><span>{m.icon}</span>{m.name}</span>} />
              <Row label="Gateway"        value={txn.gateway} />
              <Row label="Gateway Txn ID" value={<code className="text-xs">{txn.gatewayTxnId}</code>} />
              <Row label="Order ID"       value={txn.orderId} />
              <Row label="Invoice"        value={txn.invoiceId} />
            </Section>

            <Section title="Session">
              <Row label="IP Address" value={txn.ipAddress} />
              <Row label="Device"     value={txn.device} />
              <Row label="Created"    value={fmt(txn.createdAt)} />
              <Row label="Updated"    value={fmt(txn.updatedAt)} />
            </Section>

            {txn.notes && (
              <Section title="Notes">
                <p className="text-sm text-gray-300">{txn.notes}</p>
              </Section>
            )}

            <Section title="Timeline">
              <div className="space-y-3">
                {txn.timeline.map((ev, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-orange-500 mt-1.5" />
                      {i < txn.timeline.length - 1 && <div className="w-px flex-1 bg-white/10 my-1" />}
                    </div>
                    <div className="flex-1 pb-2">
                      <div className="flex justify-between gap-3">
                        <div className="text-sm text-white font-medium">{ev.title}</div>
                        <div className="text-xs text-gray-500 whitespace-nowrap">{fmt(ev.time)}</div>
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">{ev.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-end gap-2 px-6 py-4 border-t border-white/5 bg-[#111118] rounded-b-2xl">
          <button onClick={() => window.print()} className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg text-sm">Print Receipt</button>
          {txn.status === 'SUCCESS' && (
            <button onClick={() => onRefund(txn)} className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium">Issue Refund</button>
          )}
          <button onClick={onClose} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm">Close</button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-[#111118] border border-white/5 rounded-xl p-4">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Row({ label, value, cls = '' }) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <div className="text-gray-400">{label}</div>
      <div className={`text-white text-right ${cls}`}>{value}</div>
    </div>
  );
}
