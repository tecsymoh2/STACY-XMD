const store = require("../lib/store");

module.exports = {
  name: "mode",
  category: "owner",
  desc: "mode public|self - self means only you can use the bot",
  ownerOnly: true,
  async run({ args, reply, sessionId }) {
    const v = (args[0] || "").toLowerCase();
    if (v !== "public" && v !== "self") {
      return reply(`Mode is ${store.get(`mode:${sessionId}`, "public")}. Use: mode public|self`);
    }
    store.set(`mode:${sessionId}`, v);
    reply(`Mode set to ${v}.`);
  },
};
