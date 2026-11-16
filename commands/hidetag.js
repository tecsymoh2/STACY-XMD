module.exports = {
  name: "hidetag",
  aliases: ["ht"],
  category: "group",
  desc: "Send a message that silently notifies everyone",
  groupOnly: true,
  adminOnly: true,
  async run({ sock, jid, text, group, reply }) {
    if (!text) return reply("Usage: hidetag <message>");
    await sock.sendMessage(jid, {
      text,
      mentions: group.participants.map((p) => p.id),
    });
  },
};
