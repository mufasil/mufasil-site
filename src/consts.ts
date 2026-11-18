export const SITE = {
  url: "https://mufasil.site",
  name: "Mufasil Iqbal",
  title: "Mufasil Iqbal, Senior Node.js Backend Engineer and Tech Lead",
  description:
    "Mufasil Iqbal is a senior backend engineer and Technical Team Lead with 11+ years in Node.js, NestJS and AWS. Open to remote roles and contract work.",
  role: "Senior Backend Engineer & Technical Team Lead",
  jobTitle: "Technical Team Lead",
  email: "mufasil.official@gmail.com",
  linkedin: "https://www.linkedin.com/in/mufasil",
  credly: "https://www.credly.com/badges/112eccbb-19c2-4aae-a01e-8215980d07fe/public_url",
  cv: "/mufasil-iqbal-cv.pdf",
  city: "Karachi",
  country: "Pakistan",
  employer: "Social Champ",
  started: new Date("2014-12-01"),
  // Set to false to hide every "open to work" line on the site in one go.
  openToWork: true,
  availability: "Open to remote roles and contract work",
};

export const yearsBuilding = () => Math.floor((Date.now() - SITE.started.valueOf()) / (365.25 * 24 * 3600 * 1000));

export const NAV = [
  { href: "/about/", label: "About" },
  { href: "/work/", label: "Work" },
  { href: "/services/", label: "Hire me" },
  { href: "/blog/", label: "Writing" },
  { href: "/resume/", label: "Resume" },
];
