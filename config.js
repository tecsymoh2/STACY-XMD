require("dotenv").config();
const path = require("path");

module.exports = {
  // Where the login session and settings are stored. Point this at a persistent disk when deploying.
  dataDir: process.env.DATA_DIR || __dirname,
  botName: "STACY XMD",
  prefix: process.env.PREFIX || ".",
  ownerNumber: (process.env.OWNER_NUMBER || "").replace(/\D/g, ""),
  pairingNumber: (process.env.PAIRING_NUMBER || "").replace(/\D/g, ""),
  groqKey: process.env.GROQ_API_KEY || "",
  groqModel: "llama-3.3-70b-versatile",
};
