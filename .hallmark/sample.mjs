import puppeteer from "puppeteer-core";
import { readFileSync } from "node:fs";
const src = "data:image/png;base64," + readFileSync(process.argv[2]).toString("base64");
const b = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
const p = await b.newPage();
const out = await p.evaluate(async (src) => {
  const img = new Image(); img.src = src; await img.decode();
  const c = document.createElement("canvas"); c.width = img.width; c.height = img.height;
  const x = c.getContext("2d"); x.drawImage(img, 0, 0);
  const px = (a, b) => { const d = x.getImageData(a, b, 1, 1).data; return "#" + [d[0], d[1], d[2]].map((v) => v.toString(16).padStart(2, "0")).join(""); };
  const res = { M_left: px(390, 650), M_right: px(987, 650), M_v: px(688, 640), dot: px(1228, 343), stem: px(1220, 700), stem2: px(1250, 600), bg: px(60, 60) };
  // edges: scan rows/cols for blue threshold
  const isBlue = (a, b) => { const d = x.getImageData(a, b, 1, 1).data; return d[2] > 200 && d[0] < 60; };
  const isStem = (a, b) => { const d = x.getImageData(a, b, 1, 1).data; return d[2] > 25 && d[2] < 70 && d[0] < 10; };
  const scanX = (y, f) => { let s = -1, e = -1, segs = []; for (let i = 0; i < img.width; i++) { const v = f(i, y); if (v && s < 0) s = i; if (!v && s >= 0) { segs.push([s, i - 1]); s = -1; } } return segs; };
  const scanY = (xx, f) => { let s = -1, segs = []; for (let i = 0; i < img.height; i++) { const v = f(xx, i); if (v && s < 0) s = i; if (!v && s >= 0) { segs.push([s, i - 1]); s = -1; } } return segs; };
  res.rows = {}; for (const y of [330, 345, 400, 500, 550, 600, 700, 800]) res.rows[y] = JSON.stringify(scanX(y, isBlue));
  res.cols = {}; for (const xx of [390, 450, 500, 600, 688, 800, 987, 1228]) res.cols[xx] = JSON.stringify(scanY(xx, isBlue));
  res.stemRows = {}; for (const y of [480, 500, 550, 600, 650, 700, 800]) res.stemRows[y] = JSON.stringify(scanX(y, isStem).filter(s => s[1]-s[0] > 20));
  res.stemCols = {}; for (const xx of [1125, 1140, 1180, 1250, 1300, 1310]) res.stemCols[xx] = JSON.stringify(scanY(xx, isStem).filter(s => s[1]-s[0] > 20));
  return res;
}, src);
console.log(JSON.stringify(out, null, 1));
await b.close();
