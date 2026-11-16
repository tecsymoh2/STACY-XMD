const fs = require("fs");
const path = require("path");
const config = require("../config");

const FILE = path.join(config.dataDir, "data", "settings.json");
fs.mkdirSync(path.dirname(FILE), { recursive: true });

let data = {};
let remote = null;
try {
  data = JSON.parse(fs.readFileSync(FILE, "utf8"));
} catch {}

function save() {
  if (remote) {
    remote.save(data).catch((e) => console.error("[store] save failed:", e.message));
  } else {
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
  }
}

module.exports = {
  // Switch to remote storage (Neon Postgres) and load saved settings
  async init(r) {
    remote = r;
    const saved = await r.load();
    if (saved) data = saved;
  },
  get(key, def) {
    return data[key] === undefined ? def : data[key];
  },
  set(key, value) {
    data[key] = value;
    save();
  },
  has(section, id) {
    return !!(data[section] && data[section][id]);
  },
  toggle(section, id, on) {
    data[section] = data[section] || {};
    if (on) data[section][id] = true;
    else delete data[section][id];
    save();
  },
};
