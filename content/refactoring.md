---
id: refactoring
title: Refactoring
summary: Learn how to improve structure without changing observable behavior.
level: intermediate
learning_goal: Refactor one proven seam while preserving behavior with tests.
system: programming-fundamentals
order: 45
status: draft
sources: []
prerequisites: [code-review, integration-testing, modules-and-dependencies]
relations:
  - { target: code-review, type: requires }
  - { target: integration-testing, type: requires }
  - { target: modules-and-dependencies, type: requires }
last_reviewed: 2026-07-29
---

# Refactoring

Refactoring improves internal structure while keeping externally observable behavior stable.

## Learning objective

After this article, you can choose a small seam, preserve evidence, and stop when the goal is met.

## Core idea

```text
ASSERT current_behavior PASSES
MOVE calculation INTO calculate_total
ASSERT current_behavior PASSES
```

Small verified steps make failures easy to locate.

## Common mistakes

- mixing refactoring with new behavior;
- extracting abstractions without repeated need;
- moving many seams before running checks.

## Exercise: Classify the change

Is changing an error message always behavior-preserving?

<details><summary>Show solution</summary>

No. Callers or users may rely on that observable message.

</details>

## Small challenge

Split one long function into two focused operations without changing its result.

## Continue the journey

- **Requires:** Code Review
- **Requires:** Integration Testing
- **Requires:** Modules and Dependencies
- **Next:** Design Principles
