---
id: loops
title: Loops
summary: Learn how programs repeat work while keeping progress and stopping conditions visible.
level: beginner
learning_goal: Choose a suitable loop and trace how its state changes on every repetition.
system: programming-fundamentals
order: 7
status: draft
sources: []
prerequisites:
  - values-and-variables
  - operators-and-expressions
  - conditions
relations:
  - target: values-and-variables
    type: requires
  - target: operators-and-expressions
    type: requires
  - target: conditions
    type: requires
last_reviewed: 2026-07-29
---

# Loops

Programs often repeat the same kind of work: count attempts, visit every item,
or continue until a goal is reached. A **loop** describes that repetition
without copying the same instructions many times.

Every useful loop answers two questions:

1. What work repeats?
2. When does the repetition stop?

## Learning objective

After this article, you should be able to:

- distinguish `FOR`, `FOR EACH`, and `WHILE` loops;
- trace a variable through several repetitions;
- identify the stopping condition;
- recognize an infinite loop;
- choose a loop that communicates the program's intent.

## Repeat a known number of times

Use `FOR` when the number of repetitions is known:

```text
FOR number FROM 1 TO 3
    DISPLAY number
END FOR
```

The loop displays `1`, `2`, and `3`. The loop variable `number` changes
automatically after each repetition.

## Visit every item

Use `FOR EACH` when the work applies to every value in a collection:

```text
SET names TO ["Ada", "Grace", "Linus"]

FOR EACH name IN names
    DISPLAY name
END FOR
```

The loop focuses on the values rather than their positions. This is usually the
clearest choice when every item receives the same treatment.

## Continue while a condition is true

Use `WHILE` when the number of repetitions depends on changing state:

```text
SET attempts TO 0

WHILE attempts IS LESS THAN 3
    DISPLAY "Trying"
    SET attempts TO attempts + 1
END WHILE
```

Trace the state:

| Before repetition | Condition | After repetition |
|---|---|---|
| `attempts = 0` | true | `attempts = 1` |
| `attempts = 1` | true | `attempts = 2` |
| `attempts = 2` | true | `attempts = 3` |
| `attempts = 3` | false | loop ends |

## Accumulate a result

A loop can build a result over time:

```text
SET total TO 0

FOR number FROM 1 TO 4
    SET total TO total + number
END FOR

DISPLAY total
```

`total` becomes `1`, then `3`, then `6`, then `10`. A variable used this way is
often called an **accumulator**.

## Skip work with a condition

Conditions inside a loop decide which items receive an action:

```text
SET temperatures TO [18, 31, 24, 35]

FOR EACH temperature IN temperatures
    IF temperature IS GREATER THAN 30 THEN
        DISPLAY temperature
    END IF
END FOR
```

The loop visits every value, but only `31` and `35` are displayed.

## Make progress visible

A `WHILE` loop must change something that can eventually make its condition
false:

```text
SET fuel TO 3

WHILE fuel IS GREATER THAN 0
    DISPLAY "Travelling"
    SET fuel TO fuel - 1
END WHILE
```

The update to `fuel` is the progress step. Without it, the loop would never
stop.

## Common mistakes

### Forgetting the progress step

```text
SET attempts TO 0

WHILE attempts IS LESS THAN 3
    DISPLAY "Trying"
END WHILE
```

`attempts` remains `0`, so the condition stays true forever.

### Starting or ending at the wrong value

Before writing a counting loop, state whether both boundaries are included.
In this guide, `FOR number FROM 1 TO 5` visits five numbers, including `1` and
`5`.

### Choosing `WHILE` for every problem

`WHILE` can express many loops, but `FOR EACH` communicates “visit every item”
more directly and needs less manual state.

### Changing a collection while visiting it

Adding or removing items during a `FOR EACH` loop can make it unclear which
items will be visited. Build a separate result collection unless the behavior
is explicitly defined.

## Exercise: Trace an accumulator

What is displayed?

```text
SET result TO 1

FOR number FROM 1 TO 4
    SET result TO result * number
END FOR

DISPLAY result
```

<details>
<summary>Show solution</summary>

The values of `result` are `1`, `2`, `6`, and `24`. The program displays `24`.

</details>

## Small challenge

Given `[3, 8, 2, 9, 5]`, count how many values are greater than `5`.

<details>
<summary>Show one solution</summary>

```text
SET values TO [3, 8, 2, 9, 5]
SET count TO 0

FOR EACH value IN values
    IF value IS GREATER THAN 5 THEN
        SET count TO count + 1
    END IF
END FOR

DISPLAY count
```

The displayed value is `2`.

</details>

## Continue the journey

- **Requires:** Values and Variables
- **Requires:** Operators and Expressions
- **Requires:** Conditions
- **Next:** Lists and Records

