export async function generateNarrative(year, yearMessages) {
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
}
