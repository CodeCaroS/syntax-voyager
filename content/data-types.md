---
id: data-types
title: Data Types
summary: Learn how the kind of a value determines its meaning and valid operations.
level: beginner
learning_goal: Identify basic data types and choose an appropriate type for simple information.
system: programming-fundamentals
order: 3
status: draft
sources: []
prerequisites:
  - values-and-variables
relations:
  - target: values-and-variables
    type: requires
  - target: operators-and-expressions
    type: used-with
last_reviewed: 2026-07-29
---

# Data Types

Values can represent different kinds of information. A number can be added. A
piece of text can be displayed. A boolean can answer a yes-or-no question.

A **data type** describes the kind of a value and which operations make sense
for it.

## Learning objective

After this article, you should be able to:

- identify numbers, text, booleans, lists, records, and `NOTHING`;
- explain why `"42"` and `42` are different values;
- choose a suitable type for simple information;
- recognize when explicit conversion is needed.

## Numbers

Numbers represent quantities and measurements:

```text
SET age TO 18
SET temperature TO -2.5
SET price TO 9.99
```

Syntax Voyager groups whole and fractional numbers under `NUMBER`. Real
languages may divide them into several types with different ranges and
precision.

Numbers support arithmetic such as:

```text
SET total TO price * 3
```

## Text

Text represents characters and words. It is surrounded by quotation marks:

```text
SET name TO "Ada"
SET postal_code TO "00123"
SET message TO "42"
```

`"42"` is text, not a number. Its characters happen to look like a number.

A postal code is usually text because:

- leading zeroes matter;
- arithmetic is not meaningful;
- it identifies a place rather than measuring a quantity.

Choosing a type depends on meaning, not appearance alone.

## Booleans

A boolean has exactly two values:

```text
TRUE
FALSE
```

Booleans represent yes-or-no state:

```text
SET is_logged_in TO TRUE
SET email_verified TO FALSE
```

Comparisons also produce boolean values:

```text
SET is_adult TO age IS AT LEAST 18
```

Boolean Logic and Conditions explain how programs combine and use these values.

## Nothing

Sometimes the deliberate result is no value:

```text
SET selected_item TO NOTHING
```

`NOTHING` is not zero, empty text, or `FALSE`. It means that no value is
currently present.

Real languages represent absence in different ways, such as `null`, `nil`,
`None`, or optional types. Introductory pseudocode uses only `NOTHING`.

## Lists

A list stores an ordered collection of values:

```text
SET scores TO [10, 20, 30]
```

Lists are useful when the number of values may vary or when the program needs
to process the values as a collection.

The dedicated **Lists** article explains adding, reading, and traversing items.

## Records

A record groups named fields that describe one thing:

```text
SET player TO {
    name: "Ada",
    score: 10,
    active: TRUE
}
```

The fields can contain different types because each field has its own meaning.

## The type changes the meaning

Compare:

```text
SET first TO 10
SET second TO 5
SET result TO first + second
```

The result is the number `15`.

Now compare:

```text
SET first TO "10"
SET second TO "5"
```

These are text values. Syntax Voyager does not assume that `+` converts or
joins them. The program must first state the intended conversion.

## Convert explicitly

Input commonly begins as text:

```text
READ "Enter your age" INTO age_input
```

Before treating the input as a number, validate and convert it:

```text
IF age_input CANNOT BE CONVERTED TO NUMBER THEN
    DISPLAY "Age must be a number"
ELSE
    SET age TO CONVERT age_input TO NUMBER
END IF
```

Explicit conversion makes the decision visible and gives invalid input a clear
path.

## Choose types by allowed behavior

Ask what the program needs to do with the value:

| Information | Suitable type | Reason |
|---|---|---|
| Number of attempts | `NUMBER` | It is counted and compared. |
| Person's name | `TEXT` | It is displayed, not calculated. |
| Account active | `BOOLEAN` | It represents yes or no. |
| Selected result | a value or `NOTHING` | A result may be absent. |
| Previous guesses | `LIST` | Several ordered values are stored. |
| Player profile | `RECORD` | Named fields describe one thing. |

## Common mistakes

### Choosing a number for an identifier

Telephone numbers, postal codes, and product codes may contain digits without
being quantities. If arithmetic is meaningless, text is often safer.

### Treating absence as an ordinary value

`0`, `""`, and `FALSE` are real values. Do not use them to mean “missing”
unless the domain explicitly defines that meaning.

### Assuming automatic conversion

Real languages convert values differently. Language-agnostic algorithms should
validate and convert explicitly.

### Adding implementation details too early

The difference between 32-bit and 64-bit numbers matters in some systems, but
not when first learning what a numeric value represents.

## Exercise: Identify the types

Name the most suitable introductory type for each value:

1. `"Berlin"`
2. `27`
3. `FALSE`
4. `[3, 5, 8]`
5. `{title: "Guide", published: TRUE}`
6. no selected user

<details>
<summary>Show solution</summary>

1. `TEXT`
2. `NUMBER`
3. `BOOLEAN`
4. `LIST`
5. `RECORD`
6. `NOTHING`

</details>

## Small challenge

Choose variable names and types for:

- a player's display name;
- their current score;
- whether they completed the level;
- all scores earned during the game.

<details>
<summary>Show one solution</summary>

```text
SET display_name TO "Ada"
SET current_score TO 120
SET level_complete TO TRUE
SET scores TO [80, 100, 120]
```

The values use `TEXT`, `NUMBER`, `BOOLEAN`, and `LIST`.

</details>

## Continue the journey

- **Requires:** Values and Variables
- **Next:** Operators and Expressions
- **Later:** Lists
- **Later:** Records and Key-Value Maps
