export default function DataTable({ resource, columns = [], data = [] }) {
  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="px-4 py-3 text-left font-semibold text-gray-500 text-xs uppercase">{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0
            ? <tr><td colSpan={columns.length || 5} className="px-4 py-8 text-center text-gray-400">No data</td></tr>
            : data.map((row, i) => (
              <tr key={i} className="border-t hover:bg-gray-50">
                {columns.map((c) => <td key={c.key} className="px-4 py-3">{row[c.key]}</td>)}
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  );
}
