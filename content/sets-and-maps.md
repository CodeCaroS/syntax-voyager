---
id: sets-and-maps
title: Sets and Maps
summary: Learn how sets store unique values and maps associate keys with values.
level: beginner
learning_goal: Choose a set for membership and a map for key-based lookup.
system: programming-fundamentals
order: 21
status: draft
sources: []
prerequisites: [lists-and-records]
relations:
  - { target: lists-and-records, type: requires }
last_reviewed: 2026-07-29
---

# Sets and Maps

A **set** keeps unique values. A **map** stores a value under a key.

## Learning objective

After this article, you can model membership and fast key-based lookup.

## Core idea

```text
SET visited TO SET("home", "search")
ADD "article" TO visited

SET scores TO {}
SET scores["Ada"] TO 10
DISPLAY scores["Ada"]
```

Use a list when order matters, a set for uniqueness, and a map for lookup by key.

## Common mistakes

- expecting a set to preserve duplicates;
- using a list when every lookup searches by identifier;
- reading a missing map key without checking it.

## Exercise: Pick the structure

Which structure best stores unique permissions?

<details><summary>Show solution</summary>

A set, because membership and uniqueness are the important rules.

</details>

## Small challenge

Build a map that counts how often each word appears.

## Continue the journey

- **Requires:** Lists and Records
- **Next:** Stacks and Queues
