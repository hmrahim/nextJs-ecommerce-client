"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { productService } from "@/services/productService";
import { variantService } from "@/services/Variantservice";
import {
  Star, ShoppingCart, Heart, Share2, Truck, RotateCcw, ShieldCheck,
  BadgeCheck, MessageSquare, MapPin, Plus, Minus,
} from "lucide-react";

/* ── helpers ─────────────────────────────────────────────────────────── */
function buildAttrGroups(variants = []) {
  const map = {};
  for (const v of variants) {
    for (const a of v.attributes || []) {
      const key = a.attributeName;
      if (!map[key]) map[key] = { slug: a.attributeSlug, values: [] };
      if (!map[key].values.some((x) => x.valueId === a.valueId)) {
        map[key].values.push({
          valueId: a.valueId,
          valueLabel: a.valueLabel,
          valueData: a.valueData || "",
        });
      }
    }
  }
  return Object.entries(map).map(([name, v]) => ({
    name, slug: v.slug, values: v.values,
  }));
}

function findMatchingVariant(variants, selection) {
  if (!variants?.length) return null;
  const keys = Object.keys(selection);
  if (!keys.length) return null;
  return variants.find((v) =>
    keys.every((k) =>
      (v.attributes || []).some(
        (a) => a.attributeName === k && a.valueId === selection[k],
      ),
    ),
  ) || null;
}

