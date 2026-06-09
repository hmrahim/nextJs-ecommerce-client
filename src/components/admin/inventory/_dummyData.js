
// ── Warehouses ────────────────────────────────────────────────────────────────
export const DUMMY_WAREHOUSES = [
  { _id: 'wh001', name: 'Dhaka Central', address: '12 Tejgaon Industrial Area', city: 'Dhaka', country: 'Bangladesh', isActive: true, itemCount: 142, totalStock: 18450 },
  { _id: 'wh002', name: 'Chittagong Port', address: '5 Port Connecting Road', city: 'Chittagong', country: 'Bangladesh', isActive: true, itemCount: 87, totalStock: 9210 },
  { _id: 'wh003', name: 'Sylhet Hub',      address: '22 Airport Road',           city: 'Sylhet',      country: 'Bangladesh', isActive: true, itemCount: 53, totalStock: 4320 },
];

// ── Inventory items ───────────────────────────────────────────────────────────
export const DUMMY_INVENTORY = [
  {
    _id: 'inv001', productId: 'p001',
    productName: 'Premium Wireless Headphones', sku: 'ELC-WH-001',
    category: 'Electronics', imageUrl: null,
    warehouseId: 'wh001', warehouseName: 'Dhaka Central',
    variantSku: 'ELC-WH-001-BLK', attrs: { color: 'Black', size: null },
    quantity: 245, reserved: 12, threshold: 50,
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    _id: 'inv002', productId: 'p001',
    productName: 'Premium Wireless Headphones', sku: 'ELC-WH-001',
    category: 'Electronics', imageUrl: null,
    warehouseId: 'wh002', warehouseName: 'Chittagong Port',
    variantSku: 'ELC-WH-001-WHT', attrs: { color: 'White', size: null },
    quantity: 80, reserved: 5, threshold: 30,
    updatedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  {
    _id: 'inv003', productId: 'p002',
    productName: 'Mechanical Keyboard TKL', sku: 'ELC-KB-002',
    category: 'Electronics', imageUrl: null,
    warehouseId: 'wh001', warehouseName: 'Dhaka Central',
    variantSku: 'ELC-KB-002-RED', attrs: { color: 'Red', size: 'TKL' },
    quantity: 18, reserved: 3, threshold: 25,
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    _id: 'inv004', productId: 'p003',
    productName: 'Yoga Mat Premium', sku: 'SPT-YM-003',
    category: 'Sports', imageUrl: null,
    warehouseId: 'wh001', warehouseName: 'Dhaka Central',
    variantSku: 'SPT-YM-003-PUR', attrs: { color: 'Purple', size: '6mm' },
    quantity: 0, reserved: 0, threshold: 20,
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    _id: 'inv005', productId: 'p004',
    productName: 'Stainless Steel Water Bottle', sku: 'KTN-WB-004',
    category: 'Kitchen', imageUrl: null,
    warehouseId: 'wh003', warehouseName: 'Sylhet Hub',
    variantSku: 'KTN-WB-004-500', attrs: { color: 'Silver', size: '500ml' },
    quantity: 512, reserved: 40, threshold: 60,
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    _id: 'inv006', productId: 'p005',
    productName: 'Merino Wool Blanket', sku: 'HOM-BL-005',
    category: 'Home', imageUrl: null,
    warehouseId: 'wh002', warehouseName: 'Chittagong Port',
    variantSku: 'HOM-BL-005-GRY', attrs: { color: 'Grey', size: 'Queen' },
    quantity: 14, reserved: 6, threshold: 15,
    updatedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    _id: 'inv007', productId: 'p006',
    productName: 'Cold Brew Coffee Maker', sku: 'KTN-CM-006',
    category: 'Kitchen', imageUrl: null,
    warehouseId: 'wh001', warehouseName: 'Dhaka Central',
    variantSku: 'KTN-CM-006-CLR', attrs: { color: 'Clear', size: '1L' },
    quantity: 67, reserved: 8, threshold: 20,
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    _id: 'inv008', productId: 'p007',
    productName: 'Linen Tote Bag', sku: 'FAH-TB-007',
    category: 'Fashion', imageUrl: null,
    warehouseId: 'wh003', warehouseName: 'Sylhet Hub',
    variantSku: 'FAH-TB-007-NAT', attrs: { color: 'Natural', size: null },
    quantity: 9, reserved: 2, threshold: 20,
    updatedAt: new Date(Date.now() - 3600000 * 30).toISOString(),
  },
  {
    _id: 'inv009', productId: 'p008',
    productName: 'Artisan Soy Candle Set', sku: 'HOM-CS-008',
    category: 'Home', imageUrl: null,
    warehouseId: 'wh001', warehouseName: 'Dhaka Central',
    variantSku: 'HOM-CS-008-LAV', attrs: { color: null, size: 'Set of 3' },
    quantity: 330, reserved: 15, threshold: 40,
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    _id: 'inv010', productId: 'p009',
    productName: 'Bamboo Cutting Board Set', sku: 'KTN-CB-009',
    category: 'Kitchen', imageUrl: null,
    warehouseId: 'wh002', warehouseName: 'Chittagong Port',
    variantSku: 'KTN-CB-009-NAT', attrs: { color: 'Natural', size: 'Set of 2' },
    quantity: 0, reserved: 0, threshold: 10,
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
];

// ── Adjustment history (per item) ─────────────────────────────────────────────
export const DUMMY_HISTORY = {
  inv001: [
    { _id: 'h1', type: 'restock',    delta: +200, before: 45,  after: 245, reason: 'Supplier delivery #PO-2024-08',       user: 'Admin',         createdAt: new Date(Date.now() - 3600000 * 2).toISOString() },
    { _id: 'h2', type: 'sale',       delta: -4,   before: 49,  after: 45,  reason: 'Orders ORD-10421, ORD-10418',         user: 'System',        createdAt: new Date(Date.now() - 3600000 * 8).toISOString() },
    { _id: 'h3', type: 'adjustment', delta: -1,   before: 50,  after: 49,  reason: 'Damaged on inspection',               user: 'Kamal Hossain', createdAt: new Date(Date.now() - 86400000).toISOString() },
    { _id: 'h4', type: 'transfer',   delta: +50,  before: 0,   after: 50,  reason: 'Transfer from Chittagong Port wh002', user: 'Admin',         createdAt: new Date(Date.now() - 86400000 * 3).toISOString() },
  ],
  inv003: [
    { _id: 'h5', type: 'sale',       delta: -7,   before: 25,  after: 18,  reason: 'Orders ORD-10419, ORD-10415',         user: 'System',        createdAt: new Date(Date.now() - 86400000).toISOString() },
    { _id: 'h6', type: 'restock',    delta: +20,  before: 5,   after: 25,  reason: 'Supplier delivery #PO-2024-05',       user: 'Admin',         createdAt: new Date(Date.now() - 86400000 * 4).toISOString() },
  ],
  default: [
    { _id: 'hd1', type: 'restock', delta: +100, before: 0, after: 100, reason: 'Initial stock load', user: 'System', createdAt: new Date(Date.now() - 86400000 * 7).toISOString() },
  ],
};
