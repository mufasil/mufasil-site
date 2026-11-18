import puppeteer from "puppeteer-core";
import { readFileSync } from "node:fs";
const [a, b2, out] = process.argv.slice(2);
const u = (f) => "data:image/png;base64," + readFileSync(f).toString("base64");
const b = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
const p = await b.newPage();
await p.setViewport({ width: 1400, height: 760 });
// Left: old, right: new; each shows the full figure on the orb blue and a 3x zoom of the hair edge.
const cell = (src, label) => `<div style="display:grid;gap:8px;justify-items:center;font:600 14px system-ui">${label}
  <div style="display:flex;gap:8px">
  <div style="width:330px;height:345px;background:linear-gradient(135deg,#dbe6ff,#5b7cff 70%,#2f55ff)"><img src="${src}" style="width:330px"></div>
  <div style="width:330px;height:345px;overflow:hidden;background:#8aa2ff;position:relative"><img src="${src}" style="position:absolute;width:1215px;left:-380px;top:-130px;image-rendering:auto;transform:scale(1);"></div>
  </div>
  <div style="display:flex;gap:8px">
  <div style="width:330px;height:345px;overflow:hidden;background:#f6f8fc;position:relative"><img src="${src}" style="position:absolute;width:1215px;left:-60px;top:-640px"></div>
  <div style="width:330px;height:345px;overflow:hidden;background:#f6f8fc;position:relative"><img src="${src}" style="position:absolute;width:1215px;left:-800px;top:-560px"></div>
  </div></div>`;
await p.setContent(`<body style="margin:0;display:flex;gap:24px;padding:10px">${cell(u(a), "old")}${cell(u(b2), "new")}</body>`);
await p.screenshot({ path: out });
await b.close();
