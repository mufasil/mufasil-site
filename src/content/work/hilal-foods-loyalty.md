---
title: "A loyalty engine for Hilal Foods distributors"
description: "A distributor loyalty system for Hilal Foods that handles 1,000+ inserts per minute, with incentive rules that non-technical staff set themselves."
client: "Hilal Foods"
years: "2015 to 2017"
role: "Developer"
stack: ["Node.js", "Laravel", "MySQL", "PostgreSQL", "Redis", "Cron"]
order: 3
---

## The problem

Hilal Foods rewards its wholesalers and distributors against sales targets, under rules that change by region.

The system had to take in a lot of sales transactions and work out incentives from rules that kept changing. The business also needed reports from it.

## Built for volume

The data model came first. I designed and maintained the ERDs, the relational tables, the views and the queries for a high-volume transactional workload. The system handles more than 1,000 inserts per minute while keeping the data consistent and latency low.

Wholesaler data is managed in workflows that let the business track and segment distributors by region.

## Rules the business can change

The main piece is an incentive calculation engine. It works from sales targets and regional rules, and none of those rules are hard-coded.

A policy configuration module lets non-technical users set the conditions for incentives and pricing themselves. When a regional rule changes, someone on the business side updates it without waiting for a developer or a release.

## Running in the background

Scheduled and optimised cron jobs handle background processing, data synchronisation and the automatic enforcement of policies.

## Reports

A reporting module gives stakeholders export-ready views of the business in close to real time, so decisions about incentives are made on current numbers.
