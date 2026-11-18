// Fills in the real contact page and sends it; /api/contact is forwarded to the local service.
import puppeteer from "puppeteer-core";
const b = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
const p = await b.newPage();
await p.setRequestInterception(true);
p.on("request", async (r) => {
  if (!r.url().includes("/api/contact")) return r.continue();
  const res = await fetch("http://127.0.0.1:8787/api/contact", { method: r.method(), headers: { ...r.headers(), origin: "https://mufasil.site", "x-forwarded-for": "3.3.3.3" }, body: r.postData() });
  r.respond({ status: res.status, contentType: "application/json", body: await res.text() });
});
await p.goto("http://127.0.0.1:4322/contact/?type=consulting", { waitUntil: "networkidle0" });
await p.type("#name", "Browser Test");
await p.type("#email", "browser@example.com");
await p.type("#message", "Sent from the real contact page in a headless browser.");
await p.type("#link", "https://example.com/repo");
await p.click("#contact-form button[type=submit]");
await new Promise((r) => setTimeout(r, 1200));
console.log("message shown:", await p.$eval("#form-help", (e) => e.textContent));
console.log("form cleared:", await p.$eval("#name", (e) => e.value === ""));
await b.close();
