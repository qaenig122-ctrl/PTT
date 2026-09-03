import { EndpointConfig, LoadStage, TestType } from '../types';

export function generateStagesForTestType(
  testType: TestType,
  targetUsers: number,
  durationSec: number,
  rampUpSec: number
): LoadStage[] {
  const rampUp = Math.max(5, rampUpSec || 10);
  const totalDuration = Math.max(15, durationSec || 60);

  switch (testType) {
    case 'Load Test': {
      const steadyDuration = Math.max(10, totalDuration - (rampUp * 2));
      return [
        { duration: `${rampUp}s`, durationSec: rampUp, targetUsers },
        { duration: `${steadyDuration}s`, durationSec: steadyDuration, targetUsers },
        { duration: `${rampUp}s`, durationSec: rampUp, targetUsers: 0 }
      ];
    }
    case 'Stress Test': {
      const stepTime = Math.max(5, Math.floor(totalDuration / 5));
      return [
        { duration: `${stepTime}s`, durationSec: stepTime, targetUsers: Math.floor(targetUsers * 0.5) },
        { duration: `${stepTime}s`, durationSec: stepTime, targetUsers: targetUsers },
        { duration: `${stepTime}s`, durationSec: stepTime, targetUsers: Math.floor(targetUsers * 1.5) },
        { duration: `${stepTime}s`, durationSec: stepTime, targetUsers: Math.floor(targetUsers * 2.0) },
        { duration: `${stepTime}s`, durationSec: stepTime, targetUsers: 0 }
      ];
    }
    case 'Spike Test': {
      const baseline = Math.max(2, Math.floor(targetUsers * 0.1));
      const spikePeak = targetUsers * 2;
      return [
        { duration: '10s', durationSec: 10, targetUsers: baseline },
        { duration: '5s', durationSec: 5, targetUsers: spikePeak },
        { duration: '30s', durationSec: 30, targetUsers: spikePeak },
        { duration: '5s', durationSec: 5, targetUsers: baseline },
        { duration: '10s', durationSec: 10, targetUsers: 0 }
      ];
    }
    case 'Endurance Test': {
      const steadyLong = Math.max(30, totalDuration - (rampUp * 2));
      return [
        { duration: `${rampUp}s`, durationSec: rampUp, targetUsers },
        { duration: `${steadyLong}s`, durationSec: steadyLong, targetUsers },
        { duration: `${rampUp}s`, durationSec: rampUp, targetUsers: 0 }
      ];
    }
    case 'Volume Test': {
      const steadyVol = Math.max(15, totalDuration - rampUp);
      return [
        { duration: `${rampUp}s`, durationSec: rampUp, targetUsers },
        { duration: `${steadyVol}s`, durationSec: steadyVol, targetUsers },
        { duration: '10s', durationSec: 10, targetUsers: 0 }
      ];
    }
    case 'Concurrency Test': {
      return [
        { duration: '5s', durationSec: 5, targetUsers },
        { duration: `${totalDuration}s`, durationSec: totalDuration, targetUsers },
        { duration: '5s', durationSec: 5, targetUsers: 0 }
      ];
    }
    default:
      return [
        { duration: '10s', durationSec: 10, targetUsers },
        { duration: '30s', durationSec: 30, targetUsers },
        { duration: '10s', durationSec: 10, targetUsers: 0 }
      ];
  }
}

/**
 * Replaces token placeholders like {{VU_ID}}, {{TIMESTAMP}}, {{RANDOM_ID}} with k6 expressions
 */
function interpolateK6Body(bodyStr: string): string {
  if (!bodyStr) return 'null';
  
  if (bodyStr.includes('{{') && bodyStr.includes('}}')) {
    const replaced = bodyStr
      .replace(/\{\{VU_ID\}\}/g, '${__VU}')
      .replace(/\{\{TIMESTAMP\}\}/g, '${Date.now()}')
      .replace(/\{\{RANDOM_ID\}\}/g, '${Math.random().toString(36).substring(2, 8)}')
      .replace(/\{\{AUTH_TOKEN\}\}/g, '${AUTH_TOKEN || "sample_jwt_token"}');

    return `JSON.stringify(JSON.parse(\`${replaced}\`))`;
  }

  return JSON.stringify(bodyStr);
}

export interface K6GeneratorParams {
  testId: string;
  testName: string;
  testType?: TestType;
  testPlan?: TestType[];
  isSequentialSuite?: boolean;
  testConfigs?: Partial<Record<TestType, { users: number; durationSec: number; rampUpSec?: number }>>;
  baseUrl: string;
  users: number;
  maxVUs?: number;
  loadModel?: 'VU_BASED' | 'TARGET_RPS';
  targetRps?: number;
  durationSec: number;
  rampUpSec: number;
  endpoints: EndpointConfig[];
  prometheusUrl?: string;
}

