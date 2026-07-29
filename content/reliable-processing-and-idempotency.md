---
id: reliable-processing-and-idempotency
title: Reliable Processing and Idempotency
summary: Learn how retries can remain safe when requests or events arrive more than once.
level: intermediate
learning_goal: Design an idempotent processing operation that detects duplicate work and records completion safely.
system: programming-fundamentals
order: 14
status: draft
sources:
  - "Personal OS: Agentic Work Management Architecture"
  - "Personal OS: Universal Intake and Processing Inbox"
prerequisites:
  - state-and-persistence
  - workflows-and-state-machines
relations:
  - target: state-and-persistence
    type: requires
  - target: workflows-and-state-machines
    type: requires
  - target: events-and-notifications
    type: builds-on
last_reviewed: 2026-07-29
---

# Reliable Processing and Idempotency

Networks time out. Programs restart. Users click twice. A worker may complete
an operation even though its response never reaches the caller.

Reliable software expects repeated requests.

An operation is **idempotent** when performing it again with the same identity
does not create an additional unintended result.

## Learning objective

After this article, you should be able to:

- explain why a timeout does not prove that work failed;
- give an operation a stable idempotency key;
- detect completed duplicate requests;
- distinguish safe retry from repeated side effects;
- record processing state before reporting success.

## The uncertain outcome problem

Imagine a request to create a note:

```text
SEND create_note REQUEST
WAIT FOR RESPONSE
```

The receiver saves the note, but the response is lost. The sender sees a
timeout.

If the sender repeats the request without an identity, a second note may be
created.

The important lesson is:

> A missing response means the outcome is unknown, not necessarily failed.

## Give the operation an identity

Add a stable idempotency key:

```text
SET request TO {
    idempotency_key: "capture-2026-07-29-17",
    operation: "create_note",
    title: "Reliable processing"
}
```

Every retry of the same logical operation uses the same key.

## Remember completed work

The receiver checks whether the key was processed:

```text
FUNCTION create_note_once(request)
    SET previous_result TO LOAD RESULT FOR request.idempotency_key

    IF previous_result IS NOT NOTHING THEN
        RETURN previous_result
    END IF

    SET note TO CREATE NOTE FROM request
    SAVE note
    SAVE RESULT request.idempotency_key WITH note
    RETURN note
END FUNCTION
```

The second call returns the original note instead of creating another one.

## The key belongs to the operation

Generating a new key for every retry defeats duplicate detection:

```text
// Incorrect: a new key makes the retry look like new work.
SET request.idempotency_key TO RANDOM ID
RETRY request
```

Create the key once when the logical action begins, then reuse it.

## Idempotent state changes

Some operations are naturally close to idempotent:

```text
SET task.status TO "completed"
```

Setting the same status twice produces the same final state.

Other operations are not:

```text
SET account.balance TO account.balance - 10
```

Running this twice subtracts `20`.

```text
APPEND item TO list
```

Running this twice may add two items.

For non-idempotent operations, duplicate detection is essential.

## Track processing states

A useful processing record can distinguish:

```text
received
processing
succeeded
failed
```

```text
FUNCTION process_request(request)
    SET record TO LOAD PROCESSING RECORD request.idempotency_key

    IF record.status IS EQUAL TO "succeeded" THEN
        RETURN record.result
    END IF

    IF record.status IS EQUAL TO "processing" THEN
        RETURN ERROR("Request is already processing")
    END IF

    SAVE PROCESSING RECORD {
        key: request.idempotency_key,
        status: "processing"
    }

    SET result TO PERFORM request.operation

    IF result IS ERROR THEN
        SAVE PROCESSING RECORD {
            key: request.idempotency_key,
            status: "failed",
            error: result.message
        }
        RETURN result
    END IF

    SAVE PROCESSING RECORD {
        key: request.idempotency_key,
        status: "succeeded",
        result: result
    }

    RETURN result
END FUNCTION
```

Real concurrent systems require an atomic write or transaction so two workers
cannot both claim the same new key. The principle remains the same: ownership
must be decided once.

## Retry with a limit

Retries should be bounded:

```text
SET attempt TO 0
SET maximum_attempts TO 3

WHILE attempt IS LESS THAN maximum_attempts
    SET attempt TO attempt + 1
    SET result TO process_request(request)

    IF result IS NOT ERROR THEN
        RETURN result
    END IF
END WHILE

RETURN ERROR("Maximum attempts reached")
```

Not every failure should be retried. Invalid input will remain invalid. A
temporary unavailable service may recover.

## Callbacks and correlation

Long work may finish through a later callback. A correlation ID connects the
callback to the original run:

```text
SET run TO {
    id: "run-88",
    correlation_id: "ticket-14-analysis",
    status: "running"
}
```

```text
FUNCTION accept_callback(callback)
    SET run TO LOAD RUN callback.run_id

    IF run IS NOTHING THEN
        RETURN ERROR("Unknown run")
    END IF

    IF run.status IS EQUAL TO "completed" THEN
        RETURN run.result
    END IF

    SET run.status TO "completed"
    SET run.result TO callback.result
    SAVE run
    RETURN run.result
END FUNCTION
```

Repeated callbacks return the completed result rather than completing the run
twice.

## Common mistakes

### Retrying with a new key

The receiver cannot recognize the request as a duplicate.

### Assuming timeout means failure

The operation may have completed before communication was interrupted.

### Marking success before saving the result

A crash after reporting success can leave no durable record of the work.

### Retrying permanent validation errors

Repeated execution cannot repair invalid input.

### Allowing unlimited retries

An unhealthy dependency can create endless work and hide the real failure.

### Checking duplicates without atomic ownership

Two workers can both observe “not processed” and perform the same side effect.

## Exercise: Identify safe retries

Which operations are naturally idempotent?

1. Set a task status to `"completed"`.
2. Increase a counter by `1`.
3. Add an email address to a set.
4. Append an email address to a list.

<details>
<summary>Show solution</summary>

Naturally idempotent:

- Setting the same task status again keeps the same final value.
- Adding an existing value to a set keeps one copy.

Not naturally idempotent:

- Increasing a counter repeats the addition.
- Appending to a list may create duplicates.

</details>

## Small challenge

Write pseudocode for `archive_item_once(request)`. It should use an
idempotency key, return the stored result when the operation already
succeeded, archive the item once, and save the result.

<details>
<summary>Show one solution</summary>

```text
FUNCTION archive_item_once(request)
    SET previous_result TO LOAD RESULT FOR request.idempotency_key

    IF previous_result IS NOT NOTHING THEN
        RETURN previous_result
    END IF

    SET item TO LOAD ITEM WITH ID request.item_id

    IF item IS NOTHING THEN
        RETURN ERROR("Item not found")
    END IF

    SET item.is_archived TO TRUE
    SAVE item
    SAVE RESULT request.idempotency_key WITH item
    RETURN item
END FUNCTION
```

</details>

## Continue the journey

- **Requires:** State and Persistence
- **Requires:** Workflows and State Machines
- **Builds on:** Events and Notifications
- **Later:** Concurrency and Transactions
- **Later:** Distributed Systems

