# Syntax Voyager Content Contract

This contract defines the content format the first implementation may rely on.
Article front matter is the source of truth for navigation, ordering,
prerequisites, and graph edges.

## Article files

- Articles live directly in `content/`.
- The filename is `<id>.md`.
- Supporting documents without front matter are not articles.
- Every article begins and ends its front matter with `---`.
- Article bodies use GitHub-flavored Markdown.
- Pseudocode fences use `text`; executable language fences are not used in the
  Programming Fundamentals system.

## Required front matter

```yaml
id: values-and-variables
title: Values and Variables
summary: Learn how programs name, store, read, and change information.
level: beginner
learning_goal: Trace variable values and use variables to describe changing state.
system: programming-fundamentals
order: 2
status: draft
sources: []
prerequisites:
  - algorithms-and-pseudocode
relations:
  - target: algorithms-and-pseudocode
    type: requires
last_reviewed: 2026-07-29
```

Field rules:

| Field | Rule |
|---|---|
| `id` | Unique lowercase kebab-case identifier; equal to the filename. |
| `title` | Reader-facing article title; equal to the first `#` heading. |
| `summary` | One short search- and navigation-friendly sentence. |
| `level` | `beginner`, `intermediate`, or `advanced`. |
| `learning_goal` | One observable outcome for the learner. |
| `system` | Kebab-case knowledge-system identifier. |
| `order` | Unique positive integer within the system. |
| `status` | `draft` or `published`. |
| `sources` | Empty for a draft; non-empty before publication. |
| `prerequisites` | Ordered article IDs that should be learned first. |
| `relations` | Typed graph edges originating at this article. |
| `last_reviewed` | ISO date in `YYYY-MM-DD` format. |

## Relationship semantics

Allowed relationship types:

- `requires`: the current article depends on the target;
- `builds-on`: the current article deepens the target;
- `used-with`: the concepts are commonly used together;
- `part-of`: the current article belongs to the larger target concept;
- `contrasts-with`: the concepts clarify each other through comparison;
- `example-of`: the current article is a concrete example of the target.

Every prerequisite must also have a `requires` relation. Implementations derive
reverse links by scanning incoming edges; authors do not duplicate reverse
relationships.

All prerequisite and relation targets must exist as article files. A future
node is added to the graph only when its article exists, which keeps the
implementable graph closed and free of placeholders.

## Required article sections

Each article contains:

- one `#` heading matching `title`;
- `## Learning objective`;
- explanatory sections appropriate to the concept;
- `## Common mistakes`;
- at least one `## Exercise: ...`;
- `## Small challenge`;
- `## Continue the journey`.

Solutions use native `<details>` and `<summary>` elements so readers decide when
to reveal them.

## Implementation behavior

- Development builds may show `draft` articles.
- Public production builds show only `published` articles.
- Search indexes `title`, `summary`, `learning_goal`, and article body.
- Navigation sorts nodes by `system`, then `order`.
- The graph uses declared relations and derived reverse edges.
- The application generates graph layout coordinates; content does not store
  presentation positions.
- Missing or invalid metadata fails the build instead of silently dropping an
  article.

Run `npm run content:build` before starting the application and in CI. The
command validates every article and generates the build-time content bundle.
