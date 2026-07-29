---
id: searching
title: Searching
summary: Learn how programs locate a value in a collection.
level: intermediate
learning_goal: Implement linear search and explain when sorted data enables faster search.
system: programming-fundamentals
order: 24
status: draft
sources: []
prerequisites: [loops, lists-and-records]
relations:
  - { target: loops, type: requires }
  - { target: lists-and-records, type: requires }
last_reviewed: 2026-07-29
---

# Searching

Searching asks whether a target exists and, often, where it appears.

## Learning objective

After this article, you can trace a linear search and state its stopping rule.

## Core idea

```text
FUNCTION find_name(names, target)
    FOR EACH name IN names
        IF name IS EQUAL TO target THEN
            RETURN name
        END IF
    END FOR
    RETURN NOTHING
END FUNCTION
```

The function stops at the first match and returns `NOTHING` if none exists.

## Common mistakes

- forgetting the not-found result;
- continuing after a match;
- using binary search on unsorted data.

## Exercise: Count comparisons

How many comparisons find `8` in `[3, 5, 8, 10]`?

<details><summary>Show solution</summary>

Three comparisons.

</details>

## Small challenge

Return the first record whose `id` matches a target.

## Continue the journey

- **Requires:** Loops
- **Requires:** Lists and Records
- **Next:** Sorting
