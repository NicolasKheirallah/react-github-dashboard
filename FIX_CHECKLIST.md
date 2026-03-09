# Engineering Checklist

This file is split into:

- `Completed in this pass`: work that is done and verified now
- `Remaining for production-grade`: work still required before this project can reasonably score near 10/10 across all categories

## Completed In This Pass

### Toolchain and Build

- [x] Migrate the app from `react-scripts` to Vite
- [x] Upgrade the project to Tailwind CSS v4
- [x] Remove the broken PostCSS configuration
- [x] Add Vite entry files and config
- [x] Add ESLint flat config for the Vite setup
- [x] Move test setup to a Vitest-compatible baseline
- [x] Restore a green baseline for `build`, `lint`, and `test`
- [x] Add code-splitting for major feature surfaces through lazy-loaded routes/components

### Security

- [x] Remove persistent GitHub token storage from `localStorage`
- [x] Remove session token persistence from `sessionStorage`
- [x] Delete the saved-token vault feature
- [x] Keep GitHub tokens in memory only for the current app session
- [x] Replace misleading client-side auth persistence messaging in the login flow
- [x] Harden settings import with schema-style validation before applying changes
- [x] Centralize direct external opens through a safe URL helper for interactive flows
- [x] Add a basic CSP policy to the static HTML shell
- [x] Add threat-model documentation for auth, imports, local cache, and external links
- [x] Remove persisted GitHub API payload caching from browser storage
- [x] Move user-derived recent searches and advanced filters to session-scoped storage
- [x] Sanitize dynamic external links rendered from GitHub/user data before navigation
- [x] Redact token-like values from client telemetry and ignore extension-origin noise

### Product and Correctness

- [x] Make dashboard navigation route-aware through query-param driven tabs
- [x] Ensure header navigation maps to real dashboard behavior
- [x] Rebuild search results to support repositories, starred repositories, pull requests, issues, and organizations
- [x] Rebuild advanced filter management into a functional, maintainable flow
- [x] Repair processed data contracts used by `Overview` and dashboard tabs
- [x] Normalize PR state handling to lowercase domain values
- [x] Preserve repo privacy/fork compatibility in processed models
- [x] Fix in-place sorting bugs in dashboard tabs
- [x] Fix drag-and-drop null-target handling in the customizable dashboard
- [x] Remove broken dead modules and placeholder implementations that were poisoning the baseline
- [x] Remove remaining sample/demo fallback data from chart surfaces that should be data-driven only
- [x] Harden dashboard layout loading against invalid saved widget state
- [x] Add a clearer default dashboard narrative with an attention-oriented briefing surface
- [x] Add preset-driven search entry points for faster first-use workflows
- [x] Add shared repo/time scoping across overview, chart, and list-heavy standard dashboard surfaces
- [x] Add summary-card drilldowns from overview surfaces into filtered dashboard tabs
- [x] Keep dashboard view, tab, repo scope, and time range in shareable URL state
- [x] Add saved dashboard views/presets for common jobs-to-be-done
- [x] Add owner-aware scoping on top of repo/time filters
- [x] Unify search-page query state with presets and URL-driven searches
- [x] Add first-use onboarding guidance to the login flow
- [x] Improve mobile header navigation with a direct search action

### Accessibility and UX

- [x] Add dialog semantics to unified search
- [x] Add dialog semantics to command palette
- [x] Add dialog semantics to widget add/configure modals
- [x] Improve labels on search inputs and icon-only controls in touched flows
- [x] Improve notification popover semantics and live regions for loading/error states
- [x] Standardize more useful empty/loading/error states in repaired flows
- [x] Add focus trapping and focus return behavior for the current dialog surfaces
- [x] Add more explicit accessible labels to remaining icon-only widget and search controls
- [x] Improve dashboard and search visual hierarchy with stronger lead sections and control surfaces
- [x] Add clearer active-search and workflow framing on the search page

### Architecture

- [x] Extract app-used GitHub auth, dashboard, and notification calls into smaller domain service modules
- [x] Extract contributor data fetching into a dedicated GitHub domain service module
- [x] Remove the dead legacy `githubService.js` monolith from the app codebase
- [x] Split theme/UI state out of `GithubContext` into a dedicated `ThemeContext`
- [x] Add a shared React Query client and use it for dashboard and notification data flows
- [x] Move dashboard loading and preference state into dedicated hooks
- [x] Move customizable dashboard layout persistence and reorder logic into a dedicated hook
- [x] Move unified-search result building and recent-search persistence into dedicated utilities/hooks
- [x] Add a shared scoped-dashboard selector hook instead of re-filtering in multiple top-level UI surfaces
- [x] Move shared parsing/filter logic into dedicated utilities/hooks
- [x] Reduce large component complexity in dashboard and search surfaces

### Documentation and Verification

- [x] Replace the CRA boilerplate README with project-specific documentation
- [x] Document the new security model and local dev flow
- [x] Add unit tests for settings validation/import/export
- [x] Add unit tests for `dataProcessingService`
- [x] Add unit tests for search parsing and filtering
- [x] Add integration tests for login/logout session behavior
- [x] Add integration tests for dashboard tab routing and query-param sync
- [x] Add GitHub Actions for lint, build, test, and production dependency audit
- [x] Add preview build/deployment workflow scaffolding for pull requests and GitHub Pages
- [x] Add production deployment, environment, architecture, threat-model, and release documentation
- [x] Add dependency update automation
- [x] Verify `npm run lint`
- [x] Verify `npm run build`
- [x] Verify `npm test`
- [x] Verify `npm audit --omit=dev`

