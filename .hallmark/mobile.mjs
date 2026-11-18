import puppeteer from "puppeteer-core";
const [base, dir, ...routes] = process.argv.slice(2);
const b = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
const p = await b.newPage();
await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
for (const r of routes) {
  await p.goto(base + r, { waitUntil: "networkidle0" });
  await p.evaluate(() => document.querySelectorAll("[data-reveal]").forEach((e) => e.classList.add("is-in")));
  await new Promise((res) => setTimeout(res, 600));
  const name = r.replace(/\//g, "") || "home";
  const over = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  await p.screenshot({ path: `${dir}/m-${name}.png`, clip: { x: 0, y: 0, width: 390, height: 2400 }, captureBeyondViewport: true });
  console.log(name, "horizontal overflow px:", over);
}
await b.close();
