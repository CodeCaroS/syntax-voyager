# Syntax Voyager Pseudocode Guide

This guide defines the notation used in introductory Syntax Voyager articles.
It is designed for explaining programming concepts, not for execution by a
computer.

## Principles

- Prefer readable words over symbols.
- Show one idea at a time.
- Use the same notation in every introductory article.
- Do not imitate the special behavior of a real programming language.
- State assumptions when an operation is not self-explanatory.

Keywords are written in uppercase. Names use lowercase words separated by
underscores.

## Values

The introductory systems use these value categories:

- `NUMBER`: `42`, `-3`, `2.5`
- `TEXT`: `"Hello"`
- `BOOLEAN`: `TRUE`, `FALSE`
- `LIST`: `[10, 20, 30]`
- `RECORD`: `{name: "Ada", score: 10}`
- `NOTHING`: the deliberate absence of a value

Examples do not rely on automatic conversion between these categories.

## Variables

Create or update a variable with `SET`:

```text
SET score TO 0
SET score TO score + 10
```

Read input into a variable:

```text
READ "Enter your name" INTO name
```

Display a value:

```text
DISPLAY name
```

## Expressions

Arithmetic expressions use:

- `+`
- `-`
- `*`
- `/`

Comparisons use readable phrases:

- `IS EQUAL TO`
- `IS NOT EQUAL TO`
- `IS LESS THAN`
- `IS GREATER THAN`
- `IS AT MOST`
- `IS AT LEAST`

Boolean expressions use `AND`, `OR`, and `NOT`.

```text
SET may_enter TO age IS AT LEAST 18 AND has_ticket
```

## Conditions

```text
IF temperature IS GREATER THAN 30 THEN
    DISPLAY "It is hot"
ELSE IF temperature IS LESS THAN 10 THEN
    DISPLAY "It is cold"
ELSE
    DISPLAY "It is mild"
END IF
```

## Loops

Repeat while a condition is true:

```text
WHILE attempts IS LESS THAN 3
    DISPLAY attempts
    SET attempts TO attempts + 1
END WHILE
```

Repeat a known number of times:

```text
FOR number FROM 1 TO 5
    DISPLAY number
END FOR
```

Visit every value in a collection:

```text
FOR EACH name IN names
    DISPLAY name
END FOR
```

## Functions

```text
FUNCTION add(left, right)
    RETURN left + right
END FUNCTION

SET total TO add(4, 6)
```

A function without an explicit result returns `NOTHING`.

## Lists

```text
SET scores TO [10, 20]
APPEND 30 TO scores

FOR EACH score IN scores
    DISPLAY score
END FOR
```

Use `LENGTH OF scores` for the number of items. Positions start at `1` in
introductory pseudocode unless an article explicitly teaches indexing.

## Records and key-value maps

Use a record when its fields are known:

```text
SET player TO {name: "Ada", score: 10}
DISPLAY player.name
SET player.score TO 20
```

Use a key-value map when keys are discovered while the program runs:

```text
SET scores_by_name TO {}
SET scores_by_name["Ada"] TO 20
DISPLAY scores_by_name["Ada"]
```

## Validation and errors

Validate information before using it:

```text
FUNCTION parse_age(input)
    IF input CANNOT BE CONVERTED TO NUMBER THEN
        RETURN ERROR("Age must be a number")
    END IF

    RETURN CONVERT input TO NUMBER
END FUNCTION
```

Handle an error explicitly:

```text
SET age_result TO parse_age(input)

IF age_result IS ERROR THEN
    DISPLAY age_result.message
ELSE
    SET age TO age_result.value
END IF
```

Exceptions, stack traces, and language-specific error classes belong in later
language systems.

## Comments and omitted steps

Comments begin with `//`:

```text
// The tax rate is simplified for this example.
SET tax_rate TO 0.20
```

Use a clearly named operation when its implementation is outside the current
lesson:

```text
SET target TO RANDOM NUMBER FROM 1 TO 100
```

The surrounding article must explain what such an operation is assumed to do.

## Deliberately unspecified

This notation does not define:

- memory representation;
- integer size or floating-point precision;
- concurrency or asynchronous execution;
- object-oriented syntax;
- modules or package systems;
- a complete executable grammar.

Those details depend on the programming language or runtime being studied.
