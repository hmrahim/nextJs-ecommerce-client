import Link from 'next/link';

export default function HeroBanner() {
  return (
    <section className="bg-gray-900 text-white py-24 px-4 text-center">
      <h1 className="text-5xl font-bold mb-4">Shop the Latest</h1>
      <p className="text-gray-300 text-lg mb-8">Discover thousands of products at unbeatable prices.</p>
      <Link href="/shop" className="bg-orange-500 text-white px-8 py-3 rounded-full font-medium hover:bg-orange-600 transition-colors">
        Shop Now
      </Link>
    </section>
  );
}
