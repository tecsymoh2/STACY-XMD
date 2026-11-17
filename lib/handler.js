const fs = require("fs");
const path = require("path");
const config = require("../config");
const store = require("./store");
const { getText, digits, getGroupContext } = require("./utils");
const { runPassive } = require("./passive");

const commands = new Map();

function loadCommands() {
  commands.clear();
  const dir = path.join(__dirname, "..", "commands");
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".js"))) {
    const cmd = require(path.join(dir, file));
    commands.set(cmd.name, cmd);
    for (const alias of cmd.aliases || []) commands.set(alias, cmd);
  }
  console.log(`[STACY XMD] Loaded ${new Set(commands.values()).size} commands`);
}

async function handleMessage(sock, m, ctx = {}) {
  const sessionId = ctx.sessionId || "main";
  const ownerNumber = ctx.ownerNumber || config.ownerNumber;
  const jid = m.key.remoteJid;
  if (!jid || jid === "status@broadcast") return;

  const isGroup = jid.endsWith("@g.us");
  const senderJid = m.key.participant || jid;
  const sender = digits(senderJid);
  const isOwner = m.key.fromMe || (ownerNumber && sender === ownerNumber);
  const text = getText(m).trim();

  if (!text.startsWith(config.prefix)) {
    return runPassive(sock, m, { jid, isGroup, senderJid, isOwner, text });
  }

  const [name, ...args] = text.slice(config.prefix.length).trim().split(/\s+/);
  const cmd = commands.get((name || "").toLowerCase());
  if (!cmd) return;

  const reply = (t) => sock.sendMessage(jid, { text: t }, { quoted: m });

  if (store.get(`mode:${sessionId}`, "public") === "self" && !isOwner) return;
  if (cmd.ownerOnly && !isOwner) return reply("Owner only command.");

  let group = null;
  try {
    if (cmd.groupOnly || cmd.adminOnly || cmd.botAdmin) {
      if (!isGroup) return reply("This command works in groups only.");
      group = await getGroupContext(sock, jid, senderJid);
      if (cmd.adminOnly && !group.isAdmin && !isOwner) {
        return reply("Only group admins can use this.");
      }
      if (cmd.botAdmin && !group.isBotAdmin) {
        return reply("Make me a group admin first.");
      }
    }

    await cmd.run({
      sock, m, jid, sender, senderJid, args,
      text: args.join(" "),
      isOwner, isGroup, group, config, commands, reply,
      sessionId, ownerNumber,
    });
  } catch (err) {
    console.error(`[${cmd.name}]`, err);
    await reply("Something went wrong.");
  }
}

module.exports = { loadCommands, handleMessage, commands };
