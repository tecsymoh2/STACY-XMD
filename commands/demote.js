const { getTargets } = require("../lib/utils");

module.exports = {
  name: "demote",
  category: "group",
  desc: "Remove admin rights (mention or reply)",
  groupOnly: true,
  adminOnly: true,
  botAdmin: true,
  async run({ sock, jid, m, args, reply }) {
    const targets = getTargets(m, args);
    if (!targets.length) return reply("Mention or reply to the person.");
    await sock.groupParticipantsUpdate(jid, targets, "demote");
    reply("Demoted.");
  },
};
