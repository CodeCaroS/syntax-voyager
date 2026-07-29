---
id: transactions-and-consistency
title: Transactions and Consistency
summary: Learn how related state changes succeed or fail as one unit.
level: intermediate
learning_goal: Identify changes that must be committed atomically.
system: programming-fundamentals
order: 31
status: draft
sources: []
prerequisites: [databases-and-queries, workflows-and-state-machines]
relations:
  - { target: databases-and-queries, type: requires }
  - { target: workflows-and-state-machines, type: requires }
last_reviewed: 2026-07-29
---

# Transactions and Consistency

A transaction groups related changes so partial success cannot leave invalid state.

## Learning objective

After this article, you can recognize an atomic operation and its invariant.

## Core idea

```text
BEGIN TRANSACTION
    DECREASE source.balance BY amount
    INCREASE target.balance BY amount
COMMIT TRANSACTION
```

If either change fails, both changes must be rolled back.

## Common mistakes

- committing half an operation;
- keeping transactions open during slow external work;
- retrying without considering duplicate effects.

## Exercise: Find the invariant

What should remain unchanged during a transfer?

<details><summary>Show solution</summary>

The combined balance of the two accounts.

</details>

## Small challenge

Describe an order update that changes stock and creates an order atomically.

## Continue the journey

- **Requires:** Databases and Queries
- **Requires:** Workflows and State Machines
- **Next:** HTTP and Web Basics
