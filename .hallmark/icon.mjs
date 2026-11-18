import puppeteer from "puppeteer-core";
import { readFileSync } from "node:fs";
const svg = readFileSync("public/favicon.svg", "utf8");
const b = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
const p = await b.newPage();
await p.setViewport({ width: 180, height: 180 });
await p.setContent(`<html><body style="margin:0;background:#0a1230">${svg.replace("<svg ", '<svg width="180" height="180" ')}</body></html>`);
await p.screenshot({ path: "public/apple-touch-icon.png" });
await b.close();
