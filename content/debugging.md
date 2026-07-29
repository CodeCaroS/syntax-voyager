---
id: debugging
title: Debugging
summary: Learn how to reproduce, isolate, explain, and verify software defects.
level: intermediate
learning_goal: Turn an observed symptom into a tested root-cause explanation.
system: programming-fundamentals
order: 40
status: draft
sources: []
prerequisites: [logging-and-observability, errors-and-input-validation]
relations:
  - { target: logging-and-observability, type: requires }
  - { target: errors-and-input-validation, type: requires }
last_reviewed: 2026-07-29
---

# Debugging

Debugging is a controlled investigation: reproduce the symptom, narrow the cause, change one thing, and verify.

## Learning objective

After this article, you can distinguish evidence from guesses and preserve a failing example.

## Core idea

```text
SET smallest_failing_input TO REDUCE original_input
ASSERT operation(smallest_failing_input) PRODUCES failure

APPLY root_cause_fix
ASSERT operation(smallest_failing_input) PRODUCES expected_result
```

A small reproducible case makes both diagnosis and regression testing easier.

## Common mistakes

- changing several causes at once;
- fixing the visible symptom in only one caller;
- declaring success without rerunning the failing path.

## Exercise: Choose the next step

What comes after reproducing a failure?

<details><summary>Show solution</summary>

Reduce and isolate it before changing code.

</details>

## Small challenge

Write a five-step debugging record for an invalid state transition.

## Continue the journey

- **Requires:** Logging and Observability
- **Requires:** Errors and Input Validation
- **Next:** Unit Testing
