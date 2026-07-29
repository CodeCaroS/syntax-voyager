---
id: security-fundamentals
title: Security Fundamentals
summary: Learn how trust boundaries, least privilege, and safe defaults reduce risk.
level: intermediate
learning_goal: Identify assets, threats, boundaries, and minimum required permissions.
system: programming-fundamentals
order: 34
status: draft
sources: []
prerequisites: [authentication-and-authorization, api-boundaries-and-validation]
relations:
  - { target: authentication-and-authorization, type: requires }
  - { target: api-boundaries-and-validation, type: requires }
last_reviewed: 2026-07-29
---

# Security Fundamentals

Security begins by identifying valuable assets, untrusted input, and the permissions an operation truly needs.

## Learning objective

After this article, you can apply least privilege and fail-closed decisions.

## Core idea

```text
IF permission_check IS ERROR THEN
    DENY ACTION
END IF

ALLOW ONLY IF permission_check.value IS TRUE
```

An uncertain permission result must not become accidental access.

## Common mistakes

- trusting internal-looking input;
- storing secrets in source code;
- returning detailed internal errors to untrusted callers.

## Exercise: Choose the safe default

What should happen when a permission service is unavailable?

<details><summary>Show solution</summary>

Deny the protected action until permission can be established.

</details>

## Small challenge

List the assets and trust boundaries of a lesson publishing feature.

## Continue the journey

- **Requires:** Authentication and Authorization
- **Requires:** API Boundaries and Validation
- **Next:** Concurrency
