export default function StatsCard({ title, value, change }) {
  const positive = change?.startsWith('+');
  return (
    <div className="bg-white rounded-xl border p-5">
      <p className="text-sm text-gray-500 mb-1">{title}</p>
      <p className="text-2xl font-bold mb-1">{value}</p>
      <span className={`text-xs font-medium ${positive ? 'text-green-600' : 'text-red-500'}`}>{change} this month</span>
    </div>
  );
}
