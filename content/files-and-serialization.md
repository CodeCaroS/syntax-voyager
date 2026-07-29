---
id: files-and-serialization
title: Files and Serialization
summary: Learn how structured values become storable text and return safely.
level: intermediate
learning_goal: Serialize data, validate it when reading, and handle file failure.
system: programming-fundamentals
order: 29
status: draft
sources: []
prerequisites: [data-modeling, errors-and-input-validation]
relations:
  - { target: data-modeling, type: requires }
  - { target: errors-and-input-validation, type: requires }
last_reviewed: 2026-07-29
---

# Files and Serialization

Serialization converts structured values into a format that can be stored or transferred.

## Learning objective

After this article, you can separate encoding, storage, decoding, and validation.

## Core idea

```text
SET encoded TO SERIALIZE note
WRITE encoded TO "note.data"

SET raw TO READ "note.data"
SET decoded TO DESERIALIZE raw
SET note TO VALIDATE NOTE(decoded)
```

Reading is a trust boundary: valid syntax does not guarantee valid domain data.

## Common mistakes

- trusting decoded data without validation;
- assuming files always exist;
- overwriting valuable data before a safe write completes.

## Exercise: Identify the boundary

When should a stored record be validated?

<details><summary>Show solution</summary>

Immediately after decoding and before the program relies on its fields.

</details>

## Small challenge

Describe how to save to a temporary file before replacing the original.

## Continue the journey

- **Requires:** Data Modeling
- **Requires:** Errors and Input Validation
- **Next:** Databases and Queries
