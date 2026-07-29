---
id: unit-testing
title: Unit Testing
summary: Learn how focused tests verify one behavior with controlled inputs.
level: intermediate
learning_goal: Write a focused test with one observable behavioral claim.
system: programming-fundamentals
order: 41
status: draft
sources: []
prerequisites: [functions, testing-state-transitions]
relations:
  - { target: functions, type: requires }
  - { target: testing-state-transitions, type: requires }
last_reviewed: 2026-07-29
---

# Unit Testing

A unit test verifies a focused behavior with controlled inputs and a clear expected result.

## Learning objective

After this article, you can arrange state, perform one action, and assert the outcome.

## Core idea

```text
TEST "discount is applied"
    SET result TO calculate_discount(100, 0.20)
    ASSERT result IS EQUAL TO 20
END TEST
```

The test describes behavior rather than private implementation steps.

## Common mistakes

- asserting several unrelated behaviors;
- testing private helper calls instead of results;
- omitting boundary and error cases.

## Exercise: Name the behavior

What should a test title communicate?

<details><summary>Show solution</summary>

The situation and expected behavior.

</details>

## Small challenge

Test a validator with one valid and two invalid inputs.

## Continue the journey

- **Requires:** Functions
- **Requires:** Testing State Transitions
- **Next:** Integration Testing
