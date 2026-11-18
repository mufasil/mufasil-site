import puppeteer from "puppeteer-core";
const base = process.argv[2];
const b = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
const ctx = b.defaultBrowserContext();
await ctx.overridePermissions(base, ["clipboard-read", "clipboard-write", "clipboard-sanitized-write"]);
const results = [];
const check = (name, ok, detail = "") => results.push(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  (" + detail + ")" : ""}`);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const p = await b.newPage();
const errors = [];
p.on("pageerror", (e) => errors.push(e.message));
await p.setViewport({ width: 1440, height: 900 });

// 1. Skip link and keyboard into the mega menu
await p.goto(base + "/", { waitUntil: "networkidle0" });
await p.keyboard.press("Tab");
check("first Tab lands on the skip link", await p.evaluate(() => document.activeElement?.classList.contains("skip")));
await p.keyboard.press("Enter"); await wait(300);
check("skip link moves to main content", await p.evaluate(() => location.hash === "#main"));
await p.goto(base + "/", { waitUntil: "networkidle0" });
await p.focus(".mega__toggle"); await p.keyboard.press("Enter"); await wait(300);
const opened = await p.evaluate(() => ({ exp: document.querySelector(".mega__toggle").getAttribute("aria-expanded"), hidden: document.querySelector("#mega-panel").hidden }));
check("Enter opens the services menu", opened.exp === "true" && !opened.hidden, JSON.stringify(opened));
await p.keyboard.press("Tab"); await wait(100);
check("Tab moves into the menu", await p.evaluate(() => !!document.activeElement?.closest("#mega-panel")));
await p.keyboard.press("Escape"); await wait(300);
const closed = await p.evaluate(() => ({ hidden: document.querySelector("#mega-panel").hidden, focus: document.activeElement?.classList.contains("mega__toggle") }));
check("Escape closes the menu and returns focus", closed.hidden && closed.focus, JSON.stringify(closed));
await p.hover(".mega__toggle"); await wait(400);
check("hover opens the menu", await p.evaluate(() => !document.querySelector("#mega-panel").hidden));
const megaLinks = await p.$$eval("#mega-panel a", (as) => as.map((a) => a.getAttribute("href")));
check("menu links all go to service pages", megaLinks.every((h) => h.startsWith("/services/")) && megaLinks.length >= 19, `${megaLinks.length} links`);
check("menu has a link to the services overview", megaLinks.includes("/services/"));
await p.mouse.move(700, 800); await p.mouse.click(700, 850); await wait(500);
check("clicking outside closes the menu", await p.evaluate(() => document.querySelector("#mega-panel").hidden));

// 2. Copy buttons
await p.goto(base + "/about/", { waitUntil: "networkidle0" });
await p.evaluate(() => document.querySelector(".cta [data-copy]").scrollIntoView());
await p.click(".cta [data-copy]"); await wait(200);
const copied = await p.evaluate(async () => ({ label: document.querySelector(".cta [data-copy-label]").textContent, clip: await navigator.clipboard.readText() }));
check("Copy email copies the address", copied.clip === "mufasil.official@gmail.com" && copied.label === "Copied", JSON.stringify(copied));
await wait(2000);
check("Copy label resets", await p.evaluate(() => document.querySelector(".cta [data-copy-label]").textContent) === "Copy email");

// 3. Contact form
await p.goto(base + "/contact/?type=contract", { waitUntil: "networkidle0" });
check("?type=contract preselects A contract", await p.evaluate(() => document.querySelector("#type-contract").checked));
await p.click("#contact-form button[type=submit]"); await wait(200);
const empty = await p.evaluate(() => ({ help: document.querySelector("#form-help").textContent, invalid: document.querySelectorAll("[aria-invalid]").length, focus: document.activeElement?.id }));
check("empty submit shows an error and focuses the first field", empty.invalid > 0 && empty.help.length > 10 && empty.focus === "name", JSON.stringify(empty));
await p.type("#name", "QA Tester"); await p.type("#email", "qa@example"); await p.type("#message", "Testing the form.");
await p.click("#contact-form button[type=submit]"); await wait(200);
const bad = await p.evaluate(() => document.querySelector("#form-help").textContent);
check("bad email gets a specific message", /email address/i.test(bad), bad);
await p.$eval("#email", (e) => (e.value = "")); await p.type("#email", "qa@example.com");
let nav = "";
p.on("request", (r) => { if (r.url().startsWith("mailto:")) nav = r.url(); });
await p.click("#contact-form button[type=submit]"); await wait(400);
const sent = await p.evaluate(() => document.querySelector("#form-help").textContent);
check("valid form falls back to email (no form endpoint yet)", /email app/i.test(sent), sent.slice(0, 70));
const copyContact = await p.$(".contact__item--mail [data-copy]");
await copyContact.click(); await wait(200);
check("contact Copy button keeps its own label", await p.evaluate(() => document.querySelector(".contact__item--mail [data-copy-label]").textContent) === "Copied");
await wait(2000);
check("contact Copy label resets to Copy", await p.evaluate(() => document.querySelector(".contact__item--mail [data-copy-label]").textContent) === "Copy");

// 4. FAQ accordion
await p.goto(base + "/services/", { waitUntil: "networkidle0" });
const faq = await p.evaluate(async () => {
  const items = [...document.querySelectorAll(".faq__item")];
  const before = items.map((d) => d.open);
  items[1].querySelector("summary").click();
  await new Promise((r) => setTimeout(r, 100));
  return { before, after: items.map((d) => d.open) };
});
check("FAQ opens on click", faq.after[1] === true, JSON.stringify(faq));
const svcLinks = await p.$$eval(".directory a", (as) => as.length);
check("services directory lists all 19 services", svcLinks === 19, `${svcLinks}`);

// 5. Home: testimonials, code tabs, counters, clock, tiles
await p.goto(base + "/", { waitUntil: "networkidle0" });
const carousel = await p.evaluate(async () => {
  const box = document.querySelector(".love");
  if (!box) return { ok: false, why: "no carousel" };
  box.scrollIntoView(); await new Promise((r) => setTimeout(r, 400));
  const active = () => [...box.querySelectorAll("[data-slide], .love__slide, blockquote")].findIndex((s) => !s.hidden && s.getAttribute("aria-hidden") !== "true" && getComputedStyle(s).display !== "none" && s.offsetParent !== null);
  const before = active();
  const next = box.querySelector("[data-next], button[aria-label*='ext']");
  next?.click(); await new Promise((r) => setTimeout(r, 700));
  return { ok: !!next, before, after: active() };
});
check("testimonial Next button changes the quote", carousel.ok && carousel.before !== carousel.after, JSON.stringify(carousel));
const tabs = await p.evaluate(async () => {
  const t = [...document.querySelectorAll("[role=tab]")];
  if (t.length < 2) return { ok: false };
  t[1].click(); await new Promise((r) => setTimeout(r, 200));
  return { ok: t[1].getAttribute("aria-selected") === "true", panels: [...document.querySelectorAll("[role=tabpanel]")].map((x) => x.hidden) };
});
check("code window tab switches", tabs.ok, JSON.stringify(tabs));
await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } });
await wait(1800);
const counts = await p.$$eval("[data-count]", (els) => els.map((e) => [e.dataset.count, e.textContent.trim()]));
check("count-up numbers end on the right values", counts.every(([want, got]) => want === got), JSON.stringify(counts.filter(([w, g]) => w !== g)));
check("footer clock shows Karachi time", /^\d\d:\d\d in Karachi/.test(await p.$eval("footer [data-clock]", (e) => e.textContent)));
check("stack tiles render", (await p.$$(".tile")).length === 6);

