---
id: parameters-and-return-values
title: Parameters and Return Values
summary: Learn how functions receive information and return useful results.
level: beginner
learning_goal: Design a function with clear inputs and one predictable result.
system: programming-fundamentals
order: 18
status: draft
sources: []
prerequisites: [functions]
relations:
  - { target: functions, type: requires }
last_reviewed: 2026-07-29
---

# Parameters and Return Values

Parameters describe what a function needs. A return value gives its result back to the caller.

## Learning objective

After this article, you can choose meaningful parameters and distinguish returning from displaying.

## Core idea

```text
FUNCTION calculate_total(price, quantity)
    RETURN price * quantity
END FUNCTION

SET total TO calculate_total(8, 3)
```

The arguments `8` and `3` become the parameters `price` and `quantity`. The caller receives `24`.

## Common mistakes

- hiding required information in shared state;
- returning several unrelated results;
- displaying a result when the caller needs to reuse it.

## Exercise: Follow the arguments

What does `calculate_total(5, 4)` return?

<details><summary>Show solution</summary>

It returns `20`.

</details>

## Small challenge

Write `calculate_area(width, height)` and call it with two values.

## Continue the journey

- **Requires:** Functions
- **Next:** Scope and Lifetime
