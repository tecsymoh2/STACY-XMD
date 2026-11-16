module.exports = {
  name: "menu",
  aliases: ["help", "commands"],
  category: "general",
  desc: "List all commands",
  async run({ reply, config, commands }) {
    const groups = {};
    for (const c of new Set(commands.values())) {
      const cat = c.category || "general";
      (groups[cat] = groups[cat] || []).push(c);
    }
    let out = `*${config.botName}*\nPrefix: ${config.prefix}\n`;
    for (const [cat, list] of Object.entries(groups)) {
      out += `\n*${cat.toUpperCase()}*\n`;
      out += list.map((c) => `${config.prefix}${c.name} - ${c.desc}`).join("\n");
      out += "\n";
    }
    reply(out.trim());
  },
};
