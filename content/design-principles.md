---
id: design-principles
title: Design Principles
summary: Learn practical principles for cohesive, loosely coupled software.
level: intermediate
learning_goal: Improve cohesion and dependency direction without speculative abstraction.
system: programming-fundamentals
order: 46
status: draft
sources: []
prerequisites: [refactoring, architecture-boundaries-and-ports]
relations:
  - { target: refactoring, type: requires }
  - { target: architecture-boundaries-and-ports, type: requires }
last_reviewed: 2026-07-29
---

# Design Principles

Good design keeps related behavior together and limits how much one part must know about another.

## Learning objective

After this article, you can recognize cohesion, coupling, and dependency direction.

## Core idea

```text
MODULE lesson_rules
    FUNCTION may_publish(lesson)
        RETURN lesson.status IS EQUAL TO "reviewed"
    END FUNCTION
END MODULE
```

The rule lives with lesson behavior rather than in several user interfaces.

## Common mistakes

- treating principles as inflexible laws;
- adding interfaces with one speculative implementation;
- separating code that changes for the same reason.

## Exercise: Improve cohesion

Where should a lesson publishing rule live?

<details><summary>Show solution</summary>

With the lesson domain behavior shared by every interface.

</details>

## Small challenge

Find one dependency that points from domain rules toward infrastructure and reverse it with a port.

## Continue the journey

- **Requires:** Refactoring
- **Requires:** Architecture Boundaries and Ports
- **Next:** Distributed Systems Basics
