
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination, EffectFade, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import 'swiper/css/free-mode';
import {
  Search, ShoppingCart, Heart, User, MapPin, Phone, Bell, ChevronDown,
  ChevronRight, ChevronLeft, Menu, X, Star, Truck, ShieldCheck, RotateCcw,
  Headphones, CreditCard, Zap, Flame, TrendingUp, Award, Gift, Tag,
  Globe, Apple, PlayCircle, Mail,
  ArrowRight, Eye, GitCompare, Sparkles, Crown, Clock, Percent,
} from 'lucide-react';

const SocialIcon = ({ children, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    {children}
  </svg>
);

const Facebook = (props) => (
  <SocialIcon {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </SocialIcon>
);

const Instagram = (props) => (
  <SocialIcon {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <path d="M17.5 6.5h.01" />
  </SocialIcon>
);

const Twitter = (props) => (
  <SocialIcon {...props}>
    <path d="M22 4.01c-.81.57-1.7 1-2.64 1.25a4.13 4.13 0 0 0-7.15 2.82v.93A9.84 9.84 0 0 1 4 4.87s-3.72 8.37 4.65 12.09A10.23 10.23 0 0 1 2 18.82c8.37 4.65 18.6 0 18.6-10.74 0-.26 0-.52-.02-.77A7.2 7.2 0 0 0 22 4.01z" />
  </SocialIcon>
);

const Youtube = (props) => (
  <SocialIcon {...props}>
    <path d="M2.5 17a3 3 0 0 0 2.11 2.11C6.48 19.5 12 19.5 12 19.5s5.52 0 7.39-.39A3 3 0 0 0 21.5 17a31.4 31.4 0 0 0 0-10 3 3 0 0 0-2.11-2.11C17.52 4.5 12 4.5 12 4.5s-5.52 0-7.39.39A3 3 0 0 0 2.5 7a31.4 31.4 0 0 0 0 10z" />
    <path d="m10 15 5-3-5-3z" />
  </SocialIcon>
);

/* =========================================================================
 *  MOCK DATA
 * ========================================================================= */
const BRAND = { name: 'MOOM24', tagline: 'Curated. Premium. Delivered.' };

const CATEGORIES = [
  { name: 'Electronics',    icon: '📱', count: 1240, color: 'from-emerald-500 to-teal-600' },
  { name: 'Fashion',        icon: '👗', count: 3120, color: 'from-amber-500 to-orange-500' },
  { name: 'Home & Living',  icon: '🛋️', count: 980,  color: 'from-rose-500 to-pink-600' },
  { name: 'Beauty',         icon: '💄', count: 740,  color: 'from-fuchsia-500 to-purple-600' },
  { name: 'Sports',         icon: '⚽', count: 510,  color: 'from-sky-500 to-blue-600' },
  { name: 'Grocery',        icon: '🥬', count: 2200, color: 'from-lime-500 to-green-600' },
  { name: 'Toys',           icon: '🧸', count: 430,  color: 'from-yellow-500 to-amber-500' },
  { name: 'Automotive',     icon: '🚗', count: 320,  color: 'from-slate-500 to-zinc-700' },
  { name: 'Books',          icon: '📚', count: 870,  color: 'from-indigo-500 to-violet-600' },
  { name: 'Health',         icon: '💊', count: 610,  color: 'from-emerald-500 to-green-700' },
  { name: 'Pet Supplies',   icon: '🐾', count: 290,  color: 'from-orange-500 to-red-500' },
  { name: 'Jewelry',        icon: '💎', count: 380,  color: 'from-yellow-400 to-amber-600' },
];

const HERO_SLIDES = [
  {
    eyebrow: 'NEW SEASON · 2026',
    title: 'Premium\nLifestyle\nRedefined',
    sub: 'Up to 70% off on hand-picked luxury essentials. Free express delivery for orders over ৳2,999.',
    cta: 'Shop the Edit',
    img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&q=80',
    accent: 'amber',
  },
  {
    eyebrow: 'TECH FESTIVAL',
    title: 'Smart Tech\nMega Deals',
    sub: 'Latest smartphones, laptops & gadgets. Save up to ৳15,000 + free EMI on cards.',
    cta: 'Explore Tech',
    img: 'https://images.unsplash.com/photo-1593344484962-796055d4a3a4?w=1600&q=80',
    accent: 'emerald',
  },
  {
    eyebrow: 'HOME UPGRADE',
    title: 'Sculpt\nYour Space',
    sub: 'Designer furniture, decor & lighting. Flat 40% off + complimentary installation.',
    cta: 'Discover Home',
    img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1600&q=80',
    accent: 'rose',
  },
];

const PRODUCTS = [
  { id: 1, name: 'Wireless Pro Earbuds Gen 4', brand: 'SoundWave', price: 4990, oldPrice: 7990, rating: 4.8, reviews: 2341, sold: 1240, img: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=600&q=80', tag: 'BEST SELLER' },
  { id: 2, name: 'Smart Watch Ultra 7 Titanium', brand: 'Apex',     price: 18900, oldPrice: 24900, rating: 4.9, reviews: 980,  sold: 540,  img: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&q=80', tag: 'NEW' },
  { id: 3, name: 'Premium Leather Sneakers',   brand: 'Walkr',     price: 5490, oldPrice: 8990, rating: 4.7, reviews: 612,  sold: 320,  img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80', tag: '-39%' },
  { id: 4, name: 'Minimalist Ceramic Mug Set', brand: 'Kasa',      price: 1290, oldPrice: 1990, rating: 4.6, reviews: 410,  sold: 210,  img: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&q=80', tag: 'TRENDING' },
  { id: 5, name: 'Ultra HD 4K Action Camera',  brand: 'GoVista',   price: 12990, oldPrice: 16990, rating: 4.8, reviews: 720,  sold: 410,  img: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&q=80', tag: 'HOT' },
  { id: 6, name: 'Organic Cotton Tote Bag',    brand: 'Greenly',   price: 690, oldPrice: 990,  rating: 4.5, reviews: 230,  sold: 180,  img: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=600&q=80', tag: 'ECO' },
  { id: 7, name: 'Aroma Diffuser Wood Edition',brand: 'Lumio',     price: 2490, oldPrice: 3490, rating: 4.7, reviews: 312,  sold: 240,  img: 'https://images.unsplash.com/photo-1602928298849-325cec8771c0?w=600&q=80', tag: 'NEW' },
  { id: 8, name: 'Pro Mechanical Keyboard',    brand: 'Keychron',  price: 8990, oldPrice: 11990, rating: 4.9, reviews: 845,  sold: 520,  img: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80', tag: '-25%' },
  { id: 9, name: 'Cashmere Blend Throw',        brand: 'Hygge',    price: 3990, oldPrice: 5990, rating: 4.8, reviews: 180,  sold: 90,   img: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&q=80', tag: 'LUXURY' },
  { id: 10, name: 'Espresso Machine Barista',   brand: 'Crema',    price: 22990, oldPrice: 29990, rating: 4.9, reviews: 510,  sold: 160,  img: 'https://images.unsplash.com/photo-1572119865084-43c285814d63?w=600&q=80', tag: 'PREMIUM' },
  { id: 11, name: 'Designer Sunglasses Aviator',brand: 'Solare',   price: 3490, oldPrice: 4990, rating: 4.6, reviews: 290,  sold: 230,  img: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80', tag: 'STYLE' },
  { id: 12, name: 'Silk Pillowcase Set',         brand: 'Lush',    price: 2190, oldPrice: 3290, rating: 4.7, reviews: 410,  sold: 310,  img: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=600&q=80', tag: 'BEAUTY' },
];

const BRANDS = [
  'Apple','Samsung','Sony','Nike','Adidas','Puma','LG','Dyson','HP','Dell','Bose','Lego','Levis','Zara','IKEA','Canon',
];

const TESTIMONIALS = [
  { name: 'Tasnim R.',  role: 'Verified Buyer · Dhaka',    msg: 'Quality blew me away. The packaging itself feels like a gift. Will order again — 10/10.',  rating: 5, img: 'https://i.pravatar.cc/100?img=47' },
  { name: 'Rakib H.',   role: 'Verified Buyer · Chittagong',msg: 'Fastest delivery I have ever experienced in BD. Genuine product, transparent pricing.',   rating: 5, img: 'https://i.pravatar.cc/100?img=12' },
  { name: 'Noushin A.', role: 'Verified Buyer · Sylhet',   msg: 'Support team replied at 1am! Returned a wrong-size item without a single question.',     rating: 5, img: 'https://i.pravatar.cc/100?img=32' },
  { name: 'Imran K.',   role: 'Verified Buyer · Dhaka',    msg: 'The Moom24 app is buttery smooth. Found exactly what I needed in 30 seconds flat.',      rating: 4, img: 'https://i.pravatar.cc/100?img=15' },
];

const BLOG_POSTS = [
  { title: '10 Minimalist Living Room Hacks That Actually Work', tag: 'HOME',     date: 'Jan 12, 2026', img: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&q=80' },
  { title: 'Best Wireless Earbuds Under ৳5,000 in 2026',         tag: 'TECH',     date: 'Jan 09, 2026', img: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=800&q=80' },
  { title: 'Capsule Wardrobe: 20 Pieces, 100 Outfits',           tag: 'FASHION',  date: 'Jan 06, 2026', img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80' },
];

/* =========================================================================
 *  Utility hook — countdown timer
 * ========================================================================= */
function useCountdown(targetDate) {
  const [t, setT] = useState({ d: 0, h: 0, m: 0, s: 0 });
  useEffect(() => {
    const id = setInterval(() => {
      const diff = Math.max(0, new Date(targetDate).getTime() - Date.now());
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff / 3600000) % 24);
      const m = Math.floor((diff / 60000) % 60);
      const s = Math.floor((diff / 1000) % 60);
      setT({ d, h, m, s });
    }, 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  return t;
}

const formatBDT = (n) => '৳' + n.toLocaleString('en-IN');

/* =========================================================================
 *  1.  AnnouncementBar
 * ========================================================================= */
function AnnouncementBar() {
  const items = [
    '🚚  Free express delivery over ৳2,999',
    '🎁  Use code MOOM10 — Extra 10% off your first order',
    '🔄  Easy 14-day hassle-free returns',
    '🛡️  100% authentic — direct from brand vaults',
  ];
  return (
    <div data-testid="announcement-bar" className="bg-emerald-950 text-emerald-50 text-xs overflow-hidden border-b border-emerald-900">
      <div className="flex animate-[scroll_30s_linear_infinite] whitespace-nowrap py-2">
        {[...items, ...items, ...items].map((t, i) => (
          <span key={i} className="px-6 sm:px-8 inline-flex items-center gap-2 font-medium tracking-wide">
            {t}<span className="text-amber-400">●</span>
          </span>
        ))}
      </div>
      <style>{`@keyframes scroll{from{transform:translateX(0)}to{transform:translateX(-33.333%)}}`}</style>
    </div>
  );
}

/* =========================================================================
 *  2.  TopUtilityBar
 * ========================================================================= */
function TopUtilityBar() {
  return (
    <div data-testid="utility-bar" className="hidden md:block bg-stone-50 border-b border-stone-200 text-xs text-stone-600">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-6 h-9 flex items-center justify-between">
        <div className="flex items-center gap-3 lg:gap-5">
          <span className="flex items-center gap-1.5"><Phone size={12} className="text-emerald-700"/> +880 1700-000000</span>
          <span className="hidden lg:flex items-center gap-1.5"><MapPin size={12} className="text-emerald-700"/> Deliver to <strong className="text-stone-900">Dhaka 1207</strong></span>
        </div>
        <div className="flex items-center gap-3 lg:gap-5">
          <Link href="/track" className="hover:text-emerald-700">Track Order</Link>
          <Link href="/sell" className="hidden lg:inline hover:text-emerald-700">Sell on Moom24</Link>
          <Link href="/help" className="hover:text-emerald-700">Help Center</Link>
          <span className="hidden lg:flex items-center gap-1 hover:text-emerald-700 cursor-pointer"><Globe size={12}/> EN <ChevronDown size={12}/></span>
          <span className="hover:text-emerald-700 cursor-pointer">BDT ৳ <ChevronDown size={12} className="inline"/></span>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
 *  3.  MegaNavbar
 * ========================================================================= */
function MegaNavbar() {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('All');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  return (
    <header data-testid="mega-navbar" className="sticky top-0 z-40 bg-white border-b border-stone-200 shadow-[0_1px_0_rgba(0,0,0,0.02)]">
      {/* Desktop nav */}
      <div className="max-w-[1440px] mx-auto px-4 lg:px-6 py-3 flex items-center gap-3 lg:gap-6">
        {/* Hamburger — mobile only */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-emerald-50 text-stone-700"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Menu"
        >
          {mobileMenuOpen ? <X size={22}/> : <Menu size={22}/>}
        </button>

        {/* Logo */}
        <Link href="/" data-testid="logo" className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 grid place-items-center shadow-lg shadow-emerald-600/20">
            <Crown size={18} className="text-amber-400" />
          </div>
          <div className="leading-none">
            <div className="font-[Syne] font-extrabold text-xl sm:text-2xl tracking-tight text-stone-900">{BRAND.name}</div>
            <div className="hidden sm:block text-[10px] text-emerald-700 font-semibold tracking-[0.2em]">PREMIUM MARKET</div>
          </div>
        </Link>

        {/* Search — hidden on mobile (shown via toggle) */}
        <div data-testid="search-wrapper" className="hidden md:flex flex-1 max-w-3xl flex-col">
          <div className="flex h-11 lg:h-12 rounded-full border-2 border-emerald-700/90 focus-within:border-amber-400 transition-all overflow-hidden bg-white">
            <select
              data-testid="search-category"
              value={cat}
              onChange={(e) => setCat(e.target.value)}
              className="h-full bg-emerald-50 border-r border-emerald-700/30 px-2 lg:px-4 text-xs lg:text-sm font-medium text-emerald-900 focus:outline-none cursor-pointer"
            >
              <option>All</option>
              {CATEGORIES.slice(0, 8).map((c) => (<option key={c.name}>{c.name}</option>))}
            </select>
            <input
              data-testid="search-input"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search 100,000+ products…"
              className="flex-1 px-3 lg:px-5 text-sm focus:outline-none placeholder:text-stone-400 text-stone-900"
            />
            <button data-testid="search-submit" className="px-4 lg:px-6 bg-gradient-to-r from-emerald-700 to-emerald-800 text-white hover:from-emerald-800 hover:to-emerald-900 transition-all grid place-items-center">
              <Search size={18}/>
            </button>
          </div>
          <div className="hidden lg:flex gap-3 mt-1.5 text-[11px] text-stone-500 px-4">
            <span className="text-stone-400">Trending:</span>
            {['iPhone 17', 'Air Fryer', 'Cotton Saree', 'Gaming Chair', 'Skincare'].map((t) => (
              <button key={t} className="hover:text-emerald-700 hover:underline">{t}</button>
            ))}
          </div>
        </div>

        {/* Mobile search toggle */}
        <button
          className="md:hidden ml-auto p-2 rounded-lg hover:bg-emerald-50 text-stone-700"
          onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
          aria-label="Search"
        >
          <Search size={22}/>
        </button>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-1 shrink-0">
          <NavIcon icon={<User size={20}/>}  label="Account"  testid="nav-account" />
          <NavIcon icon={<Heart size={20}/>} label="Wishlist" count={3} testid="nav-wishlist" />
          <NavIcon icon={<Bell size={20}/>}  label="Alerts"   count={7} testid="nav-alerts" />
          <button data-testid="nav-cart" className="ml-2 group relative flex items-center gap-2 lg:gap-3 pl-3 lg:pl-4 pr-4 lg:pr-5 h-11 lg:h-12 bg-gradient-to-br from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-500 rounded-full shadow-lg shadow-amber-500/30 transition-all">
            <ShoppingCart size={18} className="text-emerald-950"/>
            <div className="text-left leading-none">
              <div className="text-[10px] text-emerald-950/70 font-semibold tracking-wider">CART</div>
              <div className="text-sm font-bold text-emerald-950">৳3,490</div>
            </div>
            <span className="absolute -top-1 -right-1 w-5 h-5 grid place-items-center rounded-full bg-emerald-900 text-amber-400 text-[10px] font-bold ring-2 ring-white">5</span>
          </button>
        </div>

        {/* Mobile cart icon only */}
        <button data-testid="nav-cart-mobile" className="md:hidden relative p-2 rounded-lg hover:bg-amber-50 text-emerald-800">
          <ShoppingCart size={22}/>
          <span className="absolute top-0 right-0 w-4 h-4 grid place-items-center rounded-full bg-amber-400 text-emerald-950 text-[9px] font-bold">5</span>
        </button>
      </div>

      {/* Mobile search bar */}
      <AnimatePresence>
        {mobileSearchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-t border-stone-100"
          >
            <div className="px-4 py-3 flex gap-2">
              <div className="flex flex-1 h-11 rounded-full border-2 border-emerald-700 overflow-hidden">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search products…"
                  className="flex-1 px-4 text-sm focus:outline-none text-stone-900"
                  autoFocus
                />
                <button className="px-4 bg-emerald-700 text-white grid place-items-center">
                  <Search size={16}/>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile slide-out menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="md:hidden bg-white border-t border-stone-100 shadow-xl overflow-y-auto max-h-[70vh]"
          >
            <div className="px-4 py-4 space-y-1">
              {/* Account links */}
              <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-50">
                <User size={20} className="text-emerald-700"/>
                <span className="font-semibold text-stone-900">My Account</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-50">
                <Heart size={20} className="text-emerald-700"/>
                <span className="font-semibold text-stone-900">Wishlist</span>
                <span className="ml-auto text-xs bg-amber-400 text-emerald-950 font-bold px-2 py-0.5 rounded-full">3</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-50">
                <Bell size={20} className="text-emerald-700"/>
                <span className="font-semibold text-stone-900">Notifications</span>
                <span className="ml-auto text-xs bg-amber-400 text-emerald-950 font-bold px-2 py-0.5 rounded-full">7</span>
              </div>
              <div className="border-t border-stone-100 my-2"/>
              {/* Categories */}
              <p className="text-[11px] font-bold tracking-widest text-stone-400 px-3 pt-1">CATEGORIES</p>
              {CATEGORIES.map((c) => (
                <button key={c.name} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-50 text-left">
                  <span className="text-xl">{c.icon}</span>
                  <span className="font-medium text-stone-900">{c.name}</span>
                  <span className="ml-auto text-xs text-stone-400">{c.count}+</span>
                </button>
              ))}
              <div className="border-t border-stone-100 my-2"/>
              <Link href="/track" className="flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-50">
                <span className="font-medium text-stone-700">Track Order</span>
              </Link>
              <Link href="/help" className="flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-50">
                <span className="font-medium text-stone-700">Help Center</span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function NavIcon({ icon, label, count, testid }) {
  return (
    <button data-testid={testid} className="relative flex flex-col items-center justify-center w-14 lg:w-16 h-11 lg:h-12 rounded-xl hover:bg-emerald-50 transition-colors group">
      <span className="text-stone-700 group-hover:text-emerald-700">{icon}</span>
      <span className="text-[10px] text-stone-600 group-hover:text-emerald-700 font-medium mt-0.5">{label}</span>
      {count !== undefined && (
        <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 grid place-items-center rounded-full bg-amber-400 text-emerald-950 text-[9px] font-bold">{count}</span>
      )}
    </button>
  );
}

/* =========================================================================
 *  4.  CategoryNavBar
 * ========================================================================= */
function CategoryNavBar() {
  const [open, setOpen] = useState(false);
  const links = ["Today's Deals", "Best Sellers", "New Arrivals", "Flash Sale", "Premium Brands", "Gift Cards"];
  return (
    <nav data-testid="category-navbar" className="bg-white border-b border-stone-200 sticky top-[57px] sm:top-[65px] z-30">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-6 h-11 sm:h-12 flex items-center gap-2 sm:gap-4 lg:gap-6">
        <button
          data-testid="all-categories-btn"
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 h-8 sm:h-9 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold shadow-sm whitespace-nowrap shrink-0"
        >
          <Menu size={14}/> <span className="hidden sm:inline">All</span> Categories <ChevronDown size={12}/>
        </button>
        <div className="flex items-center gap-0.5 sm:gap-1 overflow-x-auto scrollbar-hide flex-1">
          {links.map((l, i) => (
            <Link key={l} href="#" className={`whitespace-nowrap px-2 sm:px-3 h-8 sm:h-9 grid place-items-center text-xs sm:text-sm font-medium rounded-md transition-colors ${i === 3 ? 'text-amber-600' : 'text-stone-700'} hover:text-emerald-700 hover:bg-emerald-50`}>
              {i === 3 && <Flame size={12} className="mr-1 text-amber-500 inline"/>}{l}
            </Link>
          ))}
        </div>
        <div className="hidden lg:flex items-center gap-2 text-xs text-emerald-800 font-semibold bg-emerald-50 px-3 h-9 rounded-md border border-emerald-200 shrink-0">
          <Zap size={14} className="text-amber-500"/> Same-day delivery in Dhaka
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border-t border-stone-200 overflow-hidden"
          >
            <div className="max-w-[1440px] mx-auto px-4 lg:px-6 py-4 sm:py-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {CATEGORIES.map((c) => (
                <Link key={c.name} href="#" className="group flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl hover:bg-emerald-50 transition-colors">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${c.color} grid place-items-center text-lg sm:text-xl shadow-md shrink-0`}>{c.icon}</div>
                  <div className="leading-tight min-w-0">
                    <div className="text-xs sm:text-sm font-semibold text-stone-900 group-hover:text-emerald-700 truncate">{c.name}</div>
                    <div className="text-[10px] text-stone-500">{c.count}+ items</div>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

/* =========================================================================
 *  5.  HeroBanner
 * ========================================================================= */
function HeroBanner() {
  return (
    <section data-testid="hero-banner" className="max-w-[1440px] mx-auto px-4 lg:px-6 mt-4 sm:mt-5">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px] gap-4 sm:gap-5">
        {/* Main slider */}
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden h-[260px] sm:h-[340px] lg:h-[460px] shadow-2xl shadow-emerald-900/10 ring-1 ring-stone-200">
          <Swiper
            modules={[Autoplay, Pagination, EffectFade]}
            effect="fade"
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            loop
            className="h-full hero-swiper"
          >
            {HERO_SLIDES.map((s, i) => (
              <SwiperSlide key={i}>
                <div className="relative h-full w-full">
                  <img src={s.img} alt={s.title} className="absolute inset-0 w-full h-full object-cover"/>
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/85 via-emerald-950/55 to-transparent"/>
                  <div className="relative h-full flex items-center px-6 sm:px-10 lg:px-16 max-w-[560px]">
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.7, delay: 0.15 }}
                    >
                      <span className="inline-block px-2.5 py-1 rounded-full bg-amber-400 text-emerald-950 text-[10px] font-bold tracking-[0.2em] mb-3 sm:mb-5">{s.eyebrow}</span>
                      <h1 className="font-[Syne] font-extrabold text-white text-2xl sm:text-4xl lg:text-5xl xl:text-6xl leading-[1.05] whitespace-pre-line mb-3 sm:mb-5">{s.title}</h1>
                      <p className="hidden sm:block text-emerald-50/90 text-sm lg:text-base mb-5 sm:mb-7 max-w-md leading-relaxed">{s.sub}</p>
                      <button data-testid={`hero-cta-${i}`} className="group inline-flex items-center gap-2 pl-4 sm:pl-6 pr-2 py-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 rounded-full font-bold shadow-xl shadow-amber-500/30 transition-all text-sm sm:text-base">
                        {s.cta}
                        <span className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-emerald-900 grid place-items-center group-hover:translate-x-1 transition-transform">
                          <ArrowRight size={14} className="text-amber-400"/>
                        </span>
                      </button>
                    </motion.div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          <style>{`.hero-swiper .swiper-pagination-bullet{background:rgba(255,255,255,.4);width:24px;height:3px;border-radius:2px}.hero-swiper .swiper-pagination-bullet-active{background:#fbbf24;width:40px}`}</style>
        </div>

        {/* Side panels — hidden on mobile, shown on lg+ */}
        <div className="hidden lg:grid grid-rows-2 gap-4 sm:gap-5">
          <div className="relative rounded-3xl overflow-hidden ring-1 ring-stone-200 h-[220px] group cursor-pointer">
            <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt=""/>
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-950/80 to-transparent"/>
            <div className="relative h-full p-6 flex flex-col justify-end">
              <span className="text-amber-400 text-[10px] font-bold tracking-[0.2em] mb-1">AUDIO COLLECTION</span>
              <h3 className="font-[Syne] font-bold text-white text-2xl leading-tight mb-2">Sound that<br/>moves you</h3>
              <span className="text-white text-xs font-semibold flex items-center gap-1">Shop now <ArrowRight size={14}/></span>
            </div>
          </div>
          <div className="relative rounded-3xl overflow-hidden h-[220px] group cursor-pointer bg-gradient-to-br from-amber-400 to-amber-500 p-6 flex flex-col justify-between ring-1 ring-amber-300">
            <div>
              <span className="text-emerald-950 text-[10px] font-bold tracking-[0.2em]">GIFT CARDS</span>
              <h3 className="font-[Syne] font-extrabold text-emerald-950 text-3xl leading-tight mt-2">Give the<br/>joy of choice</h3>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-emerald-950 text-xs font-bold">From ৳500</span>
              <div className="w-10 h-10 rounded-full bg-emerald-950 grid place-items-center group-hover:rotate-45 transition-transform">
                <Gift size={18} className="text-amber-400"/>
              </div>
            </div>
            <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-amber-300/40 blur-2xl"/>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================================
 *  6.  ServicePills
 * ========================================================================= */
function ServicePills() {
  const items = [
    { icon: <Truck size={20}/>,       title: 'Free Express Shipping', sub: 'On orders over ৳2,999' },
    { icon: <RotateCcw size={20}/>,   title: '14-Day Easy Returns',   sub: 'No questions asked' },
    { icon: <ShieldCheck size={20}/>, title: '100% Authentic',        sub: 'Direct from brands' },
    { icon: <CreditCard size={20}/>,  title: 'Secure Payment',        sub: 'EMI & COD available' },
    { icon: <Headphones size={20}/>,  title: '24/7 Support',          sub: 'Bangla & English' },
  ];
  return (
    <section data-testid="service-pills" className="max-w-[1440px] mx-auto px-4 lg:px-6 mt-4 sm:mt-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3 p-3 sm:p-4 bg-white rounded-2xl ring-1 ring-stone-200 shadow-sm">
        {items.map((s, i) => (
          <div key={i} className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl hover:bg-emerald-50 transition-colors ${i === 4 ? 'col-span-2 sm:col-span-1' : ''}`}>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 text-emerald-700 grid place-items-center ring-1 ring-emerald-100 shrink-0">{s.icon}</div>
            <div className="leading-tight min-w-0">
              <div className="text-xs sm:text-sm font-bold text-stone-900 truncate">{s.title}</div>
              <div className="text-[10px] sm:text-[11px] text-stone-500">{s.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* =========================================================================
 *  7.  CategoryShowcase
 * ========================================================================= */
function CategoryShowcase() {
  return (
    <section data-testid="category-showcase" className="max-w-[1440px] mx-auto px-4 lg:px-6 mt-10 sm:mt-14">
      <SectionHeader eyebrow="EXPLORE" title="Shop by category" link="View all" />
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-6 lg:grid-cols-12 gap-2 sm:gap-3">
        {CATEGORIES.map((c, i) => (
          <motion.button
            key={c.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04 }}
            data-testid={`category-card-${i}`}
            className="group flex flex-col items-center p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-white ring-1 ring-stone-200 hover:ring-emerald-600 hover:-translate-y-1 transition-all"
          >
            <div className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br ${c.color} grid place-items-center text-2xl sm:text-3xl shadow-md sm:shadow-lg group-hover:scale-110 transition-transform`}>{c.icon}</div>
            <div className="text-[10px] sm:text-xs font-semibold text-stone-900 mt-2 sm:mt-3 text-center leading-tight">{c.name}</div>
            <div className="hidden sm:block text-[10px] text-stone-500 mt-0.5">{c.count}+</div>
          </motion.button>
        ))}
      </div>
    </section>
  );
}

/* =========================================================================
 *  8.  FlashDealsSection
 * ========================================================================= */
function FlashDealsSection() {
  const target = useMemo(() => { const d = new Date(); d.setHours(d.getHours() + 8); return d.toISOString(); }, []);
  const { d, h, m, s } = useCountdown(target);
  return (
    <section data-testid="flash-deals" className="max-w-[1440px] mx-auto px-4 lg:px-6 mt-10 sm:mt-14">
      <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 p-4 sm:p-6 lg:p-8 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-amber-400/20 blur-3xl"/>
        <div className="absolute -bottom-32 -left-10 w-64 h-64 rounded-full bg-emerald-500/20 blur-3xl"/>

        <div className="relative flex flex-wrap items-end justify-between gap-3 sm:gap-4 mb-5 sm:mb-7">
          <div>
            <div className="flex items-center gap-2 mb-1 sm:mb-2">
              <Flame size={18} className="text-amber-400"/>
              <span className="text-amber-400 text-xs font-bold tracking-[0.25em]">FLASH SALE</span>
            </div>
            <h2 className="font-[Syne] font-extrabold text-white text-2xl sm:text-4xl lg:text-5xl">Deals end in</h2>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            {[{ l: 'Days', v: d }, { l: 'Hours', v: h }, { l: 'Min', v: m }, { l: 'Sec', v: s }].map((x, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl bg-white grid place-items-center font-[Syne] font-extrabold text-xl sm:text-2xl lg:text-3xl text-emerald-900 shadow-xl">
                  {String(x.v).padStart(2, '0')}
                </div>
                <div className="text-[10px] text-amber-300/80 mt-1 font-semibold tracking-wider">{x.l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <Swiper
            modules={[Navigation, FreeMode]}
            navigation={{ nextEl: '.fd-next', prevEl: '.fd-prev' }}
            freeMode
            slidesPerView={1.5}
            spaceBetween={12}
            breakpoints={{ 480: { slidesPerView: 2 }, 640: { slidesPerView: 3 }, 900: { slidesPerView: 4 }, 1200: { slidesPerView: 5 } }}
          >
            {PRODUCTS.slice(0, 10).map((p) => (
              <SwiperSlide key={p.id}><FlashProductCard p={p}/></SwiperSlide>
            ))}
          </Swiper>
          <button className="fd-prev absolute -left-2 sm:-left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white text-emerald-900 grid place-items-center shadow-lg hover:bg-amber-400 transition-colors"><ChevronLeft size={18}/></button>
          <button className="fd-next absolute -right-2 sm:-right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white text-emerald-900 grid place-items-center shadow-lg hover:bg-amber-400 transition-colors"><ChevronRight size={18}/></button>
        </div>
      </div>
    </section>
  );
}

function FlashProductCard({ p }) {
  const off = Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100);
  const progress = Math.min(100, Math.round((p.sold / (p.sold + 200)) * 100));
  return (
    <div data-testid={`flash-card-${p.id}`} className="bg-white rounded-xl sm:rounded-2xl overflow-hidden group ring-1 ring-emerald-900/10">
      <div className="relative aspect-square overflow-hidden bg-stone-100">
        <img src={p.img} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"/>
        <span className="absolute top-2 left-2 px-2 py-1 bg-amber-400 text-emerald-950 text-[10px] font-extrabold rounded-md">-{off}%</span>
      </div>
      <div className="p-2.5 sm:p-3">
        <div className="text-xs sm:text-sm font-semibold text-stone-900 line-clamp-2 leading-snug min-h-[36px] sm:min-h-[40px]">{p.name}</div>
        <div className="flex items-baseline gap-1.5 mt-1.5 sm:mt-2">
          <span className="font-[Syne] font-extrabold text-emerald-700 text-base sm:text-lg">{formatBDT(p.price)}</span>
          <span className="text-[10px] sm:text-xs text-stone-400 line-through">{formatBDT(p.oldPrice)}</span>
        </div>
        <div className="mt-1.5 sm:mt-2">
          <div className="h-1.5 rounded-full bg-stone-100 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500" style={{ width: `${progress}%` }}/>
          </div>
          <div className="text-[10px] text-stone-500 mt-1 font-medium">🔥 {p.sold} sold</div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
 *  9.  PromoBannersTriple
 * ========================================================================= */
function PromoBannersTriple() {
  const banners = [
    { tag: 'FOR HER', title: 'Beauty Week', sub: 'Up to 50% off', img: 'https://images.unsplash.com/photo-1522335789203-aaa2f6fefae8?w=800&q=80', accent: 'from-rose-500/80 to-rose-700/80' },
    { tag: 'FOR HIM', title: 'Tech Refresh', sub: 'From ৳1,990',  img: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80', accent: 'from-emerald-800/80 to-emerald-950/80' },
    { tag: 'NEW',     title: 'Home Edit',    sub: 'Designer pieces', img: 'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=800&q=80', accent: 'from-amber-600/80 to-orange-800/80' },
  ];
  return (
    <section data-testid="promo-triple" className="max-w-[1440px] mx-auto px-4 lg:px-6 mt-10 sm:mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
      {banners.map((b, i) => (
        <div key={i} data-testid={`promo-${i}`} className="relative h-44 sm:h-56 rounded-2xl sm:rounded-3xl overflow-hidden group cursor-pointer ring-1 ring-stone-200">
          <img src={b.img} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt=""/>
          <div className={`absolute inset-0 bg-gradient-to-br ${b.accent}`}/>
          <div className="relative h-full p-5 sm:p-7 flex flex-col justify-between">
            <span className="text-amber-300 text-[10px] font-bold tracking-[0.25em]">{b.tag}</span>
            <div>
              <h3 className="font-[Syne] font-extrabold text-white text-2xl sm:text-3xl leading-tight">{b.title}</h3>
              <p className="text-white/90 text-xs sm:text-sm mt-1">{b.sub}</p>
              <button className="mt-3 sm:mt-4 inline-flex items-center gap-2 text-white text-xs font-bold border-b-2 border-amber-400 pb-1">SHOP NOW <ArrowRight size={12}/></button>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}

/* =========================================================================
 *  10. ProductCard + FeaturedProducts
 * ========================================================================= */
function ProductCard({ p, index = 0 }) {
  const off = p.oldPrice ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100) : 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      data-testid={`product-card-${p.id}`}
      className="group bg-white rounded-xl sm:rounded-2xl ring-1 ring-stone-200 hover:ring-emerald-600 hover:shadow-xl hover:shadow-emerald-900/5 hover:-translate-y-1 transition-all overflow-hidden"
    >
      <div className="relative aspect-square overflow-hidden bg-stone-50">
        <img src={p.img} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"/>
        {p.tag && <span className="absolute top-2 left-2 px-2 py-0.5 bg-emerald-900 text-amber-300 text-[9px] sm:text-[10px] font-bold tracking-wider rounded-md">{p.tag}</span>}
        {off > 0 && <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-amber-400 text-emerald-950 text-[10px] sm:text-[11px] font-extrabold rounded-md">-{off}%</span>}
        <div className="absolute right-2 bottom-2 flex flex-col gap-1.5 opacity-0 translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
          <IconBtn icon={<Heart size={13}/>}      testid={`wish-${p.id}`}/>
          <IconBtn icon={<GitCompare size={13}/>} testid={`compare-${p.id}`}/>
          <IconBtn icon={<Eye size={13}/>}         testid={`quick-${p.id}`}/>
        </div>
      </div>
      <div className="p-3 sm:p-4">
        <div className="text-[10px] text-emerald-700 font-bold tracking-wider mb-1">{p.brand.toUpperCase()}</div>
        <div className="text-xs sm:text-sm font-semibold text-stone-900 line-clamp-2 leading-snug min-h-[36px] sm:min-h-[40px]">{p.name}</div>
        <div className="flex items-center gap-1 mt-1.5 sm:mt-2 text-xs">
          <div className="flex items-center gap-0.5 text-amber-500">
            {Array.from({ length: 5 }).map((_, i) => (<Star key={i} size={11} fill={i < Math.round(p.rating) ? 'currentColor' : 'transparent'} strokeWidth={1.5}/>))}
          </div>
          <span className="text-stone-600 font-medium">{p.rating}</span>
          <span className="hidden sm:inline text-stone-400">({p.reviews})</span>
        </div>
        <div className="flex items-end justify-between mt-2 sm:mt-3">
          <div>
            <div className="font-[Syne] font-extrabold text-emerald-800 text-base sm:text-xl">{formatBDT(p.price)}</div>
            {p.oldPrice && <div className="text-[10px] sm:text-xs text-stone-400 line-through">{formatBDT(p.oldPrice)}</div>}
          </div>
          <button data-testid={`add-${p.id}`} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-emerald-700 hover:bg-amber-400 text-white hover:text-emerald-950 grid place-items-center shadow-md hover:shadow-amber-500/40 transition-all">
            <ShoppingCart size={14}/>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function IconBtn({ icon, testid }) {
  return (
    <button data-testid={testid} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white text-stone-700 hover:bg-emerald-700 hover:text-white grid place-items-center shadow-md transition-colors">
      {icon}
    </button>
  );
}

function FeaturedProducts() {
  const [tab, setTab] = useState('featured');
  const tabs = [
    { k: 'featured',   label: 'Featured',     icon: <Award size={13}/> },
    { k: 'bestseller', label: 'Best Sellers', icon: <TrendingUp size={13}/> },
    { k: 'new',        label: 'New Arrivals', icon: <Sparkles size={13}/> },
    { k: 'trending',   label: 'Trending',     icon: <Flame size={13}/> },
  ];
  return (
    <section data-testid="featured-products" className="max-w-[1440px] mx-auto px-4 lg:px-6 mt-10 sm:mt-14">
      <div className="flex flex-wrap items-end justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div>
          <span className="text-amber-600 text-[11px] font-bold tracking-[0.25em]">HANDPICKED</span>
          <h2 className="font-[Syne] font-extrabold text-stone-900 text-2xl sm:text-4xl mt-1">Featured products</h2>
        </div>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {tabs.map((t) => (
            <button
              key={t.k}
              data-testid={`tab-${t.k}`}
              onClick={() => setTab(t.k)}
              className={`flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 h-8 sm:h-10 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                tab === t.k
                  ? 'bg-emerald-800 text-white shadow-lg shadow-emerald-900/20'
                  : 'bg-white text-stone-700 ring-1 ring-stone-200 hover:ring-emerald-600'
              }`}
            >
              {t.icon}{t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
        {PRODUCTS.slice(0, 10).map((p, i) => (<ProductCard key={p.id} p={p} index={i}/>))}
      </div>
    </section>
  );
}

/* =========================================================================
 *  11. DealOfTheDay
 * ========================================================================= */
function DealOfTheDay() {
  const target = useMemo(() => { const d = new Date(); d.setHours(d.getHours() + 14); return d.toISOString(); }, []);
  const { h, m, s } = useCountdown(target);
  return (
    <section data-testid="deal-of-day" className="max-w-[1440px] mx-auto px-4 lg:px-6 mt-10 sm:mt-14">
      <div className="grid grid-cols-1 lg:grid-cols-2 rounded-2xl sm:rounded-3xl overflow-hidden ring-1 ring-stone-200 shadow-xl">
        <div className="relative h-[240px] sm:h-[300px] lg:h-[420px] bg-stone-100">
          <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&q=80" className="absolute inset-0 w-full h-full object-cover" alt=""/>
          <span className="absolute top-4 sm:top-6 left-4 sm:left-6 px-3 py-1.5 bg-amber-400 text-emerald-950 text-[10px] font-extrabold tracking-[0.2em] rounded-full">⚡ DEAL OF THE DAY</span>
        </div>
        <div className="bg-gradient-to-br from-white to-emerald-50/50 p-6 sm:p-10 lg:p-14 flex flex-col justify-center">
          <div className="text-xs font-bold text-emerald-700 tracking-widest">SOUNDWAVE PRO</div>
          <h2 className="font-[Syne] font-extrabold text-stone-900 text-2xl sm:text-3xl lg:text-4xl xl:text-5xl mt-2 leading-tight">Wireless Pro Earbuds Gen 4 — Studio Edition</h2>
          <div className="flex items-baseline gap-2 sm:gap-3 mt-4 sm:mt-5 flex-wrap">
            <span className="font-[Syne] font-extrabold text-emerald-800 text-3xl sm:text-5xl">৳4,990</span>
            <span className="text-base sm:text-lg text-stone-400 line-through">৳7,990</span>
            <span className="px-2 py-1 bg-emerald-700 text-amber-300 text-xs font-bold rounded">SAVE 38%</span>
          </div>
          <div className="mt-4 sm:mt-5 h-2.5 rounded-full bg-stone-200 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-400 to-emerald-600" style={{ width: '68%' }}/>
          </div>
          <div className="text-xs text-stone-600 mt-2"><span className="font-bold text-emerald-700">68%</span> claimed · 124 pieces left</div>
          <div className="flex items-center gap-2 sm:gap-4 mt-5 sm:mt-7 flex-wrap">
            <span className="text-xs font-bold tracking-widest text-stone-500">ENDS IN</span>
            {[h, m, s].map((v, i) => (
              <div key={i} className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-emerald-900 grid place-items-center font-[Syne] font-extrabold text-xl sm:text-2xl text-amber-400">{String(v).padStart(2, '0')}</div>
            ))}
          </div>
          <button data-testid="dod-cta" className="mt-5 sm:mt-7 self-start inline-flex items-center gap-2 sm:gap-3 pl-5 sm:pl-7 pr-2 sm:pr-3 py-2.5 sm:py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-full font-bold shadow-xl shadow-emerald-900/20 text-sm sm:text-base">
            Buy now
            <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-amber-400 grid place-items-center"><ArrowRight size={14} className="text-emerald-950"/></span>
          </button>
        </div>
      </div>
    </section>
  );
}

/* =========================================================================
 *  12. TrendingProductsCarousel
 * ========================================================================= */
function TrendingProductsCarousel() {
  return (
    <section data-testid="trending-carousel" className="max-w-[1440px] mx-auto px-4 lg:px-6 mt-10 sm:mt-14">
      <SectionHeader eyebrow="WHAT'S HOT" title="Trending now" link="See all trending"/>
      <Swiper
        modules={[Navigation, FreeMode]}
        navigation
        freeMode
        slidesPerView={1.5}
        spaceBetween={14}
        breakpoints={{ 480: { slidesPerView: 2 }, 640: { slidesPerView: 3 }, 900: { slidesPerView: 4 }, 1200: { slidesPerView: 5 } }}
        className="trend-swiper"
      >
        {[...PRODUCTS].reverse().map((p, i) => (
          <SwiperSlide key={p.id}><ProductCard p={p} index={i}/></SwiperSlide>
        ))}
      </Swiper>
      <style>{`.trend-swiper .swiper-button-prev,.trend-swiper .swiper-button-next{color:#065f46;background:#fff;width:36px;height:36px;border-radius:9999px;box-shadow:0 6px 16px rgba(0,0,0,.08)}.trend-swiper .swiper-button-prev:after,.trend-swiper .swiper-button-next:after{font-size:14px;font-weight:900}`}</style>
    </section>
  );
}

/* =========================================================================
 *  13. NewArrivalsGrid
 * ========================================================================= */
function NewArrivalsGrid() {
  return (
    <section data-testid="new-arrivals" className="max-w-[1440px] mx-auto px-4 lg:px-6 mt-10 sm:mt-14">
      <SectionHeader eyebrow="JUST IN" title="New arrivals" link="View all"/>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
        <div className="col-span-2 md:col-span-1 md:row-span-2 relative rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-900 to-emerald-700 p-6 sm:p-8 min-h-[200px] md:min-h-[400px] flex flex-col justify-between text-white">
          <div>
            <span className="text-amber-400 text-[10px] font-bold tracking-[0.25em]">DROP 02</span>
            <h3 className="font-[Syne] font-extrabold text-3xl sm:text-4xl mt-2 sm:mt-3 leading-tight">Winter<br/>capsule<br/>'26</h3>
            <p className="hidden sm:block text-emerald-100/80 text-sm mt-3 sm:mt-4 max-w-xs">36 new pieces handcrafted for the season. Limited quantities, no restocks.</p>
          </div>
          <button className="self-start mt-4 sm:mt-6 inline-flex items-center gap-2 text-sm font-bold border-b-2 border-amber-400 pb-1">EXPLORE DROP <ArrowRight size={14}/></button>
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-amber-400/10 blur-3xl"/>
        </div>
        {PRODUCTS.slice(0, 4).map((p, i) => (<ProductCard key={p.id} p={p} index={i}/>))}
      </div>
    </section>
  );
}

/* =========================================================================
 *  14. BrandShowcase
 * ========================================================================= */
function BrandShowcase() {
  return (
    <section data-testid="brand-showcase" className="max-w-[1440px] mx-auto px-4 lg:px-6 mt-10 sm:mt-14">
      <SectionHeader eyebrow="TRUSTED BY THE BEST" title="Premium brands" link="All brands"/>
      <Swiper
        modules={[Autoplay, FreeMode]}
        autoplay={{ delay: 1500, disableOnInteraction: false }}
        loop freeMode slidesPerView={3}
        spaceBetween={12}
        breakpoints={{ 480: { slidesPerView: 4 }, 640: { slidesPerView: 5 }, 900: { slidesPerView: 7 }, 1200: { slidesPerView: 8 } }}
      >
        {BRANDS.map((b) => (
          <SwiperSlide key={b}>
            <div data-testid={`brand-${b}`} className="h-16 sm:h-20 lg:h-24 rounded-xl sm:rounded-2xl bg-white ring-1 ring-stone-200 grid place-items-center hover:ring-emerald-600 hover:-translate-y-1 transition-all">
              <span className="font-[Syne] font-extrabold text-base sm:text-xl text-stone-700">{b}</span>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}

/* =========================================================================
 *  15. CategorySplitBanner
 * ========================================================================= */
function CategorySplitBanner() {
  return (
    <section data-testid="split-banner" className="max-w-[1440px] mx-auto px-4 lg:px-6 mt-10 sm:mt-14 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
      {[
        { title: 'Electronics\nFestival', sub: 'Mega savings up to ৳15,000', cta: 'Shop tech',    img: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200&q=80', bg: 'from-emerald-900/85 to-emerald-700/60' },
        { title: 'Fashion\nWeek',         sub: 'New collection — up to 60% off', cta: 'Shop fashion', img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=80', bg: 'from-amber-900/80 to-stone-900/60' },
      ].map((b, i) => (
        <div key={i} data-testid={`split-${i}`} className="relative h-56 sm:h-72 lg:h-80 rounded-2xl sm:rounded-3xl overflow-hidden group cursor-pointer">
          <img src={b.img} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt=""/>
          <div className={`absolute inset-0 bg-gradient-to-r ${b.bg}`}/>
          <div className="relative h-full p-7 sm:p-10 flex flex-col justify-center max-w-sm">
            <h3 className="font-[Syne] font-extrabold text-white text-3xl sm:text-4xl lg:text-5xl leading-[0.95] whitespace-pre-line">{b.title}</h3>
            <p className="text-white/90 mt-2 sm:mt-3 text-sm sm:text-base">{b.sub}</p>
            <button className="mt-4 sm:mt-6 self-start inline-flex items-center gap-2 pl-4 sm:pl-5 pr-2 py-2 bg-white text-emerald-900 rounded-full font-bold text-sm">
              {b.cta} <span className="w-7 h-7 rounded-full bg-amber-400 grid place-items-center"><ArrowRight size={14} className="text-emerald-950"/></span>
            </button>
          </div>
        </div>
      ))}
    </section>
  );
}

/* =========================================================================
 *  16. RecommendedForYou
 * ========================================================================= */
function RecommendedForYou() {
  return (
    <section data-testid="recommended" className="max-w-[1440px] mx-auto px-4 lg:px-6 mt-10 sm:mt-14">
      <SectionHeader eyebrow="JUST FOR YOU" title="Recommended" link="Personalize"/>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
        {PRODUCTS.slice(2, 14).map((p, i) => (<ProductCard key={`r-${p.id}-${i}`} p={p} index={i}/>))}
      </div>
    </section>
  );
}

/* =========================================================================
 *  17. RecentlyViewed
 * ========================================================================= */
function RecentlyViewed() {
  return (
    <section data-testid="recently-viewed" className="max-w-[1440px] mx-auto px-4 lg:px-6 mt-10 sm:mt-14">
      <SectionHeader eyebrow="PICK UP WHERE YOU LEFT" title="Recently viewed" link="Clear history"/>
      <Swiper modules={[FreeMode]} freeMode slidesPerView={2} spaceBetween={12}
        breakpoints={{ 480: { slidesPerView: 3 }, 640: { slidesPerView: 4 }, 900: { slidesPerView: 6 }, 1200: { slidesPerView: 8 } }}
      >
        {PRODUCTS.slice(0, 8).map((p) => (
          <SwiperSlide key={p.id}>
            <div data-testid={`recent-${p.id}`} className="bg-white rounded-xl sm:rounded-2xl ring-1 ring-stone-200 overflow-hidden hover:ring-emerald-600 transition-all">
              <div className="aspect-square bg-stone-50">
                <img src={p.img} className="w-full h-full object-cover" alt={p.name}/>
              </div>
              <div className="p-2 sm:p-3">
                <div className="text-xs font-semibold text-stone-800 line-clamp-1">{p.name}</div>
                <div className="text-emerald-800 font-[Syne] font-extrabold text-sm mt-1">{formatBDT(p.price)}</div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}

/* =========================================================================
 *  18. Testimonials
 * ========================================================================= */
function Testimonials() {
  return (
    <section data-testid="testimonials" className="max-w-[1440px] mx-auto px-4 lg:px-6 mt-10 sm:mt-14">
      <div className="bg-gradient-to-br from-stone-50 to-emerald-50/40 rounded-2xl sm:rounded-3xl p-6 sm:p-10 lg:p-14 ring-1 ring-stone-200">
        <div className="flex flex-wrap items-end justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div>
            <span className="text-amber-600 text-[11px] font-bold tracking-[0.25em]">REAL CUSTOMERS · REAL STORIES</span>
            <h2 className="font-[Syne] font-extrabold text-stone-900 text-2xl sm:text-4xl mt-1">Loved by 50K+ shoppers</h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex">{Array.from({ length: 5 }).map((_, i) => (<Star key={i} size={18} className="text-amber-400" fill="currentColor"/>))}</div>
            <span className="font-bold text-stone-900">4.9</span>
            <span className="text-stone-500 text-sm">· 12,840 reviews</span>
          </div>
        </div>
        <Swiper modules={[Autoplay, Pagination]} autoplay={{ delay: 4500 }} pagination={{ clickable: true }} loop
          slidesPerView={1} spaceBetween={16}
          breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }}
          className="pb-12"
        >
          {TESTIMONIALS.map((t, i) => (
            <SwiperSlide key={i}>
              <div data-testid={`testimonial-${i}`} className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-7 ring-1 ring-stone-200 h-full">
                <div className="flex mb-3 sm:mb-4">{Array.from({ length: 5 }).map((_, j) => (<Star key={j} size={14} className={j < t.rating ? 'text-amber-400' : 'text-stone-200'} fill="currentColor"/>))}</div>
                <p className="text-stone-700 leading-relaxed text-sm sm:text-base">"{t.msg}"</p>
                <div className="flex items-center gap-3 mt-5 sm:mt-6 pt-4 sm:pt-5 border-t border-stone-100">
                  <img src={t.img} alt={t.name} className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover"/>
                  <div>
                    <div className="font-bold text-stone-900 text-sm">{t.name}</div>
                    <div className="text-xs text-emerald-700">{t.role}</div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}

/* =========================================================================
 *  19. StatsStrip
 * ========================================================================= */
function StatsStrip() {
  const stats = [
    { v: '50K+',  l: 'Happy customers' },
    { v: '100K+', l: 'Products listed' },
    { v: '850+',  l: 'Trusted brands' },
    { v: '4.9★',  l: 'Average rating' },
    { v: '24/7',  l: 'Customer support' },
  ];
  return (
    <section data-testid="stats-strip" className="max-w-[1440px] mx-auto px-4 lg:px-6 mt-10 sm:mt-14">
      <div className="rounded-2xl sm:rounded-3xl bg-emerald-950 p-6 sm:p-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-6">
        {stats.map((s, i) => (
          <div key={i} className={`text-center ${i === 4 ? 'col-span-2 sm:col-span-1' : ''}`}>
            <div className="font-[Syne] font-extrabold text-2xl sm:text-4xl text-amber-400">{s.v}</div>
            <div className="text-[10px] sm:text-xs text-emerald-100/70 mt-1 tracking-wider uppercase">{s.l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* =========================================================================
 *  20. BlogSection
 * ========================================================================= */
function BlogSection() {
  return (
    <section data-testid="blog" className="max-w-[1440px] mx-auto px-4 lg:px-6 mt-10 sm:mt-14">
      <SectionHeader eyebrow="THE EDIT" title="Stories & guides" link="Visit blog"/>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {BLOG_POSTS.map((b, i) => (
          <article key={i} data-testid={`blog-${i}`} className="group cursor-pointer">
            <div className="aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden bg-stone-100">
              <img src={b.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt=""/>
            </div>
            <div className="flex items-center gap-3 mt-3 sm:mt-4 text-xs">
              <span className="px-2 py-0.5 bg-emerald-700 text-amber-300 rounded font-bold tracking-wider">{b.tag}</span>
              <span className="text-stone-500">{b.date}</span>
            </div>
            <h3 className="font-[Syne] font-extrabold text-stone-900 text-base sm:text-xl mt-2 leading-snug group-hover:text-emerald-700 transition-colors">{b.title}</h3>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 mt-2 sm:mt-3">Read article <ArrowRight size={14}/></span>
          </article>
        ))}
      </div>
    </section>
  );
}

/* =========================================================================
 *  21. AppDownload
 * ========================================================================= */
function AppDownload() {
  return (
    <section data-testid="app-download" className="max-w-[1440px] mx-auto px-4 lg:px-6 mt-10 sm:mt-14">
      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-900 to-emerald-700 relative">
        <div className="p-7 sm:p-10 lg:p-14 relative z-10">
          <span className="text-amber-400 text-[11px] font-bold tracking-[0.25em]">EXCLUSIVE ON APP</span>
          <h2 className="font-[Syne] font-extrabold text-white text-2xl sm:text-4xl lg:text-5xl mt-2 sm:mt-3 leading-tight">Shop smarter<br/>on the Moom24 app</h2>
          <p className="text-emerald-100/80 mt-3 sm:mt-4 max-w-md text-sm sm:text-base">Get instant 5% off your first app order. Track parcels, save wishlists, and unlock app-only flash sales.</p>
          <div className="flex flex-wrap gap-2 sm:gap-3 mt-5 sm:mt-7">
            <button data-testid="app-ios" className="flex items-center gap-2 sm:gap-3 pl-3 sm:pl-4 pr-4 sm:pr-6 py-2.5 sm:py-3 bg-black hover:bg-stone-800 rounded-xl sm:rounded-2xl transition-colors">
              <Apple size={22} className="text-white"/>
              <div className="text-left leading-tight">
                <div className="text-[10px] text-stone-300">Download on</div>
                <div className="text-white font-bold text-sm">App Store</div>
              </div>
            </button>
            <button data-testid="app-android" className="flex items-center gap-2 sm:gap-3 pl-3 sm:pl-4 pr-4 sm:pr-6 py-2.5 sm:py-3 bg-black hover:bg-stone-800 rounded-xl sm:rounded-2xl transition-colors">
              <PlayCircle size={22} className="text-white"/>
              <div className="text-left leading-tight">
                <div className="text-[10px] text-stone-300">Get it on</div>
                <div className="text-white font-bold text-sm">Google Play</div>
              </div>
            </button>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 mt-6 sm:mt-8 text-emerald-100/80 text-sm">
            <div className="flex">{Array.from({ length: 5 }).map((_, i) => (<Star key={i} size={13} className="text-amber-400" fill="currentColor"/>))}</div>
            4.9 · Over 200K downloads
          </div>
        </div>
        <div className="relative min-h-[200px] lg:min-h-[300px]">
          <img src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=900&q=80" className="absolute inset-0 w-full h-full object-cover" alt=""/>
          <div className="absolute inset-0 bg-gradient-to-l from-transparent to-emerald-900/40"/>
        </div>
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-amber-400/10 blur-3xl"/>
      </div>
    </section>
  );
}

/* =========================================================================
 *  22. Newsletter
 * ========================================================================= */
function Newsletter() {
  const [email, setEmail] = useState('');
  return (
    <section data-testid="newsletter" className="max-w-[1440px] mx-auto px-4 lg:px-6 mt-10 sm:mt-14">
      <div className="rounded-2xl sm:rounded-3xl bg-amber-400 p-7 sm:p-10 lg:p-14 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-emerald-700/20 blur-3xl"/>
        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-center">
          <div>
            <span className="text-emerald-900 text-[11px] font-bold tracking-[0.25em]">JOIN THE INSIDERS</span>
            <h2 className="font-[Syne] font-extrabold text-emerald-950 text-2xl sm:text-4xl lg:text-5xl mt-2 sm:mt-3 leading-tight">Get ৳200 off<br/>your first order</h2>
            <p className="text-emerald-950/80 mt-2 sm:mt-3 text-sm sm:text-base">Subscribe for early access to drops, member-only deals & styling tips.</p>
          </div>
          <form data-testid="newsletter-form" onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"/>
              <input
                data-testid="newsletter-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full h-12 sm:h-14 pl-10 sm:pl-11 pr-4 rounded-full bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-700 text-sm"
              />
            </div>
            <button data-testid="newsletter-submit" className="h-12 sm:h-14 px-6 sm:px-8 rounded-full bg-emerald-900 hover:bg-emerald-950 text-white font-bold shadow-xl shadow-emerald-900/20 text-sm sm:text-base whitespace-nowrap">Subscribe</button>
          </form>
        </div>
      </div>
    </section>
  );
}

/* =========================================================================
 *  23. Footer
 * ========================================================================= */
function Footer() {
  const cols = [
    { title: 'Shop',    links: ['New arrivals', 'Best sellers', 'Flash sale', 'Gift cards', 'Outlet'] },
    { title: 'Help',    links: ['Contact us', 'FAQ', 'Shipping', 'Returns & refunds', 'Track order'] },
    { title: 'Company', links: ['About Moom24', 'Careers', 'Press', 'Sustainability', 'Affiliate program'] },
    { title: 'Sell',    links: ['Become a seller', 'Seller portal', 'Logistics', 'Brand partnership', 'Bulk orders'] },
  ];
  return (
    <footer data-testid="footer" className="mt-16 sm:mt-20 bg-emerald-950 text-emerald-50">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-6 py-10 sm:py-16 grid grid-cols-1 lg:grid-cols-[1.4fr_3fr] gap-8 sm:gap-12">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-700 grid place-items-center"><Crown className="text-amber-400" size={22}/></div>
            <div>
              <div className="font-[Syne] font-extrabold text-2xl sm:text-3xl">{BRAND.name}</div>
              <div className="text-[10px] text-amber-400 tracking-[0.2em] font-bold">PREMIUM MARKET</div>
            </div>
          </div>
          <p className="text-emerald-100/70 mt-4 sm:mt-5 max-w-sm leading-relaxed text-sm">{BRAND.tagline} Bangladesh's most loved curated marketplace — sourcing premium goods from across the globe directly to your door.</p>
          <div className="flex gap-2 sm:gap-3 mt-5 sm:mt-6">
            {[Facebook, Instagram, Twitter, Youtube].map((Ico, i) => (
              <a key={i} href="#" data-testid={`social-${i}`} className="w-9 h-9 sm:w-10 sm:h-10 grid place-items-center rounded-full bg-emerald-800 hover:bg-amber-400 hover:text-emerald-950 transition-colors"><Ico size={15}/></a>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {cols.map((c) => (
            <div key={c.title}>
              <h4 className="font-[Syne] font-bold text-white text-sm tracking-wide mb-3 sm:mb-4">{c.title}</h4>
              <ul className="space-y-2 text-sm text-emerald-100/70">
                {c.links.map((l) => (<li key={l}><a href="#" className="hover:text-amber-300 transition-colors">{l}</a></li>))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-emerald-900">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-6 py-5 sm:py-6 flex flex-wrap items-center justify-between gap-3 sm:gap-4 text-xs text-emerald-100/60">
          <span>© {new Date().getFullYear()} Moom24. All rights reserved.</span>
          <div className="flex flex-wrap gap-3 sm:gap-5">
            <a href="#" className="hover:text-amber-300">Privacy</a>
            <a href="#" className="hover:text-amber-300">Terms</a>
            <a href="#" className="hover:text-amber-300">Cookies</a>
            <a href="#" className="hover:text-amber-300">Accessibility</a>
          </div>
          <div className="flex flex-wrap gap-1.5 sm:gap-2 opacity-80">
            {['VISA', 'MC', 'AMEX', 'bKash', 'Nagad', 'SSL'].map((p) => (
              <span key={p} className="px-1.5 sm:px-2 py-1 bg-emerald-900 rounded text-[9px] sm:text-[10px] font-bold tracking-wider">{p}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

/* =========================================================================
 *  Shared: SectionHeader
 * ========================================================================= */
function SectionHeader({ eyebrow, title, link }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
      <div>
        <span className="text-amber-600 text-[11px] font-bold tracking-[0.25em]">{eyebrow}</span>
        <h2 className="font-[Syne] font-extrabold text-stone-900 text-2xl sm:text-4xl mt-1">{title}</h2>
      </div>
      {link && (
        <Link href="#" className="group inline-flex items-center gap-1.5 sm:gap-2 text-sm font-bold text-emerald-800 hover:text-amber-600 transition-colors">
          {link}<ArrowRight size={15} className="group-hover:translate-x-1 transition-transform"/>
        </Link>
      )}
    </div>
  );
}

/* =========================================================================
 *  PAGE
 * ========================================================================= */
export default function HomePage() {
  return (
    <div data-testid="home-page" className="bg-stone-50 font-[DM_Sans] text-stone-900 antialiased overflow-x-hidden">
      <AnnouncementBar />
      <TopUtilityBar />
      <MegaNavbar />
      <CategoryNavBar />

      <HeroBanner />
      <ServicePills />
      <CategoryShowcase />
      <FlashDealsSection />
      <PromoBannersTriple />
      <FeaturedProducts />
      <DealOfTheDay />
      <TrendingProductsCarousel />
      <NewArrivalsGrid />
      <BrandShowcase />
      <CategorySplitBanner />
      <RecommendedForYou />
      <RecentlyViewed />
      <Testimonials />
      <StatsStrip />
      <BlogSection />
      <AppDownload />
      <Newsletter />

      <Footer />
    </div>
  );
}
