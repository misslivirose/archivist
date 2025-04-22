export default function Toolbar({
  onFilePick,
  onClearCache,
  search,
  setSearch,
}) {
  return (
    <div className="flex justify-between items-center flex-wrap gap-4">
      <button
        onClick={onFilePick}
        className="px-5 py-2 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
      >
        💾 Select Facebook ZIP Archive
      </button>
      <button
        onClick={onClearCache}
        className="px-5 py-2 font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
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
    </div>
  );
}
