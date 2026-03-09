# Environment

## Local Requirements

- Node.js 20+
- npm 10+

## Optional Build Variables

- `VITE_BASE_PATH`
  - Default: `/`
  - Used for static hosting under a repository subpath, such as GitHub Pages
- `VITE_OBSERVABILITY_ENDPOINT`
  - Default: unset
  - When set, client error logs and web-vitals metrics are posted to this endpoint

## Deliberately Not Supported

- Bundled GitHub tokens in `.env`
- Server secrets exposed to the browser bundle

## Local Example

```bash
VITE_BASE_PATH=/react-github-dashboard/ npm run build
```

```bash
VITE_OBSERVABILITY_ENDPOINT=https://example.com/ingest npm run build
```
