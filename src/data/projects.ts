// Every row comes from Mufasil's own profile and CV. Nothing here is estimated.
export type Project = {
  name: string;
  client: string;
  years: string;
  stack: string;
  slug?: string;
};

export const projects: Project[] = [
  {
    name: "A delayed product, shipped in four months",
    client: "Digital Auxilius",
    years: "2024 to 2026",
    stack: "A team of 19+ across web, mobile, QA and DevOps",
    slug: "delivery-turnaround",
  },
  {
    name: "Multi-tenant childcare platform",
    client: "Perfect Day Care",
    years: "2021 to 2023",
    stack: "Node.js, PHP, MySQL",
    slug: "perfect-day-care",
  },
  {
    name: "Distributor loyalty engine",
    client: "Hilal Foods",
    years: "2015 to 2017",
    stack: "Node.js, Laravel, Redis",
    slug: "hilal-foods-loyalty",
  },
  {
    name: "WhatsApp messaging across 50+ touchpoints",
    client: "Get Licensed",
    years: "2024",
    stack: "Backend, third-party APIs",
  },
  {
    name: "Featured ads and local payments",
    client: "Zido",
    years: "2021 to 2022",
    stack: "Backend, AWS EC2, RDS",
  },
  {
    name: "Live quiz screens for events",
    client: "Getz Pharma",
    years: "2015 to 2017",
    stack: "Node.js, Socket.io, MongoDB",
  },
  {
    name: "Broadband customer portals",
    client: "Storm Fiber, National Broadband",
    years: "2018 to 2019",
    stack: "SQL procedures, schedulers",
  },
];
