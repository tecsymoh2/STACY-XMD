module.exports = {
  name: "ping",
  category: "general",
  aliases: ["speed"],
  desc: "Check bot response time",
  async run({ sock, m, jid }) {
    const start = Date.now();
    const sent = await sock.sendMessage(jid, { text: "Pinging..." }, { quoted: m });
    await sock.sendMessage(jid, {
      text: `Pong! ${Date.now() - start}ms`,
      edit: sent.key,
    });
  },
};
