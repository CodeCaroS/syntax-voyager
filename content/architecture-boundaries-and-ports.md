---
id: architecture-boundaries-and-ports
title: Architecture Boundaries and Ports
summary: Learn how boundaries keep domain rules independent from databases, frameworks, and interfaces.
level: intermediate
learning_goal: Separate a domain operation from external technology by defining the capability it needs.
system: programming-fundamentals
order: 16
status: draft
sources:
  - "Personal OS: Hexagonal DDD Migration"
prerequisites:
  - functions
  - state-and-persistence
  - api-boundaries-and-validation
relations:
  - target: functions
    type: requires
  - target: state-and-persistence
    type: requires
  - target: api-boundaries-and-validation
    type: requires
last_reviewed: 2026-07-29
---

# Architecture Boundaries and Ports

Software becomes difficult to change when its rules know too much about web
frameworks, database commands, or file formats.

An architecture boundary separates **what the program means** from **how
external technology performs the work**.

A **port** names a capability the program needs. An **adapter** connects that
capability to a particular technology.

## Learning objective

After this article, you should be able to:

- distinguish domain behavior from infrastructure;
- describe a port in terms of a needed capability;
- explain how an adapter fulfills a port;
- trace dependency direction across a boundary;
- avoid abstractions that do not protect a real boundary.

## Start with the domain operation

```text
FUNCTION complete_task(task_id, task_store)
    SET task TO task_store.find_by_id(task_id)

    IF task DOES NOT EXIST THEN
        RETURN ERROR("Task not found")
    END IF

    IF NOT may_transition(task.status, "completed") THEN
        RETURN ERROR("Invalid transition")
    END IF

    SET task.status TO "completed"
    task_store.save(task)
    RETURN task
END FUNCTION
```

The operation needs to find and save tasks. It does not need to know whether
they live in a database, a file, or memory.

## A port names the capability

The expected capability is:

```text
TASK STORE PORT
    find_by_id(task_id)
    save(task)
END PORT
```

This is not a complete programming-language interface. It is a design
description: the domain depends on task storage behavior, not a database
brand.

## An adapter handles technology

```text
DATABASE TASK STORE ADAPTER
    FUNCTION find_by_id(task_id)
        SET row TO DATABASE QUERY FOR task_id
        RETURN CONVERT row TO task
    END FUNCTION

    FUNCTION save(task)
        SET row TO CONVERT task TO database_row
        DATABASE STORE row
    END FUNCTION
END ADAPTER
```

Conversion belongs near the adapter. Database rows do not need to become the
domain's language.

## Dependencies point toward the rules

The API boundary calls the domain operation. The domain operation describes a
storage capability. The database adapter fulfills that capability.

```text
API -> DOMAIN OPERATION -> STORAGE PORT <- DATABASE ADAPTER
```

The domain does not import or select the database adapter. The application
connects them when it starts.

## Boundaries improve testing

A small in-memory adapter can exercise the same operation:

```text
IN MEMORY TASK STORE ADAPTER
    SET tasks TO {}

    FUNCTION find_by_id(task_id)
        RETURN tasks[task_id]
    END FUNCTION

    FUNCTION save(task)
        SET tasks[task.id] TO task
    END FUNCTION
END ADAPTER
```

This does not replace database tests. It lets domain tests focus on transition
rules without setting up unrelated technology.

## Use boundaries where change or meaning demands them

Useful boundaries often appear around:

- persistence;
- external services;
- clocks and random values;
- user interfaces and protocols;
- domain rules with several callers.

Do not create a port for every function. A boundary should isolate a real
external concern or protect meaningful rules.

## Common mistakes

### Letting database rows become domain objects

Storage columns then dictate the language and shape of business rules.

### Naming ports after technology

`SQL_TASK_HELPER` describes one solution. `TASK_STORE` describes the needed
capability.

### Putting domain decisions in adapters

An adapter translates and performs external work. Whether a task may complete
is a domain rule.

### Adding layers without a boundary

A file that only forwards every call adds navigation without separation. Keep
the direct call until a real boundary exists.

## Exercise: Sort the responsibilities

Place each responsibility in the domain, port, or adapter:

1. Decide whether a task may move from `review` to `completed`.
2. Declare that tasks can be loaded by identifier.
3. Convert a database row into a task record.
4. Save the changed task using a database command.

<details>
<summary>Show solution</summary>

1. Domain rule
2. Port
3. Adapter
4. Adapter

</details>

## Small challenge

Describe a clock port for a function that marks when a note was archived.
Then use it without referring to the system clock directly.

<details>
<summary>Show one solution</summary>

```text
CLOCK PORT
    now()
END PORT

FUNCTION archive_note(note, clock)
    IF note.status IS EQUAL TO "archived" THEN
        RETURN ERROR("Note is already archived")
    END IF

    SET note.status TO "archived"
    SET note.archived_at TO clock.now()
    RETURN note
END FUNCTION
```

A real clock adapter can return the current time. A test adapter can return a
fixed time.

</details>

## Continue the journey

- **Requires:** Functions
- **Requires:** State and Persistence
- **Requires:** API Boundaries and Validation
- **Next:** Testing State Transitions

