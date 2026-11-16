module.exports = {
  name: "dice",
  aliases: ["roll"],
  category: "fun",
  desc: "Roll a dice (dice 20 for a d20)",
  async run({ args, reply }) {
    const sides = Math.min(Math.max(parseInt(args[0]) || 6, 2), 1000);
    reply(`Rolled a d${sides}: ${1 + Math.floor(Math.random() * sides)}`);
  },
};
