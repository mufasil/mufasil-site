---
title: "Random 502s from an AWS load balancer in front of Node.js"
description: "Why an AWS load balancer returns random 502s that never reach your Node.js logs, the two-line keepAliveTimeout fix, and how to confirm it."
pubDate: 2026-11-17
tags: ["Node.js", "AWS", "NestJS", "Express"]
---

5 seconds on one side, 60 on the other. That mismatch causes a lot of random 502s on Node.js apps running behind an AWS Application Load Balancer.

The errors are rare, they don't line up with load, and your app logs show nothing. That last part is what makes them so annoying to chase.

## What's happening

The ALB keeps connections to your targets open and reuses them for later requests. That saves a TCP handshake on every request, which is good.

Node's HTTP server closes a keep-alive connection after it has been idle for 5 seconds. That's the default for `server.keepAliveTimeout`. The ALB's idle timeout is 60 seconds by default, so from its side the connection is still fine.

Every so often the ALB sends a request down a connection at the same moment Node closes it. The connection resets, the ALB returns a 502 to the user, and the request never reached your code. Nothing to log.

## The fix

Make Node wait longer than the load balancer. In Express, that's a couple of lines where you start the server:

```js
const server = app.listen(3000);
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;
```

`keepAliveTimeout` needs to be longer than the ALB's idle timeout. Keep `headersTimeout` a little above it, so Node doesn't drop a connection that's in the middle of sending headers.

In NestJS, get the underlying server after the app starts:

```ts
const app = await NestFactory.create(AppModule);
await app.listen(3000);

const server = app.getHttpServer();
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;
```

Fastify's default `keepAliveTimeout` is already 72 seconds, which is above the ALB default. Check it anyway if you changed the ALB's idle timeout.

## If you changed the ALB idle timeout

Whatever the numbers are, Node's timeout has to be longer than the load balancer's. If you raised the ALB idle timeout to 120 seconds for long uploads, Node needs something like 125 seconds.

## How to confirm it's this

Turn on access logs for the ALB if they aren't on already. These 502s show up with `elb_status_code` 502 and a `target_status_code` of `-`, meaning the target never sent a response. If your 502s look like that, and they stop after the change, this was it.

If the target did respond with a 502 of its own, the problem is somewhere else, usually in a proxy or upstream service behind the app.
