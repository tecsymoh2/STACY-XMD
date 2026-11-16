module.exports = {
  name: "alive",
  category: "general",
  desc: "Show that the bot is running",
  async run({ sock, m, jid, config }) {
    const up = process.uptime();
    const h = Math.floor(up / 3600);
    const min = Math.floor((up % 3600) / 60);
    await sock.sendMessage(
      jid,
      { text: `*${config.botName}* is online.\nUptime: ${h}h ${min}m` },
      { quoted: m }
    );
  },
};
