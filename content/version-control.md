---
id: version-control
title: Version Control
summary: Learn how commits preserve meaningful changes and support collaboration.
level: beginner
learning_goal: Create a focused change history that can be reviewed and restored.
system: programming-fundamentals
order: 43
status: draft
sources: []
prerequisites: [modules-and-dependencies]
relations:
  - { target: modules-and-dependencies, type: requires }
last_reviewed: 2026-07-29
---

# Version Control

Version control records how a project changes and lets collaborators compare, combine, and restore work.

## Learning objective

After this article, you can describe a focused commit and inspect its difference.

## Core idea

```text
SET change TO {
    purpose: "reject invalid scores",
    files: ["score_validator", "score_validator_test"],
    verification: "boundary cases pass"
}
RECORD COMMIT change
```

A commit should tell one coherent story.

## Common mistakes

- mixing unrelated changes;
- committing generated secrets;
- writing messages that describe only filenames.

## Exercise: Split the work

Should a validation fix and unrelated redesign share one commit?

<details><summary>Show solution</summary>

No. Separate them so each change can be understood and reverted independently.

</details>

## Small challenge

Write a concise commit message for fixing duplicate form submission.

## Continue the journey

- **Requires:** Modules and Dependencies
- **Next:** Code Review
