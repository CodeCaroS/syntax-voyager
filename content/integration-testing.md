---
id: integration-testing
title: Integration Testing
summary: Learn how tests verify boundaries working together.
level: intermediate
learning_goal: Test one important path across real module or persistence boundaries.
system: programming-fundamentals
order: 42
status: draft
sources: []
prerequisites: [unit-testing, databases-and-queries]
relations:
  - { target: unit-testing, type: requires }
  - { target: databases-and-queries, type: requires }
last_reviewed: 2026-07-29
---

# Integration Testing

An integration test verifies that two or more real parts agree on their contract.

## Learning objective

After this article, you can select a boundary where combined behavior deserves proof.

## Core idea

```text
TEST "saved lesson can be loaded"
    SET store TO TEST DATABASE
    store.save({id: "lesson-1", title: "Loops"})

    SET loaded TO store.find_by_id("lesson-1")
    ASSERT loaded.title IS EQUAL TO "Loops"
END TEST
```

This checks mapping and persistence together.

## Common mistakes

- replacing every dependency with a fake;
- testing too many unrelated systems at once;
- sharing dirty test data between cases.

## Exercise: Pick the boundary

Does a database adapter need a real database integration test?

<details><summary>Show solution</summary>

Yes. Its main responsibility is translating to and from that database.

</details>

## Small challenge

Test an API handler, domain operation, and test store through one request.

## Continue the journey

- **Requires:** Unit Testing
- **Requires:** Databases and Queries
- **Next:** Version Control
