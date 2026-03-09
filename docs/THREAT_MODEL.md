# Threat Model

## In Scope

- User-entered GitHub personal access tokens
- Settings import/export files
- Local browser storage used for non-secret preferences
- External links opened from GitHub-backed data

## Primary Risks

### Token exposure in browser runtime

- Impact: high
- Current mitigation: tokens are memory-only and not persisted
- Remaining gap: browser runtime still directly handles the token

### XSS leading to token exfiltration

- Impact: high
- Current mitigation: safer URL handling, no token persistence, basic CSP in `index.html`
- Remaining gap: true production safety still requires a server-backed auth flow

### Malicious settings import payloads

- Impact: medium
- Current mitigation: imported settings are validated before application, oversized payloads are rejected, and unsupported fields are blocked
- Remaining gap: imported widget config shapes are still not fully versioned

### Unsafe external URL opens

- Impact: medium
- Current mitigation: interactive flows and dynamic outbound links use shared URL sanitization before navigation
- Remaining gap: broad outbound allowlisting is still app-level and not enforced by a server-side policy

### Oversized client-side trust boundary

- Impact: high
- Current mitigation: none beyond session-only token handling
- Remaining gap: move to backend OAuth/token exchange and server-side API mediation

### Sensitive data retained in browser storage

- Impact: medium
- Current mitigation: GitHub API payload caching was removed from `localStorage`, and search/filter history now uses session-scoped storage only
- Remaining gap: true least-privilege still requires server-side mediation and shorter-lived sessions
