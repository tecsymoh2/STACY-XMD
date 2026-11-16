const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs");
const path = require("path");
const config = require("./config");
const { loadCommands, handleMessage } = require("./lib/handler");

loadCommands();

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState(path.join(config.dataDir, "session"));
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: "silent" }),
    browser: ["STACY XMD", "Chrome", "1.0.0"],
    printQRInTerminal: false,
  });

  // First run: pair with a code (no QR, no third-party site)
  if (!sock.authState.creds.registered) {
    if (!config.pairingNumber) {
      console.error("Set PAIRING_NUMBER in .env first.");
      process.exit(1);
    }
    setTimeout(async () => {
      const code = await sock.requestPairingCode(config.pairingNumber);
      console.log(`\n[STACY XMD] Pairing code: ${code}`);
      console.log("WhatsApp > Linked Devices > Link with phone number\n");
    }, 3000);
  }

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
    if (connection === "open") {
      console.log("[STACY XMD] Connected.");
    }
    if (connection === "close") {
      const code = lastDisconnect?.error?.output?.statusCode;
      if (code === DisconnectReason.loggedOut) {
        console.log("[STACY XMD] Logged out. Deleting session, restart to pair again.");
        fs.rmSync(path.join(config.dataDir, "session"), { recursive: true, force: true });
        process.exit(0);
      }
      console.log("[STACY XMD] Reconnecting...");
      start();
    }
  });

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;
    for (const m of messages) {
      if (!m.message) continue;
      await handleMessage(sock, m);
    }
  });
}

start();
