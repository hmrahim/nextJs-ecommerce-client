// Dummy transactions data - Bangladesh e-commerce style (bKash, Nagad, Rocket, Cards, COD)

export const PAYMENT_METHODS = [
  { id: 'bkash', name: 'bKash', icon: '📱', color: 'bg-pink-500/10 text-pink-400 border-pink-500/30' },
  { id: 'nagad', name: 'Nagad', icon: '💰', color: 'bg-orange-500/10 text-orange-400 border-orange-500/30' },
  { id: 'rocket', name: 'Rocket', icon: '🚀', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
  { id: 'upay', name: 'Upay', icon: '💳', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' },
  { id: 'card', name: 'Card (Visa/Master)', icon: '💳', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  { id: 'sslcommerz', name: 'SSLCommerz', icon: '🏦', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' },
  { id: 'cod', name: 'Cash on Delivery', icon: '💵', color: 'bg-green-500/10 text-green-400 border-green-500/30' },
  { id: 'bank', name: 'Bank Transfer', icon: '🏛️', color: 'bg-gray-500/10 text-gray-300 border-gray-500/30' },
];

export const TRANSACTION_STATUS = {
  SUCCESS:    { label: 'Success',    color: 'bg-green-500/10 text-green-400 border-green-500/30' },
  PENDING:    { label: 'Pending',    color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' },
  PROCESSING: { label: 'Processing', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  FAILED:     { label: 'Failed',     color: 'bg-red-500/10 text-red-400 border-red-500/30' },
  REFUNDED:   { label: 'Refunded',   color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
  DISPUTED:   { label: 'Disputed',   color: 'bg-orange-500/10 text-orange-400 border-orange-500/30' },
  CANCELLED:  { label: 'Cancelled',  color: 'bg-gray-500/10 text-gray-300 border-gray-500/30' },
};

export const TRANSACTION_TYPES = {
  PAYMENT:    { label: 'Payment',    color: 'text-green-400' },
  REFUND:     { label: 'Refund',     color: 'text-red-400' },
  PAYOUT:     { label: 'Payout',     color: 'text-blue-400' },
  CHARGEBACK: { label: 'Chargeback', color: 'text-orange-400' },
  ADJUSTMENT: { label: 'Adjustment', color: 'text-purple-400' },
};

const customers = [
  { name: 'Rahim Uddin',     email: 'rahim@example.com',     phone: '+8801711234567' },
  { name: 'Karim Hossain',   email: 'karim@example.com',     phone: '+8801812345678' },
  { name: 'Fatema Begum',    email: 'fatema@example.com',    phone: '+8801913456789' },
  { name: 'Ayesha Akter',    email: 'ayesha@example.com',    phone: '+8801614567890' },
  { name: 'Sajid Rahman',    email: 'sajid@example.com',     phone: '+8801515678901' },
  { name: 'Nusrat Jahan',    email: 'nusrat@example.com',    phone: '+8801716789012' },
  { name: 'Tanvir Ahmed',    email: 'tanvir@example.com',    phone: '+8801817890123' },
  { name: 'Mahmuda Khatun',  email: 'mahmuda@example.com',   phone: '+8801918901234' },
  { name: 'Imran Hossain',   email: 'imran@example.com',     phone: '+8801619012345' },
  { name: 'Sumaiya Islam',   email: 'sumaiya@example.com',   phone: '+8801510123456' },
  { name: 'Rakib Hasan',     email: 'rakib@example.com',     phone: '+8801711122233' },
  { name: 'Tania Sultana',   email: 'tania@example.com',     phone: '+8801812233344' },
];

const gateways = ['SSLCommerz', 'bKash PGW', 'Nagad PGW', 'Stripe', 'Manual', 'AamarPay'];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function makeTxn(i) {
  const method = pick(PAYMENT_METHODS);
  const statusKeys = ['SUCCESS','SUCCESS','SUCCESS','SUCCESS','PENDING','PROCESSING','FAILED','REFUNDED','DISPUTED','CANCELLED'];
  const status = pick(statusKeys);
  const typeKeys = ['PAYMENT','PAYMENT','PAYMENT','PAYMENT','PAYMENT','REFUND','PAYOUT','CHARGEBACK','ADJUSTMENT'];
  const type = pick(typeKeys);
  const customer = pick(customers);
  const amount = rand(150, 25000);
  const fee = Math.round(amount * (method.id === 'cod' ? 0.005 : 0.018));
  const tax = Math.round(amount * 0.05);
  const net = amount - fee;
  const daysAgo = rand(0, 60);
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(rand(0,23), rand(0,59), rand(0,59));

  return {
    id: `TXN-${String(100000 + i).padStart(7, '0')}`,
    orderId: `ORD-${String(50000 + rand(0, 9999)).padStart(6, '0')}`,
    invoiceId: `INV-${String(20000 + i).padStart(6, '0')}`,
    referenceId: `REF${rand(100000000, 999999999)}`,
    gatewayTxnId: `${method.id.toUpperCase()}${rand(10000000000, 99999999999)}`,
    customer,
    paymentMethod: method.id,
    paymentMethodName: method.name,
    gateway: pick(gateways),
    type,
    status,
    amount,
    fee,
    tax,
    net,
    currency: 'SAR',
    createdAt: date.toISOString(),
    updatedAt: date.toISOString(),
    ipAddress: `103.${rand(1,255)}.${rand(1,255)}.${rand(1,255)}`,
    device: pick(['Mobile - Android','Mobile - iOS','Desktop - Chrome','Desktop - Safari','Tablet - iPad']),
    notes: status === 'FAILED' ? 'Insufficient balance on customer account' : status === 'DISPUTED' ? 'Customer raised dispute - product not received' : status === 'REFUNDED' ? 'Refund processed - customer requested cancellation' : '',
    riskScore: rand(0, 100),
    timeline: buildTimeline(status, date),
  };
}

function buildTimeline(status, baseDate) {
  const steps = [];
  const t = (mins) => { const d = new Date(baseDate); d.setMinutes(d.getMinutes() + mins); return d.toISOString(); };
  steps.push({ time: t(0),  title: 'Transaction Initiated', desc: 'Customer initiated payment from checkout' });
  steps.push({ time: t(1),  title: 'Sent to Gateway',       desc: 'Payment request forwarded to gateway' });
  if (status === 'PENDING')    { steps.push({ time: t(2), title: 'Awaiting Confirmation', desc: 'Waiting for gateway response' }); }
  if (status === 'PROCESSING') { steps.push({ time: t(2), title: 'Processing',  desc: 'Gateway is processing the transaction' }); }
  if (status === 'SUCCESS')    { steps.push({ time: t(3), title: 'Payment Captured', desc: 'Amount successfully captured' });
                                 steps.push({ time: t(4), title: 'Settled',     desc: 'Funds added to merchant balance' }); }
  if (status === 'FAILED')     { steps.push({ time: t(3), title: 'Failed',      desc: 'Gateway returned error: declined' }); }
  if (status === 'REFUNDED')   { steps.push({ time: t(3), title: 'Captured',    desc: 'Initial capture successful' });
                                 steps.push({ time: t(rand(60,500)), title: 'Refund Issued', desc: 'Full refund processed to source' }); }
  if (status === 'DISPUTED')   { steps.push({ time: t(3), title: 'Captured',    desc: 'Initial capture successful' });
                                 steps.push({ time: t(rand(1000,3000)), title: 'Dispute Raised', desc: 'Customer filed a dispute' }); }
  if (status === 'CANCELLED')  { steps.push({ time: t(2), title: 'Cancelled',   desc: 'Customer cancelled before completion' }); }
  return steps;
}

export const DUMMY_TRANSACTIONS = Array.from({ length: 60 }, (_, i) => makeTxn(i + 1))
  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

export function getTxnStats(txns) {
  const total   = txns.length;
  const success = txns.filter(t => t.status === 'SUCCESS');
  const pending = txns.filter(t => ['PENDING','PROCESSING'].includes(t.status));
  const failed  = txns.filter(t => ['FAILED','CANCELLED'].includes(t.status));
  const refund  = txns.filter(t => t.status === 'REFUNDED');
  const dispute = txns.filter(t => t.status === 'DISPUTED');

  const gross   = success.reduce((s, t) => s + t.amount, 0);
  const fees    = success.reduce((s, t) => s + t.fee, 0);
  const net     = success.reduce((s, t) => s + t.net, 0);
  const refundAmt = refund.reduce((s, t) => s + t.amount, 0);

  return {
    total,
    successCount: success.length,
    pendingCount: pending.length,
    failedCount: failed.length,
    refundCount: refund.length,
    disputeCount: dispute.length,
    gross, fees, net, refundAmt,
    successRate: total ? ((success.length / total) * 100).toFixed(1) : 0,
  };
}
