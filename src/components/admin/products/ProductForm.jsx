'use client';
export default function ProductForm({ productId }) {
  return (
    <div className="bg-white rounded-xl border p-6 space-y-4">
      {['Name','Slug','Price','Stock','Description'].map((label) => (
        <div key={label}>
          <label className="block text-sm font-medium mb-1">{label}</label>
          <input className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" placeholder={label} />
        </div>
      ))}
      <button className="bg-gray-900 text-white px-6 py-2 rounded-lg text-sm hover:bg-gray-700 transition-colors">
        {productId ? 'Update Product' : 'Create Product'}
      </button>
    </div>
  );
}
