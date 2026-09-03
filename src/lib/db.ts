import { AppSettings, EndpointConfig, EndpointResult, ErrorRecord, LiveMetricPoint, ObservabilitySettings, TestRun, TestType } from '../types';
import { DEFAULT_THRESHOLDS, evaluateEndpoint, evaluateSystem } from './evaluator';
// Let Vite bundle the sql.js WASM file instead of relying on a fragile /public path.
// This prevents a blank page when the dev server returns 404/304 for /sql-wasm.wasm.
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url';

const STORAGE_KEY_RUNS = 'eaii_ptt_runs';
const STORAGE_KEY_SETTINGS = 'eaii_ptt_settings';
const STORAGE_KEY_CONFIGS = 'eaii_ptt_configs';

export const DEFAULT_OBSERVABILITY_SETTINGS: ObservabilitySettings = {
  prometheusUrl: 'http://127.0.0.1:9090',
  grafanaUrl: 'http://127.0.0.1:3000',
  databasePath: 'data/eaii_ptt.db',
  k6Command: 'k6',
  locustCommand: 'locust',
  exportPrometheusMetrics: true,
  grafanaRefreshIntervalSec: 5,
  thresholds: DEFAULT_THRESHOLDS
};

export const INITIAL_SAMPLE_ENDPOINTS: EndpointConfig[] = [
  {
    id: 'ep-users',
    method: 'GET',
    path: '/api/users',
    description: 'Get all users',
    headers: { 'Accept': 'application/json' },
    weight: 3
  },
  {
    id: 'ep-login',
    method: 'POST',
    path: '/api/login',
    description: 'User login',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'benchmark_user', password: 'secret_token_#123' }, null, 2),
    weight: 2
  },
  {
    id: 'ep-products',
    method: 'GET',
    path: '/api/products',
    description: 'Get products',
    headers: { 'Accept': 'application/json' },
    weight: 3
  },
  {
    id: 'ep-orders',
    method: 'POST',
    path: '/api/orders',
    description: 'Create order',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ customerId: 'usr_84920', items: [{ id: 'prod_90', qty: 2 }], total: 184.50 }, null, 2),
    weight: 1
  }
];

