// Share images for every page in the sitemap, rendered from the built pages.
// Run after a build with the preview server up:  node .hallmark/og.mjs http://127.0.0.1:4322
// Then build again so the images land in dist.
import puppeteer from "puppeteer-core";
import { readFileSync, mkdirSync } from "node:fs";

const base = process.argv[2] || "http://127.0.0.1:4322";
const b64 = (p) => readFileSync(p).toString("base64");
const inter = b64("node_modules/@fontsource-variable/inter/files/inter-latin-opsz-normal.woff2");
const serif = b64("node_modules/@fontsource/instrument-serif/files/instrument-serif-latin-400-italic.woff2");
const photo = b64("src/assets/mufasil-cutout.png");
const logo = readFileSync("public/logo.svg", "utf8").replace("<svg ", '<svg height="30" ');
const sitemap = readFileSync("dist/sitemap-0.xml", "utf8");
const routes = [...sitemap.matchAll(/<loc>https:\/\/mufasil\.site([^<]*)<\/loc>/g)].map((m) => m[1]);

mkdirSync("public/og", { recursive: true });
const browser = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
const reader = await browser.newPage();
const painter = await browser.newPage();
await painter.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
for (const route of routes) {
  await reader.goto(base + route, { waitUntil: "domcontentloaded" });
  const info = await reader.evaluate(() => {
    const h1 = document.querySelector("main h1");
    const em = h1?.querySelector("em")?.textContent ?? "";
    const crumbs = [...document.querySelectorAll(".crumbs li")].map((li) => li.textContent.trim());
    return {
      title: h1?.textContent.replace(/\s+/g, " ").trim() ?? document.title,
      em,
      kicker: document.querySelector(".phero .kicker")?.textContent.trim() ?? "",
      crumbs,
      metric: document.querySelector(".metric b")?.textContent.trim() ?? "",
      metricLabel: document.querySelector(".metric span")?.textContent.trim() ?? "",
      tone: [...(document.querySelector(".metric")?.classList ?? [])].find((c) => c.startsWith("metric--"))?.slice(8) ?? "",
      tags: [...document.querySelectorAll(".phero .tags li")].slice(0, 4).map((li) => li.textContent.trim()),
      serviceIcon: document.querySelector(".svc-card .glossy")?.innerHTML ?? "",
      serviceGroup: document.querySelector(".svc-card__top small")?.textContent.trim() ?? "",
    };
  });
  const isHome = route === "/";
  const withPhoto = isHome || route === "/about/";
  const section = route.startsWith("/services/") && route !== "/services/" ? "Service" : route.startsWith("/work/") && route !== "/work/" ? "Case study" : route.startsWith("/blog/") && route !== "/blog/" ? "Writing" : isHome ? "Open to remote roles" : info.kicker || "Mufasil Iqbal";
  const title = isHome ? "Backend engineer and tech lead helping products ship and scale" : info.title;
  const em = isHome ? "ship and scale" : info.em;
  let html = esc(title);
  if (em && title.includes(em)) html = esc(title).replace(esc(em), `<em>${esc(em)}</em>`);
  const size = title.length < 34 ? 84 : title.length < 56 ? 70 : title.length < 76 ? 58 : 50;
  const tones = { sky: "linear-gradient(135deg,#e6efff,#cfe0ff)", peach: "linear-gradient(135deg,#fff3ea,#ffe2d1)", mint: "linear-gradient(135deg,#effbf5,#d4f4e6)" };
  const right = withPhoto
    ? `<div class="fig"><div class="orb"></div><img src="data:image/png;base64,${photo}"></div>`
    : info.metric
      ? `<div class="metric" style="background:${tones[info.tone] || tones.sky}"><b>${esc(info.metric)}</b><span>${esc(info.metricLabel)}</span></div>`
      : info.serviceIcon
        ? `<div class="icon">${info.serviceIcon}</div>`
        : "";
  const tags = info.tags.length && !right ? `<div class="tags">${info.tags.map((t) => `<span>${esc(t)}</span>`).join("")}</div>` : "";
  await painter.setContent(`<!doctype html><html><head><style>
    @font-face { font-family: Inter; src: url(data:font/woff2;base64,${inter}) format("woff2"); font-weight: 100 900; }
    @font-face { font-family: Serif; src: url(data:font/woff2;base64,${serif}) format("woff2"); font-style: italic; }
    * { box-sizing: border-box; margin: 0; }
    body { width: 1200px; height: 630px; overflow: hidden; font-family: Inter; color: #0a1230;
      background: radial-gradient(60% 80% at 80% 10%, #cfe0ff 0%, transparent 70%), radial-gradient(70% 90% at 0% 100%, #e6efff 0%, transparent 70%), #f6f8fc; }
    body::before { content: ""; position: absolute; inset: 0; background-image: radial-gradient(circle, rgba(47,85,255,.18) 1.2px, transparent 1.8px); background-size: 28px 28px; -webkit-mask-image: linear-gradient(90deg, transparent, #000 60%); }
    .frame { position: absolute; inset: 0; display: grid; grid-template-rows: auto 1fr auto; padding: 56px 64px; }
    .top { display: flex; align-items: center; justify-content: space-between; }
    .brand { display: flex; align-items: center; gap: 14px; font-weight: 600; font-size: 22px; letter-spacing: .06em; }
    .pill { padding: 10px 20px; border-radius: 999px; background: #0a1230; color: #fff; font-size: 20px; font-weight: 500; }
    .main { display: flex; align-items: center; gap: 40px; }
    .copy { flex: 1; display: grid; gap: 22px; }
    h1 { font-size: ${size}px; line-height: 1.02; letter-spacing: -0.045em; font-weight: 600; max-width: ${right ? 720 : 1000}px; }
    h1 em { font-family: Serif; font-weight: 400; color: #2f55ff; letter-spacing: -0.01em; }
    .tags { display: flex; gap: 10px; flex-wrap: wrap; }
    .tags span { padding: 8px 16px; border-radius: 999px; background: #fff; border: 1px solid #e2e8f3; font-size: 20px; color: #3a4566; font-weight: 500; }
    .foot { display: flex; justify-content: space-between; align-items: center; padding-top: 22px; border-top: 2px solid #e2e8f3; font-size: 22px; color: #3a4566; }
    .foot b { color: #0a1230; }
    .fig { position: relative; width: 330px; height: 360px; flex-shrink: 0; }
    .orb { position: absolute; left: 22px; bottom: 0; width: 286px; height: 286px; border-radius: 50%; background: radial-gradient(circle at 35% 30%, #fff 0%, #c9dbff 22%, #7da2ff 52%, #2f55ff 78%, #1c3be0 100%); box-shadow: 0 30px 60px -20px rgba(47,85,255,.5); }
    .fig img { position: absolute; left: 0; bottom: 0; width: 330px; -webkit-mask-image: linear-gradient(#000,#000), radial-gradient(circle 143px at 50% calc(100% - 143px), #000 99%, transparent 100%); -webkit-mask-size: 100% calc(100% - 143px), 100% 100%; -webkit-mask-repeat: no-repeat; }
    .metric { flex-shrink: 0; width: 340px; display: grid; gap: 14px; padding: 40px 36px; border-radius: 32px; box-shadow: 0 30px 60px -30px rgba(10,18,48,.35); }
    .metric b { font-family: Serif; font-weight: 400; font-size: 130px; line-height: .85; }
    .metric span { font-size: 22px; color: #3a4566; line-height: 1.35; }
    .icon { flex-shrink: 0; display: grid; place-items: center; width: 220px; height: 220px; border-radius: 56px; color: #fff; background: linear-gradient(150deg,#7b97ff 0%,#2f55ff 52%,#1c3be0 100%); box-shadow: inset 0 2px 0 rgba(255,255,255,.4), 0 40px 70px -30px rgba(47,85,255,.7); }
    .icon svg { width: 110px; height: 110px; stroke-width: 1.5; }
  </style></head><body><div class="frame">
    <div class="top"><div class="brand">${logo}MUFASIL IQBAL</div><div class="pill">${esc(info.serviceGroup ? `${section}` : section)}</div></div>
    <div class="main"><div class="copy"><h1>${html}</h1>${tags}</div>${right}</div>
    <div class="foot"><span><b>mufasil.site</b></span><span>Senior backend engineer and tech lead, Node.js and AWS</span></div>
  </div></body></html>`, { waitUntil: "load" });
  await painter.evaluate(() => document.fonts.ready);
  const name = route.replace(/^\/|\/$/g, "").replace(/\//g, "-") || "home";
  await painter.screenshot({ path: `public/og/${name}.png` });
  console.log("og", name);
}
await browser.close();
