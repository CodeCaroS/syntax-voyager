---
id: complexity-and-trade-offs
title: Complexity and Trade-offs
summary: Learn how input size affects time and memory requirements.
level: intermediate
learning_goal: Compare constant, linear, and quadratic growth without language-specific timing.
system: programming-fundamentals
order: 26
status: draft
sources: []
prerequisites: [searching, sorting]
relations:
  - { target: searching, type: requires }
  - { target: sorting, type: requires }
last_reviewed: 2026-07-29
---

# Complexity and Trade-offs

Complexity describes how required work grows as the input becomes larger.

## Learning objective

After this article, you can distinguish constant, linear, and quadratic growth.

## Core idea

```text
FOR EACH left IN values
    FOR EACH right IN values
        COMPARE left WITH right
    END FOR
END FOR
```

If the list doubles, this nested work grows by about four times. That is quadratic growth.

## Common mistakes

- optimizing tiny inputs without evidence;
- ignoring memory costs;
- treating complexity as an exact runtime.

## Exercise: Classify the work

Visiting every item once has which growth?

<details><summary>Show solution</summary>

Linear growth.

</details>

## Small challenge

Compare searching a list with looking up a known key in a map.

## Continue the journey

- **Requires:** Searching
- **Requires:** Sorting
- **Next:** Modules and Dependencies
