export default function Tabs({ activeTab, setActiveTab, tabs }) {
  return (
    <div className="flex space-x-4 border-b pb-2">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`pb-1 border-b-2 ${
            activeTab === tab
              ? "border-amber-500 bg-amber-100 text-amber-700 shadow-inner"
              : "border-transparent text-gray-500 hover:text-amber-600 hover:bg-amber-50"
          } font-medium capitalize`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
