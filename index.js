const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs");
const path = require("path");
const http = require("http");
const config = require("./config");
const store = require("./lib/store");
const { loadCommands, handleMessage } = require("./lib/handler");

loadCommands();

// Tiny web endpoint so free web hosts see a live port and uptime pingers have something to hit
http
  .createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end(`${config.botName} is running`);
  })
  .listen(process.env.PORT || 3000);

let backend = null;

async function setupStorage() {
  if (config.databaseUrl) {
    const { createBackend } = require("./lib/neonAuth");
    backend = createBackend(config.databaseUrl, config.authPrefix);
    await backend.init();
    await store.init(backend.settings);
    console.log("[STACY XMD] Storage: Neon Postgres");
  } else {
    console.log("[STACY XMD] Storage: local files");
  }
}

async function start() {
  const { state, saveCreds } = backend
    ? await backend.useAuthState()
    : await useMultiFileAuthState(path.join(config.dataDir, "session"));
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
      console.error("Set PAIRING_NUMBER first.");
      process.exit(1);
    }
    setTimeout(async () => {
      try {
        const code = await sock.requestPairingCode(config.pairingNumber);
        console.log(`\n[STACY XMD] Pairing code: ${code}`);
        console.log("WhatsApp > Linked Devices > Link with phone number\n");
      } catch (e) {
        console.error("Could not get pairing code:", e.message);
      }
    }, 3000);
  }

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
    if (connection === "open") console.log("[STACY XMD] Connected.");
    if (connection === "close") {
      const code = lastDisconnect?.error?.output?.statusCode;
      if (code === DisconnectReason.loggedOut) {
        console.log("[STACY XMD] Logged out. Clearing session, restart to pair again.");
        if (backend) await backend.clear().catch(() => {});
        else fs.rmSync(path.join(config.dataDir, "session"), { recursive: true, force: true });
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

setupStorage()
  .then(start)
  .catch((e) => {
    console.error("Startup failed:", e);
    process.exit(1);
  });
