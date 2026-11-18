import puppeteer from "puppeteer-core";
const out = process.argv[2];
const sites = process.argv.slice(3);
const b = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true, args: ["--use-angle=metal", "--enable-webgl", "--ignore-gpu-blocklist"] });
for (const url of sites) {
  const name = new URL(url).hostname.replace(/^www\./, "");
  const p = await b.newPage();
  try {
    await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
    await p.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36");
    await p.goto(url, { waitUntil: "domcontentloaded", timeout: 25000 });
    await new Promise((r) => setTimeout(r, 6500));
    await p.screenshot({ path: `${out}/${name}.jpg`, type: "jpeg", quality: 72 });
    console.log("ok", name);
  } catch (e) {
    console.log("fail", name, String(e).slice(0, 80));
  } finally {
    await p.close();
  }
}
await b.close();