export function generateK6Script(params: K6GeneratorParams): string {
  const {
    testId,
    testName,
    testType = 'Load Test',
    testPlan = ['Load Test', 'Stress Test', 'Spike Test', 'Endurance Test', 'Volume Test', 'Concurrency Test'],
    isSequentialSuite = true,
    testConfigs,
    baseUrl,
    users,
    maxVUs = users * 2 || 500,
    loadModel = 'VU_BASED',
    targetRps = 100,
    durationSec,
    rampUpSec,
    endpoints,
    prometheusUrl = 'http://127.0.0.1:9090'
  } = params;

  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

  // Extract individual configuration per test type if available
  const cfgLoad = testConfigs?.['Load Test'] || { users: 100, durationSec: 1800, rampUpSec: 120 };
  const cfgStress = testConfigs?.['Stress Test'] || { users: 500, durationSec: 1800, rampUpSec: 180 };
  const cfgSpike = testConfigs?.['Spike Test'] || { users: 1000, durationSec: 600, rampUpSec: 30 };
  const cfgEndurance = testConfigs?.['Endurance Test'] || { users: 50, durationSec: 3600, rampUpSec: 60 };
  const cfgVolume = testConfigs?.['Volume Test'] || { users: 150, durationSec: 2700, rampUpSec: 90 };
  const cfgConcurrency = testConfigs?.['Concurrency Test'] || { users: 250, durationSec: 900, rampUpSec: 10 };

  let scenariosConfig = '';

  if (isSequentialSuite) {
    const totalPipelineStages = [
      // 1. Load Test
      { duration: `${cfgLoad.rampUpSec || 60}s`, target: cfgLoad.users },
      { duration: `${cfgLoad.durationSec}s`, target: cfgLoad.users },
      { duration: '30s', target: 0 },
      // 2. Stress Test
      { duration: `${cfgStress.rampUpSec || 120}s`, target: cfgStress.users },
      { duration: `${cfgStress.durationSec}s`, target: cfgStress.users },
      { duration: '30s', target: 0 },
      // 3. Spike Test
      { duration: '15s', target: cfgSpike.users },
      { duration: `${cfgSpike.durationSec}s`, target: cfgSpike.users },
      { duration: '15s', target: 0 },
      // 4. Endurance Test
      { duration: '60s', target: cfgEndurance.users },
      { duration: `${cfgEndurance.durationSec}s`, target: cfgEndurance.users },
      { duration: '30s', target: 0 },
      // 5. Volume Test
      { duration: '60s', target: cfgVolume.users },
      { duration: `${cfgVolume.durationSec}s`, target: cfgVolume.users },
      { duration: '30s', target: 0 },
      // 6. Concurrency Test
      { duration: '10s', target: cfgConcurrency.users },
      { duration: `${cfgConcurrency.durationSec}s`, target: cfgConcurrency.users },
      { duration: '10s', target: 0 },
    ];

    scenariosConfig = `  stages: ${JSON.stringify(totalPipelineStages, null, 4)},`;
  } else if (loadModel === 'TARGET_RPS') {
    // Arrival-rate executor: rate is exactly targetRps
    const durStr = `${durationSec}s`;
    scenariosConfig = `  scenarios: {
    target_arrival_rate: {
      executor: 'constant-arrival-rate',
      rate: ${targetRps},
      timeUnit: '1s',
      duration: '${durStr}',
      preAllocatedVUs: ${Math.max(10, Math.min(users, 100))},
      maxVUs: ${maxVUs || Math.max(users, targetRps * 2)},
      tags: { testid: '${testId}' },
    },
  },`;
  } else {
    // VU-based staged execution
    const stages = generateStagesForTestType(testType, users, durationSec, rampUpSec);
    const stagesJson = JSON.stringify(
      stages.map(s => ({ duration: s.duration, target: s.targetUsers })),
      null,
      4
    );
    scenariosConfig = `  stages: ${stagesJson},`;
  }

  const endpointFunctions = endpoints.map((ep, idx) => {
    const fnName = `executeEndpoint_${idx}`;
    const cleanPath = ep.path.startsWith('/') ? ep.path : `/${ep.path}`;
    const fullUrl = `\${BASE_URL}${cleanPath}`;
    const headersObj = { ...(ep.headers || {}) };
    
    if (ep.method === 'POST' || ep.method === 'PUT' || ep.method === 'PATCH') {
      if (!headersObj['Content-Type']) {
        headersObj['Content-Type'] = 'application/json';
      }
    }

    const headersJson = JSON.stringify(headersObj);
    const bodyContent = ep.body ? interpolateK6Body(ep.body) : 'null';
    const tagEndpoint = `${ep.method} ${cleanPath}`;
    const weight = ep.weight || 10;

    let reqCall = '';
    if (ep.method === 'GET') {
      reqCall = `http.get(\`${fullUrl}\`, {
      headers: ${headersJson},
      tags: {
        endpoint: "${tagEndpoint}",
        method: "GET",
        testid: TEST_ID
      }
    })`;
    } else if (ep.method === 'POST') {
      reqCall = `http.post(\`${fullUrl}\`, ${bodyContent}, {
      headers: ${headersJson},
      tags: {
        endpoint: "${tagEndpoint}",
        method: "POST",
        testid: TEST_ID
      }
    })`;
    } else if (ep.method === 'PUT') {
      reqCall = `http.put(\`${fullUrl}\`, ${bodyContent}, {
      headers: ${headersJson},
      tags: {
        endpoint: "${tagEndpoint}",
        method: "PUT",
        testid: TEST_ID
      }
    })`;
    } else if (ep.method === 'DELETE') {
      reqCall = `http.del(\`${fullUrl}\`, ${bodyContent}, {
      headers: ${headersJson},
      tags: {
        endpoint: "${tagEndpoint}",
        method: "DELETE",
        testid: TEST_ID
      }
    })`;
    } else {
      reqCall = `http.request("${ep.method}", \`${fullUrl}\`, ${bodyContent}, {
      headers: ${headersJson},
      tags: {
        endpoint: "${tagEndpoint}",
        method: "${ep.method}",
        testid: TEST_ID
      }
    })`;
    }

    const pacingComment = loadModel === 'TARGET_RPS'
      ? '// Pacing managed by k6 arrival-rate executor'
      : '// Realistic user pacing with think time jitter (0.5s - 1.5s)\n  sleep(0.5 + Math.random());';

    return `
// Route: ${tagEndpoint} (Weight: ${weight}x)
function ${fnName}() {
  const res = ${reqCall};
  check(res, {
    '${tagEndpoint} status is 2xx/3xx': (r) => r.status >= 200 && r.status < 400,
  }, {
    endpoint: "${tagEndpoint}",
    method: "${ep.method}",
    testid: TEST_ID
  });
  ${pacingComment}
}`;
  }).join('\n');

  // Weighted probability distribution
  const totalWeight = endpoints.reduce((sum, ep) => sum + (ep.weight || 10), 0);
  let cumulative = 0;
  const weightedConditions = endpoints.map((ep, idx) => {
    cumulative += (ep.weight || 10);
    const threshold = (cumulative / totalWeight).toFixed(3);
    return `  if (rand <= ${threshold}) { executeEndpoint_${idx}(); return; }`;
  }).join('\n');

  if (isSequentialSuite) {
    return `// ==========================================================
// EAII Performance Testing Tool — Generated k6 Test Script
// Test Name:      ${testName}
// Test ID:        ${testId}
// Pipeline Scope: All 6 Test Types (Automated Sequential Suite)
// Test Types:     1. Load Test, 2. Stress Test, 3. Spike Test, 4. Endurance Test, 5. Volume Test, 6. Concurrency Test
// Target VUs:     Load: ${cfgLoad.users} | Stress: ${cfgStress.users} | Spike: ${cfgSpike.users} | Endurance: ${cfgEndurance.users} | Volume: ${cfgVolume.users} | Concurrency: ${cfgConcurrency.users}
// Host:           ${cleanBaseUrl}
// Generated:      ${new Date().toISOString()}
// Prometheus Remote-Write: ${prometheusUrl}/api/v1/write
// ==========================================================

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
${scenariosConfig}
  thresholds: {
    'http_req_failed{testid:${testId}}': ['rate<0.05'], // SLA Error rate < 5%
    'http_req_duration{testid:${testId}}': ['p(95)<2000'], // SLA P95 latency < 2000ms
  },
  tags: {
    testid: '${testId}',
    test_type: '6-Phase Sequential Suite',
  },
  ext: {
    loadimpact: {
      name: "${testName}",
    },
  },
};

const BASE_URL = '${cleanBaseUrl}';
const TEST_ID = '${testId}';
const AUTH_TOKEN = 'Bearer eaii_perf_token_${Date.now()}';

${endpointFunctions}

export default function () {
  const rand = Math.random();
${weightedConditions}
}

export function handleSummary(data) {
  return {
    'summary.json': JSON.stringify(data),
    stdout: JSON.stringify({
      metrics: data.metrics,
      root_group: data.root_group
    })
  };
}
`;
  }

  return `// ==========================================================
// EAII Performance Testing Tool — Generated k6 Test Script
// Test Name:  ${testName}
// Test ID:    ${testId}
// Test Type:  ${testType}
// Load Model: ${loadModel === 'TARGET_RPS' ? `Target RPS (${targetRps} RPS)` : `VU-Based (${users} VUs)`}
// Generated:  ${new Date().toISOString()}
// Prometheus Remote-Write: ${prometheusUrl}/api/v1/write
// ==========================================================

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
${scenariosConfig}
  thresholds: {
    'http_req_failed{testid:${testId}}': ['rate<0.05'], // SLA Error rate < 5%
    'http_req_duration{testid:${testId}}': ['p(95)<2000'], // SLA P95 latency < 2000ms
  },
  tags: {
    testid: '${testId}',
    test_type: '${testType}',
  },
  ext: {
    loadimpact: {
      name: "${testName}",
    },
  },
};

const BASE_URL = '${cleanBaseUrl}';
const TEST_ID = '${testId}';
const AUTH_TOKEN = 'Bearer eaii_perf_token_${Date.now()}';

${endpointFunctions}

export default function () {
  const rand = Math.random();
${weightedConditions}
}

export function handleSummary(data) {
  return {
    'summary.json': JSON.stringify(data),
    stdout: JSON.stringify({
      metrics: data.metrics,
      root_group: data.root_group
    })
  };
}
`;
}
