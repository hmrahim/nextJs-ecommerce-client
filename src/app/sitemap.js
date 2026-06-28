const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default async function sitemap() {
  const staticPages = [
    { url: 'https://moom24.com',         lastModified: new Date(), changeFrequency: 'daily',   priority: 1   },
    { url: 'https://moom24.com/shop',    lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    { url: 'https://moom24.com/about',   lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: 'https://moom24.com/contact', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];

  try {
    const res = await fetch(`${API_BASE}/products?limit=1000&status=active`);
    const json = await res.json();
    const products = json?.data?.products ?? json?.products ?? [];

    const productPages = products.map((p) => ({
      url:             `https://moom24.com/shop/${p.slug}`,
      lastModified:    new Date(p.updatedAt ?? p.createdAt ?? Date.now()),
      changeFrequency: 'weekly',
      priority:        0.8,
    }));

    return [...staticPages, ...productPages];
  } catch {
    return staticPages;
  }
}