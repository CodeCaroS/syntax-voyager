---
id: code-review
title: Code Review
summary: Learn how review checks correctness, clarity, risk, and evidence.
level: intermediate
learning_goal: Review a change by prioritizing user impact and verifiable behavior.
system: programming-fundamentals
order: 44
status: draft
sources: []
prerequisites: [version-control, unit-testing]
relations:
  - { target: version-control, type: requires }
  - { target: unit-testing, type: requires }
last_reviewed: 2026-07-29
---

# Code Review

Code review examines whether a change solves its problem safely and remains understandable.

## Learning objective

After this article, you can separate blocking defects from optional preferences.

## Core idea

```text
FOR EACH changed_behavior IN change
    CHECK correctness
    CHECK failure_paths
    CHECK security_and_data_risk
    CHECK verification_evidence
END FOR
```

Review the behavior and boundaries before formatting preferences.

## Common mistakes

- commenting only on style;
- assuming tests cover what their names suggest;
- requesting broad redesign without a concrete defect.

## Exercise: Prioritize findings

Which matters more: a naming preference or possible data loss?

<details><summary>Show solution</summary>

Possible data loss is the blocking priority.

</details>

## Small challenge

Write one evidence-based review comment for an unvalidated API field.

## Continue the journey

- **Requires:** Version Control
- **Requires:** Unit Testing
- **Next:** Refactoring
