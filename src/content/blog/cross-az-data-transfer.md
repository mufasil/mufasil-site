---
title: "Cross-AZ data transfer, the AWS charge with no clear name"
description: "How to find traffic between Availability Zones in Cost Explorer, where it usually comes from, and which fixes are worth making."
pubDate: 2026-11-17
tags: ["AWS", "Cost", "Architecture"]
---

$0.01 per GB sounds like nothing. But you pay it in both directions, and two services that talk to each other all day move a lot of gigabytes. The bill doesn't give it a clear name either.

It's cross-AZ data transfer, meaning traffic between two Availability Zones in the same region. Someone brought it up in the comments on my [AWS bill post](/blog/where-aws-bills-come-from/), and it's worth more than a comment.

## How it happens

Say your app servers run in `us-east-1a` and the Postgres primary sits in `us-east-1b`. Every query and every result set crosses between zones, and AWS charges for the trip out and the trip back.

The same thing happens when:

- Redis or another cache runs in a different zone from the servers that use it most
- one NAT Gateway in a single AZ serves private subnets in every AZ
- services in a cluster call each other across zones with no preference for the local one

None of these is a mistake on its own. Spreading across zones is how you survive a zone going down. The cost is just easy to miss.

## Finding it

Open Cost Explorer and filter usage type for `DataTransfer-Regional-Bytes` (it's prefixed with your region code, like `USE1-DataTransfer-Regional-Bytes`). Group by month.

If that number is small, leave it alone. There are better uses of your week.

Cost Explorer only shows the total. To see which instances are actually talking across zones, turn on VPC Flow Logs for a day and group the traffic by source and destination subnet.

## The usual fixes

If the number is big, the fixes are boring ones:

- **Keep the cache close.** Put the cache in the same zone as the servers that hit it hardest, or use a client that prefers a replica in its own zone.
- **Read locally.** Send read queries to a replica in the same AZ as the app server, and keep writes going to the primary.
- **One NAT Gateway per AZ.** Each one has an hourly cost, so do the maths first, but once traffic is heavy it's usually cheaper than sending everything across zones to one gateway.

## What not to do

Don't give up high availability to save on transfer. RDS Multi-AZ replication traffic isn't charged anyway, and an outage costs more than a few gigabytes ever will.

Cut the cross-zone traffic that has no reason to exist. Multi-AZ redundancy you set up on purpose should stay.
