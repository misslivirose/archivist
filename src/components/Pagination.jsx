export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  setPageSize,
  setCurrentPage,
}) {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(startItem + pageSize - 1, totalItems);

  const handlePageJump = (e) => {
    const page = Math.min(Math.max(Number(e.target.value), 1), totalPages);
    if (!isNaN(page)) setCurrentPage(page);
  };

  return (
    <div className="sticky bottom-0 bg-white py-3 border-t border-gray-200 text-sm">
      <div className="flex flex-wrap justify-between items-center gap-4">
        {/* Item range info */}
        <div className="text-gray-600">
          Showing <span className="font-medium">{startItem}</span>–
          <span className="font-medium">{endItem}</span> of{" "}
          <span className="font-medium">{totalItems}</span> messages
        </div>

        {/* Page size selector */}
        <div className="flex items-center gap-2">
          <label htmlFor="pageSize">Show</label>
          <select
            id="pageSize"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1); // Reset to page 1
            }}
            className="border rounded px-2 py-1 text-sm"
          >
            {[10, 25, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span>per page</span>
        </div>

        {/* Jump to page */}
        <div className="flex items-center gap-2">
          <label htmlFor="jumpTo">Go to page</label>
          <input
            id="jumpTo"
            type="number"
            min="1"
            max={totalPages}
            defaultValue={currentPage}
            onBlur={handlePageJump}
            className="w-20 border rounded px-2 py-1 text-sm"
          />
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="px-2 py-1 bg-gray-200 text-gray-600 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            « First
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-2 py-1 bg-gray-200 text-gray-600 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            ← Prev
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-2 py-1 bg-gray-200 text-gray-600 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Next →
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="px-2 py-1 bg-gray-200 text-gray-600 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Last »
          </button>
        </div>
      </div>
    </div>
  );
}
