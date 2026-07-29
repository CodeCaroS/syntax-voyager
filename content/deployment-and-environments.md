---
id: deployment-and-environments
title: Deployment and Environments
summary: Learn how the same application moves safely through development, test, and production.
level: intermediate
learning_goal: Separate build artifacts, environment configuration, and deployment verification.
system: programming-fundamentals
order: 48
status: draft
sources: []
prerequisites: [modules-and-dependencies, http-and-web-basics]
relations:
  - { target: modules-and-dependencies, type: requires }
  - { target: http-and-web-basics, type: requires }
last_reviewed: 2026-07-29
---

# Deployment and Environments

Deployment places a tested application version into an environment with its required configuration.

## Learning objective

After this article, you can distinguish source, build artifact, configuration, and running deployment.

## Core idea

```text
SET artifact TO BUILD source_version
VERIFY artifact
DEPLOY artifact TO production WITH production_configuration
CHECK health
```

The deployed artifact should match the version that was verified.

## Common mistakes

- rebuilding differently during release;
- testing only development configuration;
- declaring success before checking the running service.

## Exercise: Preserve provenance

Should production use an unverified rebuild?

<details><summary>Show solution</summary>

No. Deploy the exact verified artifact.

</details>

## Small challenge

Define a health check and rollback signal for a lesson service.

## Continue the journey

- **Requires:** Modules and Dependencies
- **Requires:** HTTP and Web Basics
- **Next:** Configuration and Secrets
