export const dynamic = 'force-dynamic'; // ✅ এটাই key — build time না, request time এ run হবে

export default async function sitemap() {
  const SITE_URL = 'https://www.moom24.com';
  const API_URL = 'https://nextjs-ecommerce-server-site-production.up.railway.app/api';

  const staticPages = [
    { url: `${SITE_URL}`,         lastModified: new Date(), changeFrequency: 'daily',   priority: 1   },
    { url: `${SITE_URL}/shop`,    lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    { url: `${SITE_URL}/about`,   lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];

  try {
    const res = await fetch(`${API_URL}/products?limit=1000&status=active`);
    if (!res.ok) throw new Error('API failed');
    const json = await res.json();
   const products = json?.results ?? json?.data?.products ?? json?.products ?? [];

    const productPages = products.map((p) => ({
      url:             `${SITE_URL}/shop/${p.slug}`,
      lastModified:    new Date(p.updatedAt ?? p.createdAt ?? Date.now()),
      changeFrequency: 'weekly',
      priority:        0.8,
    }));

    return [...staticPages, ...productPages];
  } catch (err) {
    console.error('Sitemap error:', err.message);
    return staticPages;
  }
}