const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "..", "data", "settings.json");
fs.mkdirSync(path.dirname(FILE), { recursive: true });

let data = {};
try {
  data = JSON.parse(fs.readFileSync(FILE, "utf8"));
} catch {}

function save() {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

module.exports = {
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
