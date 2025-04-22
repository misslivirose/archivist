export default function Toolbar({
  onFilePick,
  onClearCache,
  search,
  setSearch,
  filters,
  setFilters,
  years,
  senders,
}) {
  return (
    <div className="flex justify-between items-center flex-wrap gap-4">
      <button
        onClick={onFilePick}
        className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 text-white font-semibold rounded-full shadow hover:bg-blue-700 transition"
      >
        💾 Select Archive
      </button>

      <button
        onClick={onClearCache}
        className="inline-flex items-center gap-2 px-5 py-2 bg-red-600 text-white font-semibold rounded-full shadow hover:bg-red-700 transition"
      >
        🗑️ Clear Cache
      </button>

      <input
        type="text"
        placeholder="Search messages..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="flex-1 min-w-[250px] px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-300"
      />
      <div className="flex gap-4 items-center">
        <label class="text-sm font-semibold text-gray-700 mb-1">Filter:</label>
        <select
          value={filters.year}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, year: e.target.value }))
          }
          className="px-3 py-2 border rounded text-sm"
        >
          <option value="">All Years</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        <select
          value={filters.sender}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, sender: e.target.value }))
          }
          className="px-3 py-2 border rounded text-sm"
        >
          <option value="">All Senders</option>
          {senders.map((sender) => (
            <option key={sender} value={sender}>
              {sender}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
