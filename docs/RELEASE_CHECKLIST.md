# Release Checklist

## Before Release

- Confirm `npm run lint`
- Confirm `npm test -- --run`
- Confirm `npm run build`
- Confirm `npm audit --omit=dev`
- Verify login, logout, search, dashboard tab routing, settings export/import, and widget customization manually
- Review GitHub token copy to ensure it does not overstate security guarantees
- Review the deployment target for CSP and security headers

## Rollback Guidance

- Re-deploy the last known-good GitHub Pages artifact or hosting provider build
- Revert the offending commit range
- Re-run CI and confirm the static build before restoring traffic
- If a security issue is involved, rotate any impacted GitHub credentials immediately
