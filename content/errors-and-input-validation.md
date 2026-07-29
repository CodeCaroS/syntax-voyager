---
id: errors-and-input-validation
title: Errors and Input Validation
summary: Learn how programs reject invalid input and make failure an explicit result.
level: beginner
learning_goal: Validate untrusted input and handle success and error results deliberately.
system: programming-fundamentals
order: 9
status: draft
sources: []
prerequisites:
  - data-types
  - conditions
  - functions
relations:
  - target: data-types
    type: requires
  - target: conditions
    type: requires
  - target: functions
    type: requires
last_reviewed: 2026-07-29
---

# Errors and Input Validation

Programs receive information from users, files, devices, and other systems.
That information may be missing, malformed, or outside the allowed range.

**Validation** checks whether input satisfies the program's rules before the
program relies on it. An **error result** explains why an operation could not
produce a normal value.

## Learning objective

After this article, you should be able to:

- identify input that crosses a trust boundary;
- validate type, presence, range, and allowed values;
- return an explicit error result;
- keep validation separate from normal calculations;
- handle both success and failure paths.

## Validate before using input

```text
READ "Enter your age" INTO age_input

IF age_input CANNOT BE CONVERTED TO NUMBER THEN
    DISPLAY "Age must be a number"
ELSE
    SET age TO CONVERT age_input TO NUMBER
END IF
```

Conversion happens only after the program knows it is possible.

## Validate more than the data type

A number can still be invalid for the task:

```text
FUNCTION parse_age(input)
    IF input CANNOT BE CONVERTED TO NUMBER THEN
        RETURN ERROR("Age must be a number")
    END IF

    SET age TO CONVERT input TO NUMBER

    IF age IS LESS THAN 0 OR age IS GREATER THAN 130 THEN
        RETURN ERROR("Age is outside the allowed range")
    END IF

    RETURN age
END FUNCTION
```

The first rule checks representation. The second checks meaning.

## Handle the result explicitly

```text
SET age_result TO parse_age(age_input)

IF age_result IS ERROR THEN
    DISPLAY age_result.message
ELSE
    SET age TO age_result.value
    DISPLAY age
END IF
```

The caller cannot safely pretend that parsing always succeeds.

## Validate records at the boundary

```text
FUNCTION validate_registration(input)
    IF input.name IS MISSING THEN
        RETURN ERROR("Name is required")
    END IF

    IF input.role IS NOT IN ["learner", "mentor"] THEN
        RETURN ERROR("Role is not allowed")
    END IF

    RETURN {
        name: input.name,
        role: input.role
    }
END FUNCTION
```

Returning a new validated record makes the accepted shape visible. Unexpected
fields do not automatically become trusted program state.

## Give errors useful context

“Invalid input” forces the caller to guess. A useful error states:

- which value failed;
- which rule was violated;
- what the caller can change.

Do not include secrets or unrelated internal details in an error message.

## Fail without partial changes

Validate all required information before saving:

```text
FUNCTION register_learner(input)
    SET validation_result TO validate_registration(input)

    IF validation_result IS ERROR THEN
        RETURN validation_result
    END IF

    SAVE validation_result.value
    RETURN validation_result.value
END FUNCTION
```

The program does not save half a record and then discover a later error.

## Common mistakes

### Trusting input because it came from the interface

Buttons, forms, and client-side checks help users, but another caller can bypass
them. Validate again where external input enters the trusted program.

### Converting before checking

If conversion can fail, check it before using the converted value.

### Silently replacing invalid values

Changing an invalid age to `0` hides the problem. Return an error unless a
documented default is genuinely part of the rule.

### Catching every error without responding

Ignoring failure makes later behavior harder to explain. Handle it, return it,
or record it at the appropriate boundary.

## Exercise: Find the missing rule

This function accepts a quantity:

```text
FUNCTION parse_quantity(input)
    IF input CANNOT BE CONVERTED TO NUMBER THEN
        RETURN ERROR("Quantity must be a number")
    END IF

    RETURN CONVERT input TO NUMBER
END FUNCTION
```

What additional rule is needed if quantities must be whole numbers from `1`
to `100`?

<details>
<summary>Show solution</summary>

After conversion, reject values below `1`, above `100`, or containing a
fraction:

```text
SET quantity TO CONVERT input TO NUMBER

IF quantity IS LESS THAN 1
    OR quantity IS GREATER THAN 100
    OR quantity IS NOT A WHOLE NUMBER THEN
    RETURN ERROR("Quantity must be a whole number from 1 to 100")
END IF
```

</details>

## Small challenge

Write `validate_score` for a numeric score from `0` to `10`, then show how a
caller handles its result.

<details>
<summary>Show one solution</summary>

```text
FUNCTION validate_score(input)
    IF input CANNOT BE CONVERTED TO NUMBER THEN
        RETURN ERROR("Score must be a number")
    END IF

    SET score TO CONVERT input TO NUMBER

    IF score IS LESS THAN 0 OR score IS GREATER THAN 10 THEN
        RETURN ERROR("Score must be from 0 to 10")
    END IF

    RETURN score
END FUNCTION

SET result TO validate_score("8")

IF result IS ERROR THEN
    DISPLAY result.message
ELSE
    DISPLAY result.value
END IF
```

</details>

## Continue the journey

- **Requires:** Data Types
- **Requires:** Conditions
- **Requires:** Functions
- **Next:** State and Persistence
- **Later:** API Boundaries and Validation

