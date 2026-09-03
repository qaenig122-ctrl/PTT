# Start behavior — manual only

- Launching `run_windows.bat` starts Vite and the Windows power guard only.
- The browser is never opened by the launcher or the app.
- The benchmark never starts, resumes, retries, or advances on application startup.
- A benchmark begins only after the user explicitly clicks Start Test (or another explicit pipeline control).
- After a manually started sequential suite begins, configured next steps may auto-advance as intended.
- Lifecycle wake/focus/visibility events cannot start a new benchmark because automatic continuation is gated by the in-memory `manualStartSession` flag.
- `getActiveRun()` is implemented and App startup initializes `activeRun` to `null`, avoiding startup API errors.


## Startup navigation
On application launch the UI opens on the Overview Dashboard. Launching the app does not start, resume, or open a benchmark. A benchmark starts only from the explicit Start Test action.
