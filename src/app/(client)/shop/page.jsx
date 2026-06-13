"use client";
import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FilterPanel } from "@/components/client/shop/FilterPanel";
import { ProductCard } from "@/components/client/product/ProductCard";
import { ProductGrid } from "@/components/client/product/ProductGrid";
import { useShopProducts } from "@/hooks/client/useShopProducts";
import { Filter, Grid3x3, List, ChevronLeft, ChevronRight } from "lucide-react";

/* ─────────────────────────────────────────────
   Sort options kept in sync with SORT_MAP on
   the backend controller.
───────────────────────────────────────────── */
const SORT_OPTIONS = [
  { label: "Best Match",        value: "-createdAt" },
  { label: "Price: Low to High", value: "price:asc" },
  { label: "Price: High to Low", value: "price:desc" },
  { label: "Newest Arrivals",    value: "newest" },
  { label: "Top Rated",          value: "rating:desc" },
  { label: "Best Selling",       value: "sold:desc" },
];

const ITEMS_PER_PAGE = 20;

/* ─────────────────────────────────────────────
   Parse query-string → filters object
───────────────────────────────────────────── */
function parseFilters(params) {
  return {
    sort:             params.get("sort")             || "-createdAt",
    categoryId:       params.get("categoryId")       || undefined,
    subCategoryId:    params.get("subCategoryId")    || undefined,
    subSubCategoryId: params.get("subSubCategoryId") || undefined,
    brandId:          params.get("brandId")          || undefined,
    tags:             params.get("tags")             || undefined,
    isFeatured:       params.get("isFeatured") === "true" ? true : undefined,
    freeShipping:     params.get("freeShipping") === "true" ? true : undefined,
    inStock:          params.get("inStock") === "true" ? true : undefined,
    minPrice:         params.get("minPrice")         || undefined,
    maxPrice:         params.get("maxPrice")         || undefined,
    rating:           params.get("rating")           || undefined,
  };
}

/* ─────────────────────────────────────────────
   Skeleton cards shown while loading
───────────────────────────────────────────── */
function ProductSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-border bg-card overflow-hidden">
      <div className="aspect-square bg-muted" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-muted rounded w-4/5" />
        <div className="h-3 bg-muted rounded w-3/5" />
        <div className="h-4 bg-muted rounded w-2/5" />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Pagination row
───────────────────────────────────────────── */
function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;

  const range = [];
  const delta = 2;
  for (let i = Math.max(1, page - delta); i <= Math.min(pages, page + delta); i++) {
    range.push(i);
  }

  return (
    <div className="mt-6 flex justify-center gap-1 flex-wrap">
      <button
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        className="grid h-9 w-9 place-items-center rounded-md border border-border hover:bg-emerald-50 disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {range[0] > 1 && (
        <>
          <button onClick={() => onChange(1)} className="grid h-9 min-w-9 place-items-center rounded-md border border-border px-3 text-sm hover:bg-emerald-50">1</button>
          {range[0] > 2 && <span className="grid h-9 place-items-center px-2 text-muted-foreground">…</span>}
        </>
      )}

      {range.map((n) => (
        <button
          key={n}
          onClick={() => onChange(n)}
          className={`grid h-9 min-w-9 place-items-center rounded-md border px-3 text-sm ${
            n === page
              ? "bg-emerald-600 text-white border-emerald-600"
              : "border-border hover:bg-emerald-50"
          }`}
        >
          {n}
        </button>
      ))}

      {range[range.length - 1] < pages && (
        <>
          {range[range.length - 1] < pages - 1 && <span className="grid h-9 place-items-center px-2 text-muted-foreground">…</span>}
          <button onClick={() => onChange(pages)} className="grid h-9 min-w-9 place-items-center rounded-md border border-border px-3 text-sm hover:bg-emerald-50">{pages}</button>
        </>
      )}

      <button
        disabled={page === pages}
        onClick={() => onChange(page + 1)}
        className="grid h-9 w-9 place-items-center rounded-md border border-border hover:bg-emerald-50 disabled:opacity-40"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════
   SHOP PAGE
