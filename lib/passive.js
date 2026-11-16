const store = require("./store");
const { askAI } = require("./ai");
const { getGroupContext } = require("./utils");

const LINK_RE = /chat\.whatsapp\.com\/[A-Za-z0-9]{10,}/i;
const history = new Map();

async function runPassive(sock, m, { jid, isGroup, senderJid, isOwner, text }) {
  if (m.key.fromMe || !text) return;

  // Anti-link: delete invite links posted by non-admins
  if (isGroup && store.has("antilink", jid) && LINK_RE.test(text)) {
    try {
      const g = await getGroupContext(sock, jid, senderJid);
      if (g.isBotAdmin && !g.isAdmin && !isOwner) {
        await sock.sendMessage(jid, { delete: m.key });
        await sock.sendMessage(jid, {
          text: `@${senderJid.split("@")[0]} links are not allowed here.`,
          mentions: [senderJid],
        });
        return;
      }
    } catch (e) {
      console.error("[antilink]", e.message);
    }
  }

  // AI chat mode: reply to every message in enabled chats
  if (store.has("chatbot", jid)) {
    const past = history.get(jid) || [];
    past.push({ role: "user", content: text });
    try {
      const reply = await askAI(past.slice(-10));
      past.push({ role: "assistant", content: reply });
      history.set(jid, past.slice(-10));
      await sock.sendMessage(jid, { text: reply }, { quoted: m });
    } catch (e) {
      console.error("[chatbot]", e.message);
    }
  }
}

function clearHistory(jid) {
  history.delete(jid);
}

module.exports = { runPassive, clearHistory };
