---
id: lists-and-records
title: Lists and Records
summary: Learn how lists collect similar values and records group related facts.
level: beginner
learning_goal: Model a small collection with lists and records and traverse it safely.
system: programming-fundamentals
order: 8
status: draft
sources: []
prerequisites:
  - data-types
  - values-and-variables
  - loops
relations:
  - target: data-types
    type: requires
  - target: values-and-variables
    type: requires
  - target: loops
    type: requires
last_reviewed: 2026-07-29
---

# Lists and Records

A single variable stores one value. Real programs often need a group of values
or several facts that belong together.

A **list** stores a sequence of values. A **record** stores named fields that
describe one thing.

## Learning objective

After this article, you should be able to:

- create and update lists;
- visit every list item;
- read and update record fields;
- combine lists and records;
- choose a structure that matches the shape of the information.

## Lists store a sequence

```text
SET scores TO [10, 20, 30]
DISPLAY LENGTH OF scores
```

The length is `3`. Append a new value:

```text
APPEND 40 TO scores
```

The list is now `[10, 20, 30, 40]`.

## Visit list values

```text
FOR EACH score IN scores
    DISPLAY score
END FOR
```

Use a position only when the position itself matters. In this introductory
pseudocode, positions begin at `1`:

```text
DISPLAY scores[1]
```

This displays `10`.

## Records give facts names

```text
SET learner TO {
    name: "Ada",
    completed_lessons: 4,
    active: TRUE
}
```

Read fields by name:

```text
DISPLAY learner.name
DISPLAY learner.completed_lessons
```

Update one field without replacing the entire record:

```text
SET learner.completed_lessons TO 5
```

## Combine lists and records

A list of records can describe several related things:

```text
SET learners TO [
    {name: "Ada", score: 8},
    {name: "Grace", score: 10},
    {name: "Linus", score: 6}
]

FOR EACH learner IN learners
    DISPLAY learner.name
    DISPLAY learner.score
END FOR
```

The list answers “which learners?” Each record answers “what do we know about
this learner?”

## Build a filtered list

Keep the original collection unchanged and build a result:

```text
SET passing_learners TO []

FOR EACH learner IN learners
    IF learner.score IS AT LEAST 8 THEN
        APPEND learner TO passing_learners
    END IF
END FOR
```

This makes the input and result easy to compare.

## Lists and records express different questions

Use a list when:

- order matters;
- there may be zero, one, or many values;
- the same action applies to every item.

Use a record when:

- fields have different meanings;
- each field needs a name;
- the facts describe one concept.

## Common mistakes

### Mixing unrelated values

```text
SET learner TO ["Ada", 8, TRUE]
```

The positions do not explain their meaning. A record is clearer:

```text
SET learner TO {name: "Ada", score: 8, active: TRUE}
```

### Reading outside the list

If a list has three items, position `4` does not exist. Check the length before
using a position received from input.

### Assuming every record has every field

Validate data from outside the program before reading required fields.

### Modifying the input while filtering

Removing items from a list while visiting it can skip values. Build a separate
result list.

## Exercise: Read the structure

What is displayed?

```text
SET missions TO [
    {name: "Orbit", completed: TRUE},
    {name: "Landing", completed: FALSE}
]

FOR EACH mission IN missions
    IF mission.completed THEN
        DISPLAY mission.name
    END IF
END FOR
```

<details>
<summary>Show solution</summary>

Only `Orbit` is displayed because its `completed` field is `TRUE`.

</details>

## Small challenge

Create a list of three products. Each product has a `name` and `price`. Display
the names of products whose price is less than `20`.

<details>
<summary>Show one solution</summary>

```text
SET products TO [
    {name: "Notebook", price: 8},
    {name: "Keyboard", price: 45},
    {name: "Cable", price: 12}
]

FOR EACH product IN products
    IF product.price IS LESS THAN 20 THEN
        DISPLAY product.name
    END IF
END FOR
```

The program displays `Notebook` and `Cable`.

</details>

## Continue the journey

- **Requires:** Data Types
- **Requires:** Values and Variables
- **Requires:** Loops
- **Next:** Errors and Input Validation