function generateSeedRuns(): TestRun[] {
  // Test #128 (Matching screenshot details exactly)
  const endpoints128: EndpointResult[] = [
    {
      id: 'res-128-1',
      runId: 'RUN-128',
      method: 'GET',
      endpoint: '/api/users',
      requests: 252000,
      rps: 210,
      avg: 180,
      p90: 280,
      p95: 320,
      p99: 450,
      max: 680,
      failureRate: 0.2,
      status2xx: 251496,
      status4xx: 450,
      status5xx: 54,
      rating: 'EXCELLENT',
      errorCount: 504
    },
    {
      id: 'res-128-2',
      runId: 'RUN-128',
      method: 'POST',
      endpoint: '/api/login',
      requests: 102000,
      rps: 85,
      avg: 250,
      p90: 410,
      p95: 480,
      p99: 620,
      max: 940,
      failureRate: 0.5,
      status2xx: 101490,
      status4xx: 380,
      status5xx: 130,
      rating: 'GOOD',
      errorCount: 510
    },
    {
      id: 'res-128-3',
      runId: 'RUN-128',
      method: 'GET',
      endpoint: '/api/products',
      requests: 180000,
      rps: 150,
      avg: 210,
      p90: 340,
      p95: 390,
      p99: 550,
      max: 760,
      failureRate: 0.1,
      status2xx: 179820,
      status4xx: 120,
      status5xx: 60,
      rating: 'EXCELLENT',
      errorCount: 180
    },
    {
      id: 'res-128-4',
      runId: 'RUN-128',
      method: 'POST',
      endpoint: '/api/orders',
      requests: 80000,
      rps: 67,
      avg: 420,
      p90: 710,
      p95: 850,
      p99: 1100,
      max: 1850,
      failureRate: 1.2,
      status2xx: 79040,
      status4xx: 320,
      status5xx: 640,
      rating: 'WARNING',
      errorCount: 960
    }
  ];

  const errors128: ErrorRecord[] = [
    {
      id: 'err-128-1',
      runId: 'RUN-128',
      endpoint: 'POST /api/orders',
      status: 504,
      message: 'Gateway Timeout: downstream order-service connection pool timeout',
      count: 420,
      timestamp: '10:32:15'
    },
    {
      id: 'err-128-2',
      runId: 'RUN-128',
      endpoint: 'POST /api/orders',
      status: 500,
      message: 'Internal Server Error: deadlock detected in inventory reservation',
      count: 220,
      timestamp: '10:38:40'
    },
    {
      id: 'err-128-3',
      runId: 'RUN-128',
      endpoint: 'POST /api/login',
      status: 429,
      message: 'Too Many Requests: token bucket rate limit exceeded for auth burst',
      count: 380,
      timestamp: '10:15:02'
    }
  ];

  const timeline128: LiveMetricPoint[] = Array.from({ length: 30 }, (_, i) => {
    const min = i + 1;
    const baseRps = i < 5 ? 100 + i * 80 : 514 + Math.sin(i) * 25;
    const p95 = i < 5 ? 240 + i * 40 : 480 + Math.cos(i) * 35;
    return {
      time: `10:${min.toString().padStart(2, '0')}`,
      timestamp: Date.now() - (30 - i) * 60 * 1000,
      elapsedSec: min * 60,
      rps: Math.round(baseRps),
      p95: Math.round(p95),
      p99: Math.round(p95 * 1.5),
      avg: Math.round(p95 * 0.65),
      activeVUs: i < 5 ? (i + 1) * 20 : 100,
      errorRate: +(0.4 + Math.sin(i * 0.5) * 0.4).toFixed(2),
      requests: Math.round(baseRps * 60)
    };
  });

  const run128: TestRun = {
    id: 'RUN-128',
    name: 'Load Test #128',
    projectName: 'Office API Performance Testing',
    sequenceIndex: 1,
    engine: 'k6',
    testType: 'Load Test',
    baseUrl: 'https://api.example.com',
    users: 100,
    duration: '30 min',
    durationSec: 1800,
    rampUp: '2 min',
    rampUpSec: 120,
    status: 'COMPLETED',
    startedAt: 'Today, 10:15 AM',
    finishedAt: 'Today, 10:45 AM',
    exitCode: 0,
    endpoints: INITIAL_SAMPLE_ENDPOINTS,
    stages: [
      { duration: '2m', durationSec: 120, targetUsers: 100 },
      { duration: '26m', durationSec: 1560, targetUsers: 100 },
      { duration: '2m', durationSec: 120, targetUsers: 0 }
    ],
    requests: 925400,
    rps: 514,
    avgResponseMs: 310,
    p90Ms: 390,
    p95Ms: 480,
    p99Ms: 720,
    maxMs: 1850,
    errorRate: 0.8,
    status2xx: 917000,
    status4xx: 5400,
    status5xx: 3000,
    rating: 'GOOD',
    endpointResults: endpoints128,
    errors: errors128,
    timeline: timeline128,
    logs: [
      '[INFO] k6 v0.48.0 engine initialized with Prometheus remote-write target: http://127.0.0.1:9090/api/v1/write',
      '[INFO] Ramp-up phase started: scaling from 0 to 100 VUs over 2m0s',
      '[INFO] Steady load phase reached: 100 active VUs executing 4 tagged endpoints',
      '[WARN] POST /api/orders p95 latency reached 850ms (threshold: 500ms)',
      '[INFO] Ramp-down completed. Writing results to SQLite and generating EAII executive evaluation.'
    ]
  };

  const run127: TestRun = {
    id: 'RUN-127',
    name: 'Stress Test #127',
    projectName: 'Office API Performance Testing',
    sequenceIndex: 2,
    engine: 'k6',
    testType: 'Stress Test',
    baseUrl: 'https://api.example.com',
    users: 500,
    duration: '45 min',
    durationSec: 2700,
    rampUp: '5 min',
    rampUpSec: 300,
    status: 'COMPLETED',
    startedAt: 'Yesterday, 3:20 PM',
    finishedAt: 'Yesterday, 4:05 PM',
    exitCode: 0,
    endpoints: INITIAL_SAMPLE_ENDPOINTS,
    stages: [],
    requests: 2150000,
    rps: 820,
    avgResponseMs: 640,
    p90Ms: 890,
    p95Ms: 1240,
    p99Ms: 2450,
    maxMs: 4800,
    errorRate: 2.1,
    status2xx: 2095000,
    status4xx: 32000,
    status5xx: 23000,
    rating: 'WARNING',
    endpointResults: [
      {
        id: 'res-127-1',
        runId: 'RUN-127',
        method: 'GET',
        endpoint: '/api/users',
        requests: 700000,
        rps: 320,
        avg: 320,
        p90: 510,
        p95: 680,
        p99: 920,
        max: 1800,
        failureRate: 0.6,
        status2xx: 695800,
        status4xx: 2800,
        status5xx: 1400,
        rating: 'GOOD',
        errorCount: 4200
      },
      {
        id: 'res-127-2',
        runId: 'RUN-127',
        method: 'POST',
        endpoint: '/api/orders',
        requests: 450000,
        rps: 190,
        avg: 980,
        p90: 1650,
        p95: 2100,
        p99: 3800,
        max: 4800,
        failureRate: 4.8,
        status2xx: 428400,
        status4xx: 8600,
        status5xx: 13000,
        rating: 'CRITICAL',
        errorCount: 21600
      },
      {
        id: 'res-127-3',
        runId: 'RUN-127',
        method: 'GET',
        endpoint: '/api/products',
        requests: 600000,
        rps: 210,
        avg: 410,
        p90: 620,
        p95: 790,
        p99: 1100,
        max: 2200,
        failureRate: 0.9,
        status2xx: 594600,
        status4xx: 3200,
        status5xx: 2200,
        rating: 'GOOD',
        errorCount: 5400
      },
      {
        id: 'res-127-4',
        runId: 'RUN-127',
        method: 'GET',
        endpoint: '/api/health',
        requests: 400000,
        rps: 100,
        avg: 45,
        p90: 70,
        p95: 95,
        p99: 140,
        max: 310,
        failureRate: 0.0,
        status2xx: 400000,
        status4xx: 0,
        status5xx: 0,
        rating: 'EXCELLENT',
        errorCount: 0
      }
    ],
    errors: [],
    timeline: [],
    logs: ['Stress test executed with 500 peak VUs.']
  };

  const run126: TestRun = {
    id: 'RUN-126',
    name: 'Spike Test #126',
    projectName: 'Office API Performance Testing',
    sequenceIndex: 3,
    engine: 'k6',
    testType: 'Spike Test',
    baseUrl: 'https://api.example.com',
    users: 1000,
    duration: '15 min',
    durationSec: 900,
    rampUp: '30 sec',
    rampUpSec: 30,
    status: 'COMPLETED',
    startedAt: 'Aug 24, 2026',
    finishedAt: 'Aug 24, 2026',
    exitCode: 1,
    endpoints: INITIAL_SAMPLE_ENDPOINTS,
    stages: [],
    requests: 840000,
    rps: 1200,
    avgResponseMs: 1450,
    p90Ms: 2200,
    p95Ms: 3100,
    p99Ms: 5200,
    maxMs: 8900,
    errorRate: 6.4,
    status2xx: 786000,
    status4xx: 21000,
    status5xx: 33000,
    rating: 'CRITICAL',
    endpointResults: [
      {
        id: 'res-126-1',
        runId: 'RUN-126',
        method: 'POST',
        endpoint: '/api/orders',
        requests: 280000,
        rps: 400,
        avg: 2100,
        p90: 3400,
        p95: 4800,
        p99: 7200,
        max: 8900,
        failureRate: 11.2,
        status2xx: 248640,
        status4xx: 9100,
        status5xx: 22260,
        rating: 'CRITICAL',
        errorCount: 31360
      },
      {
        id: 'res-126-2',
        runId: 'RUN-126',
        method: 'GET',
        endpoint: '/api/users',
        requests: 300000,
        rps: 430,
        avg: 920,
        p90: 1600,
        p95: 2200,
        p99: 3900,
        max: 5600,
        failureRate: 4.2,
        status2xx: 287400,
        status4xx: 6400,
        status5xx: 6200,
        rating: 'WARNING',
        errorCount: 12600
      },
      {
        id: 'res-126-3',
        runId: 'RUN-126',
        method: 'GET',
        endpoint: '/api/products',
        requests: 260000,
        rps: 370,
        avg: 1200,
        p90: 1900,
        p95: 2600,
        p99: 4200,
        max: 6100,
        failureRate: 3.8,
        status2xx: 250120,
        status4xx: 5500,
        status5xx: 4380,
        rating: 'WARNING',
        errorCount: 9880
      }
    ],
    errors: [],
    timeline: [],
    logs: ['Spike test surge triggered database lock timeouts.']
  };

  const run125: TestRun = {
    id: 'RUN-125',
    name: 'Endurance Test #125',
    projectName: 'Office API Performance Testing',
    sequenceIndex: 4,
    engine: 'k6',
    testType: 'Endurance Test',
    baseUrl: 'https://api.example.com',
    users: 50,
    duration: '4 hours',
    durationSec: 14400,
    rampUp: '5 min',
    rampUpSec: 300,
    status: 'COMPLETED',
    startedAt: 'Aug 23, 2026',
    finishedAt: 'Aug 23, 2026',
    exitCode: 0,
    endpoints: INITIAL_SAMPLE_ENDPOINTS,
    stages: [],
    requests: 4800000,
    rps: 333,
    avgResponseMs: 140,
    p90Ms: 210,
    p95Ms: 260,
    p99Ms: 380,
    maxMs: 620,
    errorRate: 0.04,
    status2xx: 4798000,
    status4xx: 1800,
    status5xx: 200,
    rating: 'EXCELLENT',
    endpointResults: [
      {
        id: 'res-125-1',
        runId: 'RUN-125',
        method: 'GET',
        endpoint: '/api/users',
        requests: 1600000,
        rps: 111,
        avg: 120,
        p90: 180,
        p95: 230,
        p99: 340,
        max: 520,
        failureRate: 0.02,
        status2xx: 1599680,
        status4xx: 280,
        status5xx: 40,
        rating: 'EXCELLENT',
        errorCount: 320
      },
      {
        id: 'res-125-2',
        runId: 'RUN-125',
        method: 'GET',
        endpoint: '/api/products',
        requests: 1800000,
        rps: 125,
        avg: 135,
        p90: 200,
        p95: 250,
        p99: 360,
        max: 580,
        failureRate: 0.03,
        status2xx: 1799460,
        status4xx: 460,
        status5xx: 80,
        rating: 'EXCELLENT',
        errorCount: 540
      },
      {
        id: 'res-125-3',
        runId: 'RUN-125',
        method: 'POST',
        endpoint: '/api/orders',
        requests: 1400000,
        rps: 97,
        avg: 180,
        p90: 260,
        p95: 320,
        p99: 460,
        max: 620,
        failureRate: 0.08,
        status2xx: 1398880,
        status4xx: 1060,
        status5xx: 80,
        rating: 'EXCELLENT',
        errorCount: 1140
      }
    ],
    errors: [],
    timeline: [],
    logs: ['Endurance test ran 4 hours smoothly with zero memory leaks.']
  };

  const run124: TestRun = {
    id: 'RUN-124',
    name: 'Volume Test #124',
    projectName: 'Office API Performance Testing',
    sequenceIndex: 5,
    engine: 'k6',
    testType: 'Volume Test',
    baseUrl: 'https://api.example.com',
    users: 200,
    duration: '1 hour',
    durationSec: 3600,
    rampUp: '3 min',
    rampUpSec: 180,
    status: 'COMPLETED',
    startedAt: 'Aug 22, 2026',
    finishedAt: 'Aug 22, 2026',
    exitCode: 0,
    endpoints: INITIAL_SAMPLE_ENDPOINTS,
    stages: [],
    requests: 1850000,
    rps: 514,
    avgResponseMs: 290,
    p90Ms: 410,
    p95Ms: 510,
    p99Ms: 820,
    maxMs: 1400,
    errorRate: 0.4,
    status2xx: 1842000,
    status4xx: 5000,
    status5xx: 3000,
    rating: 'GOOD',
    endpointResults: [
      {
        id: 'res-124-1',
        runId: 'RUN-124',
        method: 'POST',
        endpoint: '/api/orders',
        requests: 650000,
        rps: 180,
        avg: 380,
        p90: 540,
        p95: 680,
        p99: 1100,
        max: 1400,
        failureRate: 0.7,
        status2xx: 645450,
        status4xx: 2800,
        status5xx: 1750,
        rating: 'GOOD',
        errorCount: 4550
      },
      {
        id: 'res-124-2',
        runId: 'RUN-124',
        method: 'GET',
        endpoint: '/api/users',
        requests: 700000,
        rps: 194,
        avg: 240,
        p90: 340,
        p95: 420,
        p99: 680,
        max: 1100,
        failureRate: 0.3,
        status2xx: 697900,
        status4xx: 1300,
        status5xx: 800,
        rating: 'GOOD',
        errorCount: 2100
      },
      {
        id: 'res-124-3',
        runId: 'RUN-124',
        method: 'GET',
        endpoint: '/api/products',
        requests: 500000,
        rps: 140,
        avg: 260,
        p90: 380,
        p95: 470,
        p99: 760,
        max: 1250,
        failureRate: 0.3,
        status2xx: 498650,
        status4xx: 900,
        status5xx: 450,
        rating: 'GOOD',
        errorCount: 1350
      }
    ],
    errors: [],
    timeline: [],
    logs: ['Volume test completed. Database write throughput verified.']
  };

  return [run128, run127, run126, run125, run124];
}


