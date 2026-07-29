---
id: api-boundaries-and-validation
title: API Boundaries and Validation
summary: Learn how an API turns untrusted requests into valid domain operations and clear responses.
level: intermediate
learning_goal: Design a thin API boundary that validates input before invoking trusted program behavior.
system: programming-fundamentals
order: 15
status: draft
sources:
  - "Personal OS: Hexagonal DDD Migration"
  - "Personal OS: Agentic Work Management Architecture"
prerequisites:
  - errors-and-input-validation
  - functions
  - state-and-persistence
relations:
  - target: errors-and-input-validation
    type: requires
  - target: functions
    type: requires
  - target: state-and-persistence
    type: requires
  - target: workflows-and-state-machines
    type: used-with
last_reviewed: 2026-07-29
---

# API Boundaries and Validation

An **application programming interface**, or API, is a boundary through which
another program asks our program to do something.

Requests crossing that boundary are untrusted. The API must translate their
raw data into validated input, invoke the correct behavior, and translate the
result into a clear response.

## Learning objective

After this article, you should be able to:

- explain why an API is a trust boundary;
- separate request validation from domain rules;
- map an error to an appropriate response;
- keep boundary code thin;
- protect rules even when the user interface is bypassed.

## A request is data, not permission

Imagine a request to complete a task:

```text
SET request TO {
    task_id: "task-42",
    target_status: "completed"
}
```

The request does not prove that:

- the task exists;
- the fields have the correct shape;
- the current task may be completed;
- the caller may perform the action.

Each question belongs to an explicit check.

## Validate the request shape

```text
FUNCTION parse_complete_task_request(raw_request)
    IF raw_request.task_id IS MISSING THEN
        RETURN ERROR("task_id is required")
    END IF

    IF raw_request.target_status IS NOT EQUAL TO "completed" THEN
        RETURN ERROR("target_status must be completed")
    END IF

    RETURN {
        task_id: raw_request.task_id,
        target_status: raw_request.target_status
    }
END FUNCTION
```

This boundary check answers: “Can the program understand this request?”

## Keep domain rules authoritative

Understanding a request does not mean it is allowed:

```text
FUNCTION complete_task(command)
    SET task TO FIND TASK BY command.task_id

    IF task DOES NOT EXIST THEN
        RETURN ERROR("Task not found")
    END IF

    IF NOT may_transition(task.status, "completed") THEN
        RETURN ERROR("Task cannot be completed from its current state")
    END IF

    SET task.status TO "completed"
    SAVE task
    RETURN task
END FUNCTION
```

The domain operation protects the transition. A web page, command-line tool,
or automated process receives the same rule.

## The boundary coordinates

```text
FUNCTION handle_complete_task(raw_request)
    SET parsed TO parse_complete_task_request(raw_request)

    IF parsed IS ERROR THEN
        RETURN RESPONSE(400, parsed.message)
    END IF

    SET result TO complete_task(parsed.value)

    IF result IS ERROR THEN
        RETURN MAP ERROR TO RESPONSE(result)
    END IF

    RETURN RESPONSE(200, result.value)
END FUNCTION
```

The boundary parses, delegates, and maps. The task rule remains outside it.

## Map different failures differently

Useful responses distinguish:

- malformed input;
- missing data;
- forbidden actions;
- conflicts with current state;
- unexpected internal failures.

The exact status codes depend on the protocol, but the principle is stable:
callers should be able to tell whether to correct, authenticate, retry, or
stop.

## Validate output exposure

Responses also cross a boundary. Return only information intended for the
caller:

```text
FUNCTION present_task(task)
    RETURN {
        id: task.id,
        title: task.title,
        status: task.status
    }
END FUNCTION
```

Internal notes, tokens, and storage details should not appear merely because
they exist in the stored record.

## Common mistakes

### Trusting client-side validation

Interface validation improves feedback. It does not protect the domain because
requests can originate elsewhere.

### Putting every rule in the API handler

When the handler owns business rules, a second interface can accidentally
behave differently. Delegate to shared domain behavior.

### Returning one error for every failure

A generic error hides whether the caller sent bad input or the server failed.

### Exposing stored records directly

Persistence shape and public response shape serve different purposes.

## Exercise: Place each check

For a request that renames a project, decide whether each check belongs at the
request boundary or in the domain operation:

1. `project_id` is missing.
2. `name` is not text.
3. the project does not exist.
4. archived projects cannot be renamed.

<details>
<summary>Show solution</summary>

Checks 1 and 2 validate the request shape at the boundary.

Checks 3 and 4 belong to the domain operation because they depend on stored
state and business meaning.

</details>

## Small challenge

Sketch a thin handler for creating a note. Require a non-empty title, delegate
creation to `create_note`, and return either a validation response or a success
response.

<details>
<summary>Show one solution</summary>

```text
FUNCTION handle_create_note(raw_request)
    IF raw_request.title IS MISSING OR raw_request.title IS EMPTY THEN
        RETURN RESPONSE(400, "Title is required")
    END IF

    SET command TO {
        title: raw_request.title,
        body: raw_request.body
    }

    SET result TO create_note(command)

    IF result IS ERROR THEN
        RETURN MAP ERROR TO RESPONSE(result)
    END IF

    RETURN RESPONSE(201, present_note(result.value))
END FUNCTION
```

</details>

## Continue the journey

- **Requires:** Errors and Input Validation
- **Requires:** Functions
- **Requires:** State and Persistence
- **Used with:** Workflows and State Machines
- **Next:** Architecture Boundaries and Ports

