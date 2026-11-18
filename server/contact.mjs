// Contact form endpoint for mufasil.site.
// Receives the form as JSON, checks it, and emails it to Mufasil through Brevo's SMTP relay.
// The SMTP key lives only in server/.env on the server. It is never sent to the browser.
//
// Run:   node --env-file=.env contact.mjs
// nginx proxies POST /api/contact to 127.0.0.1:${PORT}.

import http from "node:http";
import nodemailer from "nodemailer";

const env = process.env;
const PORT = Number(env.PORT || 8787);
const HOST = env.HOST || "127.0.0.1"; // only nginx on the same machine should reach this
const MAIL_TO = env.MAIL_TO || "mufasil.official@gmail.com";
const MAIL_FROM = env.MAIL_FROM; // a sender verified in Brevo, ideally on mufasil.site
const DRY_RUN = env.MAIL_DRY_RUN === "1"; // log instead of sending, for local testing
const ALLOWED_ORIGINS = (env.ALLOWED_ORIGINS || "https://mufasil.site,https://www.mufasil.site").split(",").map((s) => s.trim());
const TYPES = ["A full-time role", "A contract", "Consulting or a review", "Something else"];

const missing = ["BREVO_SMTP_LOGIN", "BREVO_SMTP_KEY", "MAIL_FROM"].filter((k) => !env[k]);
if (missing.length && !DRY_RUN) {
  console.error(`Missing in .env: ${missing.join(", ")}. Nothing can be sent until they are set.`);
  process.exit(1);
}

const transport = DRY_RUN
  ? null
  : nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: Number(env.BREVO_SMTP_PORT || 587),
      secure: false, // STARTTLS on 587
      requireTLS: true,
      auth: { user: env.BREVO_SMTP_LOGIN, pass: env.BREVO_SMTP_KEY },
    });

// A few messages per address per window is plenty for a person; anything more is a script.
const WINDOW_MS = 10 * 60 * 1000;
const LIMIT = 5;
const hits = new Map();
const limited = (ip) => {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) for (const [k, v] of hits) if (now - v[v.length - 1] > WINDOW_MS) hits.delete(k);
  return recent.length > LIMIT;
};

const oneLine = (s, max) => String(s ?? "").replace(/[\r\n\t]+/g, " ").trim().slice(0, max);
const isEmail = (s) => /^[^@\s<>"]+@[^@\s<>"]+\.[^@\s<>"]{2,}$/.test(s) && s.length <= 200;
const isUrl = (s) => { try { return ["http:", "https:"].includes(new URL(s).protocol); } catch { return false; } };

function send(res, status, body, origin) {
  const headers = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" };
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Vary"] = "Origin";
  }
  res.writeHead(status, headers);
  res.end(JSON.stringify(body));
}

const server = http.createServer((req, res) => {
  const origin = req.headers.origin;
  const path = (req.url || "").split("?")[0].replace(/\/$/, "");

  if (req.method === "OPTIONS" && path === "/api/contact") {
    if (!ALLOWED_ORIGINS.includes(origin)) return send(res, 403, { ok: false }, null);
    res.writeHead(204, { "Access-Control-Allow-Origin": origin, "Access-Control-Allow-Methods": "POST", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Max-Age": "600", Vary: "Origin" });
    return res.end();
  }
  if (path === "/api/contact/health" && req.method === "GET") return send(res, 200, { ok: true, dryRun: DRY_RUN }, origin);
  if (path !== "/api/contact" || req.method !== "POST") return send(res, 404, { ok: false }, origin);

  // Browsers always send Origin on a cross-site or same-site POST from fetch; reject anything else.
  if (!ALLOWED_ORIGINS.includes(origin)) return send(res, 403, { ok: false, error: "origin" }, null);
  if (!(req.headers["content-type"] || "").includes("application/json")) return send(res, 415, { ok: false }, origin);

  const ip = String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").split(",")[0].trim();
  if (limited(ip)) return send(res, 429, { ok: false, error: "rate" }, origin);

  let size = 0;
  const chunks = [];
  req.on("data", (c) => {
    size += c.length;
    if (size > 20_000) { send(res, 413, { ok: false }, origin); req.destroy(); return; }
    chunks.push(c);
  });
  req.on("end", async () => {
    if (res.writableEnded) return;
    let data;
    try { data = JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch { return send(res, 400, { ok: false, error: "json" }, origin); }

    // Bot trap: a field people never see, with a name autofill doesn't recognise. Bots fill it;
    // pretend it worked so they move on, but log it so a real message can't vanish silently.
    if (data.mi_trap_7) {
      console.warn(`bot trap hit from ${ip}: name="${oneLine(data.name, 60)}" email="${oneLine(data.email, 80)}"`);
      return send(res, 200, { ok: true }, origin);
    }

    const name = oneLine(data.name, 100);
    const email = oneLine(data.email, 200);
    const type = TYPES.includes(data.type) ? data.type : "Something else";
    const message = String(data.message ?? "").trim().slice(0, 5000);
    const link = oneLine(data.link, 500);

    if (!name || !isEmail(email) || message.length < 5 || (link && !isUrl(link))) {
      return send(res, 400, { ok: false, error: "fields" }, origin);
    }

    const text = [
      `${type}, from ${name} <${email}>`,
      "",
      message,
      "",
      `Link: ${link || "none"}`,
      `Sent from the contact form on mufasil.site`,
    ].join("\n");

    if (DRY_RUN) {
      console.log("[dry run] would send:\n" + text);
      return send(res, 200, { ok: true }, origin);
    }
    try {
      await transport.sendMail({
        from: { name: "mufasil.site contact form", address: MAIL_FROM },
        to: MAIL_TO,
        replyTo: { name, address: email }, // hit Reply and it goes to the visitor
        subject: `${type}: ${name}`,
        text,
      });
      send(res, 200, { ok: true }, origin);
    } catch (err) {
      console.error("send failed:", err.code || "", err.responseCode || "", err.message);
      send(res, 502, { ok: false, error: "send" }, origin);
    }
  });
});

server.listen(PORT, HOST, () => console.log(`contact form listening on http://${HOST}:${PORT}/api/contact${DRY_RUN ? " (dry run)" : ""}`));
