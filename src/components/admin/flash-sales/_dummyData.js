// 📁 PATH: src/components/admin/flash-sales/_dummyData.js
// ⚠️  This is a completely new file

const now  = new Date();
const f    = (h) => new Date(now.getTime() + h * 3600000).toISOString();
const p    = (h) => new Date(now.getTime() - h * 3600000).toISOString();

export const DUMMY_SALES = [
  {
    _id: 'fs01',
    name: 'Eid Mega Flash Sale',
    slug: 'eid-mega-flash-sale',
    status: 'active',
    startTime: p(2),
    endTime:   f(4),
    discountType: 'percent',
    discountValue: 40,
    maxOrdersPerUser: 2,
    totalStock: 500,
    soldCount: 312,
    revenue: 248000,
    banner: null,
    products: [
      { _id: 'p1', name: 'Samsung Galaxy S24',    image: null, originalPrice: 85000, salePrice: 51000, stock: 50,  sold: 38, sku: 'SAM-S24-BLK' },
      { _id: 'p2', name: 'OnePlus 12 Pro',         image: null, originalPrice: 72000, salePrice: 43200, stock: 30,  sold: 30, sku: 'OP-12P-GRN' },
      { _id: 'p3', name: 'Sony WH-1000XM5',        image: null, originalPrice: 32000, salePrice: 19200, stock: 80,  sold: 54, sku: 'SNY-XM5-BLK' },
      { _id: 'p4', name: 'Apple AirPods Pro 2',    image: null, originalPrice: 28000, salePrice: 16800, stock: 100, sold: 72, sku: 'APL-APP2-WHT' },
      { _id: 'p5', name: 'Anker 65W GaN Charger',  image: null, originalPrice: 4500,  salePrice: 2700,  stock: 200, sold: 118,sku: 'ANK-65W-BLK' },
    ],
    isActive: true,
    createdAt: p(72),
  },
  {
    _id: 'fs02',
    name: '12.12 Electronics Bonanza',
    slug: '12-12-electronics-bonanza',
    status: 'upcoming',
    startTime: f(6),
    endTime:   f(30),
    discountType: 'percent',
    discountValue: 30,
    maxOrdersPerUser: 1,
    totalStock: 1000,
    soldCount: 0,
    revenue: 0,
    banner: null,
    products: [
      { _id: 'p6', name: 'MacBook Air M3',          image: null, originalPrice: 145000, salePrice: 101500, stock: 20, sold: 0, sku: 'APL-MBA-M3' },
      { _id: 'p7', name: 'Dell XPS 15',             image: null, originalPrice: 120000, salePrice: 84000,  stock: 15, sold: 0, sku: 'DEL-XPS15' },
    ],
    isActive: true,
    createdAt: p(24),
  },
  {
    _id: 'fs03',
    name: 'Weekend Lightning Deal',
    slug: 'weekend-lightning-deal',
    status: 'ended',
    startTime: p(48),
    endTime:   p(24),
    discountType: 'fixed',
    discountValue: 500,
    maxOrdersPerUser: 3,
    totalStock: 200,
    soldCount: 200,
    revenue: 180000,
    banner: null,
    products: [
      { _id: 'p8', name: 'Mi Smart TV 43"',         image: null, originalPrice: 32000, salePrice: 31500, stock: 0,  sold: 120, sku: 'MI-TV43-BLK' },
      { _id: 'p9', name: 'Philips Air Purifier',    image: null, originalPrice: 18000, salePrice: 17500, stock: 0,  sold: 80,  sku: 'PHL-AP-WHT' },
    ],
    isActive: false,
    createdAt: p(120),
  },
  {
    _id: 'fs04',
    name: 'Ramadan Night Deal',
    slug: 'ramadan-night-deal',
    status: 'scheduled',
    startTime: f(24),
    endTime:   f(36),
    discountType: 'percent',
    discountValue: 25,
    maxOrdersPerUser: 2,
    totalStock: 300,
    soldCount: 0,
    revenue: 0,
    banner: null,
    products: [],
    isActive: true,
    createdAt: p(10),
  },
  {
    _id: 'fs05',
    name: 'Midnight Madness — Fashion',
    slug: 'midnight-madness-fashion',
    status: 'draft',
    startTime: f(72),
    endTime:   f(84),
    discountType: 'percent',
    discountValue: 50,
    maxOrdersPerUser: 5,
    totalStock: 800,
    soldCount: 0,
    revenue: 0,
    banner: null,
    products: [],
    isActive: false,
    createdAt: p(5),
  },
];

export function getSaleStatus(sale) {
  const now   = new Date();
  const start = new Date(sale.startTime);
  const end   = new Date(sale.endTime);
  if (!sale.isActive) return 'draft';
  if (now < start)   return 'upcoming';
  if (now > end)     return 'ended';
  return 'active';
}

export function getTimeRemaining(endTime) {
  const diff = new Date(endTime) - new Date();
  if (diff <= 0) return null;
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000)   / 1000);
  return { h, m, s, total: diff };
}
