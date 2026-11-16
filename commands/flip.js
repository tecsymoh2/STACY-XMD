module.exports = {
  name: "flip",
  aliases: ["coin"],
  category: "fun",
  desc: "Flip a coin",
  async run({ reply }) {
    reply(Math.random() < 0.5 ? "Heads" : "Tails");
  },
};