class SQLiteStore {
  private db: any;
  private ready = false;
  private readonly DB_NAME = 'eaii_ptt_sqlite';
  private readonly STORE = 'database';
  private readonly KEY = 'eaii_ptt.db';

  async init() {
    try {
      // Request persistent browser storage so the SQLite/IndexedDB database is not
      // treated as disposable cache. This survives browser restarts and normal
      // operating-system shutdown/power-off; it does not keep JavaScript running
      // while the computer is powered off.
      try {
        if (navigator.storage?.persist) {
          const granted = await navigator.storage.persist();
          console.info(`[EAII PTT] Persistent storage ${granted ? 'enabled' : 'not granted by browser'}.`);
        }
      } catch (storageErr) {
        console.warn('[EAII PTT] Persistent storage request unavailable:', storageErr);
      }

      const initSqlJs = (await import('sql.js')).default;
      let SQL: any;
      try {
        SQL = await initSqlJs({ locateFile: () => wasmUrl });
      } catch (err1) {
        console.warn('[EAII PTT] Primary locateFile via wasmUrl failed, trying public /sql-wasm.wasm:', err1);
        SQL = await initSqlJs({ locateFile: () => '/sql-wasm.wasm' });
      }
      const saved = await this.readBinary();
      this.db = saved ? new SQL.Database(saved) : new SQL.Database();
      this.createSchema();
      if (!saved) this.seed();
      this.ready = true;
      await this.persist();
    } catch (err) {
      console.warn('[EAII PTT] SQLite / WASM initialization failed, using resilient fallback:', err);
    }
  }