// 6. Blog code copy
await p.goto(base + "/blog/alb-502-node-keepalive/", { waitUntil: "networkidle0" });
await p.evaluate(() => document.querySelector(".code-copy").scrollIntoView());
await p.click(".code-copy"); await wait(200);
const code = await p.evaluate(async () => ({ clip: await navigator.clipboard.readText(), label: document.querySelector(".code-copy").textContent }));
check("code Copy button copies just the code", code.clip.startsWith("const server = app.listen(3000);") && !code.clip.includes("Copy"), code.clip.slice(0, 50));
const toc = await p.$$eval(".toc a", (as) => as.map((a) => [a.getAttribute("href"), !!document.querySelector(a.getAttribute("href"))]));
check("table of contents links all resolve", toc.length > 0 && toc.every(([, ok]) => ok), `${toc.length} links`);

// 7. Phone menu (mobile)
const m = await b.newPage();
await m.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
await m.goto(base + "/", { waitUntil: "networkidle0" });
check("phone nav hides desktop links", await m.evaluate(() => getComputedStyle(document.querySelector(".nav__links")).display === "none"));
await m.tap(".menu summary"); await wait(300);
const menuLinks = await m.$$eval(".menu__panel a", (as) => as.map((a) => a.getAttribute("href")));
check("phone menu opens with links", await m.evaluate(() => document.querySelector(".menu").open) && menuLinks.length >= 6, menuLinks.join(" "));
await m.tap("h1"); await wait(300);
check("phone menu closes on outside tap", await m.evaluate(() => !document.querySelector(".menu").open));
check("lite mode on phones", await m.evaluate(() => document.documentElement.classList.contains("lite")));

// 8. No JavaScript
const nj = await b.newPage();
await nj.setJavaScriptEnabled(false);
await nj.setViewport({ width: 1440, height: 900 });
await nj.goto(base + "/about/", { waitUntil: "networkidle0" });
const noJs = await nj.evaluate(() => {
  const hidden = [...document.querySelectorAll("main *")].filter((e) => e.offsetParent !== null && getComputedStyle(e).opacity === "0").length;
  return { hidden, h1: document.querySelector("h1")?.textContent.slice(0, 20), servicesReachable: !!document.querySelector("nav a[href='/services/']") };
});
check("content visible without JavaScript", noJs.hidden === 0, JSON.stringify(noJs));
check("Services reachable from the nav without JavaScript", noJs.servicesReachable);

// 9. Reduced motion
const rm = await b.newPage();
await rm.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
await rm.goto(base + "/", { waitUntil: "networkidle0" });
await wait(800);
const red = await rm.evaluate(() => ({ lite: document.documentElement.classList.contains("lite"), lenis: document.documentElement.classList.contains("lenis"), animating: document.getAnimations().filter((a) => a.playState === "running").length }));
check("reduced motion: no smooth scroll, nothing animating", red.lite && !red.lenis && red.animating === 0, JSON.stringify(red));

// 10. Smooth scroll active on desktop
await p.goto(base + "/", { waitUntil: "networkidle0" }); await wait(1800);
check("smooth scroll loads on desktop", await p.evaluate(() => document.documentElement.classList.contains("lenis")));

check("no JavaScript errors during the run", errors.length === 0, errors.slice(0, 3).join(" | "));
await b.close();
console.log(results.join("\n"));
