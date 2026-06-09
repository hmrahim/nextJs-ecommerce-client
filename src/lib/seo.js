const defaultMeta = {
  siteName: 'Moom24',
  description: 'Shop the latest trends at Moom24 — fast delivery, best prices.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://moom24.com',
  image: '/images/og-default.jpg',
};

export function generateMetadata({ title, description, image, noIndex = false } = {}) {
  const fullTitle = title ? `${title} | ${defaultMeta.siteName}` : defaultMeta.siteName;
  return {
    title: fullTitle,
    description: description || defaultMeta.description,
    openGraph: {
      title: fullTitle,
      description: description || defaultMeta.description,
      images: [{ url: image || defaultMeta.image }],
      siteName: defaultMeta.siteName,
    },
    ...(noIndex && { robots: { index: false, follow: false } }),
  };
}

export function generateProductMetadata(product) {
  return generateMetadata({
    title: product.name,
    description: product.description?.slice(0, 160),
    image: product.images?.[0],
  });
}
