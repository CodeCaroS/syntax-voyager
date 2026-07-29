---
id: functions
title: Functions
summary: Learn how programs name, reuse, and combine pieces of behavior.
level: beginner
learning_goal: Trace function calls and write functions with parameters and return values.
system: programming-fundamentals
order: 10
status: draft
sources: []
prerequisites:
  - values-and-variables
  - operators-and-expressions
relations:
  - target: values-and-variables
    type: requires
  - target: operators-and-expressions
    type: requires
last_reviewed: 2026-07-29
---

# Functions

Programs become easier to understand when a group of instructions has a clear
name. Instead of repeating the same calculation in several places, a program
can define it once and call it whenever it is needed.

A **function** is a named piece of behavior.

## Learning objective

After this article, you should be able to:

- explain the difference between defining and calling a function;
- trace values through a function call;
- use parameters to provide input;
- use `RETURN` to provide a result;
- distinguish returning a value from displaying it.

## Define a function

A function definition gives a piece of behavior a name:

```text
FUNCTION display_welcome()
    DISPLAY "Welcome aboard"
END FUNCTION
```

Defining the function does not run its instructions. It only makes the function
available.

Call the function to run it:

```text
display_welcome()
```

Each call executes the function body:

```text
display_welcome()
display_welcome()
```

The message is displayed twice.

## Parameters provide input

A function becomes more useful when callers can provide values:

```text
FUNCTION greet(name)
    DISPLAY "Hello"
    DISPLAY name
END FUNCTION

greet("Ada")
greet("Grace")
```

`name` is a **parameter**. It is the name used inside the function.

`"Ada"` and `"Grace"` are **arguments**. They are the values supplied by each
call.

During `greet("Ada")`, the parameter `name` contains `"Ada"`. During the next
call, it contains `"Grace"`.

## Return a result

Many functions calculate a value for the caller:

```text
FUNCTION add(left, right)
    RETURN left + right
END FUNCTION

SET total TO add(4, 6)
DISPLAY total
```

Trace the call:

1. `left` receives `4`.
2. `right` receives `6`.
3. The function calculates `4 + 6`.
4. `RETURN` sends `10` back to the caller.
5. `total` receives `10`.

After `RETURN`, the current function call ends.

## Returning is not displaying

These functions have different purposes:

```text
FUNCTION display_total(left, right)
    DISPLAY left + right
END FUNCTION
```

```text
FUNCTION calculate_total(left, right)
    RETURN left + right
END FUNCTION
```

`display_total` shows a value to a user. It does not give the value back to the
caller.

`calculate_total` returns a value. The caller can display it, store it, compare
it, or pass it to another function:

```text
SET total TO calculate_total(4, 6)
SET doubled_total TO total * 2
DISPLAY doubled_total
```

Prefer returning a value when the result may be needed elsewhere.

## Functions can call other functions

Small functions can be combined:

```text
FUNCTION calculate_subtotal(price, quantity)
    RETURN price * quantity
END FUNCTION

FUNCTION calculate_total(price, quantity, shipping)
    SET subtotal TO calculate_subtotal(price, quantity)
    RETURN subtotal + shipping
END FUNCTION

SET order_total TO calculate_total(8, 3, 5)
DISPLAY order_total
```

The program calculates:

1. `8 * 3`, producing a subtotal of `24`;
2. `24 + 5`, producing a total of `29`.

The function names describe the two separate calculations.

## Local variables

A variable created inside a function belongs to that function call:

```text
FUNCTION calculate_total(price, quantity)
    SET total TO price * quantity
    RETURN total
END FUNCTION
```

The variable `total` helps the function perform its work. Code outside the
function should not depend on that local variable.

The later article **Scope** explains where variables exist and how long they
remain available.

## Give functions focused names

A function name should describe what the function does:

```text
calculate_average(scores)
validate_email(email)
display_summary(summary)
```

Avoid names that reveal nothing:

```text
do_it(data)
handle(value)
process(input)
```

A focused function is easier to name, explain, reuse, and test. If its name
needs the word “and,” it may be performing more than one recognizable job.

## Avoid hidden information

Compare these two functions:

```text
FUNCTION calculate_discount()
    RETURN current_price * discount_rate
END FUNCTION
```

```text
FUNCTION calculate_discount(price, rate)
    RETURN price * rate
END FUNCTION
```

The second version clearly states the information it needs. The same arguments
produce the same result, which makes the behavior easier to understand and
check.

Some real programs intentionally use shared state, but beginners should prefer
explicit parameters until shared state solves a demonstrated problem.

## Common mistakes

### Defining without calling

This defines behavior but produces no output:

```text
FUNCTION display_message()
    DISPLAY "Hello"
END FUNCTION
```

The program must also call `display_message()`.

### Forgetting to use a returned value

```text
calculate_total(8, 3)
```

The calculation runs, but its result is not stored or displayed:

```text
SET total TO calculate_total(8, 3)
DISPLAY total
```

### Confusing parameters and arguments

In `FUNCTION greet(name)`, `name` is a parameter. In `greet("Ada")`, `"Ada"` is
the argument.

### Passing arguments in the wrong order

For this function:

```text
FUNCTION subtract(left, right)
    RETURN left - right
END FUNCTION
```

`subtract(10, 3)` returns `7`, while `subtract(3, 10)` returns `-7`.

Parameter names make the expected order visible.

## Exercise: Trace the calls

Trace the final values:

```text
FUNCTION double(number)
    RETURN number * 2
END FUNCTION

FUNCTION add_bonus(score)
    RETURN score + 5
END FUNCTION

SET first_result TO double(4)
SET final_result TO add_bonus(first_result)
```

1. What does `double(4)` return?
2. What is the final value of `first_result`?
3. What is the final value of `final_result`?

<details>
<summary>Show solution</summary>

`double(4)` returns `8`, so `first_result` receives `8`.

`add_bonus(8)` returns `13`, so `final_result` receives `13`.

Final state:

```text
first_result = 8
final_result = 13
```

</details>

## Small challenge

Write a function named `calculate_rectangle_area` that accepts `width` and
`height` and returns their product. Call it with a width of `5` and a height of
`3`, then display the result.

<details>
<summary>Show one solution</summary>

```text
FUNCTION calculate_rectangle_area(width, height)
    RETURN width * height
END FUNCTION

SET area TO calculate_rectangle_area(5, 3)
DISPLAY area
```

The displayed value is `15`.

</details>

## Continue the journey

- **Requires:** Values and Variables
- **Next:** Parameters and Return Values
- **Next:** Scope
- **Later:** Errors and Input Validation
