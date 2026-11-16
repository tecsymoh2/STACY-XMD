const store = require("../lib/store");
const { clearHistory } = require("../lib/passive");

module.exports = {
  name: "chatbot",
  category: "ai",
  desc: "chatbot on/off/reset - AI replies to every message in this chat (owner)",
  ownerOnly: true,
  async run({ jid, args, reply, config }) {
    if (!config.groqKey) return reply("Set GROQ_API_KEY first.");
    const v = (args[0] || "").toLowerCase();
    if (v === "reset") {
      clearHistory(jid);
      return reply("Conversation memory cleared.");
    }
    if (v !== "on" && v !== "off") {
      return reply(`Chatbot is ${store.has("chatbot", jid) ? "ON" : "OFF"} here. Use: chatbot on|off|reset`);
    }
    store.toggle("chatbot", jid, v === "on");
    reply(`Chatbot ${v === "on" ? "enabled" : "disabled"} in this chat.`);
  },
};
