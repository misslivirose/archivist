import { invoke } from "@tauri-apps/api/core";
import { useState, useEffect } from "react";

export function useConnections() {
  const [connections, setConnections] = useState([]);

  useEffect(() => {
    async function loadCachedConnections() {
      try {
        const result = await invoke("read_connection_cache");
        console.log("🔄 Raw connections result from backend:", result);

        if (Array.isArray(result)) {
          setConnections(result);
        } else {
          console.warn("⚠️ Expected array, got:", typeof result, result);
          setConnections([]);
        }
      } catch (error) {
        console.error("Failed to load cached connections: ", error);
      }
    }
    loadCachedConnections();
  }, []);

  return { connections, setConnections };
}
