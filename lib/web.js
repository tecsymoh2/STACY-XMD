const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const config = require("../config");
const sessions = require("./sessions");

const page = fs.readFileSync(path.join(__dirname, "..", "public", "index.html"));
const fails = new Map(); // ip -> { count, reset }

const clientIp = (req) =>
  (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").split(",")[0].trim();

function blocked(ip) {
  const f = fails.get(ip);
  return !!f && f.reset > Date.now() && f.count >= 5;
}

function recordFail(ip) {
  const f = fails.get(ip);
  if (!f || f.reset <= Date.now()) fails.set(ip, { count: 1, reset: Date.now() + 10 * 60 * 1000 });
  else f.count++;
}

function passwordOk(input) {
  if (!config.pairPassword) return false;
  const a = crypto.createHash("sha256").update(String(input || "")).digest();
  const b = crypto.createHash("sha256").update(config.pairPassword).digest();
  return crypto.timingSafeEqual(a, b);
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (c) => {
      data += c;
      if (data.length > 2000) {
        reject(new Error("too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(data || "{}"));
      } catch {
        reject(new Error("bad json"));
      }
    });
  });
}

function send(res, code, obj) {
  res.writeHead(code, { "Content-Type": "application/json", "Cache-Control": "no-store" });
  res.end(JSON.stringify(obj));
}

async function handle(req, res) {
  if (req.method === "GET" && (req.url === "/" || req.url.startsWith("/?"))) {
    res.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Frame-Options": "DENY",
    });
    return res.end(page);
  }
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    return res.end(`${config.botName} is running`);
  }

  if (req.method === "POST" && req.url.startsWith("/api/")) {
    if (!config.pairPassword) {
      return send(res, 503, { error: "Pairing is disabled. Set PAIR_PASSWORD on the server." });
    }
    const ip = clientIp(req);
    if (blocked(ip)) return send(res, 429, { error: "Too many wrong attempts. Try again later." });

    const body = await readJson(req).catch(() => null);
    if (!body) return send(res, 400, { error: "Bad request." });
    if (!passwordOk(body.password)) {
      recordFail(ip);
      return send(res, 401, { error: "Wrong access password." });
    }

    const number = String(body.number || "").replace(/\D/g, "");
    if (number.length < 8 || number.length > 15) {
      return send(res, 400, { error: "Enter your number with country code, digits only." });
    }

    if (req.url === "/api/pair") {
      try {
        const mode = body.mode === "qr" ? "qr" : "code";
        return send(res, 200, await sessions.pair(number, mode));
      } catch (e) {
        if (e.message === "FULL") return send(res, 503, { error: "The bot is full right now." });
        console.error("[pair]", e.message);
        return send(res, 500, { error: "Could not get a code. Check the number and try again." });
      }
    }
    if (req.url === "/api/status") return send(res, 200, await sessions.info(number));
    if (req.url === "/api/unlink") {
      await sessions.unlink(number);
      return send(res, 200, { status: "none" });
    }
  }

  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not found");
}

function start(port) {
  http
    .createServer((req, res) =>
      handle(req, res).catch((e) => {
        console.error("[web]", e);
        try {
          send(res, 500, { error: "Server error." });
        } catch {}
      })
    )
    .listen(port, () => console.log(`[STACY XMD] Web listening on ${port}`));
}

module.exports = { start };
