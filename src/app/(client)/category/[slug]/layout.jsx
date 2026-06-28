const API_URL = 'https://nextjs-ecommerce-server-site-production.up.railway.app/api';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  try {
    const res = await fetch(`${API_URL}/categories/${slug}`);
    const json = await res.json();
    const cat = json?.data ?? json;
    return {
      title: `${cat.name} | Moom24`,
      description: `Shop the best ${cat.name} products at Moom24. Best prices guaranteed.`,
      alternates: { canonical: `https://www.moom24.com/category/${slug}` },
    };
  } catch {
    return { title: 'Category | Moom24' };
  }
}
export default function CategoryLayout({ children }) { return children; }