import puppeteer from "puppeteer-core";
import { readFileSync } from "node:fs";
const [src, dir] = process.argv.slice(2);
const png = "data:image/png;base64," + readFileSync(src).toString("base64");
const light = readFileSync("public/logo.svg", "utf8");
const dark = readFileSync("public/logo-dark.svg", "utf8");
const b = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
const p = await b.newPage();
await p.setViewport({ width: 1536, height: 1024 });
// Overlay: the traced outline in red on top of the original.
const outline = light.replace('viewBox="315 241 1014 568"', 'viewBox="0 0 1536 1024" width="1536" height="1024"').replaceAll(/fill="#[0-9a-f]+"/g, 'fill="none" stroke="#ff2a2a" stroke-width="3"');
await p.setContent(`<body style="margin:0;position:relative"><img src="${png}" style="display:block"><div style="position:absolute;inset:0">${outline}</div></body>`);
await p.screenshot({ path: `${dir}/logo-overlay.png` });
await p.setViewport({ width: 1100, height: 420 });
await p.setContent(`<body style="margin:0;display:grid;grid-template-columns:1fr 1fr;height:100vh">
<div style="display:grid;place-items:center;background:#f6f8fc">${light.replace("<svg ", '<svg width="380" ')}</div>
<div style="display:grid;place-items:center;background:#000">${dark.replace("<svg ", '<svg width="520" ')}</div></body>`);
await p.screenshot({ path: `${dir}/logo-versions.png` });
await b.close();
