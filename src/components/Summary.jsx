export default function Summary({ messages, summaries }) {
  const groups = {};
  for (const msg of messages) {
    const year = new Date(msg.timestamp).getFullYear();
    if (!groups[year]) groups[year] = [];
    groups[year].push(msg);
  }
  const sortedYears = Object.keys(groups).sort();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-700">Year-by-Year Summary</h2>
      {sortedYears.map((year) => (
        <div key={year} className="border-l-4 border-amber-200 pl-4">
          <h3 className="text-xl font-bold text-amber-700">{year}</h3>
          <p className="italic text-stone-700 mt-1">
            {summaries[year] || "Generating summary..."}
          </p>
        </div>
      ))}
    </div>
  );
}
