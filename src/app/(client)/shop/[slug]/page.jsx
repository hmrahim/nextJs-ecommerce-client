import ProductDetailClient from "./Productdetailclient";




const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// ─── Server-side product fetch (SSR এ চলে) ───────────────────────────────────
async function fetchProductBySlug(slug) {
  try {
    const res = await fetch(`${API_BASE}/products/${slug}`, {
      next: { revalidate: 60 }, // ⏱ 60 সেকেন্ড পর পর Google re-index করলে fresh data পাবে
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? json ?? null;
  } catch {
    return null;
  }
}

// ─── generateMetadata — Google Search এ title/description দেখাবে ──────────────
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);

  if (!product) {
    return {
      title: 'Product Not Found | Moom24',
    };
  }

  const name        = product.name ?? 'Product';
  const description = product.shortDescription || product.description || `Buy ${name} at best price on Moom24`;
  const image       = product.images?.[0]?.url ?? product.image ?? null;
  const price       = product.effectivePrice ?? product.price ?? 0;
  const inStock     = !product.trackInventory || (product.stock ?? 0) > 0;

  return {
    title:       `${name} | Moom24`,
    description: description.slice(0, 160),
    openGraph: {
      title:       `${name} | Moom24`,
      description: description.slice(0, 160),
      url:         `https://moom24.com/shop/${slug}`,
      siteName:    'Moom24',
      images:      image ? [{ url: image, alt: name }] : [],
      type:        'website',
    },
    twitter: {
      card:        'summary_large_image',
      title:       `${name} | Moom24`,
      description: description.slice(0, 160),
      images:      image ? [image] : [],
    },
    // ✅ Google Search Console verification (নিচের code টা search console থেকে নিবে)
    // verification: {
    //   google: 'তোমার-verification-code-এখানে',
    // },
    alternates: {
      canonical: `https://moom24.com/shop/${slug}`,
    },
    other: {
      'product:price:amount':   String(price),
      'product:price:currency': 'SAR',
      'product:availability':   inStock ? 'in stock' : 'out of stock',
    },
  };
}

// ─── JSON-LD builder — Google Product Rich Results এর জন্য ───────────────────
function buildProductJsonLd(product, slug) {
  const name        = product.name ?? '';
  const description = product.description || product.shortDescription || '';
  const image       = product.images?.[0]?.url ?? product.image ?? '';
  const price       = product.effectivePrice ?? product.price ?? 0;
  const comparePrice = product.comparePrice ?? null;
  const inStock     = !product.trackInventory || (product.stock ?? 0) > 0;
  const brand       = product.brand?.name ?? 'Moom24';
  const sku         = product.sku ?? String(product._id ?? '');
  const gtin        = product.gtin ?? product.barcode ?? undefined; // থাকলে Google Shopping এ আরো ভালো show হবে
  const avgRating   = product.avgRating ?? 0;
  const reviewCount = product.reviewCount ?? 0;

  // ─── Offer: discount থাকলে সেটাও দেখাবে ────────────────────────────────────
  const offerPrice = price;
  const priceValidUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0]; // 30 দিন পরে expire

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type':    'Product',

    // ─ Required fields ────────────────────────────────────────────────
    name,
    image:       image ? [image, ...(product.images?.slice(1).map((i) => i.url) ?? [])] : [],
    description,

    // ─ Identifiers (থাকলে Google Shopping tab এ দেখাবে) ──────────────
    sku,
    ...(gtin ? { gtin } : {}),
    mpn: sku,

    // ─ Brand ──────────────────────────────────────────────────────────
    brand: {
      '@type': 'Brand',
      name:    brand,
    },

    // ─ Offers (দাম, availability — এটাই Google card এ দেখায়) ────────
    offers: {
      '@type':           'Offer',
      url:               `https://moom24.com/shop/${slug}`,
      priceCurrency:     'SAR',
      price:             offerPrice.toFixed(2),
      priceValidUntil,
      availability:      inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition:     'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name:    'Moom24',
        url:     'https://moom24.com',
      },
      // ✅ Compare price থাকলে strikethrough দেখাবে Google এ
      ...(comparePrice && comparePrice > price
        ? {
            priceSpecification: {
              '@type':          'PriceSpecification',
              price:            offerPrice.toFixed(2),
              priceCurrency:    'SAR',
            },
          }
        : {}),
      // ✅ Shipping info (Google Shopping এ দেখাবে)
      shippingDetails: {
        '@type':             'OfferShippingDetails',
        shippingRate: {
          '@type':    'MonetaryAmount',
          value:      0,          // Free shipping
          currency:   'SAR',
        },
        shippingDestination: {
          '@type':          'DefinedRegion',
          addressCountry:   'SA',
        },
        deliveryTime: {
          '@type':            'ShippingDeliveryTime',
          handlingTime: {
            '@type':    'QuantitativeValue',
            minValue:   1,
            maxValue:   2,
            unitCode:   'DAY',
          },
          transitTime: {
            '@type':    'QuantitativeValue',
            minValue:   2,
            maxValue:   5,
            unitCode:   'DAY',
          },
        },
      },
      // ✅ Return policy
      hasMerchantReturnPolicy: {
        '@type':                'MerchantReturnPolicy',
        applicableCountry:      'SA',
        returnPolicyCategory:   'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays:     30,
        returnMethod:           'https://schema.org/ReturnByMail',
        returnFees:             'https://schema.org/FreeReturn',
      },
    },

    // ─ Aggregate Rating (star rating Google card এ দেখাবে) ───────────
    ...(reviewCount > 0 && avgRating > 0
      ? {
          aggregateRating: {
            '@type':       'AggregateRating',
            ratingValue:   avgRating.toFixed(1),
            reviewCount:   String(reviewCount),
            bestRating:    '5',
            worstRating:   '1',
          },
        }
      : {}),

    // ─ Category ───────────────────────────────────────────────────────
    ...(product.category?.name ? { category: product.category.name } : {}),
  };

  return jsonLd;
}

// ─── Main Server Component ────────────────────────────────────────────────────
export default async function ProductDetailPage({ params }) {
  const { slug } = await params;

  // SSR এ product fetch — JSON-LD এর জন্য
  const product = await fetchProductBySlug(slug);
  const jsonLd  = product ? buildProductJsonLd(product, slug) : null;

  return (
    <>
      {/* ✅ JSON-LD — SSR এ render হয়, Google bot সরাসরি পড়তে পারে */}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      {/*
        ✅ ProductDetailClient = তোমার বর্তমান সমস্ত page.jsx এর code
           এটাকে একই folder এ ProductDetailClient.jsx নামে save করো
           'use client' directive সহ
      */}
      <ProductDetailClient />
    </>
  );
}