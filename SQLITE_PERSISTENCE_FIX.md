# EAII PTT — SQLite Persistence & Power-Off Recovery

## What changed

- Test Builder project state is persisted in the SQLite database (`app_state` / `project_draft`).
- Active sequential pipeline snapshots are persisted in SQLite instead of `localStorage`.
- The sql.js SQLite binary is persisted into IndexedDB, which survives browser close and normal full machine power-off.
- Builder changes are written continuously, so the latest project name, target URL, plan, endpoints, test configuration, and builder step are recoverable after restart.
- Running test state is checkpointed every live tick instead of every five seconds, reducing data loss after an unexpected shutdown.
- Startup remains passive: persisted state is recovered only as pending state; no test, network traffic, timer, or browser popup starts automatically.
- An explicit `resumePersistedRun()` method is available for a future Resume action.

## Important limitation

A browser application cannot guarantee persistence if the user/browser profile or site storage is deliberately cleared. The application therefore treats SQLite/sql.js + IndexedDB as the persistent source of truth and provides SQLite export from Settings.
