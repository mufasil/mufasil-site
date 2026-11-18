---
title: "Five things to check before you launch an AI-built app"
description: "Before the link goes out, check where your API keys live, add rate limits, test a restore, tighten IAM policies and set up error logging."
pubDate: 2026-11-10
tags: ["AI", "Next.js", "Node.js", "AWS", "Launch"]
---

An app built with AI in a weekend can run perfectly on localhost and still fall over in its first week online.

Most of the trouble comes from the parts nobody asked the AI about. The demo didn't need them, so nobody wrote them. None of them takes long, and every one is cheaper to sort out before the link goes out.

## 1. Check where your API keys live

In Next.js, any environment variable that starts with `NEXT_PUBLIC_` is inlined into the JavaScript the browser downloads at build time. That's the point of the prefix, and it's also an easy place for a secret to end up when code gets generated fast. If your payment or AI provider key has that prefix, anyone can read it in their browser's dev tools.

A quick way to check a build:

```bash
npm run build
grep -r "sk_live\|sk-proj" .next/static
```

If that finds anything, rename the variable so it has no prefix, read it only on the server (a route handler or a server action), and rotate the key with the provider. Removing it from the code doesn't help once it has shipped, because old bundles are still cached in browsers and on CDNs.

## 2. Put a rate limit on anything that costs money

An endpoint that calls a paid AI model costs money every time someone hits it. One script calling it in a loop can run up charges you'll notice before your users do.

On an Express app the minimum looks like this:

```js
import rateLimit from "express-rate-limit";

app.use("/api/ai", rateLimit({ windowMs: 60_000, limit: 20 }));
```

That allows 20 requests a minute per IP address. Tie the limit to the signed-in user if you have accounts, since many people can share one IP. And set a monthly spend limit in the provider's own dashboard as a second fence.

## 3. Restore your backup once

Most managed databases take backups by default. Very few teams have ever restored one.

Do it once before launch. On RDS, restore the latest snapshot to a new instance, point a copy of the app at it, and check that the data is actually there. Write down how long it took. Until you've restored a backup, you don't know it works. You don't want to find out during an outage that it was empty, or that a restore takes four hours.

## 4. Read your IAM policies

AI-written AWS policies love `"Action": "*"` because it makes permission errors go away. It also means a leaked key can do anything that account can do.

Scope each policy to the actions and the resources the app really uses. For an app that uploads files to one bucket, that's closer to this:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject"],
      "Resource": "arn:aws:s3:::example-uploads/*"
    }
  ]
}
```

If you're not sure what the app needs, IAM Access Analyzer can generate a starting policy from the calls recorded in CloudTrail.

## 5. Set up error logging before launch

If the app breaks at 2 a.m. and nothing is recorded, you hear about it from an angry customer, and you still don't know what happened.

At minimum, capture uncaught exceptions and every 5xx response somewhere you will look, with the request path and a timestamp. Sentry, CloudWatch Logs or any hosted logger works. Add one alert for a spike in errors so the first person to know is you.

## Where to start if you only have an afternoon

Start with the keys. A leaked key is the one item on this list that starts costing money before anyone notices. Then the rate limit, then logging. Backups and IAM can take the next morning.

None of this needs a rewrite. It's usually about a day of setup.
