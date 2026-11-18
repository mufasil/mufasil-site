---
title: "How to review a pull request an AI agent wrote"
description: "A short review pass for AI-written pull requests. Check new dependencies, files outside the task, catch blocks, auth on new routes and the tests."
pubDate: 2026-11-17
tags: ["AI", "Code review", "Node.js", "Next.js"]
---

Open the `package.json` diff first when you review a pull request an AI agent wrote.

An agent can produce a working change in minutes. Reviewing it still takes a person, and reading every line top to bottom isn't the best use of their time. This is the order I'd go in instead. It catches the problems that get expensive after merge.

## 1. New dependencies

Agents add a package to solve a five-line problem without thinking twice. Each new dependency is something you'll be updating and patching for years.

For every package the PR adds, check three things. It's maintained. It's actually used in the code. And the name really is the package you think it is. Models sometimes suggest package names that don't exist, and people have started registering those names on npm with something unpleasant inside. A name that looks almost right deserves a second look on npmjs.com.

## 2. Files outside the task

Compare the list of changed files with what was asked for. A PR to fix a date format has no business touching the auth middleware, and agents do wander into files nobody mentioned, usually while "cleaning up" something nearby.

If a change outside the task is genuinely needed, it should be its own PR with its own description.

## 3. The catch blocks

AI code is very good at catching an error, logging it, and returning an empty array:

```ts
try {
  return await db.order.findMany({ where: { customerId } });
} catch (err) {
  console.error(err);
  return [];
}
```

The tests stay green, and in production users quietly see an empty list instead of an error. Search the diff for `catch` and decide, for each one, whether hiding the error is really what you want.

## 4. Auth on every new route

Make sure every new API route checks who's calling it. In Next.js, a page can sit behind a login while the route handler it calls is open to anyone with the URL. Middleware with a `matcher` that skips `/api` is a common way this happens.

Open each new route in a private window, signed out. If data comes back, that's the first review comment.

## 5. What the tests assert

A lot of generated tests check that a mock returned the value the mock was told to return. They pass, and they'd still pass if the function under test were deleted.

Break the function on purpose once, run the tests, and see if anything fails. If nothing does, those tests aren't checking anything.

## Ask the agent to explain itself

Before you start, ask the agent to end the PR description with every file it changed and why. Anything it can't explain is your first review comment, and the list gives you a map for steps 1 and 2.
