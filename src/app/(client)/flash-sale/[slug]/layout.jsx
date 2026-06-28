/**
 * src/app/(client)/flash-sale/[slug]/layout.jsx
 * SSR metadata for Flash Sale pages
 */

const API_URL = 'https://nextjs-ecommerce-server-site-production.up.railway.app/api';

export async function generateMetadata({ params }) {
  const { slug } = await params;

  try {
    const res = await fetch(`${API_URL}/flash-sales/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error('Not found');

    const json = await res.json();
    const sale = json?.data?.sale ?? json?.data ?? json;

    const name        = sale?.name ?? 'Flash Sale';
    const discount    = sale?.discountValue
      ? sale.discountType === 'percent'
        ? `Up to ${sale.discountValue}% OFF`
        : `Up to SAR ${sale.discountValue} OFF`
      : 'Limited time deals';
    const description = `${name} on Moom24 — ${discount}. Grab the best deals before they're gone!`;

    return {
      title:       `${name} | Flash Sale | Moom24`,
      description,
      openGraph: {
        title:       `⚡ ${name} | Moom24`,
        description,
        url:         `https://www.moom24.com/flash-sale/${slug}`,
        images:      [{ url: 'https://www.moom24.com/og-image.png' }],
      },
      alternates: {
        canonical: `https://www.moom24.com/flash-sale/${slug}`,
      },
    };
  } catch {
    return {
      title:       'Flash Sale | Moom24',
      description: 'Limited time flash sale deals on Moom24. Shop now before they expire!',
    };
  }
}

export default function FlashSaleLayout({ children }) {
  return children;
}