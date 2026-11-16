const sharp = require("sharp");
const { getTarget, mediaType, downloadMedia } = require("../lib/utils");

module.exports = {
  name: "toimg",
  aliases: ["toimage"],
  category: "media",
  desc: "Convert a sticker back to an image (reply to it)",
  async run({ sock, m, jid, reply }) {
    const target = getTarget(m);
    if (mediaType(target) !== "sticker") return reply("Reply to a sticker.");
    const webp = await downloadMedia(sock, target);
    const png = await sharp(webp).png().toBuffer();
    await sock.sendMessage(jid, { image: png, caption: "Done" }, { quoted: m });
  },
};
