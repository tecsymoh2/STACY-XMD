module.exports = {
  name: "add",
  category: "group",
  desc: "Add a number to the group",
  groupOnly: true,
  adminOnly: true,
  botAdmin: true,
  async run({ sock, jid, args, reply, config }) {
    const num = (args[0] || "").replace(/\D/g, "");
    if (num.length < 8) return reply(`Usage: ${config.prefix}add 2547XXXXXXXX`);
    const res = await sock.groupParticipantsUpdate(jid, [`${num}@s.whatsapp.net`], "add");
    const status = res?.[0]?.status;
    reply(status === "200" ? "Added." : `Could not add (status ${status}). They may have privacy settings on.`);
  },
};
