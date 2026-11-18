// The headline number for each case study, and the card tone it sits on. Every figure is in the case study itself.
export const caseLook: Record<string, { tone: "sky" | "peach" | "mint"; value: string; label: string }> = {
  "delivery-turnaround": { tone: "sky", value: "4 mo", label: "to ship a product that was 1.5 years late" },
  "perfect-day-care": { tone: "peach", value: "40%", label: "faster responses, at best, on a multi-tenant SaaS" },
  "hilal-foods-loyalty": { tone: "mint", value: "1k+", label: "inserts per minute, kept consistent" },
};

export const lookFor = (id: string) => caseLook[id] ?? { tone: "sky" as const, value: "", label: "" };
