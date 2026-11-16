module.exports = {
  name: "weather",
  category: "tools",
  desc: "Weather for a city, e.g. weather Nairobi",
  async run({ text, reply, config }) {
    if (!text) return reply(`Usage: ${config.prefix}weather <city>`);
    const r = await fetch(`https://wttr.in/${encodeURIComponent(text)}?format=3`);
    reply((await r.text()).trim());
  },
};
