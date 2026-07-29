---
id: algorithms-and-pseudocode
title: Algorithms and Pseudocode
summary: Learn how to describe a finite solution as clear, ordered steps.
level: beginner
learning_goal: Read, trace, and write a small algorithm in language-agnostic pseudocode.
system: programming-fundamentals
order: 1
status: draft
sources: []
prerequisites: []
relations:
  - target: values-and-variables
    type: used-with
last_reviewed: 2026-07-29
---

# Algorithms and Pseudocode

Programming starts before code. First, we need a clear description of what a
solution should do.

An **algorithm** is a finite sequence of unambiguous steps that transforms
input into a result. **Pseudocode** is a readable way to write those steps
without choosing a programming language.

## Learning objective

After this article, you should be able to:

- recognize the input, steps, and result of an algorithm;
- explain why instruction order matters;
- trace a short pseudocode algorithm;
- describe a small solution in pseudocode.

## Algorithms solve defined problems

Before writing steps, state the problem:

> Given a person's name, display a welcome message for that person.

This problem has:

- **input:** a name;
- **processing:** prepare the welcome;
- **output:** the displayed name.

Its pseudocode can be:

```text
READ "Enter your name" INTO name
DISPLAY "Welcome"
DISPLAY name
```

The instructions are deliberately simple. Variables, input, and output receive
their own detailed explanations later.

## Order matters

An algorithm runs instructions in sequence unless a later concept changes the
flow.

```text
DISPLAY "Open the container"
DISPLAY "Add the item"
DISPLAY "Close the container"
```

Reordering the instructions may produce a different or impossible result:

```text
DISPLAY "Close the container"
DISPLAY "Add the item"
DISPLAY "Open the container"
```

A correct algorithm contains the necessary steps in a valid order.

## Useful algorithms have clear properties

For introductory problems, an algorithm should be:

- **finite:** it eventually stops;
- **unambiguous:** each instruction has one intended meaning;
- **ordered:** the sequence is clear;
- **effective:** every step can actually be carried out;
- **relevant:** the steps solve the stated problem.

An algorithm can be correct without being the fastest possible solution.
Correctness comes first; optimization requires evidence that it matters.

## Pseudocode is not a programming language

Pseudocode communicates an algorithm to people. It does not need to compile.

This is useful because the central idea remains visible:

```text
SET width TO 5
SET height TO 3
SET area TO width * height
DISPLAY area
```

The same algorithm could later be implemented in Python, JavaScript, Java,
PHP, or another language.

Syntax Voyager uses one small pseudocode convention so that different articles
remain consistent. The complete notation is defined in the
**Syntax Voyager Pseudocode Guide**.

## Trace one instruction at a time

To **trace** an algorithm, follow its instructions in order and record what each
step changes or displays.

```text
SET current_floor TO 1
DISPLAY current_floor
SET current_floor TO 2
DISPLAY current_floor
```

Trace:

1. `current_floor` receives `1`.
2. The program displays `1`.
3. `current_floor` changes to `2`.
4. The program displays `2`.

Do not skip ahead or assume an instruction runs more than once.

## Break larger problems into smaller steps

Consider:

> Calculate and display the total price for several items.

Before choosing exact pseudocode, decompose it:

1. receive the item prices;
2. add the prices;
3. store the total;
4. display the total.

Later articles introduce the variables, expressions, loops, and functions that
can implement these steps. Decomposition lets us understand the shape of a
solution before learning every tool it needs.

## Common mistakes

### Starting with syntax

Choosing punctuation or language features before understanding the problem
hides missing steps. Describe the input, desired result, and transformation
first.

### Using vague instructions

```text
PROCESS the order
```

What does `PROCESS` mean? Unless another article defines that operation, divide
it into observable steps such as reading items, calculating a total, and
displaying the result.

### Writing an endless procedure

An algorithm must have a point at which its work is complete. Loops need a
condition or finite collection that allows them to stop.

### Solving a different problem

Check the final result against the original problem statement. Extra steps do
not compensate for a missing required result.

## Exercise: Trace the output

What is displayed, and in what order?

```text
DISPLAY "Prepare"
SET count TO 2
DISPLAY count
SET count TO count + 1
DISPLAY count
DISPLAY "Complete"
```

<details>
<summary>Show solution</summary>

The output is:

```text
Prepare
2
3
Complete
```

The instructions run from top to bottom. `count` changes before it is displayed
the second time.

</details>

## Small challenge

Write pseudocode for this problem:

> Read a first name and a city, then display both values beneath the heading
> `"Profile"`.

<details>
<summary>Show one solution</summary>

```text
READ "Enter your first name" INTO first_name
READ "Enter your city" INTO city
DISPLAY "Profile"
DISPLAY first_name
DISPLAY city
```

Other solutions are valid when their steps are finite, clear, and produce the
required output.

</details>

## Continue the journey

- **Next:** Values and Variables
- **Reference:** Syntax Voyager Pseudocode Guide
