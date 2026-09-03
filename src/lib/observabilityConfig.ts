export function getPrometheusYml(scrapeInterval = '5s'): string {
  return `# ==========================================================
# EAII PTT — Prometheus Configuration
# Supports k6 Remote-Write / Pushgateway / Prometheus Exporter
# ==========================================================

global:
  scrape_interval: ${scrapeInterval}
  evaluation_interval: ${scrapeInterval}
  external_labels:
    monitor: 'eaii-ptt-observability'

# Enable remote-write receiver endpoint for k6:
# Run prometheus with --web.enable-remote-write-receiver
# (e.g. k6 run -o experimental-prometheus-rw test.js)

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'eaii_k6_metrics'
    metrics_path: '/metrics'
    static_configs:
      - targets: ['host.docker.internal:6565', '127.0.0.1:6565']

  - job_name: 'eaii_locust_metrics'
    metrics_path: '/metrics'
    static_configs:
      - targets: ['host.docker.internal:9646', '127.0.0.1:9646']
`;
}

export function getGrafanaDashboardJson(): string {
  return JSON.stringify({
    title: "EAII Performance Dashboard",
    uid: "eaii-perf-main",
    description: "Live real-time performance testing metrics by Test ID and Endpoint from Prometheus",
    timezone: "browser",
    refresh: "5s",
    templating: {
      list: [
        {
          name: "testid",
          label: "Test Run",
          type: "query",
          query: "label_values(k6_http_reqs_total, testid)",
          current: { text: "All", value: "$__all" },
          includeAll: true,
          multi: false
        },
        {
          name: "endpoint",
          label: "Endpoint",
          type: "query",
          query: "label_values(k6_http_reqs_total{testid=~\"$testid\"}, endpoint)",
          current: { text: "All", value: "$__all" },
          includeAll: true,
          multi: true
        }
      ]
    },
    panels: [
      {
        id: 1,
        title: "Live Throughput (RPS)",
        type: "stat",
        gridPos: { h: 4, w: 5, x: 0, y: 0 },
        targets: [
          { expr: "sum(rate(k6_http_reqs_total{testid=~\"$testid\", endpoint=~\"$endpoint\"}[10s]))", legendFormat: "RPS" }
        ],
        fieldConfig: { defaults: { unit: "reqps", color: { mode: "thresholds" } } }
      },
      {
        id: 2,
        title: "P95 Response Latency",
        type: "stat",
        gridPos: { h: 4, w: 5, x: 5, y: 0 },
        targets: [
          { expr: "histogram_quantile(0.95, sum by (le) (rate(k6_http_req_duration_seconds_bucket{testid=~\"$testid\", endpoint=~\"$endpoint\"}[10s]))) * 1000", legendFormat: "P95 (ms)" }
        ],
        fieldConfig: { defaults: { unit: "ms", color: { mode: "thresholds" } } }
      },
      {
        id: 3,
        title: "P99 Response Latency",
        type: "stat",
        gridPos: { h: 4, w: 5, x: 10, y: 0 },
        targets: [
          { expr: "histogram_quantile(0.99, sum by (le) (rate(k6_http_req_duration_seconds_bucket{testid=~\"$testid\", endpoint=~\"$endpoint\"}[10s]))) * 1000", legendFormat: "P99 (ms)" }
        ],
        fieldConfig: { defaults: { unit: "ms", color: { mode: "thresholds" } } }
      },
      {
        id: 4,
        title: "Error Rate (%)",
        type: "stat",
        gridPos: { h: 4, w: 5, x: 15, y: 0 },
        targets: [
          { expr: "(sum(rate(k6_http_req_failed_total{testid=~\"$testid\", endpoint=~\"$endpoint\"}[10s])) / sum(rate(k6_http_reqs_total{testid=~\"$testid\", endpoint=~\"$endpoint\"}[10s]))) * 100", legendFormat: "Error %" }
        ],
        fieldConfig: { defaults: { unit: "percent", color: { mode: "thresholds" } } }
      },
      {
        id: 5,
        title: "Active Virtual Users",
        type: "stat",
        gridPos: { h: 4, w: 4, x: 20, y: 0 },
        targets: [
          { expr: "max(k6_vus{testid=~\"$testid\"})", legendFormat: "VUs" }
        ]
      },
      {
        id: 6,
        title: "Throughput by Endpoint (RPS Over Time)",
        type: "timeseries",
        gridPos: { h: 8, w: 12, x: 0, y: 4 },
        targets: [
          { expr: "sum by (endpoint, method) (rate(k6_http_reqs_total{testid=~\"$testid\", endpoint=~\"$endpoint\"}[5s]))", legendFormat: "{{method}} {{endpoint}}" }
        ]
      },
      {
        id: 7,
        title: "P95 Response Latency Over Time (by Endpoint)",
        type: "timeseries",
        gridPos: { h: 8, w: 12, x: 12, y: 4 },
        targets: [
          { expr: "histogram_quantile(0.95, sum by (le, endpoint) (rate(k6_http_req_duration_seconds_bucket{testid=~\"$testid\", endpoint=~\"$endpoint\"}[10s]))) * 1000", legendFormat: "{{endpoint}} (P95 ms)" }
        ]
      },
      {
        id: 8,
        title: "Endpoint Real-Time Performance Summary",
        type: "table",
        gridPos: { h: 8, w: 24, x: 0, y: 12 },
        targets: [
          { expr: "sum by (endpoint, method) (rate(k6_http_reqs_total{testid=~\"$testid\"}[1m]))", legendFormat: "{{method}} {{endpoint}}" }
        ]
      }
    ]
  }, null, 2);
}

