---
id: stacks-and-queues
title: Stacks and Queues
summary: Learn how processing order changes the behavior of a collection.
level: beginner
learning_goal: Choose last-in-first-out or first-in-first-out ordering.
system: programming-fundamentals
order: 22
status: draft
sources: []
prerequisites: [lists-and-records]
relations:
  - { target: lists-and-records, type: requires }
last_reviewed: 2026-07-29
---

# Stacks and Queues

A **stack** removes the newest item first. A **queue** removes the oldest item first.

## Learning objective

After this article, you can select the ordering rule that matches a process.

## Core idea

```text
PUSH "page-a" ONTO history_stack
PUSH "page-b" ONTO history_stack
SET previous_page TO POP FROM history_stack

ENQUEUE "job-a" INTO job_queue
ENQUEUE "job-b" INTO job_queue
SET next_job TO DEQUEUE FROM job_queue
```

The stack returns `"page-b"`; the queue returns `"job-a"`.

## Common mistakes

- mixing stack and queue operations;
- removing from an empty collection;
- assuming arrival order never matters.

## Exercise: Choose an order

Should print jobs normally use a stack or queue?

<details><summary>Show solution</summary>

A queue preserves first-in-first-out order.

</details>

## Small challenge

Model browser back navigation with a stack.

## Continue the journey

- **Requires:** Lists and Records
- **Next:** Recursion
