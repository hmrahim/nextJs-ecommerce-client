import Link from 'next/link';

const MOCK_CATS = [
  { name: 'Electronics', slug: 'electronics', emoji: '📱' },
  { name: 'Fashion',     slug: 'fashion',     emoji: '👗' },
  { name: 'Home',        slug: 'home',        emoji: '🏠' },
  { name: 'Sports',      slug: 'sports',      emoji: '⚽' },
];

export default function CategoryShowcase() {
  return (
    <section className="container mx-auto px-4 py-10">
      <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
      <div className="grid grid-cols-4 gap-4">
        {MOCK_CATS.map((c) => (
          <Link key={c.slug} href={`/shop/category/${c.slug}`}
            className="bg-gray-50 hover:bg-gray-100 rounded-xl p-6 text-center transition-colors">
            <div className="text-4xl mb-2">{c.emoji}</div>
            <p className="font-medium text-sm">{c.name}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
