---
id: events-and-notifications
title: Events and Notifications
summary: Learn how software announces completed facts without coupling every feature together.
level: intermediate
learning_goal: Model an event and decide when a user notification should be produced from it.
system: programming-fundamentals
order: 12
status: draft
sources:
  - "Personal OS: Central Notification Center"
  - "Personal OS: Universal Intake and Processing Inbox"
prerequisites:
  - conditions
  - functions
  - state-and-persistence
relations:
  - target: conditions
    type: requires
  - target: functions
    type: requires
  - target: state-and-persistence
    type: requires
last_reviewed: 2026-07-29
---

# Events and Notifications

When one part of a program completes meaningful work, other parts may need to
react. Saving a note may update search. Completing a task may update a counter.
A failed import may create a visible warning.

Calling every interested feature directly creates a chain of dependencies.
Events provide another option.

An **event** is a record of something that already happened.

## Learning objective

After this article, you should be able to:

- distinguish a command from an event;
- design a small event payload;
- explain how publishers and subscribers reduce direct coupling;
- distinguish system events from user notifications;
- prevent duplicate or misleading notifications.

## Commands ask, events report

A command requests behavior:

```text
archive_note("note-42")
```

An event reports the completed fact:

```text
{
    type: "note_archived",
    note_id: "note-42",
    occurred_at: "2026-07-29T10:00:00Z"
}
```

Name commands with actions. Name events with completed facts.

- Command: `create_task`
- Event: `task_created`
- Command: `retry_import`
- Event: `import_retried`

This distinction matters because an event must not promise work that has not
finished.

## Publish after success

The event should be published only after the state change succeeds:

```text
FUNCTION archive_saved_note(note_id)
    SET note TO LOAD NOTE WITH ID note_id

    IF note IS NOTHING THEN
        RETURN ERROR("Note not found")
    END IF

    SET note.is_archived TO TRUE
    SAVE note

    PUBLISH {
        type: "note_archived",
        note_id: note.id
    }

    RETURN note
END FUNCTION
```

Publishing before `SAVE note` could announce a fact that never became true.

## Subscribers react independently

Different subscribers can react to the same event:

```text
WHEN EVENT type IS EQUAL TO "note_archived"
    REMOVE note_id FROM SEARCH INDEX
END WHEN
```

```text
WHEN EVENT type IS EQUAL TO "note_archived"
    UPDATE archived_note_count
END WHEN
```

The archive function does not need to know how search or counters work.

## Keep event payloads focused

An event needs enough information for its consumers, but it should not become a
copy of the entire application state.

```text
{
    id: "event-91",
    type: "task_completed",
    task_id: "task-8",
    occurred_at: "2026-07-29T10:02:00Z"
}
```

Useful fields often include:

- a stable event ID;
- a type;
- the ID of the affected record;
- when the event occurred;
- a correlation ID when several actions belong together.

Sensitive information should not be added merely because it is available.

## Events are not notifications

Most events do not need to interrupt a person.

`search_index_updated` may be important to the system but irrelevant to the
user. `import_failed` may require attention.

A notification policy decides which events become visible:

```text
FUNCTION notification_for(event)
    IF event.type IS EQUAL TO "import_failed" THEN
        RETURN {
            title: "Import failed",
            message: "Open the item to retry.",
            tone: "error"
        }
    END IF

    IF event.type IS EQUAL TO "task_completed" THEN
        RETURN {
            title: "Task completed",
            message: "The result is ready.",
            tone: "success"
        }
    END IF

    RETURN NOTHING
END FUNCTION
```

## One notification center

If every feature invents its own banners and pop-ups, messages compete and
behave inconsistently.

A central notification boundary gives the application one place for:

- priority and tone;
- dismissal;
- unread state;
- accessibility announcements;
- duplicate prevention;
- consistent presentation.

Features publish meaningful facts. Notification policy decides how people are
informed.

## Duplicate events

Some operations can deliver the same event more than once. Give each event a
stable ID and remember processed IDs:

```text
FUNCTION handle_event(event)
    IF event.id IS IN processed_event_ids THEN
        RETURN
    END IF

    PROCESS event
    APPEND event.id TO processed_event_ids
END FUNCTION
```

Later lessons refine this idea into idempotent processing.

## Common mistakes

### Publishing before the operation succeeds

An event should represent a fact, not an intention.

### Turning every event into a notification

Too many messages train users to ignore all messages.

### Putting full records into every event

Large payloads become stale, expose unnecessary data, and couple consumers to
fields they do not need.

### Using vague event names

`data_changed` does not explain what changed. `note_archived` states a concrete
fact.

### Showing notifications in several unrelated places

Competing banners, toasts, and panels make it unclear where messages belong.

## Exercise: Event or command

Classify each name as a command or an event:

1. `capture_item`
2. `item_captured`
3. `send_notification`
4. `workflow_failed`

<details>
<summary>Show solution</summary>

`capture_item` and `send_notification` are commands because they request
actions.

`item_captured` and `workflow_failed` are events because they describe facts
that already occurred.

</details>

## Small challenge

Design an event for a successfully created note. Include an event ID, the event
type, the note ID, and a timestamp. Then write a notification policy that
returns a success message for that event.

<details>
<summary>Show one solution</summary>

```text
SET event TO {
    id: "event-101",
    type: "note_created",
    note_id: "note-55",
    occurred_at: "2026-07-29T10:15:00Z"
}

FUNCTION notification_for(event)
    IF event.type IS EQUAL TO "note_created" THEN
        RETURN {
            title: "Note created",
            message: "Your note is ready.",
            tone: "success"
        }
    END IF

    RETURN NOTHING
END FUNCTION
```

</details>

## Continue the journey

- **Requires:** Conditions
- **Requires:** Functions
- **Requires:** State and Persistence
- **Next:** Workflows and State Machines
- **Later:** Reliable Processing and Idempotency

