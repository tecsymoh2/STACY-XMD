module.exports = {
  name: "calc",
  aliases: ["math"],
  category: "tools",
  desc: "Calculator, e.g. calc (5+3)*2",
  async run({ text, reply, config }) {
    if (!text) return reply(`Usage: ${config.prefix}calc 12*(3+4)`);
    if (!/^[\d\s+\-*/().%]+$/.test(text)) return reply("Only numbers and + - * / ( ) % allowed.");
    try {
      const result = Function(`"use strict"; return (${text})`)();
      reply(`${text} = ${result}`);
    } catch {
      reply("Invalid expression.");
    }
  },
};