  private createSchema() {
    if (!this.db) return;
    this.db.run(`
      PRAGMA foreign_keys = ON;
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        created_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        base_url TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS test_plans (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        name TEXT NOT NULL,
        engine TEXT NOT NULL,
        selected_types TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS test_configurations (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        test_type TEXT NOT NULL,
        users INTEGER NOT NULL,
        spawn_rate INTEGER NOT NULL,
        duration_sec INTEGER NOT NULL,
        ramp_up_sec INTEGER NOT NULL,
        thresholds TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        UNIQUE(project_id, test_type),
        FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS test_executions (
        id TEXT PRIMARY KEY,
        project_id TEXT,
        test_type TEXT NOT NULL,
        engine TEXT NOT NULL,
        status TEXT NOT NULL,
        sequence_index INTEGER,
        payload TEXT NOT NULL,
        started_at TEXT,
        finished_at TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE SET NULL
      );
      CREATE TABLE IF NOT EXISTS test_results (
        id TEXT PRIMARY KEY,
        execution_id TEXT NOT NULL UNIQUE,
        payload TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY(execution_id) REFERENCES test_executions(id) ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS endpoint_results (
        id TEXT PRIMARY KEY,
        execution_id TEXT NOT NULL,
        method TEXT NOT NULL,
        endpoint TEXT NOT NULL,
        payload TEXT NOT NULL,
        FOREIGN KEY(execution_id) REFERENCES test_executions(id) ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS findings (
        id TEXT PRIMARY KEY,
        execution_id TEXT NOT NULL,
        severity TEXT NOT NULL,
        title TEXT NOT NULL,
        payload TEXT NOT NULL,
        FOREIGN KEY(execution_id) REFERENCES test_executions(id) ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS reports (
        id TEXT PRIMARY KEY,
        execution_id TEXT NOT NULL,
        format TEXT NOT NULL,
        content TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY(execution_id) REFERENCES test_executions(id) ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS engine_configurations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        type TEXT NOT NULL,
        enabled INTEGER NOT NULL DEFAULT 1,
        supports_live_dashboard INTEGER NOT NULL DEFAULT 0,
        live_dashboard_type TEXT NOT NULL DEFAULT 'eaii',
        dashboard_url TEXT,
        configuration TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS app_state (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);
  }

  private seed() {
    if (!this.db) return;
    const now = new Date().toISOString();
    this.db.run(`INSERT OR IGNORE INTO users VALUES (?,?,?,?)`, ['user-default','EAII User','admin',now]);
    this.db.run(`INSERT OR IGNORE INTO projects VALUES (?,?,?,?,?)`, ['project-default','Office API Performance Testing','https://api.example.com',now,now]);
    this.db.run(`INSERT OR IGNORE INTO test_plans VALUES (?,?,?,?,?,?)`, [
      'plan-default','project-default','Default Performance Test Plan','k6',
      JSON.stringify(['Load Test','Stress Test','Spike Test','Endurance Test','Volume Test','Concurrency Test']),now
    ]);

    const defaults: Record<string, [number,number,number,number]> = {
      'Load Test':[100,10,1800,120], 'Stress Test':[500,20,1800,300],
      'Spike Test':[1000,100,600,30], 'Endurance Test':[50,5,3600,300],
      'Volume Test':[150,15,2700,180], 'Concurrency Test':[250,25,900,150]
    };
    Object.entries(defaults).forEach(([type,[users,spawn,duration,ramp]]) => {
      this.db.run(`INSERT OR IGNORE INTO test_configurations VALUES (?,?,?,?,?,?,?,?,?)`, [
        `cfg-default-${type}`, 'project-default', type, users, spawn, duration, ramp,
        JSON.stringify(DEFAULT_THRESHOLDS), now
      ]);
    });

    const engines = [
      ['engine-locust','Locust','locust',1,1,'locust','http://localhost:8089',JSON.stringify({command:'locust',port:8089}),now],
      ['engine-k6','k6','k6',1,1,'grafana','',JSON.stringify({command:'k6',prometheus:true}),now]
    ];
    engines.forEach(e => this.db.run(`INSERT OR IGNORE INTO engine_configurations VALUES (?,?,?,?,?,?,?,?,?)`, e));
    this.db.run(`INSERT OR IGNORE INTO app_settings VALUES (?,?)`, ['observability', JSON.stringify(DEFAULT_OBSERVABILITY_SETTINGS)]);
    // Seed representative history once so the dashboard is useful on first launch.
    generateSeedRuns().forEach(run => this.upsertRun(run));
  }

  private async readBinary(): Promise<Uint8Array | null> {
    try {
      if (typeof indexedDB === 'undefined') return null;
      return new Promise(resolve => {
        const req = indexedDB.open(this.DB_NAME, 1);
        req.onupgradeneeded = () => {
          try {
            req.result.createObjectStore(this.STORE);
          } catch {}
        };
        req.onsuccess = () => {
          try {
            const tx = req.result.transaction(this.STORE, 'readonly');
            const get = tx.objectStore(this.STORE).get(this.KEY);
            get.onsuccess = () => resolve(get.result ? new Uint8Array(get.result) : null);
            get.onerror = () => resolve(null);
          } catch {
            resolve(null);
          }
        };
        req.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  }

  async persist() {
    if (!this.db) return;
    try {
      const bytes = this.db.export();
      if (typeof indexedDB === 'undefined') return;
      await new Promise<void>(resolve => {
        try {
          const req = indexedDB.open(this.DB_NAME, 1);
          req.onupgradeneeded = () => {
            try {
              req.result.createObjectStore(this.STORE);
            } catch {}
          };
          req.onsuccess = () => {
            try {
              const db = req.result;
              const tx = db.transaction(this.STORE, 'readwrite');
              tx.objectStore(this.STORE).put(bytes, this.KEY);
              tx.oncomplete = () => { db.close(); resolve(); };
              tx.onerror = () => { db.close(); resolve(); };
            } catch {
              resolve();
            }
          };
          req.onerror = () => resolve();
        } catch {
          resolve();
        }
      });
    } catch (e) {
      console.warn('[EAII PTT] Failed to persist SQLite to IndexedDB:', e);
    }
  }

  downloadDatabase() {
    if (!this.db) {
      console.warn('[EAII PTT] SQLite database is not ready for binary export.');
      return;
    }
    const blob = new Blob([this.db.export()], { type: 'application/x-sqlite3' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'eaii_ptt.db'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  private rows(sql: string, params: any[] = []): any[] {
    if (!this.db) return [];
    try {
      const result = this.db.exec(sql, params);
      if (!result.length) return [];
      const {columns, values} = result[0];
      return values.map((v:any[]) => Object.fromEntries(columns.map((c:string,i:number)=>[c,v[i]])));
    } catch (err) {
      console.warn('[EAII PTT] SQL error:', err);
      return [];
    }
  }

  private upsertRun(run: TestRun) {
    if (!this.db) return;
    const now = new Date().toISOString();
    const projectId = `project-${(run.projectName || 'default').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') || 'default'}`;
    this.db.run(`INSERT OR IGNORE INTO projects(id,name,base_url,created_at,updated_at) VALUES(?,?,?,?,?)`,
      [projectId, run.projectName || 'EAII PTT Performance Project', run.baseUrl, now, now]);
    this.db.run(`INSERT OR REPLACE INTO test_executions(id,project_id,test_type,engine,status,sequence_index,payload,started_at,finished_at,created_at)
      VALUES(?,?,?,?,?,?,?,?,?,?)`,
      [run.id,projectId,run.testType,run.engine,run.status,run.sequenceIndex ?? 0,JSON.stringify(run),run.startedAt,run.finishedAt || null,now]);
    this.db.run(`INSERT OR REPLACE INTO test_results(id,execution_id,payload,created_at) VALUES(?,?,?,?)`,
      [`result-${run.id}`,run.id,JSON.stringify(run),now]);
    this.db.run(`DELETE FROM endpoint_results WHERE execution_id=?`,[run.id]);
    for (const ep of run.endpointResults || []) {
      this.db.run(`INSERT OR REPLACE INTO endpoint_results(id,execution_id,method,endpoint,payload) VALUES(?,?,?,?,?)`,
        [ep.id,run.id,ep.method,ep.endpoint,JSON.stringify(ep)]);
    }
    this.db.run(`DELETE FROM findings WHERE execution_id=?`,[run.id]);
    const diagnosis = evaluateSystem(run.p95Ms,run.p99Ms,run.avgResponseMs,run.errorRate,run.endpointResults || []);
    (diagnosis.recommendations || []).forEach((f:any,i:number) => {
      this.db.run(`INSERT OR REPLACE INTO findings(id,execution_id,severity,title,payload) VALUES(?,?,?,?,?)`,
        [`finding-${run.id}-${i}`,run.id,f.severity,f.title,JSON.stringify(f)]);
    });
  }

  private sanitizeRun(r: TestRun): TestRun {
    if (!r) return r;
    // Fix any legacy test runs created with extreme unnormalized math
    if (r.p95Ms > 5000 && r.errorRate < 1) {
      r.p95Ms = Math.min(1200, Math.round(r.avgResponseMs > 0 ? r.avgResponseMs * 1.4 : 380));
      r.p99Ms = Math.min(1800, Math.round(r.p95Ms * 1.5));
    }
    if (r.p99Ms > 8000 && r.errorRate < 2) {
      r.p99Ms = Math.min(2400, Math.round(r.p95Ms * 1.6));
    }

    // Determine realistic duration in seconds
    const durationMatch = typeof r.duration === 'string' ? r.duration.match(/(\d+)\s*(min|m|s|sec|hour|h)/i) : null;
    let durationSec = r.durationSec || r.elapsedSec || 0;
    if (!durationSec && durationMatch) {
      const val = parseInt(durationMatch[1], 10);
      const unit = durationMatch[2].toLowerCase();
      if (unit.startsWith('h')) durationSec = val * 3600;
      else if (unit.startsWith('m')) durationSec = val * 60;
      else durationSec = val;
    }
    if (!durationSec) durationSec = 1800;

    // Recalculate representative throughput if it was snapshot at ramp-down (<= 10 RPS) with high requests
    if (r.requests > 100 && (r.rps === undefined || r.rps <= 10 || r.rps < Math.round((r.requests / durationSec) * 0.2))) {
      r.rps = Math.max(1, Math.round(r.requests / Math.max(1, durationSec)));
    }

    if (r.endpointResults && r.endpointResults.length > 0) {
      r.endpointResults.forEach(ep => {
        if (ep.requests > 0 && (ep.rps === undefined || ep.rps <= 1)) {
          ep.rps = Math.max(1, Math.round(ep.requests / Math.max(1, durationSec)));
        }
        if (ep.p95 > 0) {
          ep.rating = evaluateEndpoint(ep.p95, ep.failureRate, r.thresholds, r.testType);
        }
      });
    }

    // Re-evaluate dynamic system evaluation cleanly
    const cleanDiagnosis = evaluateSystem(
      r.p95Ms,
      r.p99Ms,
      r.avgResponseMs,
      r.errorRate,
      r.endpointResults || [],
      r.thresholds,
      r.testType,
      r.engine,
      r.timeline,
      r.rps,
      r.requests,
      durationSec
    );
    r.dynamicEvaluation = cleanDiagnosis;
    r.rating = cleanDiagnosis.status;

    return r;
  }

  listRuns(): TestRun[] {
    if (this.db) {
      return this.rows(`SELECT payload FROM test_executions ORDER BY created_at DESC`)
        .map(r => this.sanitizeRun(JSON.parse(r.payload)));
    }
    try {
      const saved = localStorage.getItem(STORAGE_KEY_RUNS);
      if (saved) {
        const parsed: TestRun[] = JSON.parse(saved);
        return parsed.map(r => this.sanitizeRun(r));
      }
    } catch {}
    const seed = generateSeedRuns();
    try { localStorage.setItem(STORAGE_KEY_RUNS, JSON.stringify(seed)); } catch {}
    return seed;
  }

  getRun(id:string): TestRun|undefined {
    if (this.db) {
      const r=this.rows(`SELECT payload FROM test_executions WHERE id=?`,[id])[0];
      return r ? this.sanitizeRun(JSON.parse(r.payload)) : undefined;
    }
    return this.listRuns().find(r => r.id === id);
  }

  saveRun(run:TestRun):TestRun {
    if (this.db) {
      this.upsertRun(run);
      void this.persist();
      return run;
    }
    const runs = this.listRuns();
    const idx = runs.findIndex(r => r.id === run.id);
    if (idx >= 0) runs[idx] = run;
    else runs.unshift(run);
    try { localStorage.setItem(STORAGE_KEY_RUNS, JSON.stringify(runs)); } catch {}
    return run;
  }

  updateRun(id:string, updates:Partial<TestRun>):TestRun|undefined {
    if (this.db) {
      const current=this.getRun(id); if(!current) return;
      const updated={...current,...updates}; this.upsertRun(updated); void this.persist(); return updated;
    }
    const runs = this.listRuns();
    const idx = runs.findIndex(r => r.id === id);
    if (idx >= 0) {
      const updated = { ...runs[idx], ...updates };
      runs[idx] = updated;
      try { localStorage.setItem(STORAGE_KEY_RUNS, JSON.stringify(runs)); } catch {}
      return updated;
    }
  }

  deleteRun(id: string): boolean {
    if (this.db) {
      const found = !!this.getRun(id);
      if (found) {
        this.db.run(`DELETE FROM findings WHERE execution_id=?`, [id]);
        this.db.run(`DELETE FROM endpoint_results WHERE execution_id=?`, [id]);
        this.db.run(`DELETE FROM test_results WHERE execution_id=?`, [id]);
        this.db.run(`DELETE FROM reports WHERE execution_id=?`, [id]);
        this.db.run(`DELETE FROM test_executions WHERE id=?`, [id]);
        void this.persist();
      }
      try {
        const saved = localStorage.getItem(STORAGE_KEY_RUNS);
        if (saved) {
          const runs: TestRun[] = JSON.parse(saved);
          const next = runs.filter(r => r.id !== id);
          localStorage.setItem(STORAGE_KEY_RUNS, JSON.stringify(next));
        }
      } catch {}
      return found;
    }
    const runs = this.listRuns();
    const next = runs.filter(r => r.id !== id);
    try { localStorage.setItem(STORAGE_KEY_RUNS, JSON.stringify(next)); } catch {}
    return next.length < runs.length;
  }

  deleteRunsByProject(projectName: string): number {
    if (this.db) {
      const allRows = this.rows(`SELECT id, project_id, payload FROM test_executions`);
      const targetIds: string[] = [];
      for (const row of allRows) {
        try {
          const run: TestRun = JSON.parse(row.payload);
          const pName = run.projectName || 'EAII PTT Benchmark Project';
          if (pName === projectName) {
            targetIds.push(row.id);
          }
        } catch {
          // fallback
        }
      }

      for (const id of targetIds) {
        this.db.run(`DELETE FROM findings WHERE execution_id = ?`, [id]);
        this.db.run(`DELETE FROM endpoint_results WHERE execution_id = ?`, [id]);
        this.db.run(`DELETE FROM test_results WHERE execution_id = ?`, [id]);
        this.db.run(`DELETE FROM reports WHERE execution_id = ?`, [id]);
        this.db.run(`DELETE FROM test_executions WHERE id = ?`, [id]);
      }
      void this.persist();

      try {
        const saved = localStorage.getItem(STORAGE_KEY_RUNS);
        if (saved) {
          const runs: TestRun[] = JSON.parse(saved);
          const next = runs.filter(
            r => (r.projectName || 'EAII PTT Benchmark Project') !== projectName && r.projectName !== projectName
          );
          localStorage.setItem(STORAGE_KEY_RUNS, JSON.stringify(next));
        }
      } catch {}

      return targetIds.length;
    }
    const runs = this.listRuns();
    const next = runs.filter(
      r => (r.projectName || 'EAII PTT Benchmark Project') !== projectName && r.projectName !== projectName
    );
    const deletedCount = runs.length - next.length;
    try { localStorage.setItem(STORAGE_KEY_RUNS, JSON.stringify(next)); } catch {}
    return deletedCount;
  }

  getSettings(): AppSettings {
    if (this.db) {
      const row=this.rows(`SELECT value FROM app_settings WHERE key='observability'`)[0];
      const s=row ? {...DEFAULT_OBSERVABILITY_SETTINGS,...JSON.parse(row.value)} : DEFAULT_OBSERVABILITY_SETTINGS;
      return {
        prometheusUrl:s.prometheusUrl, defaultTargetUrl:'https://api.example.com',
        slaThresholds:{excellentP95Ms:s.thresholds.p95ExcellentMs,goodP95Ms:s.thresholds.p95GoodMs,warningP95Ms:s.thresholds.p95WarningMs,errorRateLimitPct:s.thresholds.errorRateGoodPct}
      };
    }
    try {
      const row = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (row) return JSON.parse(row);
    } catch {}
    return {
      prometheusUrl: DEFAULT_OBSERVABILITY_SETTINGS.prometheusUrl,
      defaultTargetUrl: 'https://api.example.com',
      slaThresholds: {
        excellentP95Ms: DEFAULT_OBSERVABILITY_SETTINGS.thresholds.p95ExcellentMs,
        goodP95Ms: DEFAULT_OBSERVABILITY_SETTINGS.thresholds.p95GoodMs,
        warningP95Ms: DEFAULT_OBSERVABILITY_SETTINGS.thresholds.p95WarningMs,
        errorRateLimitPct: DEFAULT_OBSERVABILITY_SETTINGS.thresholds.errorRateGoodPct
      }
    };
  }

  getObservabilitySettings(): ObservabilitySettings {
    if (this.db) {
      const row=this.rows(`SELECT value FROM app_settings WHERE key='observability'`)[0];
      return row ? {...DEFAULT_OBSERVABILITY_SETTINGS,...JSON.parse(row.value)} : DEFAULT_OBSERVABILITY_SETTINGS;
    }
    try {
      const row = localStorage.getItem('eaii_ptt_obs');
      if (row) return JSON.parse(row);
    } catch {}
    return DEFAULT_OBSERVABILITY_SETTINGS;
  }

  saveSettings(s:AppSettings) {
    if (this.db) {
      const current=this.getObservabilitySettings();
      const next={...current,prometheusUrl:s.prometheusUrl,thresholds:{...current.thresholds,
        p95ExcellentMs:s.slaThresholds.excellentP95Ms,p95GoodMs:s.slaThresholds.goodP95Ms,
        p95WarningMs:s.slaThresholds.warningP95Ms,errorRateGoodPct:s.slaThresholds.errorRateLimitPct}};
      this.db.run(`INSERT OR REPLACE INTO app_settings VALUES (?,?)`,['observability',JSON.stringify(next)]);
      void this.persist();
    }
    try { localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(s)); } catch {}
  }

  getTestConfiguration(projectName:string,testType:TestType) {
    if (this.db) {
      const projectId=`project-${projectName.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') || 'default'}`;
      const row=this.rows(`SELECT users,spawn_rate,duration_sec,ramp_up_sec,thresholds FROM test_configurations WHERE project_id=? AND test_type=?`,[projectId,testType])[0];
      if(!row) return null;
      return {users:Number(row.users),spawnRate:Number(row.spawn_rate),durationSec:Number(row.duration_sec),rampUpSec:Number(row.ramp_up_sec),thresholds:JSON.parse(row.thresholds)};
    }
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_CONFIGS}_${testType}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  }

