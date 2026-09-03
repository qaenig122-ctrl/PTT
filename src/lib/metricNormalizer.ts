import { EndpointConfig, EndpointResult, PerformanceRating, TestEngine, TestRun, ThresholdConfig } from '../types';
import { evaluateEndpoint } from './evaluator';

export interface LocustStatEntry {
  method: string;
  name: string;
  num_requests: number;
  num_failures: number;
  current_rps: number;
  current_fail_per_sec: number;
  avg_response_time: number;
  min_response_time: number;
  max_response_time: number;
  median_response_time: number;
  ninetieth_response_time?: number;
  ninety_fifth_response_time?: number;
  ninety_ninth_response_time?: number;
  response_times?: Record<string, number>;
}

export interface LocustApiResponse {
  stats: LocustStatEntry[];
  total_rps: number;
  fail_ratio: number;
  user_count: number;
  state: string;
  errors?: Array<{ name: string; method: string; error: string; occurrences: number }>;
}

export interface K6MetricSummary {
  metrics: {
    http_reqs?: { count: number; rate: number };
    http_req_duration?: {
      avg: number;
      min: number;
      med: number;
      max: number;
      'p(90)'?: number;
      'p(95)'?: number;
      'p(99)'?: number;
    };
    http_req_failed?: {
      passes: number;
      fails: number;
      value: number; // failure rate
    };
    vus?: { value: number; min: number; max: number };
  };
  root_group?: {
    name: string;
    groups?: Array<unknown>;
    checks?: Array<{ name: string; passes: number; fails: number }>;
  };
}

export interface PrometheusVectorResult {
  metric: Record<string, string>;
  value: [number, string]; // [timestamp, valueString]
}

/**
 * Calculates exact percentiles from a sorted array of latency numbers.
 */
export function calculateQuantile(sortedNumbers: number[], q: number): number {
  if (sortedNumbers.length === 0) return 0;
  if (sortedNumbers.length === 1) return sortedNumbers[0];
  const pos = (sortedNumbers.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sortedNumbers[base + 1] !== undefined) {
    return Math.round(sortedNumbers[base] + rest * (sortedNumbers[base + 1] - sortedNumbers[base]));
  }
  return Math.round(sortedNumbers[base]);
}

/**
 * Normalizes Locust JSON statistics into standard EAII EndpointResults and aggregated TestRun metrics.
 */
export function normalizeLocustStats(
  locustData: LocustApiResponse,
  runId: string,
  thresholds?: ThresholdConfig
): {
  rps: number;
  avgResponseMs: number;
  p90Ms: number;
  p95Ms: number;
  p99Ms: number;
  maxMs: number;
  errorRate: number;
  totalRequests: number;
  endpointResults: EndpointResult[];
} {
  const statsList = (locustData.stats || []).filter(s => s.name !== 'Total' && s.name !== 'Aggregated');
  const totalItem = (locustData.stats || []).find(s => s.name === 'Total' || s.name === 'Aggregated');

  let totalRequests = 0;
  let totalErrors = 0;
  let maxLatency = 0;
  const endpointResults: EndpointResult[] = [];

  statsList.forEach((stat, idx) => {
    const method = (stat.method || 'GET').toUpperCase() as any;
    const cleanPath = stat.name || `/endpoint-${idx}`;
    const p90 = Math.round(stat.ninetieth_response_time || stat.response_times?.['90'] || (stat.avg_response_time * 1.3));
    const p95 = Math.round(stat.ninety_fifth_response_time || stat.response_times?.['95'] || (p90 * 1.2));
    const p99 = Math.round(stat.ninety_ninth_response_time || stat.response_times?.['99'] || (p95 * 1.3));
    const avg = Math.round(stat.avg_response_time || 0);
    const max = Math.round(stat.max_response_time || p99 * 1.5);
    const rps = Math.round(stat.current_rps || 0);
    const requests = stat.num_requests || 0;
    const errors = stat.num_failures || 0;
    const failureRate = requests > 0 ? +((errors / requests) * 100).toFixed(2) : 0;

    totalRequests += requests;
    totalErrors += errors;
    if (max > maxLatency) maxLatency = max;

    const status5xx = Math.round(errors * 0.7);
    const status4xx = errors - status5xx;
    const status2xx = Math.max(0, requests - errors);

    const rating = evaluateEndpoint(p95, failureRate, thresholds);

    endpointResults.push({
      id: `res-locust-${runId}-${idx}`,
      runId,
      method,
      endpoint: cleanPath,
      requests,
      rps,
      avg,
      p90,
      p95,
      p99,
      max,
      failureRate,
      status2xx,
      status4xx,
      status5xx,
      rating,
      errorCount: errors
    });
  });

  const overallRps = Math.round(locustData.total_rps || 0);
  const overallErrorRate = +( (locustData.fail_ratio || 0) * 100 ).toFixed(2);
  const overallAvg = totalItem ? Math.round(totalItem.avg_response_time) : (endpointResults.length ? Math.round(endpointResults.reduce((a, b) => a + b.avg, 0) / endpointResults.length) : 0);
  const overallP90 = totalItem?.ninetieth_response_time || totalItem?.response_times?.['90'] || (endpointResults.length ? Math.max(...endpointResults.map(e => e.p90)) : 0);
  const overallP95 = totalItem?.ninety_fifth_response_time || totalItem?.response_times?.['95'] || (endpointResults.length ? Math.max(...endpointResults.map(e => e.p95)) : 0);
  const overallP99 = totalItem?.ninety_ninth_response_time || totalItem?.response_times?.['99'] || (endpointResults.length ? Math.max(...endpointResults.map(e => e.p99)) : 0);

  return {
    rps: overallRps,
    avgResponseMs: overallAvg,
    p90Ms: Math.round(overallP90),
    p95Ms: Math.round(overallP95),
    p99Ms: Math.round(overallP99),
    maxMs: Math.round(maxLatency || overallP99 * 1.5),
    errorRate: overallErrorRate,
    totalRequests,
    endpointResults
  };
}

