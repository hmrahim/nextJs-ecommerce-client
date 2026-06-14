// 📁 PATH: components/search/SearchBar.jsx
'use client';

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { useCategories } from '@/hooks/client/useSearch';

/**
 * SearchBar Component
 * - react-hook-form দিয়ে form handle
 * - Category select করলে সেই category অনুযায়ী search হবে
 * - Submit এ /search?q=...&category=... এ navigate করে
 *
 * Props:
 *  - defaultValues: { q: '', category: '' }  (Search page থেকে pre-fill করতে)
 *  - compact: boolean (navbar এ ছোট version)
 */
export default function SearchBar({ defaultValues = {}, compact = false }) {
  const router = useRouter();
  const { data: categories = [], isLoading: catLoading } = useCategories();

  const { register, handleSubmit, watch } = useForm({
    defaultValues: {
      q: defaultValues.q ?? '',
      category: defaultValues.category ?? '',
    },
  });

  const onSubmit = (values) => {
    const params = new URLSearchParams();
    if (values.q?.trim()) params.set('q', values.q.trim());
    if (values.category) params.set('category', values.category);
    router.push(`/search?${params.toString()}`);
  };

  const inputHeight = compact ? 'h-10 text-sm' : 'h-12 text-base';
  const btnHeight   = compact ? 'h-10 px-4 text-sm' : 'h-12 px-6 text-base';

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full max-w-3xl items-center rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden"
    >
      {/* ── Category Dropdown ── */}
      <div className="relative border-r border-gray-200 shrink-0">
        <select
          {...register('category')}
          disabled={catLoading}
          className={`
            ${inputHeight}
            appearance-none bg-transparent pl-3 pr-7 text-gray-600
            focus:outline-none cursor-pointer
            ${compact ? 'hidden sm:block' : 'block'}
          `}
        >
          <option value="">সব Category</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
        {/* custom arrow */}
        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
          ▾
        </span>
      </div>

      {/* ── Search Input ── */}
      <input
        type="text"
        {...register('q')}
        placeholder="পণ্য খুঁজুন..."
        className={`
          ${inputHeight}
          flex-1 px-4 text-gray-800 placeholder:text-gray-400
          focus:outline-none bg-transparent
        `}
      />

      {/* ── Submit Button ── */}
      <button
        type="submit"
        className={`
          ${btnHeight}
          bg-violet-600 hover:bg-violet-700 active:bg-violet-800
          text-white font-medium transition-colors shrink-0
          flex items-center gap-2
        `}
      >
        <Search size={compact ? 16 : 18} />
        {!compact && <span>Search</span>}
      </button>
    </form>
  );
}