/* ── page ─────────────────────────────────────────────────────────────── */
export default function ProductPage() {
  const { id } = useParams();

  const [product, setProduct]   = useState(null);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  const [selection, setSelection] = useState({}); // { [attributeName]: valueId }
  const [qty, setQty] = useState(1);
  const [img, setImg] = useState("");

  /* fetch product + variants */
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      setLoading(true); setError("");
      try {
        const res = await productService.getBySlug(id);
        const p = res.data?.data || res.data?.product || res.data;
        if (cancelled) return;
        if (!p) { setError("Product not found"); setLoading(false); return; }

        setProduct(p);
        setImg(p.images?.[0]?.url || p.images?.[0] || "");

        // variants may already be embedded by the public controller, else fetch
        let vs = Array.isArray(p.variants) ? p.variants : [];
        if (!vs.length) {
          try {
            const vr = await variantService.getPublic(p._id);
            vs = vr.data?.data || [];
          } catch { /* ignore */ }
        }
        if (cancelled) return;
        setVariants(vs);

        // pre-select first value for every attribute group
        const groups = buildAttrGroups(vs);
        const init = {};
        groups.forEach((g) => { if (g.values[0]) init[g.name] = g.values[0].valueId; });
        setSelection(init);
      } catch (e) {
        if (!cancelled) setError(e?.response?.data?.message || "Failed to load product");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  const attrGroups       = useMemo(() => buildAttrGroups(variants), [variants]);
  const activeVariant    = useMemo(() => findMatchingVariant(variants, selection), [variants, selection]);

  const displayPrice     = activeVariant?.price ?? product?.price ?? 0;
  const displayCompare   = activeVariant?.comparePrice || product?.comparePrice || 0;
  const displayStock     = activeVariant?.stock ?? product?.stock ?? 0;
  const displayImage     = activeVariant?.image || img;
  const galleryImages    = (product?.images || []).map((i) => i?.url || i).filter(Boolean);

  if (loading) {
    return <div className="container-x py-20 text-center text-muted-foreground">Loading…</div>;
  }
  if (error || !product) {
    return (
      <div className="container-x py-20 text-center">
        <h1 className="text-xl font-semibold">Product not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        <Link href="/shop" className="mt-4 inline-block text-emerald-700 hover:underline">← Back to shop</Link>
      </div>
    );
  }

  const discountPct = displayCompare && displayCompare > displayPrice
    ? Math.round(((displayCompare - displayPrice) / displayCompare) * 100) : 0;

  return (
    <div className="container-x py-6">
      <nav className="mb-4 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-primary">Home</Link>
        {" / "}
        {product.category?.slug && (
          <>
            <Link href={`/category/${product.category.slug}`} className="hover:text-primary capitalize">
              {product.category?.name}
            </Link>
            {" / "}
          </>
        )}
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-[1.1fr_1fr_320px]">
        {/* Gallery */}
        <div className="space-y-3">
          <div className="aspect-square overflow-hidden rounded-2xl border border-border bg-card">
            {displayImage
              ? <img src={displayImage} alt={product.name} className="h-full w-full object-cover" />
              : <div className="h-full w-full grid place-items-center text-muted-foreground">No image</div>}
          </div>
          {galleryImages.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {galleryImages.map((src) => (
                <button key={src} onClick={() => setImg(src)}
                  className={`aspect-square overflow-hidden rounded-lg border-2 ${img === src ? "border-emerald-600" : "border-transparent"}`}>
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-4">
          <h1 className="font-display text-xl font-bold md:text-3xl">{product.name}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-semibold">{(product.avgRating || 0).toFixed(1)}</span>
            </span>
            <a href="#reviews" className="text-emerald-700 hover:underline">
              {(product.reviewCount || 0).toLocaleString()} reviews
            </a>
            <span className="text-muted-foreground">|</span>
            <span className="flex items-center gap-1 text-emerald-700">
              <BadgeCheck className="h-4 w-4" /> Authentic
            </span>
          </div>

          <div className="rounded-xl border border-border bg-gradient-to-br from-emerald-50 to-amber-50 p-5">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-emerald-700">৳{Number(displayPrice).toLocaleString()}</span>
              {displayCompare > displayPrice && (
                <>
                  <span className="text-lg text-muted-foreground line-through">৳{Number(displayCompare).toLocaleString()}</span>
                  <span className="sale-badge">-{discountPct}%</span>
                </>
              )}
            </div>
            {activeVariant && (
              <div className="mt-1 text-xs text-emerald-800">
                Selected: <b>{activeVariant.variantTitle}</b>
              </div>
            )}
          </div>

          {/* Variants — dynamic from backend */}
          {attrGroups.map((g) => {
            const selectedValueId = selection[g.name];
            const selectedLabel   = g.values.find((v) => v.valueId === selectedValueId)?.valueLabel;
            const isColor         = g.slug === "color";
            return (
              <div key={g.name}>
                <div className="text-sm font-semibold mb-2">
                  {g.name}:{" "}
                  <span className="text-muted-foreground font-normal">{selectedLabel || "—"}</span>
                </div>
                <div className={isColor ? "flex flex-wrap gap-2" : "grid grid-cols-2 gap-2 sm:flex sm:flex-wrap"}>
                  {g.values.map((v) => {
                    const active = v.valueId === selectedValueId;
                    if (isColor) {
                      return (
                        <button
                          key={v.valueId}
                          onClick={() => setSelection((s) => ({ ...s, [g.name]: v.valueId }))}
                          title={v.valueLabel}
                          style={{ backgroundColor: v.valueData || "#ccc" }}
                          className={`h-9 w-9 rounded-full border-2 ${active ? "border-emerald-900 ring-2 ring-emerald-300" : "border-white"}`}
                        />
                      );
                    }
                    return (
                      <button
                        key={v.valueId}
                        onClick={() => setSelection((s) => ({ ...s, [g.name]: v.valueId }))}
                        className={`min-w-12 rounded-md border px-4 py-2 text-sm font-semibold transition-colors ${
                          active
                            ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                            : "border-border hover:border-emerald-600"
                        }`}
                      >
                        {v.valueLabel}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Quantity */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold">Quantity:</span>
            <div className="flex items-center rounded-md border border-border">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="grid h-9 w-9 place-items-center hover:bg-emerald-50">
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center font-semibold">{qty}</span>
              <button onClick={() => setQty(Math.min(displayStock || qty + 1, qty + 1))} className="grid h-9 w-9 place-items-center hover:bg-emerald-50">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <span className="text-xs text-muted-foreground">{displayStock} pieces available</span>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <button
              disabled={displayStock <= 0}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-amber-400 px-6 py-3 font-bold text-emerald-950 hover:bg-amber-300 disabled:opacity-50">
              Buy Now
            </button>
            <button
              disabled={displayStock <= 0}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
              <ShoppingCart className="h-4 w-4" /> Add to Cart
            </button>
            <button className="grid h-12 w-12 place-items-center rounded-lg border border-border hover:border-rose-500 hover:text-rose-500">
              <Heart className="h-5 w-5" />
            </button>
            <button className="grid h-12 w-12 place-items-center rounded-lg border border-border hover:border-emerald-500">
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Right rail */}
        <aside className="space-y-4 md:col-span-2 lg:col-span-1">
          <div className="rounded-xl border border-border bg-card p-4 space-y-3 text-sm">
            <div className="font-semibold flex items-center gap-2">
              <Truck className="h-4 w-4 text-emerald-600" /> Delivery Options
            </div>
            <div className="flex items-start gap-2 text-xs">
              <MapPin className="h-4 w-4 text-emerald-600 mt-0.5" />
              <div>
                <div className="font-semibold">Dhaka, Mirpur 1207</div>
                <button className="text-emerald-700 hover:underline">Change</button>
              </div>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between rounded border border-border p-2">
                <span>Standard (3-5 days)</span><span className="font-semibold text-emerald-700">Free</span>
              </div>
              <div className="flex items-center justify-between rounded border border-border p-2">
                <span>Express (1-2 days)</span><span className="font-semibold">৳120</span>
              </div>
              <div className="flex items-center justify-between rounded border border-border p-2">
                <span>Cash on Delivery</span><span className="font-semibold text-emerald-700">Available</span>
              </div>
            </div>
            <div className="space-y-2 border-t border-border pt-3 text-xs">
              <div className="flex items-center gap-2"><RotateCcw className="h-4 w-4 text-emerald-600" /> 7-Day easy returns</div>
              <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-600" /> 1-year manufacturer warranty</div>
              <div className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-emerald-600" /> 100% authentic guarantee</div>
            </div>
          </div>

          {variants.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                All Variants ({variants.length})
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-border">
                {variants.map((v) => (
                  <div key={v._id} className="flex items-center justify-between py-2 text-xs">
                    <span className="font-medium">{v.variantTitle}</span>
                    <span className="flex items-center gap-2">
                      <span className="font-semibold text-emerald-700">৳{Number(v.price).toLocaleString()}</span>
                      <span className={`text-[10px] ${v.stock > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                        {v.stock > 0 ? `${v.stock} in stock` : "Out of stock"}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Description */}
      {product.description && (
        <section className="mt-10 rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-bold mb-3">Description</h2>
          <div className="prose prose-sm max-w-none whitespace-pre-wrap text-muted-foreground">
            {product.description}
          </div>
        </section>
      )}
    </div>
  );
}
