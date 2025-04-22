export default function Pagination({
  currentPage,
  totalPages,
  setCurrentPage,
}) {
  return (
    <div className="sticky bottom-0 bg-white py-3 border-t border-gray-200">
      <div className="flex justify-between items-center mt-6 text-sm">
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-gray-200 text-gray-600 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          ← Previous
        </button>
        <span className="text-gray-600">
          Page <span className="font-medium">{currentPage}</span> of{" "}
          {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 bg-gray-200 text-gray-600 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
