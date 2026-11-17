const config = require("./config");
const store = require("./lib/store");
const sessions = require("./lib/sessions");
const web = require("./lib/web");
const { loadCommands } = require("./lib/handler");

loadCommands();
web.start(process.env.PORT || 3000);

async function main() {
  let pool = null;
  if (config.databaseUrl) {
    const neon = require("./lib/neonAuth");
    pool = neon.createPool(config.databaseUrl);
    await neon.initTable(pool);
    await store.init(neon.createBackend(pool, config.authPrefix).settings);
    console.log("[STACY XMD] Storage: Neon Postgres");
  } else {
    console.log("[STACY XMD] Storage: local files");
  }
  sessions.configure(pool);

  // Bring back every number that was linked before
  const linked = await sessions.listLinked();
  for (const id of linked) {
    console.log(`[STACY XMD] Starting session ${id}`);
    sessions.startSession(id);
  }

  // Optional: pair one number from the logs (the pairing website is easier)
  if (config.pairingNumber && !linked.includes(config.pairingNumber)) {
    const entry = sessions.startSession(config.pairingNumber, { pairing: true, timeout: false });
    entry.codePromise
      .then((code) => {
        console.log(`\n[STACY XMD] Pairing code: ${code}`);
        console.log("WhatsApp > Linked Devices > Link with phone number\n");
      })
      .catch((e) => console.error("Could not get pairing code:", e.message));
  }

  if (!linked.length && !config.pairingNumber) {
    console.log("[STACY XMD] No linked numbers yet. Open the web page and pair one.");
  }
  if (!config.pairPassword) {
    console.log("[STACY XMD] PAIR_PASSWORD is not set, so the pairing page is disabled.");
  }
}

main().catch((e) => {
  console.error("Startup failed:", e);
  process.exit(1);
});
