module.exports = {
  name: "tagall",
  category: "group",
  desc: "Mention everyone in the group",
  groupOnly: true,
  adminOnly: true,
  async run({ sock, jid, m, text, group }) {
    const ids = group.participants.map((p) => p.id);
    const lines = ids.map((id) => `@${id.split("@")[0]}`).join("\n");
    await sock.sendMessage(
      jid,
      { text: `*${text || "Attention everyone"}*\n\n${lines}`, mentions: ids },
      { quoted: m }
    );
  },
};
