// Every line comes from Mufasil's own profile and CV.
export type Role = {
  company: string;
  role: string;
  start: string;
  end: string;
  note?: string;
  points: string[];
  stack?: string[];
};

export const experience: Role[] = [
  {
    company: "Social Champ Inc.",
    role: "Technical Team Lead",
    start: "Jan 2026",
    end: "Present",
    points: [
      "Lead the engineering team behind a SaaS platform for social media management.",
      "Brought in an AI-first workflow we call No Code by Developer, where AI writes the boilerplate and scaffolding and engineers own the architecture and design.",
      "Tie engineering work to delivery goals while raising code quality across the team.",
    ],
    stack: ["Node.js", "AI tooling", "SaaS"],
  },
  {
    company: "Digital Auxilius",
    role: "Technical Team Lead",
    start: "Oct 2024",
    end: "Jan 2026",
    points: [
      "Led a cross-functional team of 19+ engineers across frontend, backend, mobile, QA and DevOps.",
      "Found the root causes of a product running 1.5 years late, re-planned it, and shipped it within 4 months.",
      "Moved the team to Agile with realistic timelines and clear ownership, and introduced performance-linked pay.",
    ],
    stack: ["Team leadership", "Agile", "Delivery"],
  },
  {
    company: "Get Licensed",
    role: "Senior Backend Engineer",
    start: "Feb 2024",
    end: "Oct 2024",
    points: [
      "Built WhatsApp interactive messaging, with buttons and replies, across 50+ product touchpoints.",
      "Shipped the GuardPerks loyalty feature on top of a third-party coupon API.",
      "Refactored legacy backend modules in a live product without disrupting users.",
    ],
    stack: ["Backend", "WhatsApp API", "Integrations"],
  },
  {
    company: "Appiskey LLC",
    role: "Senior Software Engineer, Line Manager",
    start: "Aug 2021",
    end: "Dec 2023",
    points: [
      "Architected a multi-tenant childcare SaaS with a database per tenant, one codebase and domain-driven design.",
      "Improved response times by up to 40% through query refactoring and caching.",
      "Promoted to line manager of the backend team, and set up SonarQube, Prometheus and Sentry.",
    ],
    stack: ["Node.js", "PHP", "MySQL", "DDD"],
  },
  {
    company: "Zido Inc.",
    role: "Senior Backend Developer",
    start: "May 2021",
    end: "Feb 2022",
    note: "Part time, remote, with a team in Riyadh",
    points: [
      "Built featured ads and localised payments for a mobile classifieds platform.",
      "Ran the AWS infrastructure on EC2 and RDS alongside the backend work.",
    ],
    stack: ["Backend", "AWS EC2", "RDS"],
  },
];

export const earlier = [
  { company: "EPlanet Communication", role: "Senior Software Engineer", years: "2021" },
  { company: "Nanosoft Technologies", role: "Senior Software Engineer", years: "2021" },
  { company: "Hashlob", role: "Software Engineer", years: "2018 to 2019" },
  { company: "Lakson Business Solutions", role: "Software Engineer", years: "2018 to 2019" },
  { company: "Synage Global", role: "Software Engineer", years: "2017 to 2018" },
  { company: "Interactive Cells", role: "Software Engineer", years: "2015 to 2017" },
  { company: "Evolution Designers", role: "Web Developer", years: "2014 to 2015" },
];

export const stack = [
  { group: "Backend", items: [
    { name: "Node.js", icon: "nodedotjs" }, { name: "NestJS", icon: "nestjs" }, { name: "Express", icon: "express" },
    { name: "TypeScript", icon: "typescript" }, { name: "Laravel", icon: "laravel" }, { name: "PHP", icon: "php" },
    { name: "Python", icon: "python" }, { name: "Django", icon: "django" }, { name: "FastAPI", icon: "fastapi" },
    { name: "Socket.io", icon: "socketdotio" },
  ] },
  { group: "Frontend", items: [ { name: "Next.js", icon: "nextdotjs" }, { name: "React", icon: "react" } ] },
  { group: "Data", items: [
    { name: "PostgreSQL", icon: "postgresql" }, { name: "MySQL", icon: "mysql" }, { name: "MongoDB", icon: "mongodb" },
    { name: "Redis", icon: "redis" }, { name: "Elasticsearch", icon: "elasticsearch" },
  ] },
  { group: "Cloud and DevOps", items: [
    { name: "AWS", icon: "aws" }, { name: "Docker", icon: "docker" }, { name: "Kubernetes", icon: "kubernetes" },
    { name: "GitHub Actions", icon: "githubactions" }, { name: "Linux", icon: "linux" }, { name: "Nginx", icon: "nginx" },
  ] },
  { group: "AI in the workflow", items: [ { name: "Claude Code", icon: "claude" }, { name: "Anthropic API", icon: "anthropic" }, { name: "GitHub Copilot", icon: "githubcopilot" }, { name: "Cursor", icon: "cursor" } ] },
];
