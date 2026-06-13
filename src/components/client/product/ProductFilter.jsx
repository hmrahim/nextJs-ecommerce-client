'use client';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ProductFilter() {
  const router = useRouter();
  const params = useSearchParams();

  const update = (key, value) => {
    const p = new URLSearchParams(params);
    value ? p.set(key, value) : p.delete(key);
    router.push(`?${p.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3 text-sm">Price Range</h3>
        <div className="flex gap-2">
          <input type="number" placeholder="Min" onChange={(e) => update('minPrice', e.target.value)}
            className="w-full border border-border rounded px-2 py-1 text-sm" />
          <input type="number" placeholder="Max" onChange={(e) => update('maxPrice', e.target.value)}
            className="w-full border border-border rounded px-2 py-1 text-sm" />
        </div>
      </div>
      <div>
        <h3 className="font-semibold mb-3 text-sm">Sort By</h3>
        <select onChange={(e) => update('sort', e.target.value)} className="w-full border border-border rounded px-2 py-1 text-sm">
          <option value="">Default</option>
          <option value="price:asc">Price: Low–High</option>
          <option value="price:desc">Price: High–Low</option>
          <option value="rating:desc">Top Rated</option>
        </select>
      </div>
    </div>
  );
}
