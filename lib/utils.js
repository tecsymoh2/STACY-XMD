const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const pino = require("pino");

const digits = (jid) => (jid || "").split("@")[0].split(":")[0];

function unwrap(message) {
  let msg = message || {};
  for (let i = 0; i < 4; i++) {
    const inner =
      msg.ephemeralMessage?.message ||
      msg.viewOnceMessage?.message ||
      msg.viewOnceMessageV2?.message ||
      msg.documentWithCaptionMessage?.message;
    if (!inner) break;
    msg = inner;
  }
  return msg;
}

function getText(m) {
  const msg = unwrap(m.message);
  return (
    msg.conversation ||
    msg.extendedTextMessage?.text ||
    msg.imageMessage?.caption ||
    msg.videoMessage?.caption ||
    ""
  );
}

function getContext(m) {
  const msg = unwrap(m.message);
  return (
    msg.extendedTextMessage?.contextInfo ||
    msg.imageMessage?.contextInfo ||
    msg.videoMessage?.contextInfo ||
    null
  );
}

// The message that holds the media: the replied-to message if any, else the message itself
function getTarget(m) {
  const ctx = getContext(m);
  if (ctx?.quotedMessage) {
    return {
      key: {
        remoteJid: m.key.remoteJid,
        id: ctx.stanzaId,
        participant: ctx.participant,
      },
      message: unwrap(ctx.quotedMessage),
    };
  }
  return { key: m.key, message: unwrap(m.message) };
}

function mediaType(target) {
  const msg = target.message || {};
  if (msg.imageMessage) return "image";
  if (msg.videoMessage) return "video";
  if (msg.stickerMessage) return "sticker";
  return null;
}

function downloadMedia(sock, target) {
  return downloadMediaMessage(
    target,
    "buffer",
    {},
    { logger: pino({ level: "silent" }), reuploadRequest: sock.updateMediaMessage }
  );
}

// Users mentioned, or the replied-to user, or numbers typed as arguments
function getTargets(m, args) {
  const ctx = getContext(m);
  const out = new Set(ctx?.mentionedJid || []);
  if (ctx?.participant && !out.size) out.add(ctx.participant);
  for (const a of args) {
    const n = a.replace(/\D/g, "");
    if (n.length >= 8) out.add(`${n}@s.whatsapp.net`);
  }
  return [...out];
}

async function getGroupContext(sock, jid, senderJid) {
  const meta = await sock.groupMetadata(jid);
  const idsOf = (p) =>
    [p.id, p.jid, p.phoneNumber, p.lid].filter(Boolean).map(digits);
  const senderNum = digits(senderJid);
  const botNums = [sock.user?.id, sock.user?.lid].filter(Boolean).map(digits);

  let isAdmin = false;
  let isBotAdmin = false;
  for (const p of meta.participants) {
    if (!p.admin) continue;
    const ids = idsOf(p);
    if (ids.includes(senderNum)) isAdmin = true;
    if (ids.some((i) => botNums.includes(i))) isBotAdmin = true;
  }
  return { meta, participants: meta.participants, isAdmin, isBotAdmin };
}

module.exports = {
  digits,
  unwrap,
  getText,
  getContext,
  getTarget,
  mediaType,
  downloadMedia,
  getTargets,
  getGroupContext,
};