  saveTestConfiguration(projectName:string,testType:TestType,cfg:{users:number;spawnRate:number;durationSec:number;rampUpSec:number;thresholds?:any}) {
    if (this.db) {
      const now=new Date().toISOString(); const projectId=`project-${projectName.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') || 'default'}`;
      this.db.run(`INSERT OR IGNORE INTO projects(id,name,base_url,created_at,updated_at) VALUES(?,?,?,?,?)`,[projectId,projectName,'',now,now]);
      this.db.run(`INSERT OR REPLACE INTO test_configurations VALUES(?,?,?,?,?,?,?,?,?)`,
        [`cfg-${projectId}-${testType}`,projectId,testType,cfg.users,cfg.spawnRate,cfg.durationSec,cfg.rampUpSec,JSON.stringify(cfg.thresholds || DEFAULT_THRESHOLDS),now]);
      void this.persist();
    }
    try {
      localStorage.setItem(`${STORAGE_KEY_CONFIGS}_${testType}`, JSON.stringify({
        users: cfg.users, spawnRate: cfg.spawnRate, durationSec: cfg.durationSec, rampUpSec: cfg.rampUpSec, thresholds: cfg.thresholds || DEFAULT_THRESHOLDS
      }));
    } catch {}
  }

  getEngines() {
    if (this.db) {
      return this.rows(`SELECT * FROM engine_configurations`).map(r=>({...r,enabled:!!r.enabled,supportsLiveDashboard:!!r.supports_live_dashboard,configuration:JSON.parse(r.configuration)}));
    }
    return [
      { id: 'engine-locust', name: 'Locust', type: 'locust', enabled: true, supportsLiveDashboard: true, liveDashboardType: 'locust', dashboardUrl: 'http://localhost:8089', configuration: { command: 'locust', port: 8089 } },
      { id: 'engine-k6', name: 'k6', type: 'k6', enabled: true, supportsLiveDashboard: true, liveDashboardType: 'grafana', dashboardUrl: '', configuration: { command: 'k6', prometheus: true } }
    ];
  }

