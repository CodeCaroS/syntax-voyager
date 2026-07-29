---
id: http-and-web-basics
title: HTTP and Web Basics
summary: Learn how web clients exchange requests and responses with servers.
level: intermediate
learning_goal: Read an HTTP-style request and choose a meaningful response.
system: programming-fundamentals
order: 32
status: draft
sources: []
prerequisites: [api-boundaries-and-validation]
relations:
  - { target: api-boundaries-and-validation, type: requires }
last_reviewed: 2026-07-29
---

# HTTP and Web Basics

HTTP is a request-response protocol. A request names an operation and resource; a response reports the outcome.

## Learning objective

After this article, you can distinguish methods, paths, headers, bodies, and status.

## Core idea

```text
REQUEST
    METHOD: GET
    PATH: /lessons/42

RESPONSE
    STATUS: 200
    BODY: lesson
```

The method communicates intent. The status communicates the result.

## Common mistakes

- changing state through a read operation;
- returning success for failed validation;
- assuming one request shares memory with the next.

## Exercise: Choose the method

Should reading a lesson change its content?

<details><summary>Show solution</summary>

No. A read request should be safe from content-changing effects.

</details>

## Small challenge

Sketch a request and response for creating a note.

## Continue the journey

- **Requires:** API Boundaries and Validation
- **Next:** Authentication and Authorization
