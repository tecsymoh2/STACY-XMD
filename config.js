require("dotenv").config();

module.exports = {
  botName: "STACY XMD",
  prefix: process.env.PREFIX || ".",
  ownerNumber: (process.env.OWNER_NUMBER || "").replace(/\D/g, ""),
  pairingNumber: (process.env.PAIRING_NUMBER || "").replace(/\D/g, ""),
  groqKey: process.env.GROQ_API_KEY || "",
  groqModel: "llama-3.3-70b-versatile",

  // Local storage folder (used when no database is configured)
  dataDir: process.env.DATA_DIR || __dirname,

  // Optional: store the WhatsApp login + settings in a Postgres database (Neon) so hosts
  // without a disk can restart safely
  databaseUrl: process.env.DATABASE_URL || "",
  authPrefix: process.env.AUTH_PREFIX || "stacy",
};
