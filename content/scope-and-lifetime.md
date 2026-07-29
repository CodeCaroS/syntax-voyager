---
id: scope-and-lifetime
title: Scope and Lifetime
summary: Learn where variables are available and how long their values exist.
level: beginner
learning_goal: Identify whether a variable belongs to a function or shared program state.
system: programming-fundamentals
order: 19
status: draft
sources: []
prerequisites: [values-and-variables, functions]
relations:
  - { target: values-and-variables, type: requires }
  - { target: functions, type: requires }
last_reviewed: 2026-07-29
---

# Scope and Lifetime

**Scope** describes where a name can be used. **Lifetime** describes how long its value exists.

## Learning objective

After this article, you can trace local variables and avoid accidental shared state.

## Core idea

```text
FUNCTION greet(name)
    SET message TO "Hello " + name
    RETURN message
END FUNCTION
```

`name` and `message` belong to one call. Code outside the function should not depend on them.

## Common mistakes

- expecting a local variable to exist outside its function;
- reusing one shared variable for unrelated work;
- changing shared state without making that effect visible.

## Exercise: Find the local names

Which names are local in `greet`?

<details><summary>Show solution</summary>

Both `name` and `message` are local to the function call.

</details>

## Small challenge

Rewrite a function so every required value arrives through a parameter.

## Continue the journey

- **Requires:** Values and Variables
- **Requires:** Functions
- **Next:** Strings and Text Processing
