---
id: workflows-and-state-machines
title: Workflows and State Machines
summary: Learn how explicit states and transitions make multi-step processes understandable.
level: intermediate
learning_goal: Define valid workflow states and trace guarded transitions through a multi-step process.
system: programming-fundamentals
order: 13
status: draft
sources:
  - "Personal OS: Agentic Work Management Architecture"
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
  - target: events-and-notifications
    type: used-with
last_reviewed: 2026-07-29
---

# Workflows and State Machines

A multi-step process becomes difficult to trust when its current situation is
hidden inside counters, booleans, and unrelated conditions.

A **state machine** makes the allowed situations and movements explicit.

A **workflow** applies those ideas to a process such as reviewing a note,
handling an intake item, or completing a software task.

## Learning objective

After this article, you should be able to:

- name the states in a small workflow;
- define valid and invalid transitions;
- use guards to protect transitions;
- distinguish workflow status from step number;
- preserve a transition history for explanation and recovery.

## States have meaning

Consider an item that must be reviewed:

```text
SET item.status TO "captured"
```

Possible states might be:

```text
captured
triaged
processed
reviewed
archived
failed
```

Each state describes a meaningful condition, not merely a screen or button.

## Transitions define movement

Not every state can move directly to every other state.

```text
SET allowed_transitions TO {
    "captured": ["triaged", "archived"],
    "triaged": ["processed", "archived"],
    "processed": ["reviewed", "triaged"],
    "reviewed": ["archived"],
    "failed": ["captured"]
}
```

A transition function checks the rule:

```text
FUNCTION may_transition(current_status, target_status)
    SET allowed_targets TO allowed_transitions[current_status]
    RETURN target_status IS IN allowed_targets
END FUNCTION
```

## Reject invalid transitions

```text
FUNCTION transition_item(item, target_status)
    IF NOT may_transition(item.status, target_status) THEN
        RETURN ERROR("Invalid transition")
    END IF

    SET item.status TO target_status
    RETURN item
END FUNCTION
```

Without this rule, any caller could skip review by changing
`"captured"` directly to `"archived"` or `"completed"`.

## Guards use current facts

Some transitions need more than a matching state:

```text
FUNCTION may_complete(ticket)
    RETURN ticket.status IS EQUAL TO "in_review"
        AND ticket.has_result
        AND ticket.qa_approved
END FUNCTION
```

The transition to completion is guarded by three facts. A user interface may
disable its button, but the workflow rule must still protect the transition.

Interfaces can be bypassed. Domain rules must remain authoritative.

## Status is not a step counter

This representation appears simple:

```text
SET current_step TO 4
```

It becomes unclear when a process:

- returns to an earlier step;
- skips an optional step;
- waits for human input;
- retries a failed step;
- runs two independent steps.

Named states and transitions communicate intent:

```text
SET workflow.active_step TO "quality_review"
SET workflow.status TO "waiting_for_review"
```

The active step and the overall status are related, but they are not the same
concept.

## Record transition history

A history explains how the process reached its current state:

```text
SET transition_record TO {
    item_id: item.id,
    from: "processed",
    to: "reviewed",
    actor: "reviewer-7",
    reason: "Content verified",
    occurred_at: "2026-07-29T11:00:00Z"
}
```

Append the record only when the transition succeeds:

```text
FUNCTION apply_transition(item, target, actor, reason)
    SET previous_status TO item.status
    SET result TO transition_item(item, target)

    IF result IS ERROR THEN
        RETURN result
    END IF

    SAVE result.value
    APPEND {
        from: previous_status,
        to: target,
        actor: actor,
        reason: reason
    } TO transition_history

    RETURN result.value
END FUNCTION
```

## Version workflow definitions

Long-running work may start under one set of rules and finish after the rules
change.

Store the version used by each running workflow:

```text
SET workflow_instance TO {
    id: "workflow-81",
    definition_id: "knowledge-review",
    definition_version: 3,
    status: "running"
}
```

Changing version `4` should not silently change the rules of an instance pinned
to version `3`.

## Failure and retry are explicit

Failure is a state, not an invisible exception:

```text
IF processing_result IS ERROR THEN
    SET item.status TO "failed"
    SET item.error TO processing_result.message
    SAVE item
END IF
```

Retry must also be an allowed transition:

```text
failed -> captured
```

This makes recovery visible and testable.

## Common mistakes

### Allowing every state change

If callers can assign any status, the workflow does not enforce its own rules.

### Encoding status as a number

Numbers show order but rarely explain waiting, failure, review, or return paths.

### Hiding rules only in the interface

A disabled button is guidance. It is not a reliable domain boundary.

### Losing the previous state

Without history, debugging and explaining a process becomes guesswork.

### Editing active workflow rules in place

Running processes should keep the definition version under which they started.

## Exercise: Validate transitions

Given these rules:

```text
draft -> in_review
in_review -> approved
in_review -> draft
approved -> archived
```

Which transitions are valid?

1. `draft -> approved`
2. `draft -> in_review`
3. `in_review -> draft`
4. `approved -> in_review`

<details>
<summary>Show solution</summary>

Valid:

- `draft -> in_review`
- `in_review -> draft`

Invalid:

- `draft -> approved` skips review.
- `approved -> in_review` is not declared.

</details>

## Small challenge

Model a three-state task workflow with `open`, `in_progress`, and `completed`.
Allow work to start, allow active work to complete, and allow active work to
return to open. Write `may_transition`.

<details>
<summary>Show one solution</summary>

```text
SET allowed_transitions TO {
    "open": ["in_progress"],
    "in_progress": ["open", "completed"],
    "completed": []
}

FUNCTION may_transition(current_status, target_status)
    RETURN target_status IS IN allowed_transitions[current_status]
END FUNCTION
```

</details>

## Continue the journey

- **Requires:** Conditions
- **Requires:** Functions
- **Requires:** State and Persistence
- **Used with:** Events and Notifications
- **Next:** Reliable Processing and Idempotency

