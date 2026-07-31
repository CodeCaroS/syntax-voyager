# Contributing to Syntax Voyager

## Setup

Syntax Voyager requires Node.js `>=22.13.0`.

```bash
npm ci
npm run dev
```

## Content changes

Follow the contracts in `content/CONTENT_CONTRACT.md` and
`content/PSEUDOCODE_GUIDE.md`. Keep article IDs and graph relationships valid;
`npm run content:build` checks them and regenerates the application bundle.

## Before a pull request

```bash
npm run lint
npm test
npm run test:e2e
```

On Windows, if OneDrive causes a Node `EPERM` error, run a check through the
included mapped-drive helper:

```powershell
.\scripts\run-node-safe.ps1 -NpmScript test
```

Keep pull requests focused and explain user-visible changes. A license has not
been selected yet, so discuss substantial contributions with the maintainer
before investing significant work.
