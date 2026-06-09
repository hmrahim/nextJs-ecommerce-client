// 📁 PATH: src/components/admin/reviews/_dummyData.js
// ⚠️  DEV ONLY — API ready হলে এই file আর লাগবে না

const now = Date.now();
const d = (days) => new Date(now - 86_400_000 * days).toISOString();

// ── Products ──────────────────────────────────────────────────────────────
const PRODUCTS = [
  { _id: 'p1', name: 'Merino Wool Blanket',       sku: 'MWB-001' },
  { _id: 'p2', name: 'Ceramic Coffee Dripper',    sku: 'CCD-042' },
  { _id: 'p3', name: 'Mechanical Keyboard TKL',   sku: 'MKB-104' },
  { _id: 'p4', name: 'Leather Minimalist Wallet', sku: 'LMW-207' },
  { _id: 'p5', name: 'Bamboo Desk Organizer',     sku: 'BDO-330' },
  { _id: 'p6', name: 'Noise-Cancel Headphones',   sku: 'NCH-512' },
  { _id: 'p7', name: 'Stainless Steel Tumbler',   sku: 'SST-089' },
  { _id: 'p8', name: 'Smart Desk Lamp',           sku: 'SDL-401' },
];

// ── Users ──────────────────────────────────────────────────────────────
const USERS = [
  { _id: 'u1', firstName: 'Sarah',   lastName: 'Johnson',  email: 'sarah.j@email.com',    phone: '+1 (212) 555-0101' },
  { _id: 'u2', firstName: 'Marcus',  lastName: 'Thompson', email: 'mthompson@corp.com',    phone: '+1 (415) 555-0202' },
  { _id: 'u3', firstName: 'Priya',   lastName: 'Sharma',   email: 'priya.s@startup.io',   phone: '+1 (650) 555-0303' },
  { _id: 'u4', firstName: 'David',   lastName: 'Kim',      email: 'dkim@gmail.com',        phone: '+1 (206) 555-0404' },
  { _id: 'u5', firstName: 'Jessica', lastName: 'Williams', email: 'jwilliams@outlook.com', phone: '+1 (512) 555-0505' },
  { _id: 'u6', firstName: 'Carlos',  lastName: 'Mendez',   email: 'cmendez@corp.com',      phone: '+1 (787) 555-1010' },
  { _id: 'u7', firstName: 'Lily',    lastName: 'Zhang',    email: 'lzhang@gmail.com',      phone: '+1 (929) 555-1111' },
  { _id: 'u8', firstName: 'Thomas',  lastName: 'Wright',   email: 'twright@hotmail.com',   phone: '+1 (617) 555-0808' },
];

