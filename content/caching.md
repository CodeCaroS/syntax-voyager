---
id: caching
title: Caching
summary: Learn how temporary copies trade freshness for speed.
level: advanced
learning_goal: Choose a cache key, lifetime, and invalidation rule.
system: programming-fundamentals
order: 38
status: draft
sources: []
prerequisites: [state-and-persistence, complexity-and-trade-offs]
relations:
  - { target: state-and-persistence, type: requires }
  - { target: complexity-and-trade-offs, type: requires }
last_reviewed: 2026-07-29
---

# Caching

A cache stores a temporary copy of an expensive result. Faster reads come with a freshness trade-off.

## Learning objective

After this article, you can define when cached data is reused and removed.

## Core idea

```text
IF cache CONTAINS key AND cache[key] IS FRESH THEN
    RETURN cache[key].value
END IF

SET value TO load_expensive_value()
SET cache[key] TO {value: value, expires_at: NOW + lifetime}
RETURN value
```

The key and lifetime are part of correctness.

## Common mistakes

- caching without an invalidation rule;
- using an incomplete key;
- caching sensitive data too broadly.

## Exercise: Complete the key

If results differ by user and language, what must the key contain?

<details><summary>Show solution</summary>

Both the user identifier and language.

</details>

## Small challenge

Choose a lifetime and invalidation event for a published lesson.

## Continue the journey

- **Requires:** State and Persistence
- **Requires:** Complexity and Trade-offs
- **Next:** Logging and Observability
