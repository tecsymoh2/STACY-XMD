const { getTargets } = require("../lib/utils");

module.exports = {
  name: "promote",
  category: "group",
  desc: "Make a member admin (mention or reply)",
  groupOnly: true,
  adminOnly: true,
  botAdmin: true,
  async run({ sock, jid, m, args, reply }) {
    const targets = getTargets(m, args);
    if (!targets.length) return reply("Mention or reply to the person.");
    await sock.groupParticipantsUpdate(jid, targets, "promote");
    reply("Promoted.");
  },
};
