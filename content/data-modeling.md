---
id: data-modeling
title: Data Modeling
summary: Learn how records, identifiers, and relationships represent a domain.
level: intermediate
learning_goal: Model one concept with stable identity, fields, and explicit relationships.
system: programming-fundamentals
order: 28
status: draft
sources: []
prerequisites: [lists-and-records, state-and-persistence]
relations:
  - { target: lists-and-records, type: requires }
  - { target: state-and-persistence, type: requires }
last_reviewed: 2026-07-29
---

# Data Modeling

A data model describes the concepts a program remembers and the relationships between them.

## Learning objective

After this article, you can distinguish identity from display fields and reference related records explicitly.

## Core idea

```text
SET lesson TO {
    id: "lesson-42",
    title: "Loops",
    author_id: "author-7",
    status: "draft"
}
```

The identifier remains stable even if the title changes. `author_id` connects the lesson to another record.

## Common mistakes

- using a mutable title as identity;
- storing the same fact in several places;
- making optional and required fields unclear.

## Exercise: Find the identity

Which field should links use when a lesson title may change?

<details><summary>Show solution</summary>

Use the stable `id`.

</details>

## Small challenge

Model a learner, course, and enrollment between them.

## Continue the journey

- **Requires:** Lists and Records
- **Requires:** State and Persistence
- **Next:** Files and Serialization
