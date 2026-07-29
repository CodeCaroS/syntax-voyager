---
id: configuration-and-secrets
title: Configuration and Secrets
summary: Learn how environments supply settings without exposing credentials.
level: intermediate
learning_goal: Separate safe configuration from sensitive secrets and validate both at startup.
system: programming-fundamentals
order: 49
status: draft
sources: []
prerequisites: [deployment-and-environments, security-fundamentals]
relations:
  - { target: deployment-and-environments, type: requires }
  - { target: security-fundamentals, type: requires }
last_reviewed: 2026-07-29
---

# Configuration and Secrets

Configuration changes behavior between environments. Secrets grant access and require stronger protection.

## Learning objective

After this article, you can classify settings and fail clearly when required values are missing.

## Core idea

```text
SET port TO READ CONFIGURATION "PORT"
SET database_secret TO READ SECRET "DATABASE_PASSWORD"

IF port IS MISSING OR database_secret IS MISSING THEN
    STOP STARTUP WITH ERROR
END IF
```

Required configuration should fail at startup rather than during user work.

## Common mistakes

- committing secrets to source control;
- logging secret values;
- silently using unsafe production defaults.

## Exercise: Classify values

Is a public port number normally a secret?

<details><summary>Show solution</summary>

No. It is configuration. A database password is a secret.

</details>

## Small challenge

Create a startup checklist for three required settings and one secret.

## Continue the journey

- **Requires:** Deployment and Environments
- **Requires:** Security Fundamentals
- **Next:** Documentation and Communication
