---
id: sorting
title: Sorting
summary: Learn how comparison rules arrange values into a predictable order.
level: intermediate
learning_goal: Trace a simple sorting pass and define the ordering rule explicitly.
system: programming-fundamentals
order: 25
status: draft
sources: []
prerequisites: [loops, lists-and-records]
relations:
  - { target: loops, type: requires }
  - { target: lists-and-records, type: requires }
last_reviewed: 2026-07-29
---

# Sorting

Sorting arranges values according to a comparison rule such as ascending score or newest date.

## Learning objective

After this article, you can describe a stable ordering rule and trace one sorting pass.

## Core idea

```text
FOR position FROM 1 TO LENGTH OF values - 1
    IF values[position] IS GREATER THAN values[position + 1] THEN
        SWAP values[position] WITH values[position + 1]
    END IF
END FOR
```

One pass moves larger neighboring values toward the end.

## Common mistakes

- sorting without defining ties;
- changing the source list unexpectedly;
- comparing text as if it were a number.

## Exercise: Trace one pass

What becomes of `[3, 1, 2]` after one complete pass?

<details><summary>Show solution</summary>

It becomes `[1, 2, 3]`.

</details>

## Small challenge

Sort learner records by score, then by name when scores match.

## Continue the journey

- **Requires:** Loops
- **Requires:** Lists and Records
- **Next:** Complexity and Trade-offs