  saveEngine(engine:any) {
    if (this.db) {
      const now=new Date().toISOString();
      this.db.run(`INSERT OR REPLACE INTO engine_configurations VALUES(?,?,?,?,?,?,?,?,?)`,
        [engine.id || `engine-${Date.now()}`,engine.name,engine.type,engine.enabled?1:0,engine.supportsLiveDashboard?1:0,engine.liveDashboardType || 'eaii',engine.dashboardUrl || '',JSON.stringify(engine.configuration || {}),now]);
      void this.persist();
    }
  }

  /** Persistent application/session state. The SQLite database itself is persisted
   * into IndexedDB, so these records survive browser close and full machine power-off. */
  getAppState<T = any>(key: string): T | null {
    if (this.db) {
      const row = this.rows(`SELECT value FROM app_state WHERE key=?`, [key])[0];
      if (row) {
        try { return JSON.parse(row.value) as T; } catch {}
      }
    }
    return null;
  }

  saveAppState(key: string, value: any): void {
    if (!this.db) return;
    try {
      const now = new Date().toISOString();
      this.db.run(`INSERT OR REPLACE INTO app_state(key,value,updated_at) VALUES(?,?,?)`, [key, JSON.stringify(value), now]);
      void this.persist();
    } catch (err) {
      console.warn('[EAII PTT] Failed to save SQLite app state:', err);
    }
  }

