'use client';

import { useState } from 'react';

const PRODUCTS = [
  { rank: 1,  name: 'Premium Wireless Headphones', category: 'Electronics', units: 842, revenue: 109262, rating: 4.8, trend: +18.4 },
  { rank: 2,  name: 'Ergonomic Office Chair',      category: 'Furniture',   units: 601, revenue: 180299, rating: 4.7, trend: +12.1 },
  { rank: 3,  name: 'Mechanical Keyboard TKL',     category: 'Electronics', units: 774, revenue: 116026, rating: 4.6, trend: +9.8  },
  { rank: 4,  name: 'Running Shoes Pro X2',        category: 'Sports',      units: 1204, revenue: 144480, rating: 4.5, trend: +22.3 },
  { rank: 5,  name: 'Merino Wool Blanket',         category: 'Home',        units: 521, revenue: 46889, rating: 4.9, trend: +5.4  },
  { rank: 6,  name: 'Stainless Water Bottle 1L',   category: 'Sports',      units: 2104, revenue: 52600, rating: 4.4, trend: -2.1  },
  { rank: 7,  name: 'Yoga Mat Premium',            category: 'Sports',      units: 943, revenue: 61295, rating: 4.6, trend: +14.7 },
  { rank: 8,  name: 'Cold Brew Coffee Maker',      category: 'Kitchen',     units: 681, revenue: 30644, rating: 4.3, trend: +8.2  },
  { rank: 9,  name: 'Bamboo Cutting Board Set',    category: 'Kitchen',     units: 1342, revenue: 37576, rating: 4.5, trend: +3.8  },
  { rank: 10, name: 'Ceramic Coffee Dripper',      category: 'Kitchen',     units: 892, revenue: 35641, rating: 4.7, trend: +11.5 },
  { rank: 11, name: 'Linen Tote Bag',              category: 'Accessories', units: 2310, revenue: 46200, rating: 4.2, trend: +28.4 },
  { rank: 12, name: 'Artisan Soy Candle Set',      category: 'Home',        units: 743, revenue: 40837, rating: 4.6, trend: +6.9  },
  { rank: 13, name: 'Natural Skincare Kit',        category: 'Beauty',      units: 614, revenue: 55260, rating: 4.8, trend: +19.3 },
  { rank: 14, name: 'Leather Minimalist Wallet',   category: 'Accessories', units: 1108, revenue: 55400, rating: 4.4, trend: -1.4  },
  { rank: 15, name: 'Standing Desk Converter',     category: 'Furniture',   units: 289, revenue: 115600, rating: 4.5, trend: +34.2 },
  { rank: 16, name: 'Noise Cancelling Earbuds',    category: 'Electronics', units: 1024, revenue: 122880, rating: 4.6, trend: +15.8 },
  { rank: 17, name: 'Smart Water Bottle',          category: 'Sports',      units: 562, revenue: 33720, rating: 4.3, trend: +42.1 },
  { rank: 18, name: 'Cork Board Wall Set',         category: 'Home',        units: 448, revenue: 17920, rating: 4.1, trend: -5.2  },
  { rank: 19, name: 'Organic Tea Collection',      category: 'Food',        units: 1892, revenue: 56760, rating: 4.7, trend: +7.6  },
  { rank: 20, name: 'Posture Corrector Band',      category: 'Health',      units: 834, revenue: 33360, rating: 4.2, trend: +9.4  },
];

const maxRevenue = Math.max(...PRODUCTS.map(p => p.revenue));

export default function TopProductsReport({ dateRange, limit = 6, expanded }) {
  const [sortBy, setSortBy] = useState('revenue');
  const products = [...PRODUCTS]
    .sort((a, b) => sortBy === 'revenue' ? b.revenue - a.revenue : b.units - a.units)
    .slice(0, limit);

  if (!expanded) {
    // Compact list mode
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 h-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Top Products</h3>
          <div className="flex gap-1">
            {['revenue','units'].map(s => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={`px-2 py-0.5 text-xs rounded font-medium transition-all ${
                  sortBy === s ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-500'
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {products.map((p, i) => (
            <div key={p.rank} className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-600 w-4 text-right">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-200 truncate font-medium">{p.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="flex-1 h-1 rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-indigo-500"
                      style={{ width: `${(p.revenue / maxRevenue) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-400 font-mono flex-shrink-0">
                    ${(p.revenue / 1000).toFixed(1)}k
                  </span>
                </div>
              </div>
              <span className={`text-xs font-medium flex-shrink-0 ${p.trend >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {p.trend >= 0 ? '+' : ''}{p.trend}%
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Expanded table mode
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-white">Product Performance</h3>
          <p className="text-xs text-slate-500 mt-0.5">Top {limit} products by revenue</p>
        </div>
        <div className="flex gap-1">
          {['revenue', 'units'].map(s => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`px-3 py-1.5 text-xs rounded-md font-medium border transition-all ${
                sortBy === s
                  ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300'
                  : 'border-slate-700 text-slate-500 hover:text-slate-300'
              }`}
            >
              By {s}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="text-left text-slate-500 font-medium pb-3 pr-4 w-8">#</th>
              <th className="text-left text-slate-500 font-medium pb-3 pr-4">Product</th>
              <th className="text-left text-slate-500 font-medium pb-3 pr-4">Category</th>
              <th className="text-right text-slate-500 font-medium pb-3 px-3">Units</th>
              <th className="text-right text-slate-500 font-medium pb-3 px-3">Revenue</th>
              <th className="text-right text-slate-500 font-medium pb-3 px-3">Rating</th>
              <th className="text-right text-slate-500 font-medium pb-3 pl-3">Trend</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {products.map((p, i) => (
              <tr key={p.rank} className="hover:bg-slate-800/30 transition-colors">
                <td className="py-3 pr-4">
                  <span className={`font-bold ${i < 3 ? 'text-indigo-400' : 'text-slate-600'}`}>
                    {i + 1}
                  </span>
                </td>
                <td className="py-3 pr-4 font-medium text-slate-200 max-w-xs truncate">{p.name}</td>
                <td className="py-3 pr-4">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400">{p.category}</span>
                </td>
                <td className="py-3 px-3 text-right font-mono text-slate-300">
                  {p.units.toLocaleString()}
                </td>
                <td className="py-3 px-3 text-right font-mono text-white font-semibold">
                  ${p.revenue.toLocaleString()}
                </td>
                <td className="py-3 px-3 text-right">
                  <span className="text-yellow-400">{'★'.repeat(Math.floor(p.rating))}</span>
                  <span className="text-slate-600">{'★'.repeat(5 - Math.floor(p.rating))}</span>
                  <span className="text-slate-400 ml-1">{p.rating}</span>
                </td>
                <td className="py-3 pl-3 text-right">
                  <span className={`font-semibold ${p.trend >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {p.trend >= 0 ? '+' : ''}{p.trend}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
