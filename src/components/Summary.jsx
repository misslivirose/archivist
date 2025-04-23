export default function Summary({ summaries, groupedByYear }) {
  const sortedYears = Object.keys(groupedByYear).sort();
  console.log("🔍 Summary re-rendered with:", summaries);
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-700">Year-by-Year Summary</h2>
      {sortedYears.map((year) => (
        <div key={year} className="border-l-4 border-rose-200 pl-4">
          <h3 className="text-xl font-bold text-rose-700">{year}</h3>
          <p className="italic text-stone-700 mt-1">
            {summaries?.[year] ?? "Generating summary..."}
          </p>
        </div>
      ))}
    </div>
  );
}
