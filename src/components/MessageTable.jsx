export default function MessageTable({ messages }) {
  return (
    <div className="notebook-paper overflow-auto border border-gray-200 rounded-lg shadow-sm max-h-[70vh]">
      <table className="table-fixed min-w-full text-sm text-left">
        <thead className="sticky top-0 bg-white shadow z-10 text-blue-800 uppercase text-xs">
          <tr>
            <th className="px-4 py-2 w-32">Sender</th>
            <th className="px-4 py-2 w-48">Timestamp</th>
            <th className="px-4 py-2 w-64">Conversation</th>
            <th className="px-4 py-2">Message</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-dashed divide-gray-300">
          {messages.map((msg, idx) => (
            <tr key={idx} className="hover:bg-rose-50 transition">
              <td className="px-4 py-2 font-medium text-gray-700 truncate">
                {msg.sender}
              </td>
              <td className="px-4 py-2 text-gray-500 whitespace-nowrap">
                {msg.timestamp}
              </td>
              <td className="px-4 py-2 text-gray-500 truncate">
                {msg.conversation}
              </td>
              <td className="px-4 py-2 text-gray-700 whitespace-normal">
                {msg.content}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
