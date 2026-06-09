import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 mt-16">
      <div className="container mx-auto px-4 grid grid-cols-4 gap-8 text-sm">
        <div>
          <h3 className="text-white font-bold mb-3">Moom24</h3>
          <p>Your one-stop shop for everything.</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Shop</h4>
          <ul className="space-y-2">
            <li><Link href="/shop" className="hover:text-white">All Products</Link></li>
            <li><Link href="/shop/category/new" className="hover:text-white">New Arrivals</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Support</h4>
          <ul className="space-y-2">
            <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
            <li><Link href="/returns" className="hover:text-white">Returns</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Legal</h4>
          <ul className="space-y-2">
            <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-white">Terms</Link></li>
          </ul>
        </div>
      </div>
      <p className="text-center text-gray-500 text-xs mt-8">© {new Date().getFullYear()} Moom24</p>
    </footer>
  );
}
