---
id: authentication-and-authorization
title: Authentication and Authorization
summary: Learn the difference between proving identity and checking permission.
level: intermediate
learning_goal: Apply authentication before a separate authorization decision.
system: programming-fundamentals
order: 33
status: draft
sources: []
prerequisites: [http-and-web-basics, errors-and-input-validation]
relations:
  - { target: http-and-web-basics, type: requires }
  - { target: errors-and-input-validation, type: requires }
last_reviewed: 2026-07-29
---

# Authentication and Authorization

Authentication asks “Who are you?” Authorization asks “May you do this?”

## Learning objective

After this article, you can keep identity proof separate from permission rules.

## Core idea

```text
SET user TO AUTHENTICATE request.credentials
IF user IS ERROR THEN RETURN RESPONSE(401)

IF NOT MAY_EDIT(user, note) THEN
    RETURN RESPONSE(403)
END IF
```

A known user can still lack permission for a particular note.

## Common mistakes

- treating login as permission for everything;
- trusting a user identifier supplied by the client;
- revealing protected data before the permission check.

## Exercise: Distinguish failures

Is a signed-in learner automatically allowed to edit another learner's work?

<details><summary>Show solution</summary>

No. Authentication succeeded, but authorization must still evaluate ownership and policy.

</details>

## Small challenge

Write rules for learners, mentors, and administrators viewing a private lesson.

## Continue the journey

- **Requires:** HTTP and Web Basics
- **Requires:** Errors and Input Validation
- **Next:** Security Fundamentals
