require("dotenv").config();

module.exports = {
  botName: "STACY XMD",
  prefix: process.env.PREFIX || ".",
  ownerNumber: (process.env.OWNER_NUMBER || "").replace(/\D/g, ""),
  pairingNumber: (process.env.PAIRING_NUMBER || "").replace(/\D/g, ""),
  groqKey: process.env.GROQ_API_KEY || "",
  groqModel: "llama-3.3-70b-versatile",
};
