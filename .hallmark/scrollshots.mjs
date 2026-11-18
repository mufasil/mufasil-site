import puppeteer from "puppeteer-core";
import fs from "node:fs";
const [url, out, steps = "14"] = process.argv.slice(2);
const b = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true, args: ["--use-angle=metal", "--ignore-gpu-blocklist"] });
const p = await b.newPage();
await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await p.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36");
await p.goto(url, { waitUntil: "networkidle2", timeout: 45000 }).catch(() => {});
await new Promise((r) => setTimeout(r, 5000));
const total = await p.evaluate(() => document.documentElement.scrollHeight);
console.log("height", total);
for (let i = 0; i < +steps; i++) {
  await p.evaluate((y) => window.scrollTo(0, y), i * 850);
  await p.mouse.wheel({ deltaY: 1 });
  await new Promise((r) => setTimeout(r, 1800));
  await p.screenshot({ path: `${out}/s${String(i).padStart(2, "0")}.jpg`, type: "jpeg", quality: 70 });
}
const text = await p.evaluate(() => document.body.innerText);
fs.writeFileSync(`${out}/text.txt`, text);
await b.close();
console.log("done");
