# Syntax Voyager

An accessible space-themed learning system for connected programming and
software-engineering knowledge, with explicit EU AI Act transparency.

![Syntax Voyager galaxy interface](public/og.png)

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

## Technology

- React 19 and Vinext on Vite;
- TypeScript and Markdown content;
- Three.js for the knowledge galaxy;
- Cloudflare Workers for deployment;
- Node's test runner and Playwright for verification.

## Privacy, accessibility, and AI transparency

- Learning progress is stored only in the current browser's `localStorage`.
- Core navigation and learning flows are keyboard accessible and support
  reduced-motion preferences.
- The app does not use AI to interact with learners, generate responses,
  profile users, or make automated decisions. An in-product EU AI Act notice
  makes this explicit.

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
npm run test:e2e
```

Pull requests run lint, unit/render tests, and the Chromium end-to-end suite in
GitHub Actions.

On Windows, if Node reports `EPERM` while resolving the OneDrive root, run the
same check through the included mapped-drive helper:

```powershell
.\scripts\run-node-safe.ps1 -NpmScript test
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

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, content rules, and the checks
expected before a pull request.

Project background lives in the [project plan](docs/project-plan.md) and the
[beginner usability study](docs/usability-study.md).

## Security

Please follow [SECURITY.md](SECURITY.md) and do not disclose vulnerability
details in a public issue.

## License

No open-source license has been selected yet. Until a `LICENSE` file is added,
all rights are reserved by the copyright holder.
