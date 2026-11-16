module.exports = {
  name: "fact",
  category: "fun",
  desc: "Random fun fact",
  async run({ reply }) {
    const r = await fetch("https://uselessfacts.jsph.pl/api/v2/facts/random?language=en");
    const j = await r.json();
    reply(j.text || "No fact today.");
  },
};
