import React, { useState, useMemo } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { useMessages } from "./hooks/messageManager";
import { generateNarrative } from "./utils/messageUtils";
import Tabs from "./components/Tabs";
import Toolbar from "./components/Toolbar";
import MessageTable from "./components/MessageTable";
import Pagination from "./components/Pagination";
import Agent from "./components/Agent";
import Summary from "./components/Summary";
import "./styles/index.css";

const PAGE_SIZE = 100;
const tabs = ["messages", "agent", "summary"];

export default function App() {
  const [zipPath, setZipPath] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("messages");
  const [filters, setFilters] = useState({ year: "", sender: "" });

  const { messages, setMessages, summaries } = useMessages(generateNarrative);

  const years = useMemo(() => {
    return Array.from(
      new Set(messages.map((m) => new Date(m.timestamp).getFullYear())),
    ).sort();
  }, [messages]);

  const senders = useMemo(() => {
    return Array.from(new Set(messages.map((m) => m.sender))).sort();
  }, [messages]);

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
        setZipPath(selected);
        setLoading(true);
        const result = await invoke("parse_zip", { zipPath: selected });
        setMessages(result);
        setCurrentPage(1);
      }
    } catch (error) {
      console.error("Error processing ZIP:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearCache = async () => {
    if (confirm("Are you sure you want to clear the cached data?")) {
      try {
        await invoke("clear_cache");
        alert("Cache cleared.");
      } catch (error) {
        alert("Failed to clear cache.");
      }
    }
  };

  const filtered = useMemo(() => {
    return messages.filter((m) => {
      const matchesSearch =
        m.content.toLowerCase().includes(search.toLowerCase()) ||
        m.sender.toLowerCase().includes(search.toLowerCase()) ||
        m.conversation.toLowerCase().includes(search.toLowerCase());

      const matchesYear = filters.year
        ? new Date(m.timestamp).getFullYear().toString() === filters.year
        : true;

      const matchesSender = filters.sender ? m.sender === filters.sender : true;

      return matchesSearch && matchesYear && matchesSender;
    });
  }, [messages, search, filters]);

  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  return (
    <div className="p-6 bg-gradient-to-br from-amber-100 to-yellow-50 min-h-screen text-stone-800">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-8 space-y-6">
        <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
        {activeTab === "messages" && (
          <>
            <Toolbar
              onFilePick={handleFilePicker}
              onClearCache={handleClearCache}
              search={search}
              setSearch={setSearch}
              filters={filters}
              setFilters={setFilters}
              years={years}
              senders={senders}
            />
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
                <MessageTable messages={paginated} />
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(filtered.length / PAGE_SIZE)}
                  setCurrentPage={setCurrentPage}
                />
              </>
            )}
          </>
        )}
        {activeTab === "agent" && (
          <Agent
            messages={messages}
            search={search}
            currentPage={currentPage}
            PAGE_SIZE={PAGE_SIZE}
          />
        )}
        {activeTab === "summary" && (
          <Summary messages={messages} summaries={summaries} />
        )}
      </div>
    </div>
  );
}
