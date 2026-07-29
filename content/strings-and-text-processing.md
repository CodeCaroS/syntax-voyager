---
id: strings-and-text-processing
title: Strings and Text Processing
summary: Learn how programs inspect, combine, and transform text.
level: beginner
learning_goal: Process text deliberately without relying on hidden conversions.
system: programming-fundamentals
order: 20
status: draft
sources: []
prerequisites: [data-types, loops]
relations:
  - { target: data-types, type: requires }
  - { target: loops, type: requires }
last_reviewed: 2026-07-29
---

# Strings and Text Processing

Text is a sequence of characters. Programs can compare, search, split, and combine that sequence.

## Learning objective

After this article, you can normalize text and visit its parts safely.

## Core idea

```text
SET normalized_name TO LOWERCASE(TRIM(name))
SET words TO SPLIT sentence AT " "

FOR EACH word IN words
    DISPLAY word
END FOR
```

Normalization makes comparisons more predictable while preserving the original when it is still needed.

## Common mistakes

- confusing an empty text with `NOTHING`;
- comparing user text without normalization;
- assuming every character uses one byte.

## Exercise: Normalize a command

How should `"  START "` be prepared for comparison?

<details><summary>Show solution</summary>

Trim the surrounding spaces and convert it to lowercase, producing `"start"`.

</details>

## Small challenge

Count the words in a sentence after trimming repeated outer spaces.

## Continue the journey

- **Requires:** Data Types
- **Requires:** Loops
- **Next:** Sets and Maps
