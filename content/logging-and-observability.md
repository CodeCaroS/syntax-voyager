---
id: logging-and-observability
title: Logging and Observability
summary: Learn how logs, metrics, and traces explain a running system.
level: advanced
learning_goal: Record useful operational context without leaking sensitive data.
system: programming-fundamentals
order: 39
status: draft
sources: []
prerequisites: [errors-and-input-validation, events-and-notifications]
relations:
  - { target: errors-and-input-validation, type: requires }
  - { target: events-and-notifications, type: requires }
last_reviewed: 2026-07-29
---

# Logging and Observability

Observability helps explain what a running system is doing through logs, metrics, and traces.

## Learning objective

After this article, you can choose useful context and avoid sensitive output.

## Core idea

```text
RECORD LOG {
    operation: "publish_lesson",
    lesson_id: lesson.id,
    outcome: "failed",
    error_code: result.code
}
```

Stable identifiers connect related events without copying entire records.

## Common mistakes

- logging passwords, tokens, or personal content;
- writing messages without operation identifiers;
- recording errors without monitoring them.

## Exercise: Remove the secret

Should an authentication log contain the submitted password?

<details><summary>Show solution</summary>

Never. Record the operation and outcome without the secret.

</details>

## Small challenge

Choose one log, metric, and trace field for a slow lesson search.

## Continue the journey

- **Requires:** Errors and Input Validation
- **Requires:** Events and Notifications
- **Next:** Debugging
