---
id: values-and-variables
title: Values and Variables
summary: Learn how programs name, store, read, and change information.
level: beginner
learning_goal: Trace variable values and use variables to describe changing state.
system: programming-fundamentals
order: 2
status: draft
sources: []
prerequisites:
  - algorithms-and-pseudocode
relations:
  - target: algorithms-and-pseudocode
    type: requires
  - target: data-types
    type: used-with
  - target: operators-and-expressions
    type: used-with
last_reviewed: 2026-07-29
---

# Values and Variables

A program works with information. A name, a price, the current score, and
whether a user is signed in are all examples of information a program may need.

A **value** is the information itself. A **variable** is a name a program uses
to refer to a value.

## Learning objective

After this article, you should be able to:

- distinguish a value from a variable;
- create and update variables in pseudocode;
- trace how variable values change;
- choose clear names for variables.

## Values

These are values:

```text
42
"Ada"
TRUE
```

The values mean different things:

- `42` is a number;
- `"Ada"` is text;
- `TRUE` is a boolean value representing yes or no.

The next article, **Data Types**, examines these categories in detail. For now,
it is enough to recognize that programs work with different kinds of values.

## Variables give values names

Use `SET` to associate a name with a value:

```text
SET score TO 0
SET player_name TO "Ada"
SET game_finished TO FALSE
```

The variable names explain what the values mean. Compare:

```text
SET x TO 3
```

with:

```text
SET remaining_attempts TO 3
```

Both variables contain the same value, but the second name communicates its
purpose.

## Variables can change

The word *variable* indicates that its value can vary:

```text
SET score TO 0
SET score TO 10
SET score TO 25
```

At the end, `score` contains `25`. Each `SET` replaces the previous value.

A new value can be calculated from the current value:

```text
SET score TO 10
SET score TO score + 5
```

The second instruction means:

1. read the current value of `score`;
2. add `5`;
3. store the result back in `score`.

The final value is `15`.

## Tracing state

The complete collection of values a program currently remembers is its
**state**. Tracing a program means following how that state changes one
instruction at a time.

```text
SET apples TO 4
SET eaten TO 1
SET apples TO apples - eaten
SET eaten TO eaten + 1
```

| After instruction | `apples` | `eaten` |
|---|---:|---:|
| `SET apples TO 4` | 4 | not set |
| `SET eaten TO 1` | 4 | 1 |
| `SET apples TO apples - eaten` | 3 | 1 |
| `SET eaten TO eaten + 1` | 3 | 2 |

Tracing state is one of the simplest and most useful debugging techniques.

## Calculated values do not update automatically

Consider this program:

```text
SET price TO 10
SET total TO price * 2
SET price TO 12
DISPLAY total
```

The program displays `20`, not `24`.

When `total` is set, the expression `price * 2` is calculated immediately. The
result `20` is stored in `total`. Changing `price` later does not repeat the old
calculation.

To update the total, the program must calculate it again:

```text
SET price TO 12
SET total TO price * 2
```

## Read before use

A program cannot use a variable before it has a value:

```text
DISPLAY final_score
```

What should `final_score` contain? The program has not said. Depending on the
real programming language, this may cause an error or produce an unintended
value.

Set variables before reading them:

```text
SET final_score TO 0
DISPLAY final_score
```

## Choose useful names

A useful variable name:

- describes what the value represents;
- distinguishes similar values;
- avoids unnecessary abbreviations;
- remains accurate when the value changes.

Prefer:

```text
SET maximum_attempts TO 3
SET current_attempt TO 1
```

over:

```text
SET max TO 3
SET x TO 1
```

Short names can be reasonable in a tiny mathematical example, but application
state usually deserves descriptive names.

## Common mistakes

### Treating a variable as permanent

Do not assume that a variable still contains its initial value. Read the
instructions in order and track every update.

### Confusing the name with the value

In this instruction:

```text
SET score TO 10
```

`score` is the variable name. `10` is the value.

### Expecting linked variables

Setting one variable from another copies the value at that moment:

```text
SET first_score TO 10
SET second_score TO first_score
SET first_score TO 20
```

`second_score` is still `10`.

## Exercise: Trace the journey

Trace the final values without running the pseudocode:

```text
SET fuel TO 10
SET distance TO 0

SET fuel TO fuel - 3
SET distance TO distance + 5
SET fuel TO fuel - 2
SET distance TO distance + 4
```

Answer these questions:

1. What is the final value of `fuel`?
2. What is the final value of `distance`?
3. How many times is each variable updated after its initial value?

<details>
<summary>Show solution</summary>

`fuel` starts at `10`, then becomes `7`, then `5`.

`distance` starts at `0`, then becomes `5`, then `9`.

Final state:

```text
fuel = 5
distance = 9
```

Each variable is updated twice after its initial value is set.

</details>

## Small challenge

Write pseudocode that:

1. stores a product price of `8`;
2. stores a quantity of `3`;
3. calculates the total price;
4. displays the total.

<details>
<summary>Show one solution</summary>

```text
SET product_price TO 8
SET quantity TO 3
SET total_price TO product_price * quantity
DISPLAY total_price
```

The displayed value is `24`.

</details>

## Continue the journey

- **Requires:** Algorithms and Pseudocode
- **Next:** Data Types
- **Next:** Operators and Expressions
- **Later:** Scope
