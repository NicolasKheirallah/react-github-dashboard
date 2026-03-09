# Deployment

## Supported Static Deployment

This repo now includes:

- CI for lint, test, build, and production dependency audit
- GitHub Pages deployment on `main` / `master`
- Pull request preview artifacts uploaded as workflow artifacts
- Netlify configuration via `netlify.toml` with `dist` as the publish directory

## Netlify

This repo builds with Vite, so the deploy output directory is:

```bash
dist
```

If Netlify was previously configured through the UI for Create React App, override it to:

```bash
Build command: npm run build
Publish directory: dist
```

The committed `netlify.toml` now carries those settings for future deploys.

## GitHub Pages

The `Deploy Pages` workflow builds the app with:

```bash
VITE_BASE_PATH=/${REPOSITORY_NAME}/
```

That keeps asset paths valid for repository-scoped GitHub Pages hosting.

## Local Production Build

```bash
npm ci
npm run build
npm run preview
```

## Required Runtime Assumptions

- The app is still a client-side GitHub dashboard
- GitHub tokens are entered by the user at runtime
- No server-side secrets should be injected into the bundle

## Recommended Headers

When deploying behind a reverse proxy or CDN, add:

- `Content-Security-Policy`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: geolocation=(), microphone=(), camera=()`
- `X-Frame-Options: DENY` or equivalent `frame-ancestors 'none'`

## Deployment Blockers Still Outside This Repo

- Server-backed OAuth/session architecture
- Runtime observability/alerting
- Deployment-specific secret management and rollback automation
