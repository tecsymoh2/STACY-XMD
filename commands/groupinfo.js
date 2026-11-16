module.exports = {
  name: "groupinfo",
  aliases: ["ginfo"],
  category: "group",
  desc: "Show group details",
  groupOnly: true,
  async run({ group, reply }) {
    const { meta, participants } = group;
    const admins = participants.filter((p) => p.admin).length;
    const created = new Date((meta.creation || 0) * 1000).toDateString();
    reply(
      `*${meta.subject}*\n\nMembers: ${participants.length}\nAdmins: ${admins}\nCreated: ${created}\n\n${meta.desc || "No description"}`
    );
  },
};
