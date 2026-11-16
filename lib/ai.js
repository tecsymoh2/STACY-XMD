const config = require("../config");

async function askAI(messages) {
  if (!config.groqKey) throw new Error("NO_KEY");
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.groqKey}`,
    },
    body: JSON.stringify({
      model: config.groqModel,
      messages: [
        {
          role: "system",
          content: `You are ${config.botName}, a friendly WhatsApp assistant. Keep answers short and clear.`,
        },
        ...messages,
      ],
    }),
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "No response from AI.";
}

module.exports = { askAI };
