---
id: modules-and-dependencies
title: Modules and Dependencies
summary: Learn how modules group behavior and declare what they need.
level: intermediate
learning_goal: Separate related responsibilities and keep dependencies explicit.
system: programming-fundamentals
order: 27
status: draft
sources: []
prerequisites: [functions, architecture-boundaries-and-ports]
relations:
  - { target: functions, type: requires }
  - { target: architecture-boundaries-and-ports, type: requires }
last_reviewed: 2026-07-29
---

# Modules and Dependencies

A module groups related behavior behind a small public surface. A dependency is another capability it needs.

## Learning objective

After this article, you can identify a module boundary and avoid hidden dependencies.

## Core idea

```text
MODULE order_calculation
    EXPORT calculate_total
    KEEP calculate_tax PRIVATE
END MODULE
```

Callers depend on the exported behavior, not every internal helper.

## Common mistakes

- exporting every function;
- creating modules that only forward calls;
- allowing dependencies in both directions.

## Exercise: Choose the public behavior

Should a private tax helper be exported when only `calculate_total` uses it?

<details><summary>Show solution</summary>

No. Keep the helper private until another module genuinely needs the contract.

</details>

## Small challenge

Define a module with one public operation and two private helpers.

## Continue the journey

- **Requires:** Functions
- **Requires:** Architecture Boundaries and Ports
- **Next:** Data Modeling
