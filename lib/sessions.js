const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs");
const path = require("path");
const config = require("../config");
const neon = require("./neonAuth");
const { handleMessage } = require("./handler");

const PAIR_TIMEOUT_MS = 3 * 60 * 1000;
const sessions = new Map(); // number -> entry
let pool = null;

const localDir = (id) => path.join(config.dataDir, "sessions", id);
const backendFor = (id) => neon.createBackend(pool, `${config.authPrefix}:${id}`);

function configure(p) {
  pool = p;
}

function getAuth(id) {
  return pool ? backendFor(id).useAuthState() : useMultiFileAuthState(localDir(id));
}

async function clearAuth(id) {
  try {
    if (pool) await backendFor(id).clear();
    else fs.rmSync(localDir(id), { recursive: true, force: true });
  } catch (e) {
    console.error(`[session ${id}] clear failed:`, e.message);
  }
}

async function listLinked() {
  if (pool) return neon.listLinked(pool, config.authPrefix);
  const root = path.join(config.dataDir, "sessions");
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root).filter((id) => {
    try {
      const c = JSON.parse(fs.readFileSync(path.join(root, id, "creds.json"), "utf8"));
      return /^\d+$/.test(id) && c.registered === true;
    } catch {
      return false;
    }
  });
}

async function connect(entry) {
  if (entry.stopped) return;
  const { id } = entry;
  const { state, saveCreds } = await getAuth(id);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: "silent" }),
    browser: ["STACY XMD", "Chrome", "1.0.0"],
    printQRInTerminal: false,
  });
  entry.sock = sock;

  // Ask for a pairing code once, on the first connection of an unlinked session
  if (!sock.authState.creds.registered && entry.codePromise && !entry.codeRequested) {
    entry.codeRequested = true;
    setTimeout(async () => {
      try {
        const code = await sock.requestPairingCode(id);
        entry.code = code;
        console.log(`[STACY XMD] Pairing code for ${id}: ${code}`);
        entry.resolveCode(code);
      } catch (e) {
        entry.rejectCode(e);
      }
    }, 3000);
  }

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
    if (entry.stopped) return;
    if (connection === "open") {
      entry.status = "linked";
      clearTimeout(entry.timer);
      console.log(`[STACY XMD] ${id} connected.`);
    }
    if (connection === "close") {
      const code = lastDisconnect?.error?.output?.statusCode;
      if (code === DisconnectReason.loggedOut) {
        console.log(`[STACY XMD] ${id} logged out. Removing login.`);
        await stopSession(id, { clear: true });
        return;
      }
      entry.status = "connecting";
      setTimeout(
        () => connect(entry).catch((e) => console.error(`[session ${id}]`, e.message)),
        2000
      );
    }
  });

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;
    for (const m of messages) {
      if (!m.message) continue;
      await handleMessage(sock, m, { sessionId: id, ownerNumber: id });
    }
  });
}

function startSession(id, { pairing = false, timeout = true } = {}) {
  const existing = sessions.get(id);
  if (existing) return existing;

  const entry = {
    id,
    sock: null,
    status: "connecting",
    code: null,
    stopped: false,
    timer: null,
    codeRequested: false,
  };
  if (pairing) {
    entry.codePromise = new Promise((resolve, reject) => {
      entry.resolveCode = resolve;
      entry.rejectCode = reject;
    });
    entry.codePromise.catch(() => {});
    if (timeout) {
      entry.timer = setTimeout(() => stopSession(id, { clear: true }), PAIR_TIMEOUT_MS);
    }
  }
  sessions.set(id, entry);
  connect(entry).catch((e) => {
    console.error(`[session ${id}] failed to start:`, e.message);
    entry.rejectCode?.(e);
  });
  return entry;
}

async function stopSession(id, { clear = false } = {}) {
  const entry = sessions.get(id);
  if (entry) {
    entry.stopped = true;
    clearTimeout(entry.timer);
    entry.rejectCode?.(new Error("stopped"));
    try {
      entry.sock?.end(undefined);
    } catch {}
    sessions.delete(id);
  }
  if (clear) await clearAuth(id);
}

// Start a pairing and return the code to show the person
async function pair(id) {
  const existing = sessions.get(id);
  if (existing?.status === "linked") return { status: "linked" };

  if ((await listLinked()).includes(id)) {
    startSession(id);
    return { status: "linked" };
  }

  if (existing) await stopSession(id, { clear: true });
  else await clearAuth(id); // drop leftovers from an unfinished attempt

  if (sessions.size >= config.maxSessions) throw new Error("FULL");

  const entry = startSession(id, { pairing: true });
  const code = await Promise.race([
    entry.codePromise,
    new Promise((_, rej) => setTimeout(() => rej(new Error("TIMEOUT")), 25000)),
  ]);
  return { status: "pending", code };
}

function status(id) {
  const e = sessions.get(id);
  if (!e) return "none";
  return e.status === "linked" ? "linked" : "pending";
}

async function unlink(id) {
  const e = sessions.get(id);
  if (e?.sock && e.status === "linked") {
    try {
      await e.sock.logout();
    } catch {}
  }
  await stopSession(id, { clear: true });
}

module.exports = {
  configure,
  listLinked,
  startSession,
  stopSession,
  pair,
  status,
  unlink,
  has: (id) => sessions.has(id),
};
