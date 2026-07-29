---
id: testing-state-transitions
title: Testing State Transitions
summary: Learn how tests prove both valid and invalid changes to program state.
level: intermediate
learning_goal: Design transition tests that check results, rejected paths, and observable effects.
system: programming-fundamentals
order: 17
status: draft
sources:
  - "Personal OS: Agentic Work Management Architecture"
  - "Personal OS: Hexagonal DDD Migration"
prerequisites:
  - functions
  - errors-and-input-validation
  - workflows-and-state-machines
relations:
  - target: functions
    type: requires
  - target: errors-and-input-validation
    type: requires
  - target: workflows-and-state-machines
    type: requires
  - target: reliable-processing-and-idempotency
    type: used-with
last_reviewed: 2026-07-29
---

# Testing State Transitions

A transition changes a system from one meaningful state to another. Testing
only the happy path proves that one movement works. It does not prove that
forbidden movements are rejected or that related effects happen correctly.

A strong transition test describes:

1. the starting state;
2. the requested action;
3. the expected new state or error;
4. the observable effects that should or should not occur.

## Learning objective

After this article, you should be able to:

- write arrange, act, and assert steps;
- test valid and invalid transitions;
- check that rejected actions leave state unchanged;
- verify observable persistence and events;
- choose a small set of high-value transition cases.

## Test a valid transition

Suppose tasks may move from `open` to `in_progress`:

```text
TEST "an open task can start"
    SET task TO {id: "task-1", status: "open"}

    SET result TO start_task(task)

    ASSERT result IS NOT ERROR
    ASSERT result.value.status IS EQUAL TO "in_progress"
END TEST
```

The test names the behavior and checks the result that matters.

## Test a rejected transition

Completed work should not start again:

```text
TEST "a completed task cannot start"
    SET task TO {id: "task-1", status: "completed"}

    SET result TO start_task(task)

    ASSERT result IS ERROR
    ASSERT task.status IS EQUAL TO "completed"
END TEST
```

The second assertion matters: failure must not partly change the task.

## Check persistence

When an operation saves state, test through the storage boundary:

```text
TEST "starting a task saves its new state"
    SET store TO IN MEMORY TASK STORE
    store.save({id: "task-1", status: "open"})

    SET result TO start_stored_task("task-1", store)
    SET saved_task TO store.find_by_id("task-1")

    ASSERT result IS NOT ERROR
    ASSERT saved_task.status IS EQUAL TO "in_progress"
END TEST
```

Checking only the returned value could miss a forgotten save.

## Check observable effects

A transition may publish an event:

```text
TEST "starting a task publishes one event"
    SET events TO RECORDING EVENT PUBLISHER
    SET task TO {id: "task-1", status: "open"}

    SET result TO start_task(task, events)

    ASSERT result IS NOT ERROR
    ASSERT events.count IS EQUAL TO 1
    ASSERT events.first.type IS EQUAL TO "task_started"
    ASSERT events.first.task_id IS EQUAL TO "task-1"
END TEST
```

For a rejected transition, also assert that no event was published.

## Test the transition table

For a small state machine, list representative cases:

| Starting state | Target state | Expected |
|---|---|---|
| `open` | `in_progress` | allowed |
| `in_progress` | `completed` | allowed |
| `open` | `completed` | rejected |
| `completed` | `in_progress` | rejected |

This exposes missing rules more clearly than several unrelated test names.

## Test behavior, not implementation details

A test should care that the task was saved, not which private helper or query
ran. Implementation-focused tests break during harmless refactoring while
failing to protect user-visible behavior.

Prefer assertions about:

- returned results;
- stored state;
- emitted events;
- rejected changes;
- stable error meaning.

## Common mistakes

### Testing only successful movement

State machines are defined as much by forbidden transitions as allowed ones.

### Checking the error but not the state

An operation can return an error after already changing or saving data.

### Mocking every internal function

This proves call choreography instead of meaningful behavior. Replace only
external boundaries that make the test slow or unpredictable.

### Asserting vague success

`result succeeded` is weaker than checking the exact new state and required
effects.

### Forgetting duplicate actions

If an operation may be retried, test whether a repeated request is rejected or
handled idempotently according to its rule.

## Exercise: Complete the assertions

An invalid approval must not change or save a draft:

```text
TEST "a draft cannot skip review"
    SET store TO RECORDING TASK STORE
    SET task TO {id: "task-7", status: "draft"}

    SET result TO approve_task(task, store)

    // Add assertions
END TEST
```

Which three outcomes should the test check?

<details>
<summary>Show solution</summary>

```text
ASSERT result IS ERROR
ASSERT task.status IS EQUAL TO "draft"
ASSERT store.save_count IS EQUAL TO 0
```

The action fails, the in-memory state stays unchanged, and no persistence
effect occurs.

</details>

## Small challenge

Write two tests for archiving a note: one valid transition from `reviewed` and
one rejected transition from `captured`. Check both state and save behavior.

<details>
<summary>Show one solution</summary>

```text
TEST "a reviewed note can be archived"
    SET store TO RECORDING NOTE STORE
    SET note TO {id: "note-1", status: "reviewed"}

    SET result TO archive_note(note, store)

    ASSERT result IS NOT ERROR
    ASSERT note.status IS EQUAL TO "archived"
    ASSERT store.save_count IS EQUAL TO 1
END TEST

TEST "a captured note cannot be archived"
    SET store TO RECORDING NOTE STORE
    SET note TO {id: "note-2", status: "captured"}

    SET result TO archive_note(note, store)

    ASSERT result IS ERROR
    ASSERT note.status IS EQUAL TO "captured"
    ASSERT store.save_count IS EQUAL TO 0
END TEST
```

</details>

## Continue the journey

- **Requires:** Functions
- **Requires:** Errors and Input Validation
- **Requires:** Workflows and State Machines
- **Used with:** Reliable Processing and Idempotency

