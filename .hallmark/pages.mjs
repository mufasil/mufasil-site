import puppeteer from "puppeteer-core";
const [base, dir, ...routes] = process.argv.slice(2);
const b = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
const p = await b.newPage();
await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
for (const r of routes) {
  await p.goto(base + r, { waitUntil: "networkidle0" });
  await p.evaluate(() => document.querySelectorAll("[data-reveal]").forEach((e) => e.classList.add("is-in")));
  await new Promise((res) => setTimeout(res, 700));
  const name = (r.replace(/\//g, "_") || "_home").replace(/^_|_$/g, "") || "home";
  const h = await p.evaluate(() => document.documentElement.scrollHeight);
  // Full page, in slices of 1800px so each stays readable.
  for (let y = 0, i = 0; y < h && i < 4; y += 1800, i++) {
    await p.screenshot({ path: `${dir}/${name}-${i}.png`, clip: { x: 0, y, width: 1440, height: Math.min(1800, h - y) }, captureBeyondViewport: true });
  }
  console.log(name, h);
}
await b.close();
