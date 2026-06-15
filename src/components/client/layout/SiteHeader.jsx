"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search, ShoppingCart, Heart, User, MapPin, Menu,
  Bell, Globe, ChevronDown, Phone, Mail, Truck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useCategories } from "@/hooks/client/useCategories";
import { useCart } from "@/hooks/useCart";
import { UserAccountMenu } from "@/components/client/layout/UserAccountMenu";
import { useAuth } from "@/hooks/useAuth";

export function SiteHeader() {
  const [megaOpen, setMegaOpen] = useState(false);
  const { data: categories = [] } = useCategories();
  const { data: cart } = useCart();
  const cartItemCount = cart?.itemCount ?? 0;
  const cartSubtotal = cart?.subtotal ?? 0;
  const { isLoggedIn } = useAuth();

  // ── Amazon-style global search (header only) ──
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");

  // Pre-fill from URL when on /search page (so input reflects current query)
  useEffect(() => {
    setQ(searchParams?.get("q") ?? "");
    setCategory(searchParams?.get("category") ?? "");
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    const query = q.trim();
    if (query) params.set("q", query);
    if (category) params.set("category", category);
    params.set("page", "1");
    router.push(`/search?${params.toString()}`);
  };

  return (
    <header className="sticky top-0 z-50">

      {/* ── Top utility bar ── */}
      <div className="hidden sm:block bg-[var(--color-primary-deep)] text-white/90 text-xs">
        <div className="container-x flex h-8 items-center justify-between overflow-hidden">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> +880 1700-000000</span>
            <span className="hidden md:flex items-center gap-1.5"><Mail className="h-3 w-3" /> support@greenmart.com</span>
            <span className="hidden lg:flex items-center gap-1.5"><Truck className="h-3 w-3" /> Free delivery on orders over ৳999</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/become-seller" className="hover:text-white">Sell on GreenMart</Link>
            <Link href="/account" className="hidden md:inline hover:text-white">Track Order</Link>
            <Link href="/help" className="hidden md:inline hover:text-white">Help Center</Link>
            <button className="flex items-center gap-1 hover:text-white">
              <Globe className="h-3 w-3" /> EN <ChevronDown className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Main header ── */}
      <div className="bg-[var(--color-header)] text-[var(--color-header-foreground)]">
        <div className="container-x flex h-14 md:h-16 items-center gap-2 md:gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 font-display font-bold">
              G
            </div>
            <div className="hidden sm:block">
              <div className="font-display text-xl font-bold leading-none">GreenMart</div>
              <div className="text-[10px] text-emerald-200/70">Multivendor Marketplace</div>
            </div>
          </Link>

          {/* Location */}
          <div className="hidden lg:flex items-center gap-1 text-xs text-emerald-100 cursor-pointer hover:text-white shrink-0">
            <MapPin className="h-4 w-4" />
            <div className="leading-tight">
              <div className="text-[10px] text-emerald-200/70">Deliver to</div>
              <div className="font-semibold">Dhaka 1207</div>
            </div>
          </div>

          {/* ── Search (Amazon-style, global) ── */}
          <form onSubmit={handleSearch} className="flex-1 min-w-0" role="search">
            <div className="flex h-11 overflow-hidden rounded-lg bg-white shadow-sm focus-within:ring-2 focus-within:ring-amber-400">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="hidden md:block border-r border-border bg-emerald-50 px-3 text-xs text-emerald-900 outline-none shrink-0 max-w-[140px]"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c._id} value={c.slug}>{c.name}</option>
                ))}
              </select>
              <input
                type="search"
                name="q"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search for products, brands, vendors..."
                className="flex-1 min-w-0 px-4 text-sm text-foreground outline-none"
                autoComplete="off"
              />
              <button
                type="submit"
                aria-label="Search"
                className="shrink-0 bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 text-white hover:from-emerald-600 hover:to-emerald-700"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-1 md:gap-2 shrink-0">
            <button className="hidden md:grid h-10 w-10 place-items-center rounded-lg hover:bg-white/10 relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-amber-400" />
            </button>
            <Link href="/wishlist" className="hidden md:flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-white/10 relative">
              <Heart className="h-5 w-5" />
              <div className="hidden xl:block text-xs leading-tight">
                <div className="text-emerald-200/70">Saved</div>
                <div className="font-semibold">Wishlist</div>
              </div>
              <span className="absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-amber-400 px-1 text-[10px] font-bold text-emerald-950">12</span>
            </Link>
            {/* Account menu — dropdown if logged in, sign-in CTA if not */}
            <UserAccountMenu />

            {/* Compact Sign-In button for tablets where xl: account label is hidden */}
            {!isLoggedIn && (
              <Link
                href="/auth/login"
                className="hidden md:inline-flex xl:hidden items-center gap-1.5 rounded-lg bg-amber-400 px-3 py-2 text-xs font-bold text-emerald-950 hover:bg-amber-500"
              >
                Sign In
              </Link>
            )}
            <Link href="/cart" className="flex items-center gap-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 px-3 py-2 relative">
              <ShoppingCart className="h-5 w-5" />
              <div className="hidden lg:block text-xs leading-tight">
                <div className="text-emerald-200/70">My Cart</div>
                <div className="font-semibold">৳ {cartSubtotal.toLocaleString("en-BD")}</div>
              </div>
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-amber-400 px-1 text-[10px] font-bold text-emerald-950">
                  {cartItemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* ── Category nav bar ── */}
      <div className="hidden sm:block bg-[var(--color-header-sub)] text-white/95 border-t border-white/5">
        <div className="container-x flex h-11 items-center gap-1 text-sm">

          {/* All Categories mega menu */}
          <div
            className="relative shrink-0"
            onMouseEnter={() => setMegaOpen(true)}
            onMouseLeave={() => setMegaOpen(false)}
          >
            <button className="flex items-center gap-2 rounded-md bg-emerald-700/60 px-3 py-1.5 font-semibold hover:bg-emerald-700 whitespace-nowrap">
              <Menu className="h-4 w-4" /> All Categories
            </button>

            {megaOpen && (
              <div className="absolute left-0 top-full z-50 mt-1 grid w-[min(720px,calc(100vw-2rem))] grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 rounded-xl border border-border bg-white p-3 text-foreground shadow-2xl">
                {categories.map((c) => (
                  <Link
                    key={c._id}
                    href={`/category/${c.slug}`}
                    className="flex items-start gap-3 rounded-lg p-3 hover:bg-emerald-50"
                  >
                    <div className="h-8 w-8 shrink-0 rounded-full bg-emerald-50 overflow-hidden grid place-items-center">
                      {c.image
                        ? <img src={c.image} alt={c.name} className="h-full w-full object-cover" />
                        : <span className="text-lg">{c.icon ?? "🛍️"}</span>
                      }
                    </div>
                    <div className="text-left min-w-0">
                      <div className="text-sm font-semibold text-emerald-900 truncate">{c.name}</div>
                      {c.description && (
                        <div className="text-[11px] text-muted-foreground line-clamp-1">{c.description}</div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* ── Scrollable nav links ── */}
          <div className="flex flex-1 items-center gap-1 overflow-x-auto scrollbar-hide">
            {categories.slice(0, 6).map((c) => (
              <Link
                key={c._id}
                href={`/category/${c.slug}`}
                className="whitespace-nowrap rounded-md px-3 py-1.5 hover:bg-white/10 shrink-0"
              >
                {c.name}
              </Link>
            ))}
            <Link href="/vendors" className="whitespace-nowrap rounded-md px-3 py-1.5 hover:bg-white/10 shrink-0">Vendors</Link>
            <Link href="/shop" className="whitespace-nowrap rounded-md px-3 py-1.5 hover:bg-white/10 shrink-0">All Products</Link>
            <Link href="/blog" className="whitespace-nowrap rounded-md px-3 py-1.5 hover:bg-white/10 shrink-0">Blog</Link>
          </div>

          {/* Flash sale badge — fixed on right, never pushes items */}
          <span className="shrink-0 ml-2 whitespace-nowrap rounded-md bg-amber-400 px-3 py-1 text-xs font-bold text-emerald-950">
            🔥 Flash Sale Live
          </span>
        </div>
      </div>

    </header>
  );
} 
