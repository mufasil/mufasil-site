import puppeteer from "puppeteer-core";
const [file, out, w, h] = process.argv.slice(2);
const b = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
const p = await b.newPage();
await p.setViewport({ width: +w, height: +h });
await p.goto("file://" + file);
await p.screenshot({ path: out });
await b.close();
