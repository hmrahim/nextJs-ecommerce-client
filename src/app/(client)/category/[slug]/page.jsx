"use client";
import { useState, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/client/product/ProductCard";
import { FilterPanel } from "@/components/client/shop/FilterPanel";
import { useShopProductsByCategory } from "@/hooks/client/useShopProducts";
import { useCategories } from "@/hooks/client/useCategories";

/* ─── Sort options ─── */
const SORT_OPTIONS = [
  { label: "Best Match",         value: "-createdAt"  },
  { label: "Price: Low to High", value: "price:asc"   },
  { label: "Price: High to Low", value: "price:desc"  },
  { label: "Newest Arrivals",    value: "newest"      },
  { label: "Top Rated",          value: "rating:desc" },
  { label: "Best Selling",       value: "sold:desc"   },
];

const ITEMS_PER_PAGE = 20;

/* ─── Parse URL query-string → filters object ─── */
function parseFilters(params) {
  return {
    sort:             params.get("sort")             || "-createdAt",
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

/* ─── Skeleton card ─── */
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

/* ─── Pagination ─── */
function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;
  const delta = 2;
  const range = [];
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
          {range[range.length - 1] < pages - 1 && (
            <span className="grid h-9 place-items-center px-2 text-muted-foreground">…</span>
          )}
          <button onClick={() => onChange(pages)} className="grid h-9 min-w-9 place-items-center rounded-md border border-border px-3 text-sm hover:bg-emerald-50">
            {pages}
          </button>
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
   CATEGORY PAGE
══════════════════════════════════════════════ */
export default function CategoryPage() {
  const { slug }     = useParams();
  const router       = useRouter();
  const searchParams = useSearchParams();

  const page    = Number(searchParams.get("page") || 1);
  const filters = parseFilters(searchParams);

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  /* ── Category info from the shared categories list ── */
  const { data: allCategories = [] } = useCategories();
  const cat = allCategories.find((c) => c.slug === slug) ?? null;

  const catName        = cat?.name        ?? slug;
  const catIcon        = cat?.icon        ?? "🛍️";
  const catImage       = cat?.image       ?? null;
  const subcategories  = cat?.subcategories ?? [];

  /* ── Fetch products for this category only ── */
  const { data, isLoading, isError } = useShopProductsByCategory(slug, page, filters);

  const total    = data?.total   ?? 0;
  const pages    = data?.pages   ?? 1;
  const products = data?.results ?? [];
  const from     = total > 0 ? (page - 1) * ITEMS_PER_PAGE + 1 : 0;
  const to       = Math.min(page * ITEMS_PER_PAGE, total);

  /* ── URL param helpers ── */
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

  /* ─────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────── */
  return (
    <div>
      {/* ── Hero banner ── */}
      <div className="bg-gradient-to-r from-emerald-700 to-emerald-900 text-white">
        <div className="container-x grid gap-4 py-10 md:grid-cols-[1fr_300px] md:items-center">
          <div>
            <nav className="mb-3 text-xs text-emerald-100">
              <Link href="/" className="hover:text-white">Home</Link>
              {" / "}
              <Link href="/shop" className="hover:text-white">Shop</Link>
              {" / "}
              <span className="text-white">{catName}</span>
            </nav>
            <h1 className="font-display text-4xl font-bold">
              {catIcon} {catName}
            </h1>
            <p className="mt-2 max-w-xl text-emerald-100">
              Explore the best of {catName.toLowerCase()} from verified sellers.
              Free shipping on orders over ৳999.
            </p>
            {subcategories.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {subcategories.map((s) => (
                  <button
                    key={s._id ?? s}
                    onClick={() => setParam("subCategoryId", s._id ?? s)}
                    className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur hover:bg-white/20"
                  >
                    {s.name ?? s}
                  </button>
                ))}
              </div>
            )}
          </div>
          {catImage && (
            <img
              src={catImage}
              alt={catName}
              className="hidden md:block h-40 w-full rounded-xl object-cover"
            />
          )}
        </div>
      </div>

      {/* ── Main grid: sidebar + products ── */}
      <div className="container-x py-6 grid gap-6 lg:grid-cols-[260px_1fr]">

        {/* Sidebar filters (desktop) */}
        <aside className="hidden lg:block space-y-6">
          <FilterPanel filters={filters} onFilterChange={setParam} />
        </aside>

        {/* Mobile filter drawer backdrop */}
        {mobileFiltersOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setMobileFiltersOpen(false)}
          />
        )}

        {/* Mobile filter drawer */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto bg-white p-4 space-y-4 shadow-xl transition-transform duration-300 lg:hidden ${
            mobileFiltersOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold">Filters</span>
            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="text-muted-foreground text-xl leading-none"
            >
              ✕
            </button>
          </div>
          <FilterPanel
            filters={filters}
            onFilterChange={(k, v) => {
              setParam(k, v);
              setMobileFiltersOpen(false);
            }}
          />
        </aside>

        {/* ── Product area ── */}
        <div>
          {/* Toolbar */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-3">
            <div className="text-sm text-muted-foreground">
              {isLoading ? (
                <span className="inline-block h-3 w-44 animate-pulse rounded bg-muted" />
              ) : (
                <>
                  Showing{" "}
                  <span className="font-semibold text-foreground">
                    {total > 0 ? `${from}–${to}` : "0"}
                  </span>
                  {" "}of{" "}
                  <span className="font-semibold text-foreground">
                    {total.toLocaleString()}
                  </span>{" "}
                  products in <span className="font-semibold text-foreground">{catName}</span>
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

              {/* Sort dropdown */}
              <select
                value={filters.sort}
                onChange={(e) => setParam("sort", e.target.value)}
                className="rounded-md border border-border bg-white px-3 py-1.5 text-sm"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
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
              <p className="text-sm text-muted-foreground">
                Try adjusting your filters or browse another category.
              </p>
              <button
                onClick={() => router.push(`/category/${slug}`)}
                className="mt-2 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Product grid */}
          {!isLoading && !isError && products.length > 0 && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p._id} p={p} />
              ))}
            </div>
          )}

          {/* Pagination */}
          <Pagination page={page} pages={pages} onChange={setPage} />
        </div>
      </div>
    </div>
  );
}