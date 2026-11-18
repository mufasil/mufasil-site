// Services Mufasil offers, grouped the way the mega menu and the services section show them.
export const coreServices = [
  { icon: "code", slug: "backend-and-apis", title: "Backend and APIs", text: "Node.js, NestJS and Laravel backends that hold up under real traffic." },
  { icon: "rocket", slug: "ai-built-apps-to-production", title: "AI-built apps to production", text: "Auth, limits, backups and logging for apps built fast with AI." },
  { icon: "cloud", slug: "aws-and-devops", title: "AWS and DevOps", text: "Architecture, CI/CD and cost reviews from a certified AWS architect." },
  { icon: "users", slug: "technical-leadership", title: "Technical leadership", text: "Planning, review and delivery for teams that keep missing dates." },
];

export const serviceGroups = [
  {
    title: "Build",
    icon: "code",
    items: ["API development", "MVP development", "Microservices", "Real-time apps", "Payments and integrations", "AI and LLM integration"],
  },
  {
    title: "Run",
    icon: "cloud",
    items: ["AWS architecture", "CI/CD pipelines", "Docker and Kubernetes", "AWS cost review", "Monitoring and alerts"],
  },
  {
    title: "Improve",
    icon: "layers",
    items: ["Production readiness review", "Node.js performance", "Database tuning", "Code and architecture review", "Part-time tech lead"],
  },
];

export type ReasonTag = { label: string; check?: boolean; logo?: string; clock?: boolean };

export const reasons: { icon: string; title: string; text: string; tags: ReasonTag[] }[] = [
  {
    icon: "shieldCheck",
    title: "Production first",
    text: "I build these in with the feature instead of leaving them for a later ticket.",
    tags: [{ label: "Logging", check: true }, { label: "Backups", check: true }, { label: "Rate limits", check: true }, { label: "Alerts", check: true }],
  },
  {
    icon: "gitPullRequest",
    title: "AI-accelerated, still reviewed",
    text: "AI writes the boilerplate. Every line still gets a human review before it merges.",
    tags: [{ label: "Claude", logo: "claude" }, { label: "GPT" }, { label: "Human review", check: true }],
  },
  {
    icon: "users",
    title: "I’ve led big teams",
    text: "A cross-functional team of 19+ engineers, and a 1.5-year delay shipped in four months.",
    tags: [{ label: "Planning" }, { label: "Code review" }, { label: "Delivery" }],
  },
  {
    icon: "badgeCheck",
    title: "Certified AWS architect",
    text: "Solutions Architect, Associate, valid until September 2028. I’ve run production workloads on EC2 and RDS.",
    tags: [{ label: "EC2" }, { label: "RDS" }, { label: "Lambda" }],
  },
  {
    icon: "blocks",
    title: "Full-stack range",
    text: "Backend first, with enough frontend to ship a feature end to end.",
    tags: [
      { label: "Node.js", logo: "nodedotjs" }, { label: "NestJS", logo: "nestjs" }, { label: "Next.js", logo: "nextdotjs" },
      { label: "Laravel", logo: "laravel" }, { label: "Python", logo: "python" }, { label: "PostgreSQL", logo: "postgresql" },
      { label: "MongoDB", logo: "mongodb" }, { label: "Redis", logo: "redis" },
    ],
  },
  {
    icon: "earth",
    title: "Remote-ready",
    text: "Based in Karachi. I’ve worked remotely with a team in Riyadh.",
    tags: [{ label: "Karachi time", clock: true }, { label: "Overlaps Europe" }, { label: "Overlaps US East" }],
  },
];

// The mega menu: two columns on the right, one featured service under the core four.
export const menuColumns = [
  { title: "Build", items: ["API development", "MVP development", "Microservices", "Real-time apps", "Payments and integrations", "AI and LLM integration", "AWS architecture"] },
  { title: "Optimise", items: ["Node.js performance", "Database tuning", "AWS cost review", "CI/CD pipelines", "Monitoring and alerts", "Code and architecture review", "Part-time tech lead"] },
];

export const featuredService = {
  slug: "production-readiness-review",
  title: "Production readiness review",
  badge: "For AI-built apps",
  text: "Keys, auth, rate limits, backups and logging checked before real users arrive.",
};

// How a conversation turns into work. Shared by the services pages.
export const startSteps = [
  { title: "Send the details", text: "The role or the project, the stack, and when you need someone." },
  { title: "I reply by email", text: "With questions if I have any, and whether I think it’s a fit." },
  { title: "We agree the scope", text: "What’s included, written down, and how we’ll both know it’s done." },
  { title: "Work starts", text: "Remote, in hours that overlap with yours." },
];
