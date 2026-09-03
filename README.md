<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/59a0525f-0a9a-48d8-878e-4227c3ec5361

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Windows startup

From the project root, run:

```powershell
.\run_windows.bat
```

The script checks Node.js/npm, installs dependencies when `node_modules` is missing, and starts the Vite development server at `http://localhost:3000/`.


## Locust live dashboard

When a Locust test is running, EAII PTT uses the Locust web UI at `http://localhost:8089` as the live execution dashboard. The Live Monitoring screen embeds that dashboard and provides an **Open Locust Dashboard** fallback. Grafana is no longer a navigation destination for the live Locust workflow; EAII PTT remains the analysis, scoring and reporting layer.


## 2026 Full Update

This version uses a real SQLite database through `sql.js`, persisted as a SQLite binary in IndexedDB and exportable as `eaii_ptt.db`. It includes engine-aware live dashboards, independent six-type configurations, sequential test-plan execution, durable result checkpoints, endpoint/problem analysis, always-visible quality gates, progressive disclosure, and HTML/PDF/XLSX/ZIP reporting. See `IMPLEMENTATION_COMPLETE.md` for the implementation details.


## SQLite WASM startup fix
The sql.js WASM asset is bundled by Vite using `sql-wasm.wasm?url`; no manual copy to `public/` or CDN access is required. This avoids blank-screen startup failures caused by missing `/sql-wasm.wasm` assets.

### Unattended Windows execution

For sequential suites that must keep running while the monitor/display turns off, launch the application with `run_windows.bat`. It starts a native `windows-power-guard.ps1` helper that blocks Windows system sleep only while EAII PTT reports an active benchmark. Browser Wake Lock remains a secondary safeguard.


## Assessment & Persistence Rules (2026-09)

- Reliability is weighted **80%**; Performance is weighted **20%**.
- Reliability scoring uses Success/Failure 35%, HTTP 5xx 20%, Timeouts 15%, HTTP 4xx 5%, and Stability 5%.
- Performance scoring uses P95 40%, P99 25%, Average Response 20%, and RPS/Throughput 15%.
- Critical reliability threshold violations override the numerical score and produce **CRITICAL / NOT READY**.
- Informational report findings are labeled **OPTIMIZATION INSIGHT**, not OBSERVATION.
- Project drafts and active-run checkpoints are stored in the sql.js SQLite database and persisted to IndexedDB with a request for persistent browser storage.
- Power-off behavior: JavaScript cannot execute while the computer is powered off; the application persists the project/checkpoint before shutdown so the data remains available after restart. An unfinished run requires explicit user resume and is never auto-started.