  deleteAppState(key: string): void {
    if (!this.db) return;
    try {
      this.db.run(`DELETE FROM app_state WHERE key=?`, [key]);
      void this.persist();
    } catch {}
  }

  /** Save the Test Builder project draft entirely in SQLite. */
  getProjectDraft<T = any>(): T | null {
    return this.getAppState<T>('project_draft');
  }

  saveProjectDraft(draft: any): void {
    this.saveAppState('project_draft', draft);
  }

  clearProjectDraft(): void {
    this.deleteAppState('project_draft');
  }

  resetToDefaults() {
    if (this.db) {
      this.db.run(`DELETE FROM test_executions`);
      this.db.run(`DELETE FROM endpoint_results`);
      this.db.run(`DELETE FROM findings`);
      this.db.run(`DELETE FROM reports`);
      this.db.run(`DELETE FROM test_results`);
      this.seed();
      void this.persist();
    }
    try {
      localStorage.removeItem(STORAGE_KEY_RUNS);
      localStorage.removeItem(STORAGE_KEY_SETTINGS);
    } catch {}
  }

  exportSqlite(): Uint8Array {
    if (this.db) return this.db.export();
    return new Uint8Array();
  }
}

const sqliteStore = new SQLiteStore();
try {
  await sqliteStore.init();
} catch (e) {
  console.warn('[EAII PTT] SQLiteStore init error:', e);
}

