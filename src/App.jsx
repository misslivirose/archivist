import React, { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import "./index.css";

const PAGE_SIZE = 100;

export default function App() {
  const [zipPath, setZipPath] = useState("");
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const handleFilePicker = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{ name: "ZIP Archive", extensions: ["zip"] }],
      });
      if (
        selected &&
        typeof selected === "string" &&
        selected.endsWith(".zip")
      ) {
        console.log("ZIP file selected:", selected);
        setZipPath(selected);
        await processZip(selected);
      } else {
        console.warn("No ZIP file selected.");
      }
    } catch (error) {
      console.error("File picker error:", error);
    }
  };

  const processZip = async (path) => {
    try {
      console.log("Invoking parse_zip with path:", path);
      setLoading(true);
      const result = await invoke("parse_zip", { zipPath: path });
      console.log("Parsed messages:", result);

      if (!Array.isArray(result)) {
        console.warn("Expected an array but got:", typeof result);
      } else if (result.length === 0) {
        console.warn("Parsed result is an empty array.");
      } else {
        console.log("Example parsed row:", result[0]);
      }

      setMessages(result);
      setCurrentPage(1);
    } catch (error) {
      console.error("Failed to parse zip:", error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = messages.filter(
    (m) =>
      m.content.toLowerCase().includes(search.toLowerCase()) ||
      m.sender.toLowerCase().includes(search.toLowerCase()) ||
      m.conversation.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  return (
    <div className="p-6 bg-gradient-to-br from-gray-100 to-white min-h-screen text-gray-800">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-8 space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <button
            onClick={handleFilePicker}
            className="px-5 py-2 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
          >
            Select Facebook ZIP Archive
          </button>
          <input
            type="text"
            placeholder="Search messages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[250px] px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-300"
          />
        </div>

        {loading ? (
          <p className="text-blue-600 font-semibold">
            Processing ZIP archive...
          </p>
        ) : messages.length === 0 ? (
          <p className="text-gray-500 italic">No messages found in archive.</p>
        ) : (
          <>
            <div className="overflow-auto border border-gray-200 rounded-lg shadow-sm max-h-[70vh]">
              <table className="min-w-full text-sm text-left table-fixed">
                <thead className="bg-blue-50 text-blue-800 uppercase text-xs">
                  <tr>
                    <th
                      style={{ width: "100px" }}
                      className="px-4 py-2 whitespace-nowrap"
                    >
                      Sender
                    </th>
                    <th className="px-4 py-2 whitespace-nowrap">Timestamp</th>
                    <th className="px-4 py-2 whitespace-nowrap">
                      Conversation
                    </th>
                    <th className="px-4 py-2 whitespace-nowrap">Message</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginated.map((msg, idx) => (
                    <tr key={idx} className="hover:bg-blue-50">
                      <td className="px-4 py-2 font-medium text-gray-700 whitespace-nowrap max-w-[150px] truncate">
                        {msg.sender}
                      </td>
                      <td className="px-4 py-2 text-gray-500 whitespace-nowrap">
                        {msg.timestamp}
                      </td>
                      <td className="px-4 py-2 text-gray-500 whitespace-nowrap">
                        {msg.conversation}
                      </td>
                      <td className="px-4 py-2 text-gray-700">{msg.content}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

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
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-gray-200 text-gray-600 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                Next →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
