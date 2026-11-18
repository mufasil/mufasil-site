import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { SITE } from "../consts";
import { servicePages } from "../data/servicePages";

export const GET: APIRoute = async () => {
  const posts = (await getCollection("blog")).sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
  const cases = (await getCollection("work")).sort((a, b) => a.data.order - b.data.order);
  const lines = [
    `# ${SITE.name}`,
    "",
    `> ${SITE.description}`,
    "",
    `${SITE.name} is a Technical Team Lead at Social Champ and a backend engineer based in Karachi, Pakistan, building since December 2014. AWS Certified Solutions Architect, Associate. Works in Node.js, NestJS, Next.js, TypeScript, Laravel, PHP and Python, on PostgreSQL, MySQL, MongoDB and Redis, deployed on AWS. Takes on outside projects: production readiness reviews for AI-built apps, Node.js performance, AWS architecture and cost, and fractional technical leadership. Contact: ${SITE.email}.`,
    "",
    "## Pages",
    `- [Services](${SITE.url}/services/): what he takes on and for whom`,
    `- [About](${SITE.url}/about/): background, roles, skills and certification`,
    `- [Work](${SITE.url}/work/): projects and case studies`,
    `- [Writing](${SITE.url}/blog/): notes on Node.js, AWS and AI-built apps`,
    `- [Resume](${SITE.url}/resume/): full work history`,
    `- [Contact](${SITE.url}/contact/): email and contact form`,
    "",
    "## Services",
    ...servicePages.map((s) => `- [${s.name}](${SITE.url}/services/${s.slug}/): ${s.description}`),
    "",
    "## Case studies",
    ...cases.map((c) => `- [${c.data.title}](${SITE.url}/work/${c.id}/): ${c.data.description}`),
    "",
    "## Writing",
    ...posts.map((p) => `- [${p.data.title}](${SITE.url}/blog/${p.id}/): ${p.data.description}`),
    "",
  ];
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
