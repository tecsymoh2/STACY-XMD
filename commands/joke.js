module.exports = {
  name: "joke",
  category: "fun",
  desc: "Random joke",
  async run({ reply }) {
    const r = await fetch("https://official-joke-api.appspot.com/random_joke");
    const j = await r.json();
    reply(`${j.setup}\n\n${j.punchline}`);
  },
};
