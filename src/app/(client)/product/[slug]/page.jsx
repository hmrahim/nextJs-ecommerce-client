'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Star, Heart, ShoppingCart, Truck, ShieldCheck,
  RotateCcw, Minus, Plus, Share2, Check, Package,
  Tag, AlertCircle, Loader2, Ban,
} from 'lucide-react';
import { useAddToCart }     from '@/hooks/useCart';
import { useWishlistStore } from '@/store/wishlistStore';
import ProductReviews       from '@/components/client/product/ProductReviews';
import { ProductCard }      from '@/components/client/product/ProductCard';
import {
  useShopProductBySlug,
  useShopRelatedProducts,
  useProductVariants,       // ✅ useEffect+useState এর বদলে React Query
} from '@/hooks/client/useShopProducts';

function buildAttrGroups(variants = []) {
  const map = {};
  for (const v of variants) {
    for (const a of v.attributes || []) {
      const key = a.attributeName;
      if (!map[key]) map[key] = { slug: a.attributeSlug, values: [] };
      if (!map[key].values.some((x) => x.valueId === a.valueId)) {
        map[key].values.push({
          valueId:    a.valueId,
          valueLabel: a.valueLabel,
          valueData:  a.valueData || '',
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
  return (
    variants.find((v) =>
      keys.every((k) =>
        (v.attributes || []).some(
          (a) => a.attributeName === k && a.valueId === selection[k],
        ),
      ),
    ) || null
  );
}

function Skeleton({ className }) {
  return <div className={`animate-pulse rounded bg-slate-200 ${className}`} />;
}
function PageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div className="space-y-3">
        <Skeleton className="w-full h-[340px] rounded-2xl" />
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
        </div>
      </div>
      <div className="space-y-4 pt-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}

function VariantPicker({ groups, variants, selection, onChange }) {
  if (!groups.length) return null;

  const isReachable = (groupName, valueId) => {
    const trial = { ...selection, [groupName]: valueId };
    return variants.some((v) =>
      Object.entries(trial).every(([k, vid]) =>
        (v.attributes || []).some(
          (a) => a.attributeName === k && a.valueId === vid,
        ),
      ) && (v.stock ?? 0) > 0,
    );
  };

  return (
    <div className="space-y-4">
      {groups.map((g) => {
        const selectedValueId = selection[g.name];
        const selectedLabel   = g.values.find((v) => v.valueId === selectedValueId)?.valueLabel;
        const isColor         = g.slug === 'color' || g.name?.toLowerCase() === 'color';

        return (
          <div key={g.name}>
            <p className="text-sm font-semibold text-slate-900 mb-2 capitalize">
              {g.name}:{' '}
              <span className="font-normal text-slate-500">{selectedLabel || '—'}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {g.values.map((val) => {
                const active    = val.valueId === selectedValueId;
                const reachable = isReachable(g.name, val.valueId);

                if (isColor) {
                  return (
                    <button
                      key={val.valueId}
                      type="button"
                      title={val.valueLabel}
                      disabled={!reachable && !active}
                      onClick={() => onChange(g.name, val.valueId)}
                      style={{ backgroundColor: val.valueData || '#e5e7eb' }}
                      className={`h-9 w-9 rounded-full border-2 transition
                        ${active ? 'border-emerald-600 ring-2 ring-emerald-300' : 'border-white shadow'}
                        ${!reachable && !active ? 'opacity-40 cursor-not-allowed' : ''}`}
                    />
                  );
                }

                return (
                  <button
                    key={val.valueId}
                    type="button"
                    disabled={!reachable && !active}
                    onClick={() => onChange(g.name, val.valueId)}
                    className={`px-4 py-2 rounded-lg border text-sm transition
                      ${active ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-border hover:border-emerald-400'}
                      ${!reachable && !active ? 'opacity-40 cursor-not-allowed line-through' : ''}`}
                  >
                    {val.valueLabel}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function OutOfStockBanner() {
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3.5 flex items-start gap-3">
      <Ban className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-semibold text-rose-700">এই পণ্যটি এখন স্টকে নেই</p>
        <p className="text-xs text-rose-500 mt-0.5">
          দুঃখিত, এই মুহূর্তে পণ্যটি পাওয়া যাচ্ছে না। পরে আবার চেক করুন।
        </p>
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  const { slug } = useParams();

  const { data: product, isLoading, isError } = useShopProductBySlug(slug);
  const { data: related = [] }                = useShopRelatedProducts(product?._id);
  // ✅ useEffect+variantService সরিয়ে React Query — cache হবে, route ফিরে এলে re-fetch হবে না
  const { data: variants = [] }               = useProductVariants(product?._id);

  const addToCart    = useAddToCart();
  const toggleWish   = useWishlistStore((s) => s.toggle);
  const isWishlisted = useWishlistStore((s) => s.isWishlisted);

  const [imgIdx,    setImgIdx]    = useState(0);
  const [selection, setSelection] = useState({});
  const [qty,       setQty]       = useState(1);
  const [tab,       setTab]       = useState('description');
  const [copied,    setCopied]    = useState(false);

  const attrGroups = useMemo(() => buildAttrGroups(variants), [variants]);

  useEffect(() => {
    if (!attrGroups.length) { setSelection({}); return; }
    setSelection((prev) => {
      const next = { ...prev };
      let changed = false;
      attrGroups.forEach((g) => {
        if (!next[g.name] && g.values[0]) {
          next[g.name] = g.values[0].valueId;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [attrGroups]);

  const activeVariant = useMemo(
    () => findMatchingVariant(variants, selection),
    [variants, selection],
  );

  if (isLoading) return <PageSkeleton />;
  if (isError || !product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-slate-300 mb-4" />
        <p className="text-lg font-semibold text-slate-700">Product not found</p>
        <Link href="/shop" className="mt-4 inline-block text-emerald-600 hover:underline">
          ← Back to shop
        </Link>
      </div>
    );
  }

  const images       = product.images ?? [];
  const variantImage = activeVariant?.image?.url || activeVariant?.image;
  const activeImage  = variantImage || images[imgIdx]?.url || '/placeholder.png';
  const price        = activeVariant?.price ?? product.price ?? 0;
  const comparePrice = activeVariant?.comparePrice ?? product.comparePrice ?? null;
  const discount     = comparePrice && comparePrice > price
    ? Math.round((comparePrice - price) / comparePrice * 100)
    : 0;
  const stock        = activeVariant?.stock ?? product.stock ?? 0;
  const inStock      = !product.trackInventory || stock > 0;
  const brandName    = product.brand?.name    ?? '';
  const categoryName = product.category?.name ?? '';
  const categorySlug = product.category?.slug ?? '';
  const wishlisted   = isWishlisted(product._id);
  const displaySku   = activeVariant?.sku || product.sku;

  const handleAddToCart = async () => {
    if (!inStock) return;
    if (attrGroups.length && !activeVariant) return;
    await addToCart.mutateAsync({
      product: { ...product, id: product._id },
      quantity: qty,
      variant: activeVariant
        ? {
            id:         activeVariant._id,
            _id:        activeVariant._id,
            sku:        activeVariant.sku,
            price:      activeVariant.price,
            title:      activeVariant.variantTitle,
            attributes: activeVariant.attributes,
            image:      variantImage || null,
          }
        : null,
    });
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  const scrollToReviews = () => {
    setTab('reviews');
    document.getElementById('product-tabs')?.scrollIntoView({ behavior: 'smooth' });
  };

  const onSelectAttr = (attrName, valueId) =>
    setSelection((s) => ({ ...s, [attrName]: valueId }));

  return (
    <div className="bg-white min-h-screen">

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4 text-sm text-slate-500 flex flex-wrap gap-1 items-center">
        <Link href="/" className="hover:text-emerald-600">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-emerald-600">Shop</Link>
        {categoryName && (
          <>
            <span>/</span>
            <Link href={`/category/${categorySlug}`} className="hover:text-emerald-600">{categoryName}</Link>
          </>
        )}
        <span>/</span>
        <span className="text-slate-900 line-clamp-1">{product.name}</span>
      </div>

      {/* Main grid */}
      <div className="container mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

        {/* ✅ Image gallery — sticky on desktop, height fixed */}
        <div className="lg:sticky lg:top-4">
          <div className="relative w-full h-[340px] sm:h-[400px] lg:h-[440px] bg-slate-100 rounded-2xl overflow-hidden">
            <Image
              src={activeImage}
              alt={product.name}
              fill
              className={`object-cover transition-all duration-300 ${!inStock ? 'grayscale opacity-60' : ''}`}
              sizes="(max-width:1024px) 100vw, 50vw"
              priority
            />
            {!inStock && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-slate-900/80 text-white text-sm font-bold px-4 py-2 rounded-full tracking-wide">
                  স্টক নেই
                </span>
              </div>
            )}
            {inStock && discount > 0 && (
              <span className="absolute top-3 left-3 bg-rose-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                -{discount}%
              </span>
            )}
            {inStock && product.featured && (
              <span className="absolute top-3 right-3 bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded-md">
                Featured
              </span>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  className={`relative h-16 rounded-lg overflow-hidden border-2 transition ${
                    i === imgIdx ? 'border-emerald-500' : 'border-transparent hover:border-slate-300'
                  }`}
                >
                  <Image src={img.url} alt="" fill className="object-cover" sizes="20vw" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="flex flex-col gap-5">

          {brandName && (
            <p className="text-xs uppercase tracking-widest text-emerald-600 font-semibold">{brandName}</p>
          )}

          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 leading-snug">
            {product.name}
          </h1>

          {displaySku && (
            <p className="text-xs text-slate-400">SKU: <span className="font-mono">{displaySku}</span></p>
          )}

          {/* Rating */}
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < Math.round(product.avgRating ?? 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
              ))}
              <span className="ml-1 font-semibold text-slate-700">{(product.avgRating ?? 0).toFixed(1)}</span>
            </div>
            <span className="text-slate-400">·</span>
            <button onClick={scrollToReviews} className="text-slate-600 hover:text-emerald-600 underline underline-offset-2">
              {(product.reviewCount ?? 0).toLocaleString()} reviews
            </button>
          </div>

          {/* Price */}
          <div className="flex items-end gap-3">
            <span className={`text-4xl font-bold ${inStock ? 'text-slate-900' : 'text-slate-400'}`}>
              ৳{Number(price).toLocaleString()}
            </span>
            {comparePrice && comparePrice > price && inStock && (
              <>
                <span className="text-xl line-through text-slate-400">৳{Number(comparePrice).toLocaleString()}</span>
                <span className="text-sm font-bold text-emerald-600">Save {discount}%</span>
              </>
            )}
          </div>

          {/* Stock status */}
          <div>
            {inStock ? (
              <span className="inline-flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
                <Check className="w-4 h-4" /> In stock
                {stock > 0 && stock <= 10 && (
                  <span className="ml-2 text-amber-600 text-xs font-semibold animate-pulse">
                    ⚠️ মাত্র {stock}টি বাকি!
                  </span>
                )}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-sm text-rose-500 font-medium">
                <Ban className="w-4 h-4" /> Out of stock
              </span>
            )}
          </div>

          {!inStock && <OutOfStockBanner />}

          {product.shortDescription && (
            <p className="text-slate-600 leading-relaxed text-sm border-l-2 border-emerald-200 pl-3">
              {product.shortDescription}
            </p>
          )}

          {attrGroups.length > 0 && (
            <VariantPicker
              groups={attrGroups}
              variants={variants}
              selection={selection}
              onChange={onSelectAttr}
            />
          )}

          {activeVariant?.variantTitle && (
            <p className="text-xs text-emerald-700">
              Selected: <span className="font-semibold">{activeVariant.variantTitle}</span>
            </p>
          )}

          {product.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 items-center">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              {product.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/shop?tags=${tag}`}
                  className="text-xs bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 px-2 py-0.5 rounded-full text-slate-600 transition"
                >
                  {tag}
                </Link>
              ))}
            </div>
          )}

          {/* Qty + actions */}
          <div className="flex flex-wrap items-center gap-3">
            {inStock && (
              <div className="flex items-center border border-border rounded-lg">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-2.5 hover:bg-slate-50 rounded-l-lg">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-semibold">{qty}</span>
                <button onClick={() => setQty(Math.min(stock || 99, qty + 1))} className="p-2.5 hover:bg-slate-50 rounded-r-lg">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            )}

            {inStock ? (
              <button
                disabled={(attrGroups.length > 0 && !activeVariant) || addToCart.isPending}
                onClick={handleAddToCart}
                className="flex-1 min-w-48 inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition"
              >
                {addToCart.isPending ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Adding...</>
                ) : (
                  <><ShoppingCart className="w-5 h-5" />{attrGroups.length > 0 && !activeVariant ? 'Select options' : 'Add to cart'}</>
                )}
              </button>
            ) : (
              <button disabled className="flex-1 min-w-48 inline-flex items-center justify-center gap-2 bg-slate-200 text-slate-400 cursor-not-allowed px-6 py-3 rounded-lg font-semibold">
                <Ban className="w-5 h-5" /> Stock নেই
              </button>
            )}

            <button
              onClick={() => toggleWish({ ...product, id: product._id })}
              className={`p-3 rounded-lg border transition ${wishlisted ? 'border-rose-300 bg-rose-50 text-rose-500' : 'border-border hover:bg-slate-50'}`}
            >
              <Heart className={`w-5 h-5 ${wishlisted ? 'fill-rose-500' : ''}`} />
            </button>

            <button onClick={handleShare} className="p-3 rounded-lg border border-border hover:bg-slate-50">
              {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Share2 className="w-5 h-5" />}
            </button>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 text-xs pt-2">
            {[
              { Icon: Truck,       title: 'Free shipping',   sub: 'On orders ৳999+' },
              { Icon: ShieldCheck, title: '2-year warranty', sub: 'Authentic guarantee' },
              { Icon: RotateCcw,   title: '30-day returns',  sub: 'Easy & free' },
            ].map(({ Icon, title, sub }) => (
              <div key={title} className="flex items-start gap-2 p-3 rounded-xl bg-slate-50">
                <Icon className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900">{title}</p>
                  <p className="text-slate-500">{sub}</p>
                </div>
              </div>
            ))}
          </div>

          {categoryName && (
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <Package className="w-3.5 h-3.5" />
              Category:{' '}
              <Link href={`/category/${categorySlug}`} className="text-emerald-600 hover:underline ml-1">
                {categoryName}
              </Link>
            </p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div id="product-tabs" className="container mx-auto px-4 py-10 border-t border-border">
        <div className="flex gap-6 border-b border-border overflow-x-auto">
          {['description', 'attributes', 'reviews'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-3 text-sm font-semibold capitalize whitespace-nowrap border-b-2 transition ${
                tab === t ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {t}
              {t === 'reviews' && (product.reviewCount ?? 0) > 0 && (
                <span className="ml-1 text-xs text-slate-400">({product.reviewCount})</span>
              )}
            </button>
          ))}
        </div>

        <div className="py-8 max-w-3xl">
          {tab === 'description' && (
            <p className="text-slate-600 leading-relaxed whitespace-pre-line">
              {product.description || <span className="text-slate-400">No description available.</span>}
            </p>
          )}
          {tab === 'attributes' && (
            <>
              {product.attributes?.length > 0 ? (
                <table className="w-full text-sm border-collapse">
                  <tbody>
                    {product.attributes.map((attr, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                        <td className="py-2.5 px-4 font-medium text-slate-700 capitalize w-40 border border-border">{attr.key}</td>
                        <td className="py-2.5 px-4 text-slate-600 border border-border">{attr.value}</td>
                      </tr>
                    ))}
                    {product.weight && (
                      <tr className={product.attributes.length % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                        <td className="py-2.5 px-4 font-medium text-slate-700 w-40 border border-border">Weight</td>
                        <td className="py-2.5 px-4 text-slate-600 border border-border">{product.weight} kg</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              ) : (
                <p className="text-slate-400">No specifications available.</p>
              )}
            </>
          )}
          {tab === 'reviews' && <ProductReviews productId={product._id} />}
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div className="container mx-auto px-4 pb-16 border-t border-border pt-10">
          <h2 className="text-xl font-bold text-slate-900 mb-6">You may also like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {related.map((p) => (
              <ProductCard key={p._id} p={p} compact />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
