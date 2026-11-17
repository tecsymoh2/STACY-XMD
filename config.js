require("dotenv").config();

module.exports = {
  botName: "STACY XMD",
  prefix: process.env.PREFIX || ".",
  ownerNumber: (process.env.OWNER_NUMBER || "").replace(/\D/g, ""),
  // Optional: pair this number from the logs at startup (the pairing website is easier)
  pairingNumber: (process.env.PAIRING_NUMBER || "").replace(/\D/g, ""),
  groqKey: process.env.GROQ_API_KEY || "",
  groqModel: "llama-3.3-70b-versatile",

  // Local storage folder (used when no database is configured)
  dataDir: process.env.DATA_DIR || __dirname,

  // Optional: store WhatsApp logins + settings in Postgres (Neon) so hosts without a disk can restart safely
  databaseUrl: process.env.DATABASE_URL || "",
  authPrefix: process.env.AUTH_PREFIX || "stacy",

  // Pairing website: people who know this password can link their number to the bot
  pairPassword: process.env.PAIR_PASSWORD || "",
  maxSessions: parseInt(process.env.MAX_SESSIONS || "20", 10),
};
