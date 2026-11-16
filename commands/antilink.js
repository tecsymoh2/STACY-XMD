const store = require("../lib/store");

module.exports = {
  name: "antilink",
  category: "group",
  desc: "antilink on/off - delete group invite links from non-admins",
  groupOnly: true,
  adminOnly: true,
  botAdmin: true,
  async run({ jid, args, reply }) {
    const v = (args[0] || "").toLowerCase();
    if (v !== "on" && v !== "off") {
      return reply(`Anti-link is ${store.has("antilink", jid) ? "ON" : "OFF"}. Use: antilink on|off`);
    }
    store.toggle("antilink", jid, v === "on");
    reply(`Anti-link ${v === "on" ? "enabled" : "disabled"}.`);
  },
};
