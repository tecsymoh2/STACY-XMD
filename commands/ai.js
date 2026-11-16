const { askAI } = require("../lib/ai");

module.exports = {
  name: "ai",
  aliases: ["ask", "gpt"],
  category: "ai",
  desc: "Ask the AI a question",
  async run({ text, reply, config }) {
    if (!config.groqKey) return reply("AI is not configured. Set GROQ_API_KEY.");
    if (!text) return reply(`Usage: ${config.prefix}ai <question>`);
    reply(await askAI([{ role: "user", content: text }]));
  },
};
