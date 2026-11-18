---
title: "A multi-tenant platform for childcare centres"
description: "Backend architecture for a childcare SaaS, with a database per tenant, one codebase and domain-driven design. Response times improved by up to 40%."
client: "Perfect Day Care, with Appiskey"
years: "2021 to 2023"
role: "Backend lead and line manager"
stack: ["Node.js", "PHP", "MySQL", "SonarQube", "Prometheus", "Sentry"]
order: 2
---

## The product

Perfect Day Care is a SaaS platform for childcare centres. Teachers use it on tablets in the classroom, parents follow their child's day on a mobile app, and staff and admins run the centre from the web. I worked on it at Appiskey from 2021 to 2023, first as a senior engineer and then as line manager of the backend team.

I was involved from the early design phase, so the backend architecture was built from the ground up rather than inherited.

## One codebase, a database per centre

Childcare data is sensitive, so keeping each centre's records apart mattered. We gave each tenant its own database and kept a single codebase serving all of them.

That decision shaped the rest. Every request is matched to its tenant early on, and data access is scoped from there, so a query can't reach another centre's records by accident. New centres get the same code and the same releases as everyone else, without a separate deployment to maintain.

## Structure that held up

The backend uses domain-driven design. Each area of the product lives in its own module, with clear boundaries between them. That keeps the code readable as features pile up, and lets developers work on different parts of the product without stepping on each other.

Security was there from the start, with role-based access for each kind of user, rate limiting and validation on every input.

## Speed and quality

Refactoring the heaviest database queries and adding caching where it made sense improved response times by up to 40%.

To catch problems before customers did, we added SonarQube for code quality, Prometheus for metrics and Sentry for errors. I also worked with the DevOps team on the CI/CD pipeline so that deployment problems got fixed quickly instead of piling up.

## The team

After my promotion to line manager I led two backend developers on the project, which meant planning, code review and mentoring alongside the architecture work.
