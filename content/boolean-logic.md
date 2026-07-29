---
id: boolean-logic
title: Boolean Logic
summary: Learn how programs combine true-or-false values into decisions.
level: beginner
learning_goal: Evaluate and write boolean expressions using AND, OR, and NOT.
system: programming-fundamentals
order: 5
status: draft
sources: []
prerequisites:
  - data-types
  - operators-and-expressions
relations:
  - target: data-types
    type: requires
  - target: operators-and-expressions
    type: requires
  - target: conditions
    type: used-with
last_reviewed: 2026-07-29
---

# Boolean Logic

Programs frequently combine several yes-or-no facts. A user may enter only when
they have a ticket **and** the event is open. A document may be edited when the
user is its owner **or** an administrator.

**Boolean logic** combines `TRUE` and `FALSE` values into new boolean results.

## Learning objective

After this article, you should be able to:

- evaluate `NOT`, `AND`, and `OR`;
- combine comparisons into boolean expressions;
- group expressions so their meaning is clear;
- describe a real rule as a boolean expression.

## Boolean values

A boolean has exactly two possible values:

```text
TRUE
FALSE
```

Variables can store these values directly:

```text
SET is_member TO TRUE
SET account_blocked TO FALSE
```

Comparisons also produce booleans:

```text
SET has_attempts_left TO attempts IS LESS THAN maximum_attempts
```

## NOT reverses a value

`NOT` changes `TRUE` to `FALSE` and `FALSE` to `TRUE`.

| value | `NOT value` |
|---|---|
| `TRUE` | `FALSE` |
| `FALSE` | `TRUE` |

Example:

```text
SET account_blocked TO FALSE
SET may_continue TO NOT account_blocked
```

`may_continue` receives `TRUE`.

## AND requires both sides

`A AND B` is true only when both values are true.

| A | B | `A AND B` |
|---|---|---|
| `FALSE` | `FALSE` | `FALSE` |
| `FALSE` | `TRUE` | `FALSE` |
| `TRUE` | `FALSE` | `FALSE` |
| `TRUE` | `TRUE` | `TRUE` |

Example:

```text
SET may_enter TO has_ticket AND event_open
```

Having a ticket is not enough when the event is closed.

## OR requires at least one side

`A OR B` is true when either value, or both values, are true.

| A | B | `A OR B` |
|---|---|---|
| `FALSE` | `FALSE` | `FALSE` |
| `FALSE` | `TRUE` | `TRUE` |
| `TRUE` | `FALSE` | `TRUE` |
| `TRUE` | `TRUE` | `TRUE` |

Example:

```text
SET may_edit TO is_owner OR is_admin
```

Either role is sufficient.

## Combine comparisons

Boolean operators often connect comparison results:

```text
SET is_valid_score TO score IS AT LEAST 0 AND score IS AT MOST 100
```

With `score = 75`:

1. `score IS AT LEAST 0` produces `TRUE`;
2. `score IS AT MOST 100` produces `TRUE`;
3. `TRUE AND TRUE` produces `TRUE`.

## Group complex expressions

Use named intermediate values:

```text
SET has_valid_role TO is_owner OR is_admin
SET account_ready TO email_verified AND NOT account_blocked
SET may_edit TO has_valid_role AND account_ready
```

This is easier to explain than one long expression and gives each business rule
a name.

Parentheses can also make grouping explicit:

```text
SET may_edit TO (is_owner OR is_admin) AND email_verified
```

Evaluate the expression inside parentheses first.

## Translate a rule carefully

Rule:

> The player may start when the game is ready and they are either a member or
> have a guest pass.

Pseudocode:

```text
SET has_access TO is_member OR has_guest_pass
SET may_start TO game_ready AND has_access
```

Do not add conditions that the rule does not contain, and do not omit required
conditions.

## Common mistakes

### Using OR when every requirement is mandatory

If a user needs both a verified email and an active account, use `AND`:

```text
SET may_login TO email_verified AND account_active
```

Using `OR` would permit a user who satisfies only one requirement.

### Using AND when either option is enough

If an owner or an administrator may edit, requiring both roles is too strict.

### Negating the wrong idea

Prefer a positive, named fact when possible:

```text
SET may_continue TO NOT account_blocked
```

This is clearer than repeatedly reasoning about nested negative phrases.

### Relying on an unclear evaluation order

Use parentheses or intermediate variables when `AND` and `OR` appear in the
same rule.

## Exercise: Evaluate the rules

Given:

```text
SET is_member TO TRUE
SET has_guest_pass TO FALSE
SET event_open TO TRUE
SET account_blocked TO FALSE

SET has_entry_method TO is_member OR has_guest_pass
SET account_ready TO NOT account_blocked
SET may_enter TO has_entry_method AND event_open AND account_ready
```

1. What is `has_entry_method`?
2. What is `account_ready`?
3. What is `may_enter`?

<details>
<summary>Show solution</summary>

1. `TRUE OR FALSE` produces `TRUE`.
2. `NOT FALSE` produces `TRUE`.
3. `TRUE AND TRUE AND TRUE` produces `TRUE`.

</details>

## Small challenge

Write a boolean expression for this rule:

> A discount applies when the customer is a member and the order total is at
> least `50`, or when the customer has a voucher.

<details>
<summary>Show one solution</summary>

```text
SET member_discount TO is_member AND order_total IS AT LEAST 50
SET discount_applies TO member_discount OR has_voucher
```

Naming the two parts makes the intended grouping explicit.

</details>

## Continue the journey

- **Requires:** Data Types
- **Requires:** Operators and Expressions
- **Next:** Conditions
- **Later:** Errors and Input Validation
