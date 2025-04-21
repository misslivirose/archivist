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
  const [activeTab, setActiveTab] = useState("messages");
  const [agentInput, setAgentInput] = useState("");
  const [agentResponse, setAgentResponse] = useState("");
  const [agentLoading, setAgentLoading] = useState(false);
  const tabs = ["messages", "agent", "summary"];
  const [summaries, setSummaries] = useState({});

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleClearCache = async () => {
    const userConfirmed = confirm(
      "Are you sure you want to clear the cached data?",
      {
        title: "Clear Cache",
        okLabel: "Yes",
        cancelLabel: "No",
      },
    );

    if (userConfirmed) {
      try {
        await invoke("clear_cache");
        alert("Cache cleared successfully.");
      } catch (error) {
        console.error("Failed to clear cache:", error);
        alert("Failed to clear cache.");
      }
    }
  };

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

  const generateNarrative = async (year, yearMessages) => {
    const context = yearMessages
      .map((m) => `[${m.timestamp}] ${m.sender}: ${m.content}`)
      .join("");
    const prompt = `Generate a warm, reflective paragraph summarizing the tone, themes, and emotional arc of these messages from the year ${year}. Speak with voice, tone, and gentle storytelling.${context}`;
    try {
      const response = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "qwen2.5",
          prompt,
          stream: false,
        }),
      });
      const data = await response.json();
      return data.response;
    } catch (err) {
      return "(Unable to generate summary for this year.)";
    }
  };

  React.useEffect(() => {
    const groups = {};
    for (const msg of messages) {
      if (!msg.timestamp) continue;
      const year = new Date(msg.timestamp).getFullYear();
      if (!groups[year]) groups[year] = [];
      groups[year].push(msg);
    }
    const sortedYears = Object.keys(groups).sort();

    const generateAllSummaries = async () => {
      const entries = await Promise.all(
        sortedYears.map(async (year) => {
          const summary = await generateNarrative(year, groups[year]);
          return [year, summary];
        }),
      );
      setSummaries(Object.fromEntries(entries));
    };

    if (messages.length > 0) {
      generateAllSummaries();
    }
  }, [messages]);

  const renderSummary = () => {
    const groups = {};
    for (const msg of messages) {
      const year = new Date(msg.timestamp).getFullYear();
      if (!groups[year]) groups[year] = [];
      groups[year].push(msg);
    }
    const sortedYears = Object.keys(groups).sort();

    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-700">
          Year-by-Year Summary
        </h2>
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

  const handleAgentSubmit = async () => {
    setAgentLoading(true);
    setAgentResponse("");
    try {
      // Step 1: Filter messages based on current search
      const visibleMessages = messages.filter(
        (m) =>
          m.content.toLowerCase().includes(search.toLowerCase()) ||
          m.sender.toLowerCase().includes(search.toLowerCase()) ||
          m.conversation.toLowerCase().includes(search.toLowerCase()),
      );

      // Step 2: Use only currently visible (paginated) messages
      const paginated = visibleMessages.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
      );

      // Step 3: Format messages into a context string
      const context = paginated
        .map((m) => `[${m.timestamp}] ${m.sender}: ${m.content}`)
        .join("\n");

      // Step 4: Send prompt to Ollama
      const response = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "qwen2.5",
          prompt: `${context}\n\n${agentInput}`,
          stream: false,
        }),
      });

      const data = await response.json();
      setAgentResponse(data.response);
    } catch (err) {
      setAgentResponse("Error communicating with the AI agent.");
    } finally {
      setAgentLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-amber-100 to-yellow-50 min-h-screen text-stone-800">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-8 space-y-6">
        <div className="flex space-x-4 border-b pb-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
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

        {activeTab === "messages" && (
          <>
            <div className="flex justify-between items-center flex-wrap gap-4">
              <button
                onClick={handleFilePicker}
                className="px-5 py-2 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
              >
                💾 Select Facebook ZIP Archive
              </button>
              <button
                onClick={handleClearCache}
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

            {loading ? (
              <p className="text-blue-600 font-semibold">
                Processing ZIP archive...
              </p>
            ) : messages.length === 0 ? (
              <p className="text-gray-500 italic">
                No messages found in archive.
              </p>
            ) : (
              <>
                <div className="overflow-auto border border-gray-200 rounded-lg shadow-sm max-h-[70vh]">
                  <table className="notebook-table min-w-full text-sm text-left table-fixed">
                    <thead className="bg-blue-50 text-blue-800 uppercase text-xs">
                      <tr>
                        <th
                          style={{ width: "100px" }}
                          className="px-4 py-2 whitespace-nowrap"
                        >
                          Sender
                        </th>
                        <th className="px-4 py-2 whitespace-nowrap">
                          Timestamp
                        </th>
                        <th className="px-4 py-2 whitespace-nowrap">
                          Conversation
                        </th>
                        <th className="px-4 py-2 whitespace-nowrap">Message</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {paginated.map((msg, idx) => (
                        <tr key={idx} className="hover:bg-blue-50">
                          <td className="px-4 py-2 font-medium text-gray-700 whitespace-nowrap truncate max-w-[100px]">
                            {msg.sender}
                          </td>
                          <td className="px-4 py-2 text-gray-500 whitespace-nowrap">
                            {msg.timestamp}
                          </td>
                          <td className="px-4 py-2 text-gray-500 whitespace-nowrap">
                            {msg.conversation}
                          </td>
                          <td className="px-4 py-2 text-gray-700 truncate">
                            {msg.content}
                          </td>
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
          </>
        )}

        {activeTab === "agent" && (
          <div className="space-y-4">
            <textarea
              rows="4"
              value={agentInput}
              onChange={(e) => setAgentInput(e.target.value)}
              placeholder="Ask something about your messages..."
              className="w-full border border-gray-300 rounded-lg p-4 shadow-sm focus:ring-2 focus:ring-blue-300"
            ></textarea>
            <button
              onClick={handleAgentSubmit}
              disabled={agentLoading || !agentInput.trim()}
              className="px-5 py-2 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {agentLoading ? "Thinking..." : "Ask AI"}
            </button>
            {agentResponse && (
              <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 whitespace-pre-wrap">
                {agentResponse}
              </div>
            )}
          </div>
        )}
        {activeTab === "summary" && renderSummary()}
      </div>
    </div>
  );
}
