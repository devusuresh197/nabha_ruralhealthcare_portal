# Backend Folder

This folder contains server-side/backend code:

- `auth-db.ts`: MongoDB auth access and credential verification.
- `data-store.ts`: API data operations used by route handlers.
- `medicine-prebooking-db.ts`: MongoDB storage for medicine inventory and prebooking workflows.
- `scripts/grant-access.mjs`: admin script to grant/update user access.

`app/api/*` remains as Next.js route entry points, and imports backend logic via `lib/*` compatibility exports.
