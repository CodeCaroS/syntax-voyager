---
id: conditions
title: Conditions
summary: Learn how programs choose which instructions to execute.
level: beginner
learning_goal: Trace and write conditional branches using boolean expressions.
system: programming-fundamentals
order: 6
status: draft
sources: []
prerequisites:
  - values-and-variables
  - operators-and-expressions
  - boolean-logic
relations:
  - target: values-and-variables
    type: requires
  - target: operators-and-expressions
    type: requires
  - target: boolean-logic
    type: requires
last_reviewed: 2026-07-29
---

# Conditions

Programs often need to make decisions. A shop applies free shipping only when
an order is large enough. A game ends when the player has no lives left. A
login succeeds only when the supplied information is valid.

A **condition** lets a program choose which instructions to execute.

## Learning objective

After this article, you should be able to:

- explain how a boolean expression controls a branch;
- trace `IF`, `ELSE IF`, and `ELSE`;
- combine conditions with `AND`, `OR`, and `NOT`;
- choose boundaries that handle every relevant value.

## A condition is a yes-or-no question

A condition must produce either `TRUE` or `FALSE`.

```text
SET age TO 20
SET is_adult TO age IS AT LEAST 18
```

The expression `age IS AT LEAST 18` is `TRUE`, so `is_adult` receives `TRUE`.

Common conditions include:

```text
score IS GREATER THAN 100
name IS EQUAL TO "Ada"
attempts IS AT MOST 3
game_finished IS EQUAL TO FALSE
```

## Run instructions only when a condition is true

Use `IF` to execute instructions conditionally:

```text
IF age IS AT LEAST 18 THEN
    DISPLAY "Access granted"
END IF
```

If the condition is `TRUE`, the program displays the message. If it is `FALSE`,
the program skips the instructions between `THEN` and `END IF`.

Instructions after `END IF` continue normally:

```text
IF age IS AT LEAST 18 THEN
    DISPLAY "Access granted"
END IF

DISPLAY "Check complete"
```

`"Check complete"` is always displayed.

## Choose between two branches

Use `ELSE` when exactly one of two paths should run:

```text
IF balance IS AT LEAST price THEN
    DISPLAY "Purchase accepted"
ELSE
    DISPLAY "Not enough balance"
END IF
```

Only one message is displayed:

- the first branch runs when the condition is `TRUE`;
- the `ELSE` branch runs when it is `FALSE`.

## Choose between several branches

Use `ELSE IF` for multiple exclusive possibilities:

```text
IF score IS AT LEAST 90 THEN
    DISPLAY "Excellent"
ELSE IF score IS AT LEAST 60 THEN
    DISPLAY "Passed"
ELSE
    DISPLAY "Try again"
END IF
```

The program checks branches from top to bottom and stops at the first true
condition.

For a score of `95`, both `score IS AT LEAST 90` and
`score IS AT LEAST 60` are true. Only `"Excellent"` is displayed because the
first branch already matched.

Order matters. Put the most specific or highest boundary first.

## Combine conditions

Use `AND` when both conditions must be true:

```text
IF age IS AT LEAST 18 AND has_ticket THEN
    DISPLAY "You may enter"
END IF
```

Use `OR` when either condition is enough:

```text
IF is_admin OR is_owner THEN
    DISPLAY "Editing allowed"
END IF
```

Use `NOT` to reverse a boolean value:

```text
IF NOT game_finished THEN
    DISPLAY "Continue playing"
END IF
```

When an expression becomes difficult to read, name its parts:

```text
SET has_access_role TO is_admin OR is_owner
SET account_ready TO email_verified AND NOT account_blocked

IF has_access_role AND account_ready THEN
    DISPLAY "Access granted"
END IF
```

The extra names reveal the meaning of the decision.

## Boundaries must be deliberate

Small boundary mistakes create incorrect behavior.

Suppose adults receive a different ticket price:

```text
IF age IS GREATER THAN 18 THEN
    SET price TO 12
ELSE
    SET price TO 8
END IF
```

This treats an 18-year-old as a child. If adulthood starts at 18, the correct
condition is:

```text
IF age IS AT LEAST 18 THEN
    SET price TO 12
ELSE
    SET price TO 8
END IF
```

Always test values directly below, exactly on, and directly above an important
boundary.

## Trace a decision

```text
SET temperature TO 7
SET is_raining TO TRUE

IF temperature IS LESS THAN 10 AND is_raining THEN
    SET advice TO "Take a warm raincoat"
ELSE IF temperature IS LESS THAN 10 THEN
    SET advice TO "Take a warm coat"
ELSE IF is_raining THEN
    SET advice TO "Take an umbrella"
ELSE
    SET advice TO "No special equipment needed"
END IF

DISPLAY advice
```

Trace the program:

1. `temperature IS LESS THAN 10` is `TRUE`.
2. `is_raining` is `TRUE`.
3. `TRUE AND TRUE` is `TRUE`.
4. The first branch sets `advice`.
5. Remaining branches are skipped.

The program displays `"Take a warm raincoat"`.

## Common mistakes

### Writing a value instead of a condition

An `IF` requires a boolean result:

```text
IF score THEN
    DISPLAY "Unclear decision"
END IF
```

This does not explain what should be true about `score`. Ask the real question:

```text
IF score IS GREATER THAN 0 THEN
    DISPLAY "The player has scored"
END IF
```

### Putting broad branches first

```text
IF score IS AT LEAST 60 THEN
    DISPLAY "Passed"
ELSE IF score IS AT LEAST 90 THEN
    DISPLAY "Excellent"
END IF
```

The second branch can never run. A score of at least `90` already matches the
first branch.

### Leaving relevant values unhandled

If every input requires an outcome, include an `ELSE` branch or prove that the
listed conditions cover every possibility.

### Nesting decisions unnecessarily

Prefer one readable expression:

```text
IF has_account AND password_is_correct THEN
    DISPLAY "Login successful"
END IF
```

over multiple nested `IF` blocks that express the same decision.

## Exercise: Shipping cost

Trace the final value of `shipping_cost` for each order:

```text
IF order_total IS AT LEAST 50 THEN
    SET shipping_cost TO 0
ELSE IF is_member THEN
    SET shipping_cost TO 3
ELSE
    SET shipping_cost TO 5
END IF
```

1. `order_total` is `70`, `is_member` is `FALSE`.
2. `order_total` is `30`, `is_member` is `TRUE`.
3. `order_total` is `30`, `is_member` is `FALSE`.

<details>
<summary>Show solution</summary>

1. The order qualifies for free shipping: `shipping_cost = 0`.
2. The order is below `50`, but the customer is a member:
   `shipping_cost = 3`.
3. Neither earlier branch matches: `shipping_cost = 5`.

</details>

## Small challenge

Write pseudocode that classifies a temperature:

- below `0`: `"Freezing"`
- from `0` through `19`: `"Cold"`
- from `20` through `29`: `"Warm"`
- `30` or higher: `"Hot"`

<details>
<summary>Show one solution</summary>

```text
IF temperature IS LESS THAN 0 THEN
    DISPLAY "Freezing"
ELSE IF temperature IS LESS THAN 20 THEN
    DISPLAY "Cold"
ELSE IF temperature IS LESS THAN 30 THEN
    DISPLAY "Warm"
ELSE
    DISPLAY "Hot"
END IF
```

Each earlier branch removes values from consideration. The second condition
does not need to repeat that the temperature is at least `0`.

</details>

## Continue the journey

- **Requires:** Values and Variables
- **Requires:** Operators and Expressions
- **Requires:** Boolean Logic
- **Next:** Repetition and Loops
- **Later:** Errors and Input Validation
