import { useEffect, useState, useMemo } from "react";
import { invoke } from "@tauri-apps/api/core";

export function useMessages(generateNarrative) {
  const [messages, setMessages] = useState([]);
  const [summaries, setSummaries] = useState({});

  useEffect(() => {
    async function loadCachedMessages() {
      try {
        const result = await invoke("read_message_cache");
        if (result) {
          setMessages(result);
        }
      } catch (error) {
        console.error("Failed to load cached messages:", error);
      }
    }
    loadCachedMessages();
  }, []);

  const groupedByYear = useMemo(() => {
    const groups = {};
    for (const msg of messages) {
      const year = new Date(msg.timestamp).getFullYear();
      if (!groups[year]) groups[year] = [];
      groups[year].push(msg);
    }
    return groups;
  }, [messages]);

  const generateSummaries = async () => {
    const groups = {};
    for (const msg of messages) {
      if (!msg.timestamp) continue;
      const year = new Date(msg.timestamp).getFullYear();
      if (!groups[year]) groups[year] = [];
      groups[year].push(msg);
    }

    const sortedYears = Object.keys(groups).sort();

    for (const year of sortedYears) {
      console.log("Generating summary for year" + year);
      const summary = await generateNarrative(year, groups[year]);
      setSummaries((prev) => {
        const updated = { ...prev, [year]: summary };
        return updated;
      });
    }
  };

  return { messages, setMessages, summaries, generateSummaries, groupedByYear };
}