export function getDockerComposeYml(): string {
  return `# EAII PTT Observability Stack
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: eaii-prometheus
    restart: unless-stopped
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--web.enable-remote-write-receiver'
      - '--web.enable-lifecycle'
    ports:
      - "9090:9090"
    volumes:
      - ./observability/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus

  grafana:
    image: grafana/grafana:latest
    container_name: eaii-grafana
    restart: unless-stopped
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_USERS_ALLOW_SIGN_UP=false
      - GF_AUTH_ANONYMOUS_ENABLED=true
      - GF_AUTH_ANONYMOUS_ORG_ROLE=Viewer
    ports:
      - "3000:3000"
    volumes:
      - ./observability/grafana/provisioning:/etc/grafana/provisioning
      - grafana_data:/var/lib/grafana
    depends_on:
      - prometheus

volumes:
  prometheus_data:
  grafana_data:
`;
}

export const generatePrometheusConfig = getPrometheusYml;
export const generateGrafanaDashboardJson = getGrafanaDashboardJson;
export const generateDockerComposeConfig = getDockerComposeYml;

export function getBatchScripts(): { runWindows: string; startObservability: string; stopObservability: string } {
  return {
    runWindows: `@echo off
echo ===================================================
echo   Starting EAII Performance Testing Tool (EAII PTT)
echo ===================================================

echo [1/3] Starting Docker Compose Observability Stack...
docker-compose -f observability/docker-compose.yml up -d

echo [2/3] Waiting for Prometheus and Grafana to initialize...
timeout /t 5 /nobreak >nul

echo [3/3] Launching EAII Performance Testing Tool...
start http://localhost:3000
npm run dev
`,
    startObservability: `@echo off
echo Starting Prometheus (port 9090) and Grafana (port 3000)...
docker-compose -f observability/docker-compose.yml up -d
echo Observability stack is running!
echo Prometheus: http://localhost:9090
echo Grafana:    http://localhost:3000
`,
    stopObservability: `@echo off
echo Stopping EAII Observability Stack...
docker-compose -f observability/docker-compose.yml down
echo Observability stack stopped.
`
  };
}
