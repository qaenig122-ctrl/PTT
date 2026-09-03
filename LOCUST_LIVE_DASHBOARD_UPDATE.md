# Locust Live Dashboard Update

- Locust is the live dashboard for Locust-engine test runs.
- The EAII PTT Live Monitoring page embeds `http://localhost:8089` when the selected engine is Locust.
- A fallback **Open Locust Dashboard** button opens the same dashboard in a new browser tab.
- Grafana is removed from the main navigation and live workflow.
- After Stop/Complete, the user returns to EAII PTT Results, where EAII PTT owns scoring and reporting.
- Existing Grafana configuration files are retained for compatibility with projects that may still use Prometheus/Grafana for other engines; they are not used as the Locust live view.
