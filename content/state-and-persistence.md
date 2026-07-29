---
id: state-and-persistence
title: State and Persistence
summary: Learn how programs keep information during execution and preserve it for later.
level: intermediate
learning_goal: Distinguish temporary state from persistent data and trace a safe load-change-save cycle.
system: programming-fundamentals
order: 11
status: draft
sources:
  - "Personal OS: Hexagonal DDD Migration"
  - "Personal OS: Universal Intake and Processing Inbox"
prerequisites:
  - values-and-variables
  - data-types
  - functions
relations:
  - target: values-and-variables
    type: requires
  - target: data-types
    type: requires
  - target: functions
    type: requires
  - target: operators-and-expressions
    type: builds-on
last_reviewed: 2026-07-29
---

# State and Persistence

A program often needs to remember what has happened. A counter remembers how
many attempts remain. A task remembers whether it is open or complete. A note
remembers its title and content.

This remembered information is called **state**.

Some state only needs to survive for the current execution. Other state must
still exist after the program closes. That difference leads to persistence.

## Learning objective

After this article, you should be able to:

- explain state as the current values that describe a program;
- distinguish temporary state from persistent data;
- model a record with a stable identity;
- trace a load-change-save cycle;
- explain why persistence belongs behind a focused boundary.

## State describes the current situation

Consider a simple reading list:

```text
SET item TO {
    id: "item-17",
    title: "Learn state",
    is_read: FALSE
}
```

The record contains three pieces of state. If `is_read` changes to `TRUE`, the
situation represented by the program changes.

```text
SET item.is_read TO TRUE
```

State is not limited to one variable. It may include many related records:

```text
SET reading_list TO [
    {id: "item-17", title: "Learn state", is_read: TRUE},
    {id: "item-18", title: "Learn persistence", is_read: FALSE}
]
```

## Temporary state

Variables normally exist while a program is running:

```text
SET attempts TO 3
SET search_text TO "persistence"
```

If the program stops and these values were not saved, they disappear. That is
correct for temporary interaction state such as:

- the text currently entered in a search field;
- whether a menu is open;
- an intermediate calculation;
- the current step inside a short operation.

Not every value deserves permanent storage.

## Persistent state

Persistent state is written to storage so it can be loaded during a later
execution.

```text
FUNCTION mark_item_read(item_id)
    SET item TO LOAD ITEM WITH ID item_id

    IF item IS NOTHING THEN
        RETURN ERROR("Item not found")
    END IF

    SET item.is_read TO TRUE
    SAVE item
    RETURN item
END FUNCTION
```

The exact storage technology is deliberately unspecified. It could be a file,
a database, or a remote service. The important idea is the contract:

1. load the current record;
2. validate that it can be changed;
3. change the state;
4. save the new state;
5. return the result.

## Stable identity

Titles and descriptions can change. A stable identifier lets the program refer
to the same record over time.

```text
SET note TO {
    id: "note-42",
    title: "First title",
    content: "..."
}

SET note.title TO "Improved title"
```

The title changed, but `note-42` still identifies the same note.

Using a title as identity creates ambiguity when two notes share a title or a
title is edited.

## Separate behavior from storage

Business behavior should describe what is allowed. Storage code should
describe how records are loaded and saved.

```text
FUNCTION complete_task(task)
    IF task.status IS EQUAL TO "completed" THEN
        RETURN task
    END IF

    SET task.status TO "completed"
    RETURN task
END FUNCTION
```

```text
FUNCTION complete_saved_task(task_id)
    SET task TO LOAD TASK WITH ID task_id

    IF task IS NOTHING THEN
        RETURN ERROR("Task not found")
    END IF

    SET updated_task TO complete_task(task)
    SAVE updated_task
    RETURN updated_task
END FUNCTION
```

The first function can be understood and tested without a database. The second
function coordinates persistence.

This separation is useful even in a small application. It avoids spreading
storage instructions through every feature.

## Validate before saving

Persistent mistakes survive after the program stops. Validate important rules
before writing:

```text
FUNCTION rename_note(note, new_title)
    IF new_title IS EQUAL TO "" THEN
        RETURN ERROR("Title is required")
    END IF

    SET note.title TO new_title
    RETURN note
END FUNCTION
```

Only save when the operation succeeds:

```text
SET result TO rename_note(note, input_title)

IF result IS ERROR THEN
    DISPLAY result.message
ELSE
    SAVE result.value
END IF
```

## Common mistakes

### Saving every temporary value

Persisting search text, hover state, and open menus adds complexity without
protecting valuable information.

Ask: must this value survive a restart?

### Changing a record without saving it

```text
SET task.status TO "completed"
```

The in-memory value changed. If the program closes before `SAVE task`, the
persistent record may still be open.

### Saving before validation

Writing an invalid record and correcting it afterward creates a period in which
other parts of the program can read bad data.

### Using editable text as identity

A title is useful for people. A stable ID is useful for reliable references.

### Mixing storage details into every function

When every behavior knows file names, table names, or network addresses,
changing storage becomes unnecessarily difficult.

## Exercise: Trace the saved state

Assume storage initially contains:

```text
{id: "task-8", title: "Review notes", status: "open"}
```

Trace this operation:

```text
SET task TO LOAD TASK WITH ID "task-8"
SET task.status TO "completed"
SAVE task
SET reloaded_task TO LOAD TASK WITH ID "task-8"
```

1. What is the status before the change?
2. What is the status in memory after the change?
3. What status is loaded at the end?

<details>
<summary>Show solution</summary>

The initial status is `"open"`.

After the assignment, the in-memory status is `"completed"`.

`SAVE task` persists that change, so `reloaded_task.status` is
`"completed"`.

</details>

## Small challenge

Write pseudocode for `archive_note(note_id)`. It should load a note, return an
error when the note does not exist, set `is_archived` to `TRUE`, save the note,
and return the updated record.

<details>
<summary>Show one solution</summary>

```text
FUNCTION archive_note(note_id)
    SET note TO LOAD NOTE WITH ID note_id

    IF note IS NOTHING THEN
        RETURN ERROR("Note not found")
    END IF

    SET note.is_archived TO TRUE
    SAVE note
    RETURN note
END FUNCTION
```

</details>

## Continue the journey

- **Requires:** Values and Variables
- **Requires:** Data Types
- **Requires:** Functions
- **Next:** Events and Notifications
- **Next:** Workflows and State Machines

