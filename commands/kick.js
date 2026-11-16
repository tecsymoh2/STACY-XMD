const { getTargets } = require("../lib/utils");

module.exports = {
  name: "kick",
  aliases: ["remove"],
  category: "group",
  desc: "Remove a member (mention or reply)",
  groupOnly: true,
  adminOnly: true,
  botAdmin: true,
  async run({ sock, jid, m, args, reply }) {
    const targets = getTargets(m, args);
    if (!targets.length) return reply("Mention or reply to the person to remove.");
    await sock.groupParticipantsUpdate(jid, targets, "remove");
    reply("Removed.");
  },
};
