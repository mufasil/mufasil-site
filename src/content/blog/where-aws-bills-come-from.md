---
title: "Where a surprise AWS bill usually comes from"
description: "Where to look first when an AWS bill jumps, from NAT Gateways and forgotten staging stacks to log retention and old snapshots."
pubDate: 2026-11-16
tags: ["AWS", "Cost", "Cloud"]
---

A surprise AWS bill usually comes from something nobody remembers turning on.

The services you think about every day are rarely the problem. The expensive line is the one that was set up once, worked, and was never looked at again. These are the places I'd check first.

## Turn on a budget alert before anything else

In AWS Budgets, create a monthly cost budget and an alert at 80% of it. It takes a few minutes, and next time you'll get an email well before the invoice. Do this even if you fix nothing else today.

## NAT Gateways

A NAT Gateway charges per hour and per gigabyte that passes through it. A server in a private subnet that pulls large files from S3 all day sends every one of those gigabytes through the NAT.

The fix is cheap. A gateway endpoint for S3 (and one for DynamoDB, if you use it) has no hourly or data charge, and it routes that traffic inside AWS instead of through the NAT. You add it to the VPC and the route tables, and the application code doesn't change.

## The staging setup from an old demo

Somebody built a full copy of the app for a client demo, with its own database and load balancer. The demo was eight months ago. All three are probably still running.

Tag everything with an environment and an owner so these show up, and delete what nobody claims. If staging is still needed, stop the database outside working hours or move it to a smaller instance.

## CloudWatch logs that never expire

New CloudWatch log groups keep their data forever unless you set a retention period. Debug logs from a chatty service keep piling up, and you keep paying to store them.

Set retention on every log group. Thirty days is plenty for most application logs, and anything you need longer can go to S3, which costs less to keep.

## Disks and snapshots left behind

Terminating an EC2 instance doesn't always delete its EBS volumes, and it never deletes the snapshots someone took "just in case".

In the EC2 console, filter volumes by the "available" state. Those are attached to nothing and still billed. Then look at snapshots older than your retention policy.

## Databases sized on launch day

RDS instances get sized when the app launches and are rarely looked at again. If the CPU graph has been low and flat for months, you're paying for headroom you don't use.

Look at CPU, memory and connections over the last 90 days first, then make the change in a maintenance window. Moving to a Graviton instance class is often cheaper for the same size, if your engine version supports it.

## Find out which one it is

In Cost Explorer, group the last three months by usage type. Whichever of these is eating your bill usually shows up in the first few rows, with a name like `NatGateway-Bytes` or `TimedStorage-ByteHrs`.

If you see `DataTransfer-Regional-Bytes` near the top, that's traffic between Availability Zones, which deserves [its own post](/blog/cross-az-data-transfer/).