## Remaining For Production-Grade

These items are not fixed yet. This is the real gap between the current repo and a 10/10 or near-production-ready score.

### Security and Trust Boundaries

- [ ] Move authentication from client-side PAT entry to a backend OAuth/token-exchange flow
- [ ] Add a backend or edge function layer so GitHub tokens are never directly exposed to the browser runtime
- [ ] Introduce a real auth/session lifecycle with expiry and revocation handling
- [ ] Add Content Security Policy headers
- [x] Add security headers strategy for deployment
- [x] Add dependency scanning in CI
- [x] Review all direct external URL opens and centralize safe URL generation for interactive flows

### Architecture

- [ ] Continue splitting remaining GitHub API concerns into smaller domain services
- [x] Introduce a dedicated data-fetching/cache layer instead of hand-rolled fetch orchestration
- [x] Reduce `GithubContext` responsibility and split UI state from data state
- [ ] Define stable typed domain models for user, repo, PR, issue, org, and search result entities
- [ ] Remove remaining imperative chart rendering where a declarative pattern is more maintainable

### Type Safety

- [ ] Adopt TypeScript for service contracts and processed GitHub models
- [ ] Add strict prop typing or TS interfaces for all cross-feature components
- [x] Add schema validation for imported/exported settings and persisted dashboard layout
- [x] Add contract tests for `dataProcessingService`

### Product and UX

- [x] Define a clearer default dashboard narrative such as “Needs attention”, “This week”, or “Review bottlenecks”
- [x] Add global date-range controls
- [x] Add repo scoping controls for the dashboard workflow
- [x] Add drilldowns from summary cards into filtered lists
- [x] Add org-aware scoping or multi-select scoping controls
- [x] Unify quick search and advanced search semantics further
- [x] Add better onboarding for first-time PAT/OAuth users
- [ ] Improve mobile behavior for dense dashboard and chart screens
- [x] Add saved views or presets for common jobs-to-be-done
- [ ] Review visual density and hierarchy to reduce equal-weight cards

### Accessibility

- [x] Add focus trapping and focus return behavior for the current dialog surfaces
- [ ] Audit heading structure across all pages
- [ ] Audit all forms for complete programmatic labeling
- [ ] Add keyboard support for all remaining non-form interactive surfaces
- [ ] Add accessible chart summaries or table alternatives for all data visualizations
- [ ] Run an accessibility audit with axe and fix remaining issues
- [ ] Review color contrast systematically in both light and dark themes

### Performance

- [ ] Reduce the largest dashboard/chart chunks further
- [ ] Add more granular lazy loading for heavy chart families
- [ ] Add request cancellation and stale-data handling
- [x] Replace synchronous `localStorage` caching for large API payloads with a better caching strategy
- [ ] Add pagination or incremental loading for data-heavy GitHub resources
- [ ] Audit chart redraw frequency and memoization opportunities
- [ ] Add bundle analysis to CI

### Reliability

- [ ] Add explicit partial-failure handling when some GitHub endpoints fail and others succeed
- [ ] Add retry/backoff consistency across all API flows
- [ ] Add rate-limit specific UI messaging and degraded-state handling
- [ ] Add offline/error recovery affordances for key flows
- [ ] Add stronger validation around imported dashboard layout/widget configs

### Testing

- [x] Add unit tests for `dataProcessingService`
- [x] Add unit tests for search parsing and filtering
- [x] Add unit tests for unified search result building
- [x] Add unit tests for settings validation/import/export
- [x] Add integration tests for login/logout/session behavior
- [x] Add integration tests for dashboard tab routing and query-param sync
- [ ] Add integration tests for customizable dashboard interactions
- [ ] Add integration tests for unified search and advanced search
- [ ] Add integration tests for notification center behavior
- [x] Add end-to-end tests for the primary user journey
- [x] Add mocking strategy for GitHub API responses

### CI/CD and Operations

- [x] Add GitHub Actions for lint, build, and test on pull requests
- [x] Add preview deployment workflow
- [x] Add production deployment documentation
- [x] Add environment configuration documentation
- [x] Add release checklist and rollback guidance
- [x] Add dependency update automation

### Observability

- [x] Add runtime error tracking
- [x] Add structured client logging strategy
- [ ] Add product analytics for feature usage
- [x] Add performance monitoring for large views/charts
- [ ] Add alerting thresholds for production failures if deployed

### Cleanup and Maintainability

- [x] Remove sample/demo fallback data from chart components that should be data-driven only
- [ ] Standardize naming conventions between raw API fields and UI models
- [ ] Review all console output and remove remaining non-essential logs
- [ ] Shrink the remaining oversized files that still carry too many responsibilities
- [x] Add architecture documentation for folder boundaries and state ownership

## Current Status

### Verified Now

- [x] `npm run lint`
- [x] `npm run build`
- [x] `npm test`
- [x] `npm audit --omit=dev`

### Not Yet True

- [ ] Production-ready authentication
- [ ] End-to-end test coverage for critical flows
- [x] CI/CD pipeline
- [ ] Observability/monitoring
- [ ] Type-safe domain contracts
- [ ] 10/10 quality across all review categories
