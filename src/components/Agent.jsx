import { useState } from "react";

export default function Agent({ messages, search, currentPage, PAGE_SIZE }) {
  const [agentInput, setAgentInput] = useState("");
  const [agentResponse, setAgentResponse] = useState("");
  const [agentLoading, setAgentLoading] = useState(false);

  const handleAgentSubmit = async () => {
    setAgentLoading(true);
    setAgentResponse("");

    try {
      const visibleMessages = messages.filter(
        (m) =>
          m.content.toLowerCase().includes(search.toLowerCase()) ||
          m.sender.toLowerCase().includes(search.toLowerCase()) ||
          m.conversation.toLowerCase().includes(search.toLowerCase()),
      );

      const paginated = visibleMessages.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
      );

      const context = paginated
        .map((m) => `[${m.timestamp}] ${m.sender}: ${m.content}`)
        .join("\n");

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
  );
}
