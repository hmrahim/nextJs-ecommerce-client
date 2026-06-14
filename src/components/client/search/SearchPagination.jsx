// 📁 PATH: components/search/SearchPagination.jsx
'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * SearchPagination
 * Props:
 *  - currentPage: number
 *  - totalPages: number
 *  - onPageChange: (page: number) => void
 */
export default function SearchPagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  // Visible page numbers (max 5 around current)
  const getPages = () => {
    const pages = [];
    const delta = 2;
    const left  = Math.max(1, currentPage - delta);
    const right = Math.min(totalPages, currentPage + delta);

    if (left > 1) {
      pages.push(1);
      if (left > 2) pages.push('...');
    }
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages) {
      if (right < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  const btnBase =
    'flex items-center justify-center min-w-[36px] h-9 px-2 rounded-lg text-sm font-medium transition-colors';

  return (
    <div className="flex items-center justify-center gap-1.5">
      {/* Prev */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`${btnBase} border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        <ChevronLeft size={16} />
      </button>

      {/* Pages */}
      {getPages().map((p, idx) =>
        p === '...' ? (
          <span key={`ellipsis-${idx}`} className="px-1 text-gray-400 text-sm">
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`${btnBase} ${
              p === currentPage
                ? 'bg-violet-600 text-white border border-violet-600'
                : 'border border-gray-200 text-gray-600 hover:bg-gray-100'
            }`}
          >
            {p}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`${btnBase} border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}