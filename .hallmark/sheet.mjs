import puppeteer from "puppeteer-core";
const [file, out] = process.argv.slice(2);
const b = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
const p = await b.newPage();
await p.setViewport({ width: 1596, height: 2400 });
await p.goto("file://" + file);
await p.screenshot({ path: out });
await b.close();
