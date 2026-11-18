// Light behaviour that runs on every device. Heavy effects load later, only where the device can afford them.
const html = document.documentElement;
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
type Nav = Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
const nav = navigator as Nav;
const lite =
  reduce ||
  (nav.deviceMemory ?? 8) <= 4 ||
  (navigator.hardwareConcurrency ?? 8) <= 4 ||
  nav.connection?.saveData === true ||
  matchMedia("(pointer: coarse)").matches;
if (lite) html.classList.add("lite");

// Sections fade up once as they enter. Without this script everything is simply visible.
const reveal = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add("is-in");
        reveal.unobserve(e.target);
      }
    }
  },
  { rootMargin: "0px 0px -8% 0px" },
);
document.querySelectorAll("[data-reveal]").forEach((el) => reveal.observe(el));

// Figures count up the first time they are seen.
const ease = (t: number) => 1 - Math.pow(1 - t, 3);
const countUp = (el: HTMLElement) => {
  const raw = el.dataset.count || "";
  const m = raw.match(/^([^\d]*)([\d,.]+)(.*)$/);
  if (!m || reduce) return;
  const [, pre, num, post] = m;
  const end = parseFloat(num.replace(/,/g, ""));
  const start = performance.now();
  const step = (now: number) => {
    const t = Math.min(1, (now - start) / 1400);
    el.textContent = `${pre}${Math.round(end * ease(t)).toLocaleString("en-US")}${post}`;
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};
const counter = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (e.isIntersecting) {
      countUp(e.target as HTMLElement);
      counter.unobserve(e.target);
    }
  }
});
document.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => counter.observe(el));

// Looping decorations pause while they are off screen, so idle pages cost nothing.
const zones = new IntersectionObserver((entries) => {
  for (const e of entries) e.target.classList.toggle("is-paused", !e.isIntersecting);
});
document.querySelectorAll("[data-anim-zone]").forEach((el) => zones.observe(el));

// The nav gains a surface once the page scrolls, checked at most once a frame.
const navEl = document.querySelector<HTMLElement>("[data-nav]");
let ticking = false;
const onScroll = () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    navEl?.classList.toggle("is-scrolled", window.scrollY > 8);
    ticking = false;
  });
};
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

// Smooth scrolling and scroll effects: capable devices only, after the page has settled.
if (!lite) {
  const load = () => import("./fancy");
  if ("requestIdleCallback" in window) (window as Window & { requestIdleCallback: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback(load, { timeout: 1200 });
  else setTimeout(load, 300);
}