══════════════════════════════════════════════ */
export default function ShopPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const page    = Number(searchParams.get("page") || 1);
  const filters = parseFilters(searchParams);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'list'
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  /* ── data ── */
  const { data, isLoading, isError } = useShopProducts(page, filters);

  const total    = data?.total   ?? 0;
  const pages    = data?.pages   ?? 1;
  const products = data?.results ?? [];
  const from     = (page - 1) * ITEMS_PER_PAGE + 1;
  const to       = Math.min(page * ITEMS_PER_PAGE, total);

  /* ── url helpers ── */
  const setParam = useCallback((key, value) => {
    const p = new URLSearchParams(searchParams);
    value !== undefined && value !== "" && value !== null
      ? p.set(key, value)
      : p.delete(key);
    p.delete("page"); // reset to page 1 on any filter change
    router.push(`?${p.toString()}`);
  }, [searchParams, router]);

  const setPage = useCallback((n) => {
    const p = new URLSearchParams(searchParams);
    p.set("page", n);
    router.push(`?${p.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [searchParams, router]);

  /* ─────────────────────────────────────────
     RENDER
  ───────────────────────────────────────── */
  return (
    <div className="container-x py-6">
      {/* Breadcrumb */}
      <nav className="mb-4 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-primary">Home</Link>
        {" / "}
        <span className="text-foreground">Shop</span>
      </nav>

      <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
        {/* ── Sidebar filters (desktop) ── */}
        <aside className="hidden lg:block space-y-6">
          <FilterPanel filters={filters} onFilterChange={setParam} />
        </aside>

        {/* ── Mobile filter drawer backdrop ── */}
        {mobileFiltersOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setMobileFiltersOpen(false)}
          />
        )}

        {/* ── Mobile filter drawer ── */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto bg-white p-4 space-y-4 shadow-xl transition-transform duration-300 lg:hidden ${
            mobileFiltersOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold">Filters</span>
            <button onClick={() => setMobileFiltersOpen(false)} className="text-muted-foreground text-xl leading-none">✕</button>
          </div>
          <FilterPanel filters={filters} onFilterChange={(k, v) => { setParam(k, v); setMobileFiltersOpen(false); }} />
        </aside>

        {/* ── Product area ── */}
        <div>
          {/* Toolbar */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-3">
            <div className="text-sm text-muted-foreground">
              {isLoading ? (
                <span className="inline-block h-3 w-40 animate-pulse rounded bg-muted" />
              ) : (
                <>
                  Showing{" "}
                  <span className="font-semibold text-foreground">{total > 0 ? `${from}–${to}` : "0"}</span>
                  {" "}of{" "}
                  <span className="font-semibold text-foreground">{total.toLocaleString()}</span>{" "}
                  products
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Mobile filter button */}
              <button
                className="lg:hidden flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-sm font-medium"
                onClick={() => setMobileFiltersOpen(true)}
              >
                <Filter className="h-4 w-4" /> Filters
              </button>

              {/* Sort */}
              <select
                value={filters.sort}
                onChange={(e) => setParam("sort", e.target.value)}
                className="rounded-md border border-border bg-white px-3 py-1.5 text-sm"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>

              {/* View toggle */}
              <div className="hidden md:flex rounded-md border border-border">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`grid h-8 w-8 place-items-center ${viewMode === "grid" ? "bg-emerald-50 text-emerald-700" : "text-muted-foreground"}`}
                  aria-label="Grid view"
                >
                  <Grid3x3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`grid h-8 w-8 place-items-center ${viewMode === "list" ? "bg-emerald-50 text-emerald-700" : "text-muted-foreground"}`}
                  aria-label="List view"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Error state */}
          {isError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-600">
              Failed to load products. Please try refreshing the page.
            </div>
          )}

          {/* Loading skeletons */}
          {isLoading && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !isError && products.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card py-20 text-center">
              <span className="text-4xl">🔍</span>
              <p className="font-semibold text-foreground">No products found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your filters or search terms.</p>
              <button
                onClick={() => router.push("/shop")}
                className="mt-2 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Product grid / list */}
          {!isLoading && products.length > 0 && (
            viewMode === "grid" ? (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {products.map((p) => (
                  <ProductCard key={p._id} p={p} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {products.map((p) => (
                  <ProductCard key={p._id} p={p} listView />
                ))}
              </div>
            )
          )}

          {/* Pagination */}
          <Pagination page={page} pages={pages} onChange={setPage} />
        </div>
      </div>
    </div>
  );
}
