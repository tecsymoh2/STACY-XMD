const { initAuthCreds, proto, BufferJSON } = require("@whiskeysockets/baileys");
const { Pool } = require("pg");

const TABLE = "stacy_wa_auth";
const toJson = (v) => JSON.stringify(v, BufferJSON.replacer);
const fromJson = (v) => JSON.parse(JSON.stringify(v), BufferJSON.reviver);

function createPool(connectionString) {
  const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false }, max: 4 });
  pool.on("error", (e) => console.error("[neon] pool error:", e.message));
  return pool;
}

async function initTable(pool) {
  await pool.query(
    `create table if not exists ${TABLE} (id text primary key, value jsonb not null)`
  );
}

// Numbers of every session whose login is complete
async function listLinked(pool, prefix) {
  const { rows } = await pool.query(
    `select id from ${TABLE}
     where id like $1 and id like '%:creds' and value->>'registered' = 'true'`,
    [`${prefix}:%`]
  );
  const tail = ":creds".length;
  return rows
    .map((r) => r.id.slice(prefix.length + 1, r.id.length - tail))
    .filter((id) => /^\d+$/.test(id));
}

function createBackend(pool, prefix) {
  const k = (name) => `${prefix}:${name}`;

  async function readMany(names) {
    const { rows } = await pool.query(
      `select id, value from ${TABLE} where id = any($1::text[])`,
      [names.map(k)]
    );
    const map = new Map();
    for (const row of rows) map.set(row.id, fromJson(row.value));
    return map;
  }

  async function writeMany(entries) {
    if (!entries.length) return;
    await pool.query(
      `insert into ${TABLE} (id, value)
       select t.i, t.v::jsonb from unnest($1::text[], $2::text[]) as t(i, v)
       on conflict (id) do update set value = excluded.value`,
      [entries.map(([n]) => k(n)), entries.map(([, v]) => toJson(v))]
    );
  }

  async function removeMany(names) {
    if (!names.length) return;
    await pool.query(`delete from ${TABLE} where id = any($1::text[])`, [names.map(k)]);
  }

  async function useAuthState() {
    const saved = await readMany(["creds"]);
    const creds = saved.get(k("creds")) || initAuthCreds();

    return {
      state: {
        creds,
        keys: {
          get: async (type, ids) => {
            const out = {};
            if (!ids.length) return out;
            const map = await readMany(ids.map((id) => `${type}-${id}`));
            for (const id of ids) {
              let v = map.get(k(`${type}-${id}`)) || null;
              if (type === "app-state-sync-key" && v) {
                v = proto.Message.AppStateSyncKeyData.fromObject(v);
              }
              out[id] = v;
            }
            return out;
          },
          set: async (data) => {
            const writes = [];
            const deletes = [];
            for (const category in data) {
              for (const id in data[category]) {
                const value = data[category][id];
                const name = `${category}-${id}`;
                if (value) writes.push([name, value]);
                else deletes.push(name);
              }
            }
            await writeMany(writes);
            await removeMany(deletes);
          },
        },
      },
      saveCreds: () => writeMany([["creds", creds]]),
    };
  }

  // Delete this login (used on logout/unlink)
  async function clear() {
    await pool.query(`delete from ${TABLE} where id like $1`, [`${prefix}:%`]);
  }

  const settings = {
    async load() {
      const m = await readMany(["settings"]);
      return m.get(k("settings")) || null;
    },
    async save(data) {
      await writeMany([["settings", data]]);
    },
  };

  return { useAuthState, clear, settings };
}

module.exports = { createPool, initTable, listLinked, createBackend };
