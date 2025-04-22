import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

export function useMessages(generateNarrative) {
  const [messages, setMessages] = useState([]);
  const [summaries, setSummaries] = useState({});
  const years = Array.from(
    new Set(messages.map((m) => new Date(m.timestamp).getFullYear())),
  ).sort();
  const senders = Array.from(new Set(messages.map((m) => m.sender))).sort();
  const conversations = Array.from(
    new Set(messages.map((m) => m.conversation)),
  ).sort();

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

  useEffect(() => {
    const groups = {};
    for (const msg of messages) {
      if (!msg.timestamp) continue;
      const year = new Date(msg.timestamp).getFullYear();
      if (!groups[year]) groups[year] = [];
      groups[year].push(msg);
    }

    const sortedYears = Object.keys(groups).sort();

    const generateAllSummaries = async () => {
      for (const year of sortedYears) {
        const summary = await generateNarrative(year, groups[year]);
        setSummaries((prev) => ({ ...prev, [year]: summary }));
      }
    };

    if (messages.length > 0) {
      generateAllSummaries();
    }
  }, [messages, generateNarrative]);

  return { messages, setMessages, summaries };
}
