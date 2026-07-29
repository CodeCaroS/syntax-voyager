---
id: databases-and-queries
title: Databases and Queries
summary: Learn how databases store records and answer focused questions.
level: intermediate
learning_goal: Express a focused query and separate stored rows from domain values.
system: programming-fundamentals
order: 30
status: draft
sources: []
prerequisites: [data-modeling, state-and-persistence]
relations:
  - { target: data-modeling, type: requires }
  - { target: state-and-persistence, type: requires }
last_reviewed: 2026-07-29
---

# Databases and Queries

A database stores durable records. A query asks for the smallest useful result.

## Learning objective

After this article, you can filter stored data and map rows into domain records.

## Core idea

```text
SET rows TO DATABASE FIND tasks
    WHERE status IS EQUAL TO "open"
    ORDER BY created_at

RETURN CONVERT rows TO tasks
```

Filtering near storage avoids loading every record only to discard most of them.

## Common mistakes

- requesting every column and row;
- building queries from untrusted text;
- leaking database row shapes into domain rules.

## Exercise: Focus the query

Should an open-task screen load completed tasks?

<details><summary>Show solution</summary>

No. Filter for open tasks in the query.

</details>

## Small challenge

Design a query that returns the ten newest published notes.

## Continue the journey

- **Requires:** Data Modeling
- **Requires:** State and Persistence
- **Next:** Transactions and Consistency
