# EAII PTT — Full End-to-End Update

This package implements the requested EAII PTT update around the existing React/Vite application.

## Database

- SQLite is the application persistence engine.
- `sql.js` creates a real SQLite database in the browser.
- The binary SQLite database is persisted in IndexedDB between sessions.
- The database can be exported as `eaii_ptt.db` from Reports.
- No PostgreSQL, Neon, psycopg2, JSONB, or `DATABASE_URL` dependency is used.
- Tables include users, projects, test_plans, test_configurations, test_executions, test_results, endpoint_results, findings, reports, engine_configurations, and app_settings.

## Engine-aware monitoring

- Locust uses Locust Web UI when its dashboard URL is configured.
- k6 uses Grafana when a Grafana URL is configured.
- Other/unsupported engines use EAII PTT internal monitoring.
- The live monitoring screen always shows the selected engine's dashboard capability and never globally forces Grafana.
- If an external dashboard is not configured, internal EAII PTT monitoring remains available.

## Independent configurations

All six test types have separate stored configuration:

- Load
- Stress
- Spike
- Endurance
- Volume
- Concurrency

Each stores VUs, spawn rate, duration, ramp-up and thresholds. Sequential execution retrieves the configuration for the next test type rather than inheriting the previous test's values.

## Persistence

Results are checkpointed in SQLite during execution and persisted again when a test completes or is stopped. This keeps the latest collected metrics available after Stop/Complete.

## Reporting

Reports include:

- EAII PTT branding
- embedded/base64 logo for portable HTML
- score immediately after report identity/header
- executive summary
- KPI metrics
- reliability
- performance
- endpoint performance
- problematic endpoints
- all endpoint results
- SLA/quality gates
- bottlenecks/action items
- final assessment

HTML is self-contained. PDF and XLSX are generated client-side, and ZIP contains HTML/PDF/XLSX/JSON/CSV artifacts.

## First-run SQLite WASM asset

The source depends on `sql.js`. For a fully offline build, copy:

`node_modules/sql.js/dist/sql-wasm.wasm`

to:

`public/sql-wasm.wasm`

The database layer first looks for that local asset and has a CDN fallback for development environments.

## Run

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

The supplied source archive intentionally does not include `node_modules`.


## Rebuild Verification — 2026-09-01

The rebuild now includes:
- Live Dashboard as the default startup tab.
- One-shot startup recovery through `autoStartOrContinuePreviousTest()`.
- SQLite-based continuation to the first unfinished test in the latest project plan.
- Recovery of an in-flight run and persisted 3-second auto-advance deadline.
- Automatic browser launch after Vite becomes reachable on port 3000.

The build environment used for this rebuild did not have npm registry access, so dependencies could not be installed in the build container. Run `npm install` on the Windows machine before `run_windows.bat`; the source changes were applied and statically checked.