// ── Reviews ───────────────────────────────────────────────────────────────
export const DUMMY_REVIEWS = [
  {
    _id: 'r001',
    userId: USERS[0],
    productId: PRODUCTS[0],
    orderId: { orderNumber: 'ORD-10421' },
    rating: 5,
    title: 'Absolutely love this blanket!',
    body: 'The quality is outstanding. Super soft and warm, exactly what I needed for winter. Fast shipping too. Will definitely buy again.',
    images: [],
    isVerified: true,
    isApproved: true,
    createdAt: d(1),
  },
  {
    _id: 'r002',
    userId: USERS[1],
    productId: PRODUCTS[2],
    orderId: { orderNumber: 'ORD-10389' },
    rating: 4,
    title: 'Great keyboard, minor gripe',
    body: 'Tactile feedback is excellent and build quality feels premium. Only downside is the keycap font is a bit small. Overall very happy.',
    images: [],
    isVerified: true,
    isApproved: true,
    createdAt: d(3),
  },
  {
    _id: 'r003',
    userId: USERS[2],
    productId: PRODUCTS[1],
    orderId: { orderNumber: 'ORD-10312' },
    rating: 5,
    title: 'Perfect pour-over dripper',
    body: 'Makes the cleanest cup of coffee I\'ve ever had at home. The ceramic is thick and retains heat well. A must-have for coffee lovers.',
    images: [],
    isVerified: true,
    isApproved: null, // pending
    createdAt: d(0),
  },
  {
    _id: 'r004',
    userId: USERS[3],
    productId: PRODUCTS[5],
    orderId: { orderNumber: 'ORD-10280' },
    rating: 2,
    title: 'Disappointed with the noise cancellation',
    body: 'The noise cancellation is mediocre at best. For this price I expected much better performance. The ear cushions also feel cheap.',
    images: [],
    isVerified: true,
    isApproved: false, // rejected
    createdAt: d(5),
  },
  {
    _id: 'r005',
    userId: USERS[4],
    productId: PRODUCTS[3],
    orderId: null,
    rating: 5,
    title: 'Slim, sleek and well-crafted',
    body: 'Fits perfectly in my front pocket. The leather quality is top-notch and the stitching is clean. Highly recommend!',
    images: [],
    isVerified: false,
    isApproved: null, // pending
    createdAt: d(2),
  },
  {
    _id: 'r006',
    userId: USERS[5],
    productId: PRODUCTS[6],
    orderId: { orderNumber: 'ORD-10201' },
    rating: 4,
    title: 'Keeps drinks cold all day',
    body: 'Used this for hiking and it kept my water ice-cold for 18+ hours. The lid doesn\'t leak at all. Lid is a little hard to open one-handed.',
    images: [],
    isVerified: true,
    isApproved: true,
    adminReply: 'Thank you for the feedback! We\'re working on an updated lid design for the next version.',
    createdAt: d(8),
  },
  {
    _id: 'r007',
    userId: USERS[6],
    productId: PRODUCTS[7],
    orderId: { orderNumber: 'ORD-10350' },
    rating: 5,
    title: 'Best desk lamp I\'ve ever owned',
    body: 'The color temperature control is incredibly useful for long work sessions. The app integration works flawlessly. Zero flicker, zero eye strain.',
    images: [],
    isVerified: true,
    isApproved: null, // pending
    createdAt: d(4),
  },
  {
    _id: 'r008',
    userId: USERS[7],
    productId: PRODUCTS[4],
    orderId: { orderNumber: 'ORD-10298' },
    rating: 3,
    title: 'Decent organizer, nothing special',
    body: 'Does the job but the compartment sizes are a bit awkward. The bamboo finish looks nice though. Took a while to ship.',
    images: [],
    isVerified: true,
    isApproved: null, // pending
    createdAt: d(6),
  },
  {
    _id: 'r009',
    userId: USERS[2],
    productId: PRODUCTS[5],
    orderId: { orderNumber: 'ORD-10410' },
    rating: 1,
    title: 'Stopped working after 2 weeks',
    body: 'Completely dead after 2 weeks. Left ear cut out first, then the whole unit stopped charging. Very disappointed. Returning for full refund.',
    images: [],
    isVerified: true,
    isApproved: false, // rejected
    createdAt: d(10),
  },
  {
    _id: 'r010',
    userId: USERS[0],
    productId: PRODUCTS[2],
    orderId: { orderNumber: 'ORD-10180' },
    rating: 5,
    title: 'Daily driver for 6 months now',
    body: 'Still going strong. The switches haven\'t lost any feel, the build quality is exceptional. Best keyboard in this price range without question.',
    images: [],
    isVerified: true,
    isApproved: true,
    createdAt: d(14),
  },
  {
    _id: 'r011',
    userId: USERS[4],
    productId: PRODUCTS[0],
    orderId: null,
    rating: 4,
    title: 'Great gift idea',
    body: 'Bought as a gift and the recipient loved it. Packaging was beautiful, arrived on time. Might buy one for myself now!',
    images: [],
    isVerified: false,
    isApproved: null, // pending
    createdAt: d(9),
  },
  {
    _id: 'r012',
    userId: USERS[6],
    productId: PRODUCTS[1],
    orderId: { orderNumber: 'ORD-10405' },
    rating: 5,
    title: 'Changed my morning routine',
    body: 'I used to spend $8/day at a coffee shop. This dripper pays for itself in a week. The brew clarity is incredible.',
    images: [],
    isVerified: true,
    isApproved: true,
    createdAt: d(18),
  },
];

// ── Stats ────────────────────────────────────────────────────────────────
export const DUMMY_STATS = {
  total:    DUMMY_REVIEWS.length,
  pending:  DUMMY_REVIEWS.filter(r => r.isApproved === null).length,
  approved: DUMMY_REVIEWS.filter(r => r.isApproved === true).length,
  rejected: DUMMY_REVIEWS.filter(r => r.isApproved === false).length,
  avgRating: (
    DUMMY_REVIEWS.reduce((s, r) => s + r.rating, 0) / DUMMY_REVIEWS.length
  ).toFixed(1),
};
