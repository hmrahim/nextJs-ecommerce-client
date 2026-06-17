// 📁 PATH: app/(client)/search/page.jsx
// ✅ FIX: import path Was '@/components/search/...' → Original file '@/components/client/search/...'
import { Suspense } from 'react';
import SearchPageClient from '@/components/client/search/SearchPageClient';

export const metadata = {
  title: 'Search products | Moom24',
  description: 'Moom24 Find your desired product in this',
};

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin h-8 w-8 border-4 border-violet-500 border-t-transparent rounded-full" />
        </div>
      }
    >
      <SearchPageClient />
    </Suspense>
  );
}