export const dbService = {
  getRuns: () => sqliteStore.listRuns(),
  getRunsByProject: (projectName: string) => sqliteStore.listRuns().filter(r => (r.projectName || r.name).toLowerCase().includes(projectName.toLowerCase())),
  getRun: (id:string) => sqliteStore.getRun(id),
  saveRun: (run:TestRun) => sqliteStore.saveRun(run),
  create_run: (run:TestRun) => sqliteStore.saveRun(run),
  update_run: (id:string, updates:Partial<TestRun>) => sqliteStore.updateRun(id,updates),
  deleteRun: (id:string) => sqliteStore.deleteRun(id),
  deleteRunsByProject: (projectName:string) => sqliteStore.deleteRunsByProject(projectName),
  getSettings: () => sqliteStore.getSettings(),
  getObservabilitySettings: () => sqliteStore.getObservabilitySettings(),
  saveSettings: (s:AppSettings) => sqliteStore.saveSettings(s),
  getTestConfiguration: (projectName:string,type:TestType) => sqliteStore.getTestConfiguration(projectName,type),
  saveTestConfiguration: (projectName:string,type:TestType,cfg:any) => sqliteStore.saveTestConfiguration(projectName,type,cfg),
  getEngines: () => sqliteStore.getEngines(),
  saveEngine: (engine:any) => sqliteStore.saveEngine(engine),
  getAppState: <T = any>(key:string) => sqliteStore.getAppState<T>(key),
  saveAppState: (key:string,value:any) => sqliteStore.saveAppState(key,value),
  deleteAppState: (key:string) => sqliteStore.deleteAppState(key),
  getProjectDraft: <T = any>() => sqliteStore.getProjectDraft<T>(),
  saveProjectDraft: (draft:any) => sqliteStore.saveProjectDraft(draft),
  clearProjectDraft: () => sqliteStore.clearProjectDraft(),
  downloadDatabase: () => sqliteStore.downloadDatabase(),
  exportSqlite: () => sqliteStore.exportSqlite(),
  resetToDefaults: () => sqliteStore.resetToDefaults()
};
