---
id: concurrency
title: Concurrency
summary: Learn what happens when multiple operations overlap in time.
level: advanced
learning_goal: Recognize a race condition and protect a shared invariant.
system: programming-fundamentals
order: 35
status: draft
sources: []
prerequisites: [state-and-persistence, functions]
relations:
  - { target: state-and-persistence, type: requires }
  - { target: functions, type: requires }
last_reviewed: 2026-07-29
---

# Concurrency

Concurrent operations overlap. Their individual steps may interleave in unexpected orders.

## Learning objective

After this article, you can describe a race condition and the state it threatens.

## Core idea

```text
SET current_stock TO READ stock
IF current_stock IS GREATER THAN 0 THEN
    WRITE stock AS current_stock - 1
END IF
```

Two operations can both read `1` before either writes, selling the same item twice.

## Common mistakes

- assuming execution order;
- protecting code without naming the invariant;
- holding a lock during unrelated slow work.

## Exercise: Find the race

What shared fact is unsafe in the stock example?

<details><summary>Show solution</summary>

The check and decrement are not one atomic operation.

</details>

## Small challenge

Describe how a transaction or atomic update could protect stock.

## Continue the journey

- **Requires:** State and Persistence
- **Requires:** Functions
- **Next:** Asynchronous Work
