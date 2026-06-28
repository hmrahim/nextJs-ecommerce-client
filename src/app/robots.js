export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/api/', '/account/'],
    },
    sitemap: 'https://moom24.com/sitemap.xml',
  };
}