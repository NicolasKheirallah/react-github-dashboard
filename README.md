# GitHub Dashboard

A client-side GitHub analytics dashboard built with React, Vite, Tailwind CSS v4, Chart.js, and `@dnd-kit`.

## What Changed

- Migrated from Create React App to Vite.
- Upgraded styling to Tailwind CSS v4.
- Removed persistent token storage. GitHub tokens now stay in memory only.
- Rebuilt search, command palette, and settings import/export flows.
- Deleted unfinished dead modules that were breaking lint/build quality.
- Added React Query for dashboard and notification data flows.
- Added runtime error boundary and client observability hooks.
- Added a Playwright end-to-end test for the primary login-to-dashboard journey.
- Restored a green `lint` / `build` / `test` baseline.

## Security Model

- This app calls the GitHub API directly from the browser.
- Personal access tokens are validated and kept in memory for the current session only.
- Tokens are not written to `localStorage` or `sessionStorage`.
- Settings import is schema-validated before being applied.

This is safer than the previous implementation, but it is still a client-only dashboard. A production release should move authentication to a server-backed OAuth flow.

## Requirements

- Node.js 20+ is recommended for Tailwind CSS v4.
- `npm` 10+ recommended.

## Local Development

```bash
npm install
npm run dev
```

Open the local Vite URL shown in the terminal.

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm test
npm run test:e2e
```

## Product Areas

- Standard dashboard with overview, charts, and tabbed lists
- Customizable dashboard with draggable widgets
- Unified search and advanced search page
- Notification center
- Theme toggle and settings import/export

## Architecture Notes

- `src/App.jsx`: app shell, routing, auth session state, settings import/export
- `src/context/GithubContext.jsx`: shared GitHub data state
- `src/context/ThemeContext.jsx`: shared theme state
- `src/lib/queryClient.js`: shared React Query cache policy
- `src/services/github/*`: GitHub API access split by domain
- `src/services/dataProcessingService.js`: raw API to UI-model transforms
- `src/components/dashboard/*`: dashboard views, widgets, charts, and tabs
- `docs/ARCHITECTURE.md`: current boundaries and next refactor path

## Deployment and Ops

- `.github/workflows/ci.yml`: lint, test, build, and production dependency audit
- `.github/workflows/deploy-pages.yml`: static deployment to GitHub Pages
- `.github/workflows/preview-artifact.yml`: pull request preview build artifact
- `.github/dependabot.yml`: weekly dependency update automation
- `docs/DEPLOYMENT.md`: deployment notes and required headers
- `docs/ENVIRONMENT.md`: environment and build variables
- `docs/THREAT_MODEL.md`: current frontend threat model
- `docs/RELEASE_CHECKLIST.md`: release and rollback checklist

## Verification

The current repo baseline passes:

```bash
npm run lint
npm run build
npm test
npm run test:e2e
```

## Known Follow-Ups

- Move auth to a backend OAuth exchange before any real production release.
- Add a deployed backend or edge function for OAuth token exchange and secret handling.
- Introduce TypeScript domain contracts at the query/data-processing boundary.
- Add broader automated coverage for search, notifications, and widget editing flows.
