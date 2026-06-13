"use client";
import { useState } from "react";
import { SlidersHorizontal, ChevronDown, ChevronUp } from "lucide-react";
import { useCategories } from "@/hooks/client/useCategories";
import { useBrands } from "@/hooks/client/useBrands";

function FilterGroup({ title, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <button
        className="mb-2 flex w-full items-center justify-between font-semibold text-sm"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        {title}
        {open ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {open && <div className="space-y-1">{children}</div>}
    </div>
  );
}

const PRICE_PRESETS = [
  { label: "Under ৳500",       min: "",     max: "500" },
  { label: "৳500 – ৳2,000",    min: "500",  max: "2000" },
  { label: "৳2,000 – ৳5,000",  min: "2000", max: "5000" },
  { label: "৳5,000 – ৳20,000", min: "5000", max: "20000" },
  { label: "Above ৳20,000",    min: "20000", max: "" },
];

function SkeletonList({ count = 6 }) {
  return (
    <div className="space-y-1">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-7 animate-pulse rounded bg-muted" />
      ))}
    </div>
  );
}

export function FilterPanel({ filters = {}, onFilterChange }) {
  const set = (key, value) => onFilterChange?.(key, value);

  const { data: categories = [], isLoading: catsLoading } = useCategories();
  const { data: brands = [],     isLoading: brandsLoading } = useBrands();

  const clearAll = () => {
    [
      "categoryId", "subCategoryId", "subSubCategoryId",
      "brandId", "tags", "isFeatured", "freeShipping",
      "inStock", "minPrice", "maxPrice", "rating",
    ].forEach((k) => set(k, ""));
  };

  const activePricePreset = PRICE_PRESETS.find(
    (p) =>
      String(p.min) === String(filters.minPrice ?? "") &&
      String(p.max) === String(filters.maxPrice ?? "")
  );

  const applyPreset = (p) => {
    if (activePricePreset?.label === p.label) {
      set("minPrice", ""); set("maxPrice", "");
    } else {
      set("minPrice", p.min); set("maxPrice", p.max);
    }
  };

  return (
    <>
      {/* Header + clear all */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center gap-2 font-semibold">
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </div>
        <button
          onClick={clearAll}
          className="w-full rounded-md border border-emerald-200 bg-emerald-50 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
        >
          Clear All
        </button>
      </div>

      {/* ── Category ── */}
      <FilterGroup title="Category">
        {catsLoading ? (
          <SkeletonList count={6} />
        ) : (
          categories.map((c) => (
            <label
              key={c._id}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-emerald-50 cursor-pointer"
            >
              <input
                type="radio"
                name="category"
                checked={filters.categoryId === c._id}
                onChange={() =>
                  set("categoryId", filters.categoryId === c._id ? "" : c._id)
                }
                className="accent-emerald-600"
              />
              <span className="flex items-center gap-1.5">
                {c.image ? (
                  <img src={c.image} alt="" className="h-4 w-4 rounded-full object-cover" />
                ) : (
                  <span className="text-sm">{c.icon ?? "🛍️"}</span>
                )}
                {c.name}
              </span>
            </label>
          ))
        )}
      </FilterGroup>

      {/* ── Brand ── */}
      <FilterGroup title="Brand">
        {brandsLoading ? (
          <SkeletonList count={6} />
        ) : (
          brands.map((b) => (
            <label
              key={b._id}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-emerald-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={filters.brandId === b._id}
                onChange={(e) =>
                  set("brandId", e.target.checked ? b._id : "")
                }
                className="accent-emerald-600"
              />
              <span className="flex items-center gap-1.5">
                {b.logo && (
                  <img src={b.logo} alt="" className="h-4 w-4 rounded object-contain" />
                )}
                {b.name}
              </span>
            </label>
          ))
        )}
      </FilterGroup>

      {/* ── Price Range ── */}
      <FilterGroup title="Price Range">
        <div className="flex gap-2 mb-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice ?? ""}
            onChange={(e) => set("minPrice", e.target.value)}
            className="w-full rounded-md border border-border px-2 py-1 text-sm"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice ?? ""}
            onChange={(e) => set("maxPrice", e.target.value)}
            className="w-full rounded-md border border-border px-2 py-1 text-sm"
          />
        </div>
        {PRICE_PRESETS.map((p) => (
          <label
            key={p.label}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-emerald-50 cursor-pointer"
          >
            <input
              type="radio"
              name="price"
              checked={activePricePreset?.label === p.label}
              onChange={() => applyPreset(p)}
              className="accent-emerald-600"
            />
            {p.label}
          </label>
        ))}
      </FilterGroup>

      {/* ── Rating ── */}
      <FilterGroup title="Rating">
        {[4, 3, 2, 1].map((r) => (
          <label
            key={r}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-emerald-50 cursor-pointer"
          >
            <input
              type="radio"
              name="rating"
              checked={String(filters.rating) === String(r)}
              onChange={() =>
                set("rating", String(filters.rating) === String(r) ? "" : r)
              }
              className="accent-emerald-600"
            />
            <span className="text-amber-400">{"★".repeat(r)}{"☆".repeat(5 - r)}</span>
            <span className="text-xs text-muted-foreground">& up</span>
          </label>
        ))}
      </FilterGroup>

      {/* ── Shipping / Availability ── */}
      <FilterGroup title="Shipping & Availability">
        <label className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-emerald-50 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.freeShipping === true || filters.freeShipping === "true"}
            onChange={(e) => set("freeShipping", e.target.checked ? "true" : "")}
            className="accent-emerald-600"
          />
          Free Shipping
        </label>
        <label className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-emerald-50 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.inStock === true || filters.inStock === "true"}
            onChange={(e) => set("inStock", e.target.checked ? "true" : "")}
            className="accent-emerald-600"
          />
          In Stock Only
        </label>
        <label className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-emerald-50 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.isFeatured === true || filters.isFeatured === "true"}
            onChange={(e) => set("isFeatured", e.target.checked ? "true" : "")}
            className="accent-emerald-600"
          />
          Featured Only
        </label>
      </FilterGroup>
    </>
  );
}