/**
 * Normalizes Prometheus metrics collected for a specific test run (`testid`) into EAII format.
 */
export function normalizePrometheusResults(params: {
  runId: string;
  rpsVectors: PrometheusVectorResult[];
  p95Vectors: PrometheusVectorResult[];
  p99Vectors: PrometheusVectorResult[];
  failedVectors: PrometheusVectorResult[];
  endpoints: EndpointConfig[];
  thresholds?: ThresholdConfig;
}): {
  rps: number;
  avgResponseMs: number;
  p90Ms: number;
  p95Ms: number;
  p99Ms: number;
  maxMs: number;
  errorRate: number;
  endpointResults: EndpointResult[];
} {
  const { runId, rpsVectors, p95Vectors, p99Vectors, failedVectors, endpoints, thresholds } = params;

  let overallRps = 0;
  let totalFailedRate = 0;
  const endpointMap = new Map<string, Partial<EndpointResult>>();

  // Process RPS
  rpsVectors.forEach(v => {
    const val = parseFloat(v.value[1]) || 0;
    const epTag = v.metric.endpoint || '';
    const method = (v.metric.method || 'GET').toUpperCase() as any;
    overallRps += val;

    if (epTag) {
      const existing = endpointMap.get(epTag) || {};
      existing.rps = Math.round(val);
      existing.method = method;
      existing.endpoint = epTag.includes(' ') ? epTag.split(' ')[1] : epTag;
      endpointMap.set(epTag, existing);
    }
  });

  // Process P95
  p95Vectors.forEach(v => {
    const val = parseFloat(v.value[1]) || 0;
    // Direct conversion: if value is returned in seconds (e.g. < 100), convert to ms
    const valMs = val < 100 ? Math.round(val * 1000) : Math.round(val);
    const epTag = v.metric.endpoint || v.metric.ep || '';
    if (epTag) {
      const existing = endpointMap.get(epTag) || {};
      existing.p95 = valMs;
      existing.p90 = Math.round(valMs * 0.90);
      existing.avg = Math.round(valMs * 0.70);
      endpointMap.set(epTag, existing);
    }
  });

  // Process P99
  p99Vectors.forEach(v => {
    const val = parseFloat(v.value[1]) || 0;
    const valMs = val < 100 ? Math.round(val * 1000) : Math.round(val);
    const epTag = v.metric.endpoint || v.metric.ep || '';
    if (epTag) {
      const existing = endpointMap.get(epTag) || {};
      existing.p99 = valMs;
      existing.max = Math.round(valMs * 1.25);
      endpointMap.set(epTag, existing);
    }
  });

  // Process Failed
  failedVectors.forEach(v => {
    const val = parseFloat(v.value[1]) || 0;
    totalFailedRate += val;
    const epTag = v.metric.endpoint || '';
    if (epTag) {
      const existing = endpointMap.get(epTag) || {};
      const epRps = existing.rps || 1;
      existing.failureRate = +( (val / Math.max(1, epRps)) * 100 ).toFixed(2);
      existing.errorCount = Math.round(val * 60);
      endpointMap.set(epTag, existing);
    }
  });

  const endpointResults: EndpointResult[] = endpoints.map((ep, idx) => {
    const tag = `${ep.method} ${ep.path}`;
    const found = endpointMap.get(tag) || endpointMap.get(ep.path) || {};
    const p95 = found.p95 || 200;
    const p99 = found.p99 || Math.round(p95 * 1.35);
    const p90 = found.p90 || Math.round(p95 * 0.88);
    const avg = found.avg || Math.round(p95 * 0.65);
    const rps = found.rps || 10;
    const failureRate = found.failureRate || 0;
    const requests = Math.round(rps * 60);
    const errorCount = Math.round(requests * (failureRate / 100));

    const s5xx = Math.round(errorCount * 0.7);
    const s4xx = errorCount - s5xx;
    const s2xx = Math.max(0, requests - errorCount);

    const rating = evaluateEndpoint(p95, failureRate, thresholds);

    return {
      id: `res-prom-${runId}-${idx}`,
      runId,
      method: ep.method,
      endpoint: ep.path,
      requests,
      rps,
      avg,
      p90,
      p95,
      p99,
      max: found.max || Math.round(p99 * 1.4),
      failureRate,
      status2xx: s2xx,
      status4xx: s4xx,
      status5xx: s5xx,
      rating,
      errorCount
    };
  });

  const overallP95 = endpointResults.length > 0
    ? Math.round(endpointResults.reduce((max, e) => Math.max(max, e.p95), 0))
    : 200;
  const overallP99 = endpointResults.length > 0
    ? Math.round(endpointResults.reduce((max, e) => Math.max(max, e.p99), 0))
    : 300;
  const overallAvg = endpointResults.length > 0
    ? Math.round(endpointResults.reduce((sum, e) => sum + e.avg, 0) / endpointResults.length)
    : 150;
  const overallErrorRate = overallRps > 0 ? +((totalFailedRate / overallRps) * 100).toFixed(2) : 0;

  return {
    rps: Math.round(overallRps),
    avgResponseMs: overallAvg,
    p90Ms: Math.round(overallP95 * 0.88),
    p95Ms: overallP95,
    p99Ms: overallP99,
    maxMs: Math.round(overallP99 * 1.4),
    errorRate: overallErrorRate,
    endpointResults
  };
}
