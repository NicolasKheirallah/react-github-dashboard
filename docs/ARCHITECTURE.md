# Architecture

## Current Boundaries

- `src/App.jsx`: app shell, auth session state, settings import/export, top-level routing
- `src/context/GithubContext.jsx`: shared GitHub data state, loading/error state, and session-adjacent GitHub data wiring
- `src/context/ThemeContext.jsx`: visual theme state and theme persistence
- `src/lib/queryClient.js`: shared React Query cache policy and retry/staleness defaults
- `src/services/github/*`: domain-scoped GitHub API clients (`session`, `dashboard`, `notifications`, `contributors`)
- `src/services/dataProcessingService.js`: transforms raw GitHub responses into UI models
- `src/components/dashboard/*`: dashboard views, charts, tab surfaces, and widget customization
- `src/utils/*`: reusable helpers for settings, external links, and search processing

## State Ownership

- Auth token is memory-only in `AppShell`
- Theme state lives in `ThemeContext`
- Processed GitHub data, loading, and error state live in `GithubContext`
- Route state lives in React Router query params
- Search view state stays local to the search surfaces, with recent-search persistence handled through a dedicated session-scoped hook
- Widget layout and view preferences persist in `localStorage`, with customizable dashboard layout behavior handled through a dedicated hook
- Dashboard and notification fetch lifecycles now live in React Query rather than ad hoc component effects
- GitHub API pagination/cache is now memory-backed per app session rather than persisted in browser storage

## Known Architectural Debt

- `GithubContext` still owns too many responsibilities beyond visual theme, even after the theme split
- Charts still mix rendering logic with data shaping in multiple places
- Product analytics and deployment-time alerting are still missing from the observability stack

## Recommended Next Refactor

1. Continue splitting the remaining GitHub API concerns into smaller service modules where raw fetch logic still exists
2. Introduce TypeScript for processed domain contracts first
3. Continue moving chart-specific shaping into dedicated selectors/hooks instead of rendering components
4. Add typed domain contracts around the query/data-processing boundary
