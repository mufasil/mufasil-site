import puppeteer from "puppeteer-core";
const [url, out] = process.argv.slice(2);
const b = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
const p = await b.newPage();
await p.goto(url, { waitUntil: "networkidle0" });
await p.emulateMediaType("print");
await p.pdf({ path: out, format: "A4", printBackground: false, preferCSSPageSize: true });
await b.close();
console.log("pdf ok");
