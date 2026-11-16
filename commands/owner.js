module.exports = {
  name: "owner",
  category: "general",
  desc: "Show the owner's contact",
  async run({ sock, m, jid, config }) {
    if (!config.ownerNumber) {
      return sock.sendMessage(jid, { text: "Owner not set." }, { quoted: m });
    }
    const vcard =
      "BEGIN:VCARD\nVERSION:3.0\n" +
      `FN:${config.botName} Owner\n` +
      `TEL;type=CELL;waid=${config.ownerNumber}:+${config.ownerNumber}\n` +
      "END:VCARD";
    await sock.sendMessage(
      jid,
      { contacts: { displayName: "Owner", contacts: [{ vcard }] } },
      { quoted: m }
    );
  },
};
