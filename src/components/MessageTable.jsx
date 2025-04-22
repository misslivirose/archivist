export default function MessageTable({ messages }) {
  return (
    <div className="overflow-auto border border-gray-200 rounded-lg shadow-sm max-h-[70vh]">
      <table className="min-w-full text-sm text-left table-fixed">
        <thead className="bg-blue-50 text-blue-800 uppercase text-xs">
          <tr>
            <th style={{ width: "100px" }}>Sender</th>
            <th>Timestamp</th>
            <th>Conversation</th>
            <th>Message</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {messages.map((msg, idx) => (
            <tr key={idx} className="hover:bg-blue-50">
              <td className="px-4 py-2 font-medium text-gray-700 truncate max-w-[100px]">
                {msg.sender}
              </td>
              <td className="px-4 py-2 text-gray-500">{msg.timestamp}</td>
              <td className="px-4 py-2 text-gray-500">{msg.conversation}</td>
              <td className="px-4 py-2 text-gray-700 truncate">
                {msg.content}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
