module.exports = {
  name: "unmute",
  aliases: ["open"],
  category: "group",
  desc: "Let everyone send messages",
  groupOnly: true,
  adminOnly: true,
  botAdmin: true,
  async run({ sock, jid, reply }) {
    await sock.groupSettingUpdate(jid, "not_announcement");
    reply("Group opened. Everyone can chat.");
  },
};
