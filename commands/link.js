module.exports = {
  name: "link",
  aliases: ["invite"],
  category: "group",
  desc: "Get the group invite link",
  groupOnly: true,
  adminOnly: true,
  botAdmin: true,
  async run({ sock, jid, reply }) {
    const code = await sock.groupInviteCode(jid);
    reply(`https://chat.whatsapp.com/${code}`);
  },
};
