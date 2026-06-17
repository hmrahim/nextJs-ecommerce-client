// 📁 PATH: src/components/admin/returns/_dummyData.js
// ⚠️  NEW FILE

const now = Date.now();
const d = (days) => new Date(now - 86400000 * days).toISOString();

export const RETURN_REASONS = [
  'Item damaged on arrival',
  'Wrong item received',
  'Item not as described',
  'Changed my mind',
  'Found better price elsewhere',
  'Item defective / not working',
  'Missing parts or accessories',
  'Ordered by mistake',
];

export const DUMMY_RETURNS = [
  {
    _id: 'ret001', returnNumber: 'RET-2001',
    orderId: { _id: 'ord001', orderNumber: 'ORD-10421' },
    userId: { _id: 'c001', firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.johnson@email.com' },
    status: 'pending_review',
    type: 'return_refund',
    items: [
      { productId: { name: 'Premium Wireless Headphones' }, variantSku: 'HDPH-BLK-001', quantity: 1, price: 129.99, reason: 'Item defective / not working', images: [] },
    ],
    refundAmount: 129.99, refundMethod: 'original_payment',
    shippingLabel: null, trackingNumber: null,
    notes: [],
    timeline: [
      { status: 'submitted', note: 'Return request submitted by customer.', createdAt: d(2) },
    ],
    createdAt: d(2), updatedAt: d(2),
  },
  {
    _id: 'ret002', returnNumber: 'RET-2002',
    orderId: { _id: 'ord002', orderNumber: 'ORD-10389' },
    userId: { _id: 'c003', firstName: 'Priya', lastName: 'Sharma', email: 'priya.s@startup.io' },
    status: 'approved',
    type: 'return_refund',
    items: [
      { productId: { name: 'Yoga Mat Premium' }, variantSku: 'YM-PRP-003', quantity: 1, price: 64.99, reason: 'Item not as described', images: [] },
    ],
    refundAmount: 64.99, refundMethod: 'original_payment',
    shippingLabel: 'LABEL-XYZ-881', trackingNumber: null,
    notes: [{ _id: 'n1', text: 'Label sent to customer via email.', createdAt: d(3), author: 'Admin' }],
    timeline: [
      { status: 'submitted', note: 'Return request submitted.', createdAt: d(5) },
      { status: 'approved', note: 'Approved. Shipping label emailed to customer.', createdAt: d(3) },
    ],
    createdAt: d(5), updatedAt: d(3),
  },
  {
    _id: 'ret003', returnNumber: 'RET-2003',
    orderId: { _id: 'ord003', orderNumber: 'ORD-10312' },
    userId: { _id: 'c007', firstName: 'Amanda', lastName: 'Foster', email: 'afoster@icloud.com' },
    status: 'item_received',
    type: 'return_refund',
    items: [
      { productId: { name: 'Ceramic Coffee Dripper' }, variantSku: 'CCD-WHT-001', quantity: 2, price: 39.99, reason: 'Changed my mind', images: [] },
      { productId: { name: 'Bamboo Cutting Board Set' }, variantSku: 'BCB-NAT-001', quantity: 1, price: 27.99, reason: 'Ordered by mistake', images: [] },
    ],
    refundAmount: 107.97, refundMethod: 'store_credit',
    shippingLabel: 'LABEL-ABC-442', trackingNumber: '1Z999AA10123456784',
    notes: [],
    timeline: [
      { status: 'submitted', note: 'Return request submitted.', createdAt: d(10) },
      { status: 'approved', note: 'Approved. Label sent.', createdAt: d(8) },
      { status: 'item_received', note: 'Item received and inspected. Condition: Good.', createdAt: d(1) },
    ],
    createdAt: d(10), updatedAt: d(1),
  },
  {
    _id: 'ret004', returnNumber: 'RET-2004',
    orderId: { _id: 'ord004', orderNumber: 'ORD-10280' },
    userId: { _id: 'c011', firstName: 'Lily', lastName: 'Zhang', email: 'lzhang@gmail.com' },
    status: 'refund_processed',
    type: 'refund_only',
    items: [
      { productId: { name: 'Merino Wool Blanket' }, variantSku: 'MWB-GRY-002', quantity: 1, price: 89.99, reason: 'Item damaged on arrival', images: ['damage1.jpg'] },
    ],
    refundAmount: 89.99, refundMethod: 'original_payment',
    refundTransactionId: 'TXN-RF-9981',
    shippingLabel: null, trackingNumber: null,
    notes: [{ _id: 'n2', text: 'Refund only — customer kept the item. Photo evidence confirmed damage.', createdAt: d(12), author: 'Admin' }],
    timeline: [
      { status: 'submitted', note: 'Refund request submitted with damage photos.', createdAt: d(15) },
      { status: 'approved', note: 'Approved as refund-only. No return needed.', createdAt: d(14) },
      { status: 'refund_processed', note: `Refund of SAR 89.99 processed to original payment. Ref: TXN-RF-9981.`, createdAt: d(12) },
    ],
    createdAt: d(15), updatedAt: d(12),
  },
  {
    _id: 'ret005', returnNumber: 'RET-2005',
    orderId: { _id: 'ord005', orderNumber: 'ORD-10201' },
    userId: { _id: 'c002', firstName: 'Marcus', lastName: 'Thompson', email: 'mthompson@company.com' },
    status: 'rejected',
    type: 'return_refund',
    items: [
      { productId: { name: 'Mechanical Keyboard TKL' }, variantSku: 'MKB-BLK-001', quantity: 1, price: 149.99, reason: 'Changed my mind', images: [] },
    ],
    refundAmount: 0, refundMethod: 'original_payment',
    rejectionReason: 'Return window of 30 days has expired. Order placed 45 days ago.',
    shippingLabel: null, trackingNumber: null,
    notes: [],
    timeline: [
      { status: 'submitted', note: 'Return request submitted.', createdAt: d(3) },
      { status: 'rejected', note: 'Rejected: return window expired.', createdAt: d(2) },
    ],
    createdAt: d(3), updatedAt: d(2),
  },
  {
    _id: 'ret006', returnNumber: 'RET-2006',
    orderId: { _id: 'ord006', orderNumber: 'ORD-10422' },
    userId: { _id: 'c010', firstName: 'Carlos', lastName: 'Mendez', email: 'cmendez@corp.com' },
    status: 'pending_review',
    type: 'exchange',
    items: [
      { productId: { name: 'Linen Tote Bag' }, variantSku: 'LTB-NAT-SM', quantity: 2, price: 19.99, reason: 'Wrong item received', images: ['wrong_item.jpg'] },
    ],
    refundAmount: 0, refundMethod: 'exchange',
    exchangeVariant: 'LTB-NAT-LG',
    shippingLabel: null, trackingNumber: null,
    notes: [],
    timeline: [
      { status: 'submitted', note: 'Exchange request — wrong size received.', createdAt: d(1) },
    ],
    createdAt: d(1), updatedAt: d(1),
  },
  {
    _id: 'ret007', returnNumber: 'RET-2007',
    orderId: { _id: 'ord007', orderNumber: 'ORD-10398' },
    userId: { _id: 'c004', firstName: 'David', lastName: 'Kim', email: 'dkim@gmail.com' },
    status: 'approved',
    type: 'return_refund',
    items: [
      { productId: { name: 'Stainless Steel Bottle' }, variantSku: 'SSB-SLV-500', quantity: 1, price: 24.99, reason: 'Missing parts or accessories', images: [] },
    ],
    refundAmount: 24.99, refundMethod: 'store_credit',
    shippingLabel: 'LABEL-DEF-667', trackingNumber: null,
    notes: [],
    timeline: [
      { status: 'submitted', note: 'Lid missing from package.', createdAt: d(6) },
      { status: 'approved', note: 'Approved. Label emailed.', createdAt: d(5) },
    ],
    createdAt: d(6), updatedAt: d(5),
  },
  {
    _id: 'ret008', returnNumber: 'RET-2008',
    orderId: { _id: 'ord008', orderNumber: 'ORD-10354' },
    userId: { _id: 'c012', firstName: 'James', lastName: "O'Brien", email: 'jobrien@fastmail.com' },
    status: 'refund_processed',
    type: 'return_refund',
    items: [
      { productId: { name: 'Cold Brew Coffee Maker' }, variantSku: 'CBM-BLK-001', quantity: 1, price: 44.99, reason: 'Item defective / not working', images: ['defect1.jpg', 'defect2.jpg'] },
    ],
    refundAmount: 44.99, refundMethod: 'original_payment',
    refundTransactionId: 'TXN-RF-0042',
    shippingLabel: 'LABEL-GHI-991', trackingNumber: '1Z999AA10123456799',
    notes: [{ _id: 'n3', text: 'Full refund issued. Item disposed — too damaged to restock.', createdAt: d(18), author: 'Admin' }],
    timeline: [
      { status: 'submitted', note: 'Defective product reported with photos.', createdAt: d(25) },
      { status: 'approved', note: 'Approved. Label sent.', createdAt: d(23) },
      { status: 'item_received', note: 'Item received. Confirmed defective.', createdAt: d(20) },
      { status: 'refund_processed', note: 'Full refund processed. Ref: TXN-RF-0042.', createdAt: d(18) },
    ],
    createdAt: d(25), updatedAt: d(18),
  },
];

export const STATUS_CONFIG = {
  pending_review:    { label: 'Pending Review',    color: 'amber',   dot: 'bg-amber-400',   cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  approved:          { label: 'Approved',           color: 'sky',     dot: 'bg-sky-400',     cls: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
  rejected:          { label: 'Rejected',           color: 'red',     dot: 'bg-red-400',     cls: 'bg-red-500/10 text-red-400 border-red-500/20' },
  item_received:     { label: 'Item Received',      color: 'violet',  dot: 'bg-violet-400',  cls: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
  refund_processed:  { label: 'Refund Processed',  color: 'emerald', dot: 'bg-emerald-400', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  closed:            { label: 'Closed',             color: 'slate',   dot: 'bg-slate-400',   cls: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
};

export const TYPE_CONFIG = {
  return_refund: { label: 'Return & Refund', icon: '↩️' },
  refund_only:   { label: 'Refund Only',     icon: '💰' },
  exchange:      { label: 'Exchange',        icon: '🔄' },
};

export const REFUND_METHODS = [
  { value: 'original_payment', label: 'Original Payment Method' },
  { value: 'store_credit',     label: 'Store Credit' },
  { value: 'bank_transfer',    label: 'Bank Transfer' },
  { value: 'exchange',         label: 'Exchange' },
];
