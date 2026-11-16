module.exports = {
  name: "broadcast",
  category: "owner",
  aliases: ["bc"],
  desc: "Owner: send a message to all groups",
  ownerOnly: true,
  async run({ sock, m, jid, text, config }) {
    if (!text) {
      return sock.sendMessage(jid, { text: `Usage: ${config.prefix}broadcast <message>` }, { quoted: m });
    }
    const groups = Object.keys(await sock.groupFetchAllParticipating());
    let sent = 0;
    for (const g of groups) {
      await sock.sendMessage(g, { text: `*${config.botName} Broadcast*\n\n${text}` });
      sent++;
      await new Promise((r) => setTimeout(r, 2000)); // go slow to avoid bans
    }
    await sock.sendMessage(jid, { text: `Sent to ${sent} groups.` }, { quoted: m });
  },
};
