# mufasil.site

Personal site of Mufasil Iqbal, built with Astro 7. The site is static HTML. The only server code is one small Node service in `server/`, which handles the contact form.

## Run it

```bash
npm install
npm run dev        # http://localhost:4321
npx astro build    # writes the site to dist/
npx astro preview --port 4322 --host 127.0.0.1
```

## Where things live

| What | File |
| --- | --- |
| Name, email, links, `openToWork` (the availability bar) | `src/consts.ts` |
| Experience, service lists, testimonials | `src/data/*.ts` |
| The 19 service pages | `src/data/servicePages.ts` |
| Case study metrics | `src/data/cases.ts` |
| Case studies and blog posts | `src/content/work/*.md`, `src/content/blog/*.md` |
| SEO tags, structured data, share image choice | `src/components/Seo.astro` |
| Styles (every colour and font is a token on `:root`) | `src/styles/site.css` |
| Scripts: `core.ts` everywhere, `fancy.ts` (smooth scroll, GSAP) on capable devices | `src/scripts/` |
| Contact form service | `server/` |
| nginx and systemd files | `deploy/` |

All copy comes from `personal_web/mufasil-iqbal-profile.md` or from Mufasil directly. Don't add numbers, clients or quotes that aren't there.

To add a blog post, create a `.md` file in `src/content/blog/` with `title`, `description` (under 160 characters), `pubDate` and `tags`. It shows up on the blog, the RSS feed, the sitemap and `llms.txt` on the next build.

## After changing content

```bash
npx astro build
npx astro preview --port 4322 --host 127.0.0.1 &
node .hallmark/og.mjs http://127.0.0.1:4322                                         # one share image per page
node .hallmark/pdf.mjs http://127.0.0.1:4322/resume/ public/mufasil-iqbal-cv.pdf    # CV, must stay 2 pages
npx astro build                                                                     # again, so dist/ has the new files
```

## Contact form

The form posts JSON to `/api/contact`. nginx proxies that to `server/contact.mjs` on `127.0.0.1:8787`, which emails the message to `MAIL_TO` through Brevo's SMTP relay. Reply-To is set to the visitor's address.

- Settings live in `server/.env`, which starts as a copy of `server/.env.example`. The SMTP key is only ever in that file. It's gitignored, chmod 600, and never copied into `dist/`.
- Brevo only accepts connections from IPs listed under Settings > Security > Authorised IPs, so the server's IP has to be on that list.
- `MAIL_FROM` should be an address on mufasil.site, with the domain authenticated in Brevo. Brevo can't authenticate gmail.com.
- Set `MAIL_DRY_RUN=1` to log messages instead of sending them.
- The service:
  - checks the origin
  - rejects bad input
  - ignores the honeypot field
  - caps the body at 20 KB
  - allows 5 messages per IP every 10 minutes
  
  It never emails the visitor, so nobody can use it to send spam.

## Deploy to the nginx server

1. Back up the folder nginx serves for mufasil.site, then copy `dist/` into it.
2. Upload `server/` without `node_modules` and `.env`, and run `npm ci --omit=dev` there. Create `server/.env` with chmod 600. The service needs Node 20 or newer for `--env-file`.
3. Copy `deploy/mufasil-contact.service` to `/etc/systemd/system/` and fix the paths. Then run `systemctl enable --now mufasil-contact`.
4. Add `deploy/nginx-contact.conf` to the mufasil.site server block, then run `nginx -t && systemctl reload nginx`.
5. Open `https://mufasil.site/api/contact/health`, then send one message through the form.

nginx settings for the static site:

```nginx
location / {
  try_files $uri $uri/ $uri/index.html =404;
}
location /_astro/ {
  add_header Cache-Control "public, max-age=31536000, immutable";
}
error_page 404 /404.html;
```

## After it goes live

1. Add the site to Google Search Console and submit `https://mufasil.site/sitemap-index.xml`.
2. Do the same in Bing Webmaster Tools.
3. Check the share preview with the LinkedIn Post Inspector.
4. Put the site link in the LinkedIn Contact info and Featured section.
