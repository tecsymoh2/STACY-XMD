module.exports = {
  name: "mute",
  aliases: ["close"],
  category: "group",
  desc: "Only admins can send messages",
  groupOnly: true,
  adminOnly: true,
  botAdmin: true,
  async run({ sock, jid, reply }) {
    await sock.groupSettingUpdate(jid, "announcement");
    reply("Group muted. Only admins can chat.");
  },
};
