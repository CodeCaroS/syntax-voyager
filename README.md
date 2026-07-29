# Syntax Voyager

Syntax Voyager is a space-journey learning system for connected programming
and software-engineering knowledge.

## What is implemented

- a cinematic, keyboard-accessible 50-node knowledge galaxy;
- five navigable knowledge sectors using the existing article graph;
- five outcome-based personal flight plans;
- device-local lesson visits, mastery signals, and resumable progress;
- four guided expedition campaigns;
- an editable pseudocode flight simulator with step traces, state, output,
  function call stacks, loop protection, and automatic mission checks;
- language bridges that translate lesson pseudocode into TypeScript, Python,
  and Java views;
- readable article routes with prerequisites, related coordinates, and an
  on-page heading navigator.

Progress stays in the current browser. The app does not require an account,
database, AI service, or remote code runner.

## Development

Requires Node.js `>=22.13.0`.

```bash
npm install
npm run dev
```

Useful checks:

```bash
npm run build
npm run lint
npm test
```

`npm run content:build` validates every Markdown article and regenerates the
application content bundle.

## Project shape

- `content/` — articles and the pseudocode/content contracts;
- `scripts/generate-content.mjs` — content and graph validation;
- `app/` — the galaxy, articles, Mission Control, and Simulation Deck;
- `lib/voyage.ts` — galaxies, flight plans, expeditions, and lab missions;
- `lib/pseudocode.ts` — the bounded educational pseudocode runtime;
- `lib/language-bridge.ts` — lesson example translations;
- `tests/` — rendered-route and learning-engine verification.

The app keeps one source of truth for article content and graph relationships.
Learning routes and sectors reuse those coordinates instead of introducing a
second content model.
