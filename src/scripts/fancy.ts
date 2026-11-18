// Heavier effects for capable devices: smooth scrolling, parallax and the stacking case studies.
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis({ lerp: 0.08, smoothWheel: true, wheelMultiplier: 0.95 });
(window as unknown as { lenis: Lenis }).lenis = lenis;
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

// In-page links glide instead of jumping.
document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    const target = id && id !== "#" ? document.querySelector<HTMLElement>(id) : null;
    if (!target) return;
    e.preventDefault();
    lenis.scrollTo(target, { offset: -90 });
    // Keep what the browser would have done: update the address and move keyboard focus.
    history.pushState(null, "", id);
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  });
});

// Hero layers drift at different speeds.
if (document.querySelector(".hero")) {
  const scrub = { trigger: ".hero", start: "top top", end: "bottom top", scrub: true };
  gsap.to(".hero__stage", { y: 110, ease: "none", scrollTrigger: scrub });
  gsap.to(".hero__copy", { y: -24, ease: "none", scrollTrigger: scrub });
}

// Stack tiles drift with the pointer, nearer tiles further, then settle back when it leaves.
const tiltZone = document.querySelector<HTMLElement>("[data-tilt-zone]");
const heroEl = document.querySelector<HTMLElement>(".hero");
if (tiltZone && heroEl) {
  const mx = gsap.quickTo(tiltZone, "--mx", { duration: 0.9, ease: "power3.out" });
  const my = gsap.quickTo(tiltZone, "--my", { duration: 0.9, ease: "power3.out" });
  heroEl.addEventListener("pointermove", (e) => {
    const r = heroEl.getBoundingClientRect();
    mx((e.clientX - r.left) / r.width - 0.5);
    my((e.clientY - r.top) / r.height - 0.5);
  });
  heroEl.addEventListener("pointerleave", () => { mx(0); my(0); });
}

// Case studies settle back as the next one slides over them.
const cards = gsap.utils.toArray<HTMLElement>("[data-stack-card]");
cards.forEach((card, i) => {
  const next = cards[i + 1];
  if (!next) return;
  gsap.to(card, { scale: 0.93, opacity: 0.6, ease: "none", scrollTrigger: { trigger: next, start: "top bottom", end: "top 25%", scrub: true } });
});

// Floating cards in the closing section drift at their own pace.
gsap.utils.toArray<HTMLElement>("[data-float]").forEach((el) => {
  const depth = parseFloat(el.dataset.float || "1");
  gsap.to(el, { y: -50 * depth, ease: "none", scrollTrigger: { trigger: el.closest("section") || el, start: "top bottom", end: "bottom top", scrub: true } });
});

// The brand marquee speeds up with scroll velocity, then eases back.
const track = document.querySelector<HTMLElement>(".marquee__track");
if (track) {
  const anims = track.getAnimations();
  let boost = 1;
  lenis.on("scroll", ({ velocity }: { velocity: number }) => {
    boost = 1 + Math.min(Math.abs(velocity) / 8, 3);
  });
  gsap.ticker.add(() => {
    if (boost > 1.01) {
      boost = 1 + (boost - 1) * 0.94;
      anims.forEach((a) => (a.playbackRate = boost));
    }
  });
}

// Primary buttons lean toward the pointer.
document.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((el) => {
  const x = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3.out" });
  const y = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3.out" });
  el.addEventListener("pointermove", (e) => {
    const r = el.getBoundingClientRect();
    x((e.clientX - r.left - r.width / 2) * 0.25);
    y((e.clientY - r.top - r.height / 2) * 0.35);
  });
  el.addEventListener("pointerleave", () => { x(0); y(0); });
});

// Images that finish loading late can shift layout; re-measure once everything is in.
window.addEventListener("load", () => ScrollTrigger.refresh());
