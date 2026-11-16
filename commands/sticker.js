const { Sticker, StickerTypes } = require("wa-sticker-formatter");
const { getTarget, mediaType, downloadMedia } = require("../lib/utils");

module.exports = {
  name: "sticker",
  aliases: ["s", "stiker"],
  category: "media",
  desc: "Turn an image/video into a sticker (reply or caption it)",
  async run({ sock, m, jid, reply, config }) {
    const target = getTarget(m);
    const type = mediaType(target);
    if (type !== "image" && type !== "video") {
      return reply(`Reply to an image or short video with ${config.prefix}sticker`);
    }
    if (type === "video" && (target.message.videoMessage.seconds || 0) > 10) {
      return reply("Video must be 10 seconds or less.");
    }
    const buffer = await downloadMedia(sock, target);
    const sticker = new Sticker(buffer, {
      pack: config.botName,
      author: "STACY",
      type: StickerTypes.FULL,
      quality: 60,
    });
    await sock.sendMessage(jid, { sticker: await sticker.toBuffer() }, { quoted: m });
  },
};
