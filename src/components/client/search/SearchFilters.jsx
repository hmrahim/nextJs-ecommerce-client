// 📁 PATH: components/search/SearchFilters.jsx
'use client';

/**
 * SearchFilters Component
 * Search results page এ sidebar filter panel
 * Parent (SearchPageClient) থেকে register, watch পাবে — একই form এর অংশ
 *
 * Props:
 *  - register: from react-hook-form
 *  - categories: array of category objects
 */
export default function SearchFilters({ register, categories = [] }) {
  return (
    <aside className="w-full space-y-6">
      {/* Category */}
      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Category
        </h3>
        <select
          {...register('category')}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-400"
        >
          <option value="">সব Category</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">
          দাম (৳)
        </h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            {...register('minPrice')}
            placeholder="Min"
            min={0}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
          <span className="text-gray-400 text-xs">—</span>
          <input
            type="number"
            {...register('maxPrice')}
            placeholder="Max"
            min={0}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
        </div>
      </div>

      {/* Rating */}
      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Minimum Rating
        </h3>
        <select
          {...register('rating')}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-400"
        >
          <option value="">যেকোনো Rating</option>
          <option value="4">⭐ 4+ Star</option>
          <option value="3">⭐ 3+ Star</option>
          <option value="2">⭐ 2+ Star</option>
        </select>
      </div>

      {/* In Stock */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="inStock"
          {...register('inStock')}
          className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-400"
        />
        <label htmlFor="inStock" className="text-sm text-gray-700 cursor-pointer">
          Stock আছে এমন পণ্য
        </label>
      </div>

      {/* Sort */}
      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Sort By
        </h3>
        <select
          {...register('sort')}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-400"
        >
          <option value="">Relevance</option>
          <option value="price:asc">দাম: কম থেকে বেশি</option>
          <option value="price:desc">দাম: বেশি থেকে কম</option>
          <option value="rating:desc">সর্বোচ্চ Rating</option>
          <option value="newest">নতুন পণ্য আগে</option>
          <option value="sold:desc">সবচেয়ে বেশি বিক্রি</option>
        </select>
      </div>
    </aside>
  );
}