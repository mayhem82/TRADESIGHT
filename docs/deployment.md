# TRADESIGHT Deployment Notes

TRADESIGHT is currently a local-browser React and Vite application.

## Build

Run npm install, then npm run build.

## Preview

Run npm run preview.

## Current runtime boundary

- Browser local storage is used for project persistence.
- No remote database is configured.
- No authentication is configured.
- No final compliance outcome is asserted by the app.
- Unknown items remain unknown until evidence and rule paths are validated.

## Deployment target

The current codebase can be deployed to a static host that supports Vite output from the dist folder.

## Production blockers to resolve later

- Authentication and account model
- Server-side project storage
- File upload storage
- Report export pipeline
- Automated CI build verification
