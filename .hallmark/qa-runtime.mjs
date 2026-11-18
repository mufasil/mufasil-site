import puppeteer from "puppeteer-core";
import { readFileSync } from "node:fs";
const [base, routesFile] = process.argv.slice(2);
const routes = [...readFileSync(routesFile, "utf8").trim().split("\n"), "/does-not-exist/", "/contact/?type=contract"];
const sizes = [[1440, 900, false], [390, 844, true], [320, 640, true], [768, 1024, true], [1920, 1080, false]];
const b = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
const out = [];
for (const [w, h, mobile] of sizes) {
  const p = await b.newPage();
  await p.setViewport({ width: w, height: h, isMobile: mobile, hasTouch: mobile });
  const errs = []; const fails = [];
  p.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") errs.push(m.text()); });
  p.on("pageerror", (e) => errs.push("PAGEERROR " + e.message));
  p.on("response", (r) => { if (r.status() >= 400 && !r.url().includes("does-not-exist")) fails.push(`${r.status()} ${r.url()}`); });
  p.on("requestfailed", (r) => fails.push(`FAILED ${r.url()} ${r.failure()?.errorText}`));
  const list = w === 1440 || w === 390 ? routes : routes.filter((r, i) => i % 3 === 0 || r.includes("services/"));
  for (const r of list) {
    errs.length = 0; fails.length = 0;
    const resp = await p.goto(base + r, { waitUntil: "networkidle0" });
    await p.evaluate(async () => {
      document.querySelectorAll("[data-reveal]").forEach((e) => e.classList.add("is-in"));
      // scroll through so lazy images load
      for (let y = 0; y < document.body.scrollHeight; y += 800) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 20)); }
      window.scrollTo(0, 0);
    });
    await new Promise((res) => setTimeout(res, 300));
    const info = await p.evaluate(() => {
      const vw = document.documentElement.clientWidth;
      const overflow = document.documentElement.scrollWidth - vw;
      const badImgs = [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src);
      // text that spills out of its own box horizontally (clipped words)
      const clipped = [...document.querySelectorAll("main h1, main h2, main h3, main p, main a, main b, main li")].filter((el) => {
        const cs = getComputedStyle(el);
        return el.scrollWidth > el.clientWidth + 2 && cs.overflowX !== "visible" && cs.display !== "inline";
      }).map((el) => el.tagName + ":" + el.textContent.trim().slice(0, 40));
      // things wider than the viewport that are not inside an overflow container
      const wide = [...document.querySelectorAll("main *")].filter((el) => {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.right <= vw + 1) return false;
        for (let a = el.parentElement; a; a = a.parentElement) { const o = getComputedStyle(a).overflowX; if (o === "hidden" || o === "auto" || o === "clip" || o === "scroll") return false; }
        return true;
      }).slice(0, 3).map((el) => el.className.toString().slice(0, 40) || el.tagName);
      const tinyTap = [...document.querySelectorAll("a, button, summary, input, label")].filter((el) => {
        const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && (r.height < 24 || r.width < 24) && getComputedStyle(el).display !== "inline";
      }).length;
      return { overflow, badImgs, clipped: clipped.slice(0, 3), wide, tinyTap };
    });
    const status = resp?.status();
    const problems = [];
    if (r === "/does-not-exist/" ? status !== 404 : status !== 200) problems.push(`status ${status}`);
    if (info.overflow > 0) problems.push(`h-overflow ${info.overflow}px`);
    if (info.wide.length) problems.push(`wider than screen: ${info.wide.join(", ")}`);
    if (info.badImgs.length) problems.push(`broken img ${info.badImgs.join(" ")}`);
    if (info.clipped.length) problems.push(`clipped text ${info.clipped.join(" | ")}`);
    if (errs.length) problems.push(`console: ${[...new Set(errs)].join(" | ").slice(0, 200)}`);
    if (fails.length) problems.push(`requests: ${[...new Set(fails)].join(" | ").slice(0, 200)}`);
    if (problems.length) out.push(`${w}px ${r}  ${problems.join("  ;  ")}`);
  }
  await p.close();
  out.push(`-- ${w}px checked ${list.length} pages`);
}
await b.close();
console.log(out.join("\n"));
