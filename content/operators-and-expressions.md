---
id: operators-and-expressions
title: Operators and Expressions
summary: Learn how programs calculate, compare, and combine values.
level: beginner
learning_goal: Trace and write expressions using arithmetic and comparison operators.
system: programming-fundamentals
order: 4
status: draft
sources: []
prerequisites:
  - values-and-variables
  - data-types
relations:
  - target: values-and-variables
    type: requires
  - target: data-types
    type: requires
  - target: boolean-logic
    type: used-with
  - target: conditions
    type: used-with
last_reviewed: 2026-07-29
---

# Operators and Expressions

Programs do more than store values. They calculate totals, compare measurements,
and derive new information.

An **operator** describes an operation. An **expression** combines values,
variables, and operators to produce one value.

## Learning objective

After this article, you should be able to:

- identify the inputs and result of an expression;
- use arithmetic and comparison operators;
- trace nested expressions in a deliberate order;
- recognize invalid or unclear operations.

## Expressions produce values

This expression produces the number `8`:

```text
5 + 3
```

An expression can contain variables:

```text
SET price TO 8
SET quantity TO 3
SET total TO price * quantity
```

`price * quantity` is evaluated first. Its result, `24`, is stored in `total`.

## Arithmetic operators

Introductory pseudocode uses:

| Operator | Meaning | Example | Result |
|---|---|---|---:|
| `+` | addition | `7 + 3` | 10 |
| `-` | subtraction | `7 - 3` | 4 |
| `*` | multiplication | `7 * 3` | 21 |
| `/` | division | `8 / 2` | 4 |

The operands must have types for which the operation makes sense. These
operators are used for numbers in introductory examples.

## Comparison operators

A comparison produces a boolean value:

```text
SET has_won TO score IS AT LEAST target_score
```

The pseudocode guide defines:

- `IS EQUAL TO`
- `IS NOT EQUAL TO`
- `IS LESS THAN`
- `IS GREATER THAN`
- `IS AT MOST`
- `IS AT LEAST`

Examples:

```text
5 IS LESS THAN 8
"Ada" IS EQUAL TO "Ada"
attempts IS AT MOST 3
```

Each expression produces `TRUE` or `FALSE`.

## Evaluate from the inside out

Use parentheses when an expression contains multiple calculations:

```text
SET total TO (price * quantity) + shipping
```

Trace with `price = 8`, `quantity = 3`, and `shipping = 5`:

1. calculate `price * quantity`, producing `24`;
2. add `shipping`, producing `29`;
3. store `29` in `total`.

Do not depend on language-specific precedence rules when parentheses make the
intended order clearer.

## Expressions can use previous results

```text
SET subtotal TO price * quantity
SET tax TO subtotal * tax_rate
SET total TO subtotal + tax
```

Named intermediate values make the calculation easy to trace. A single larger
expression may be shorter, but shorter is not automatically clearer.

## Types restrict operations

This calculation has clear numeric meaning:

```text
SET remaining_attempts TO maximum_attempts - used_attempts
```

This one does not:

```text
SET result TO "Ada" - 3
```

A good algorithm does not rely on a real language to invent a meaning for an
invalid combination.

## Division needs a valid divisor

Division by zero is not a valid arithmetic result:

```text
SET average TO total / count
```

The algorithm must ensure that `count` is not zero before performing the
division. Conditions and error handling provide that control.

## Comparisons describe boundaries

These expressions differ at exactly `18`:

```text
age IS GREATER THAN 18
age IS AT LEAST 18
```

The first excludes `18`. The second includes it.

When a rule has a boundary, test:

- one value below it;
- the boundary itself;
- one value above it.

## Common mistakes

### Confusing assignment with comparison

Syntax Voyager avoids this ambiguity:

```text
SET score TO 10
score IS EQUAL TO 10
```

The first instruction stores a value. The second expression asks a question.

### Mixing incompatible types

Do not calculate with text until the algorithm explicitly converts it to a
number.

### Hiding the calculation order

Use parentheses or named intermediate values when a reader could reasonably
interpret the order differently.

### Recalculating without updating dependent values

An expression is evaluated when its instruction runs. Changing an input later
does not automatically update a previously stored result.

## Exercise: Trace the expressions

Given:

```text
SET price TO 6
SET quantity TO 4
SET shipping TO 3
SET subtotal TO price * quantity
SET total TO subtotal + shipping
SET free_shipping TO total IS AT LEAST 25
```

1. What is `subtotal`?
2. What is `total`?
3. What is `free_shipping`?

<details>
<summary>Show solution</summary>

1. `subtotal = 24`
2. `total = 27`
3. `free_shipping = TRUE`

</details>

## Small challenge

Write pseudocode that calculates the average of three scores: `8`, `10`, and
`12`. Use parentheses to make the intended order explicit.

<details>
<summary>Show one solution</summary>

```text
SET first_score TO 8
SET second_score TO 10
SET third_score TO 12
SET average TO (first_score + second_score + third_score) / 3
DISPLAY average
```

The displayed value is `10`.

</details>

## Continue the journey

- **Requires:** Values and Variables
- **Requires:** Data Types
- **Next:** Boolean Logic
- **Later:** Conditions
