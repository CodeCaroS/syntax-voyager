---
id: recursion
title: Recursion
summary: Learn how a function can solve a problem by calling itself on a smaller case.
level: intermediate
learning_goal: Trace recursive calls and identify a terminating base case.
system: programming-fundamentals
order: 23
status: draft
sources: []
prerequisites: [functions, conditions]
relations:
  - { target: functions, type: requires }
  - { target: conditions, type: requires }
last_reviewed: 2026-07-29
---

# Recursion

Recursion solves a problem by reducing it until a simple **base case** is reached.

## Learning objective

After this article, you can trace a recursive call chain and prove that it stops.

## Core idea

```text
FUNCTION countdown(number)
    IF number IS EQUAL TO 0 THEN
        RETURN
    END IF
    DISPLAY number
    countdown(number - 1)
END FUNCTION
```

Each call uses a smaller number. Zero ends the chain.

## Common mistakes

- omitting the base case;
- recursing without reducing the problem;
- choosing recursion when a loop is clearer.

## Exercise: Trace the calls

What does `countdown(3)` display?

<details><summary>Show solution</summary>

It displays `3`, `2`, and `1`.

</details>

## Small challenge

Write a recursive function that adds the numbers from `1` to `n`.

## Continue the journey

- **Requires:** Functions
- **Requires:** Conditions
- **Next:** Searching
