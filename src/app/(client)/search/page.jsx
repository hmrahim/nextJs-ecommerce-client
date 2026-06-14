// 📁 PATH: app/(client)/search/page.jsx
// ✅ FIX: import path ছিল '@/components/search/...' → আসল file '@/components/client/search/...'
import { Suspense } from 'react';
import SearchPageClient from '@/components/client/search/SearchPageClient';

export const metadata = {
  title: 'পণ্য খুঁজুন | Moom24',
  description: 'Moom24 এ আপনার পছন্দের পণ্য খুঁজুন',
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
