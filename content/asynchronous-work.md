---
id: asynchronous-work
title: Asynchronous Work
summary: Learn how programs continue while slower operations finish later.
level: advanced
learning_goal: Model pending, successful, and failed asynchronous results.
system: programming-fundamentals
order: 36
status: draft
sources: []
prerequisites: [concurrency, events-and-notifications]
relations:
  - { target: concurrency, type: requires }
  - { target: events-and-notifications, type: requires }
last_reviewed: 2026-07-29
---

# Asynchronous Work

Asynchronous work starts now and completes later, allowing other useful work to continue.

## Learning objective

After this article, you can represent pending, success, failure, and cancellation.

## Core idea

```text
SET request.status TO "pending"
START fetch_lesson

WHEN fetch_lesson COMPLETES WITH result
    SET request.status TO "succeeded"
    SET request.value TO result
END WHEN
```

Failure and cancellation need equally explicit paths.

## Common mistakes

- treating a pending result as available;
- losing errors from background work;
- updating state after the caller has cancelled.

## Exercise: Name the states

Which states should a visible loading operation expose?

<details><summary>Show solution</summary>

At least pending, succeeded, failed, and cancelled when cancellation is supported.

</details>

## Small challenge

Model an asynchronous search that ignores an outdated result.

## Continue the journey

- **Requires:** Concurrency
- **Requires:** Events and Notifications
- **Next:** Messaging and Queues
