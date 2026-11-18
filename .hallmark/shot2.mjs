import puppeteer from "puppeteer-core";
const [url, out, w, h, y = "0"] = process.argv.slice(2);
const b = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
const p = await b.newPage();
await p.setViewport({ width: +w, height: +h, deviceScaleFactor: 1 });
await p.goto(url, { waitUntil: "networkidle0" });
await new Promise((r) => setTimeout(r, 2500));
if (+y) { await p.evaluate((v) => window.scrollTo(0, v), +y); await new Promise((r) => setTimeout(r, 1500)); }
await p.screenshot({ path: out });
await b.close();
