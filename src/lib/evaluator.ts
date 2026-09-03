import {
  EndpointResult,
  PerformanceRating,
  ThresholdConfig,
  TestType,
  TestEngine,
  DynamicTestProfile,
  MetricTier,
  CriticalViolation,
  SlaEvaluation,
  SlaGateResult,
  ProductionRecommendation,
  ProductionStatus,
  TestBehaviorAnalysis,
  RecommendationItem,
  DynamicSystemEvaluation,
  LiveMetricPoint
} from '../types';

export const DEFAULT_THRESHOLDS: ThresholdConfig = {
  p95ExcellentMs: 500,
  p95GoodMs: 1000,
  p95WarningMs: 2000,
  errorRateExcellentPct: 0.5,
  errorRateGoodPct: 1.0,
  errorRateWarningPct: 2.5,
  minRpsTarget: 100
};

// ============================================================================
// DYNAMIC TEST PROFILES FOR ALL 6 TEST TYPES
// ============================================================================

export const DYNAMIC_PROFILES: Record<TestType, DynamicTestProfile> = {
  'Load Test': {
    testType: 'Load Test',
    question: 'Can the system handle expected normal traffic within SLA?',
    focus: 'Baseline stability, predictable latency distribution, zero degradation under nominal load.',
    latency: {
      targetAvgMs: 1000,
      warningAvgMs: 4000,
      criticalAvgMs: 10000,
      targetP95Ms: 2000,
      warningP95Ms: 6000,
      criticalP95Ms: 15000,
      targetP99Ms: 3500,
      warningP99Ms: 9000,
      criticalP99Ms: 20000
    },
    errorRate: {
      targetPct: 1.0,
      warningPct: 4.0,
      criticalPct: 10.0
    },
    http5xx: {
      targetPct: 0.5,
      warningPct: 2.0,
      criticalPct: 5.0
    },
    timeout: {
      targetPct: 0.5,
      warningPct: 2.0,
      criticalPct: 5.0
    },
    throughput: {
      minRpsTarget: 100,
      warningRps: 70,
      criticalRps: 30
    },
    weights: {
      latency: 0.35,
      errorRate: 0.40,
      throughput: 0.15,
      behavior: 0.10
    },
    behaviorLabel: 'Normal Traffic Stability & SLA Compliance'
  },
  'Stress Test': {
    testType: 'Stress Test',
    question: 'Where does the system break, and how gracefully does it degrade beyond capacity?',
    focus: 'Identification of saturation point, resource exhaustion, and graceful degradation vs abrupt crash.',
    latency: {
      targetAvgMs: 2000,
      warningAvgMs: 6000,
      criticalAvgMs: 15000,
      targetP95Ms: 4000,
      warningP95Ms: 10000,
      criticalP95Ms: 25000,
      targetP99Ms: 7000,
      warningP99Ms: 15000,
      criticalP99Ms: 30000
    },
    errorRate: {
      targetPct: 2.0,
      warningPct: 6.0,
      criticalPct: 15.0
    },
    http5xx: {
      targetPct: 1.0,
      warningPct: 3.0,
      criticalPct: 7.0
    },
    timeout: {
      targetPct: 1.0,
      warningPct: 3.0,
      criticalPct: 7.0
    },
    throughput: {
      minRpsTarget: 150,
      warningRps: 100,
      criticalRps: 50
    },
    weights: {
      latency: 0.25,
      errorRate: 0.40,
      throughput: 0.20,
      behavior: 0.15
    },
    behaviorLabel: 'Saturation Limit & Degradation Gracefulness'
  },
  'Spike Test': {
    testType: 'Spike Test',
    question: 'Can the system survive sudden drastic traffic surges and rapidly recover back to baseline?',
    focus: 'Surge absorption, queue elasticity, transient vs persistent error isolation, and recovery time.',
    latency: {
      targetAvgMs: 1500,
      warningAvgMs: 5000,
      criticalAvgMs: 12000,
      targetP95Ms: 3000,
      warningP95Ms: 8000,
      criticalP95Ms: 20000,
      targetP99Ms: 5000,
      warningP99Ms: 12000,
      criticalP99Ms: 25000
    },
    errorRate: {
      targetPct: 1.0,
      warningPct: 5.0,
      criticalPct: 12.0
    },
    http5xx: {
      targetPct: 0.5,
      warningPct: 2.5,
      criticalPct: 6.0
    },
    timeout: {
      targetPct: 0.5,
      warningPct: 2.5,
      criticalPct: 6.0
    },
    throughput: {
      minRpsTarget: 200,
      warningRps: 120,
      criticalRps: 60
    },
    weights: {
      latency: 0.30,
      errorRate: 0.35,
      throughput: 0.15,
      behavior: 0.20
    },
    behaviorLabel: 'Surge Absorption & Rapid Baseline Recovery'
  },
  'Endurance Test': {
    testType: 'Endurance Test',
    question: 'Does the system maintain steady performance over time, or suffer from memory leaks, resource exhaustion, or latency drift?',
    focus: 'Long-duration stability, memory leak prevention, connection pool leakage, and latency drift over time.',
    latency: {
      targetAvgMs: 1000,
      warningAvgMs: 3500,
      criticalAvgMs: 8000,
      targetP95Ms: 2000,
      warningP95Ms: 5000,
      criticalP95Ms: 12000,
      targetP99Ms: 3500,
      warningP99Ms: 8000,
      criticalP99Ms: 18000
    },
    errorRate: {
      targetPct: 0.5,
      warningPct: 2.0,
      criticalPct: 6.0
    },
    http5xx: {
      targetPct: 0.2,
      warningPct: 1.0,
      criticalPct: 3.0
    },
    timeout: {
      targetPct: 0.2,
      warningPct: 1.0,
      criticalPct: 3.0
    },
    throughput: {
      minRpsTarget: 80,
      warningRps: 50,
      criticalRps: 25
    },
    weights: {
      latency: 0.30,
      errorRate: 0.40,
      throughput: 0.10,
      behavior: 0.20
    },
    behaviorLabel: 'Resource Stability & Latency Drift Over Time'
  },
  'Volume Test': {
    testType: 'Volume Test',
    question: 'Can the system handle large volumes of data or requests without I/O saturation, timeout or memory bloat?',
    focus: 'Large payload processing, I/O saturation, serialization overhead, buffer pool stability, and disk throughput.',
    latency: {
      targetAvgMs: 1500,
      warningAvgMs: 4500,
      criticalAvgMs: 12000,
      targetP95Ms: 3000,
      warningP95Ms: 7500,
      criticalP95Ms: 18000,
      targetP99Ms: 5000,
      warningP99Ms: 10000,
      criticalP99Ms: 22000
    },
    errorRate: {
      targetPct: 1.0,
      warningPct: 4.0,
      criticalPct: 10.0
    },
    http5xx: {
      targetPct: 0.5,
      warningPct: 2.0,
      criticalPct: 5.0
    },
    timeout: {
      targetPct: 0.5,
      warningPct: 2.0,
      criticalPct: 5.0
    },
    throughput: {
      minRpsTarget: 120,
      warningRps: 80,
      criticalRps: 40
    },
    weights: {
      latency: 0.25,
      errorRate: 0.35,
      throughput: 0.25,
      behavior: 0.15
    },
    behaviorLabel: 'I/O Saturation & Large Payload Handling'
  },
  'Concurrency Test': {
    testType: 'Concurrency Test',
    question: 'Can the system handle simultaneous parallel threads/connections without race conditions, lock contention, or thread pool exhaustion?',
    focus: 'Parallel connection handling, thread pool saturation, database row lock contention, and parallel queuing.',
    latency: {
      targetAvgMs: 1200,
      warningAvgMs: 4000,
      criticalAvgMs: 10000,
      targetP95Ms: 2500,
      warningP95Ms: 6500,
      criticalP95Ms: 16000,
      targetP99Ms: 4000,
      warningP99Ms: 9000,
      criticalP99Ms: 20000
    },
    errorRate: {
      targetPct: 1.0,
      warningPct: 4.0,
      criticalPct: 10.0
    },
    http5xx: {
      targetPct: 0.5,
      warningPct: 2.0,
      criticalPct: 5.0
    },
    timeout: {
      targetPct: 0.5,
      warningPct: 2.0,
      criticalPct: 5.0
    },
    throughput: {
      minRpsTarget: 100,
      warningRps: 70,
      criticalRps: 30
    },
    weights: {
      latency: 0.25,
      errorRate: 0.40,
      throughput: 0.15,
      behavior: 0.20
    },
    behaviorLabel: 'Thread/Lock Contention & Parallel Queuing'
  }
};

export type EvaluationDiagnosis = DynamicSystemEvaluation;

/**
 * Retrieves the appropriate dynamic profile for the given test type,
 * with optional threshold overrides if specified by the user.
 */
export function getTestProfile(
  testType?: TestType,
  overrides?: Partial<ThresholdConfig>
): DynamicTestProfile {
  const baseType: TestType = testType && DYNAMIC_PROFILES[testType] ? testType : 'Load Test';
  const baseProfile = DYNAMIC_PROFILES[baseType];

  if (!overrides) return baseProfile;

  // Clone profile and apply any explicitly configured overrides
  const profile: DynamicTestProfile = JSON.parse(JSON.stringify(baseProfile));

  if (overrides.p95GoodMs) profile.latency.targetP95Ms = overrides.p95GoodMs;
  if (overrides.p95WarningMs) profile.latency.warningP95Ms = overrides.p95WarningMs;
  if (overrides.minRpsTarget) profile.throughput.minRpsTarget = overrides.minRpsTarget;
  if (overrides.errorRateGoodPct) profile.errorRate.targetPct = overrides.errorRateGoodPct;
  if (overrides.errorRateWarningPct) profile.errorRate.warningPct = overrides.errorRateWarningPct;

  return profile;
}

// ============================================================================
// CONTINUOUS SCORING ALGORITHMS
// ============================================================================

function scoreLatencyMetric(value: number, target: number, warning: number, critical: number): number {
  if (!Number.isFinite(value) || value <= 0) return 100;
  if (value <= target) return 100;
  if (value <= warning) {
    // Smooth linear scale from 100 down to 75 (ACCEPTABLE range)
    const ratio = (value - target) / Math.max(1, warning - target);
    return Math.round(100 - ratio * 25);
  }
  if (value <= critical) {
    // Smooth linear scale from 74 down to 35 (WARNING range)
    const ratio = (value - warning) / Math.max(1, critical - warning);
    return Math.round(74 - ratio * 39);
  }
  // Beyond critical: scales from 34 down to 5
  const excessRatio = Math.min(1, (value - critical) / Math.max(1, critical));
  return Math.max(5, Math.round(34 - excessRatio * 29));
}

function scoreErrorRateMetric(rate: number, target: number, warning: number, critical: number): number {
  if (!Number.isFinite(rate) || rate <= 0) return 100;
  if (rate <= target) return 100;
  if (rate <= warning) {
    const ratio = (rate - target) / Math.max(0.1, warning - target);
    return Math.round(100 - ratio * 25);
  }
  if (rate <= critical) {
    const ratio = (rate - warning) / Math.max(0.1, critical - warning);
    return Math.round(74 - ratio * 40);
  }
  const excessRatio = Math.min(1, (rate - critical) / Math.max(1, critical));
  return Math.max(5, Math.round(34 - excessRatio * 29));
}

function scoreThroughputMetric(actualRps: number, targetRps: number, warningRps = 70, criticalRps = 30): number {
  if (actualRps <= 0) return 30;
  if (actualRps >= targetRps) return 100;
  if (actualRps >= warningRps) {
    const ratio = (targetRps - actualRps) / Math.max(1, targetRps - warningRps);
    return Math.round(100 - ratio * 25);
  }
  if (actualRps >= criticalRps) {
    const ratio = (warningRps - actualRps) / Math.max(1, warningRps - criticalRps);
    return Math.round(74 - ratio * 40);
  }
  const dropRatio = Math.min(1, (criticalRps - actualRps) / Math.max(1, criticalRps));
  return Math.max(5, Math.round(34 - dropRatio * 29));
}

/**
 * Evaluates test-specific dynamic behavior based on test type and timeline telemetry.
 */
function evaluateTestBehavior(
  testType: TestType,
  profile: DynamicTestProfile,
  p95Ms: number,
  avgMs: number,
  errorRate: number,
  status5xx: number,
  endpoints: EndpointResult[],
  timeline?: LiveMetricPoint[]
): TestBehaviorAnalysis {
  let behaviorScore = 90;
  const observations: string[] = [];
  const metrics: TestBehaviorAnalysis['metrics'] = [];

  switch (testType) {
    case 'Load Test': {
      const latencyVarianceRatio = avgMs > 0 ? (p95Ms - avgMs) / avgMs : 0;
      const isStable = latencyVarianceRatio < 2.5 && errorRate <= profile.errorRate.targetPct;
      behaviorScore = isStable ? 96 : latencyVarianceRatio < 4.0 ? 78 : 55;

      metrics.push({
        label: 'Latency Jitter (Tail Spread)',
        value: `${(latencyVarianceRatio * 100).toFixed(0)}%`,
        status: latencyVarianceRatio < 2.5 ? 'GOOD' : latencyVarianceRatio < 4.0 ? 'WARNING' : 'CRITICAL',
        detail: 'Measures spread between average and P95 latency under normal load.'
      });
      metrics.push({
        label: 'Nominal Load Adherence',
        value: errorRate === 0 ? 'Flawless (0% err)' : `${errorRate.toFixed(2)}% err`,
        status: errorRate <= profile.errorRate.targetPct ? 'GOOD' : 'WARNING',
        detail: 'Expected zero or near-zero errors under normal baseline conditions.'
      });
      observations.push(
        isStable
          ? 'System demonstrates stable, deterministic response times with tight tail latency under normal traffic.'
          : 'Elevated latency jitter observed between average and 95th percentile requests.'
      );
      break;
    }

    case 'Stress Test': {
      const errorToleranceMet = errorRate <= profile.errorRate.warningPct;
      const gracefulDegradation = status5xx === 0 || (status5xx / Math.max(1, endpoints.reduce((a, b) => a + b.requests, 1))) < 0.03;
      behaviorScore = errorToleranceMet && gracefulDegradation ? 88 : gracefulDegradation ? 70 : 45;

      metrics.push({
        label: 'Saturation Resilience',
        value: gracefulDegradation ? 'Graceful' : 'Abrupt Collapse',
        status: gracefulDegradation ? 'GOOD' : 'CRITICAL',
        detail: 'Assesses whether the service rejected gracefully or crashed when capacity was exceeded.'
      });
      metrics.push({
        label: 'Stress Error Envelope',
        value: `${errorRate.toFixed(2)}% / ${profile.errorRate.warningPct}% limit`,
        status: errorRate <= profile.errorRate.warningPct ? 'GOOD' : 'WARNING',
        detail: 'Errors remain within expected beyond-capacity limits.'
      });
      observations.push(
        gracefulDegradation
          ? 'Service demonstrated graceful degradation beyond nominal capacity without catastrophic backend crash.'
          : 'High 5xx server error rate indicates thread/socket exhaustion or unhandled backpressure.'
      );
      break;
    }

    case 'Spike Test': {
      // Analyze surge recovery
      const hasBurstErrors = errorRate > 0;
      const recoveryClean = status5xx === 0 || errorRate <= profile.errorRate.warningPct;
      behaviorScore = recoveryClean ? 92 : 65;

      metrics.push({
        label: 'Surge Absorption',
        value: p95Ms < profile.latency.warningP95Ms ? 'Absorbed' : 'Severe Delay',
        status: p95Ms < profile.latency.warningP95Ms ? 'GOOD' : 'WARNING',
        detail: 'Queue elasticity and request buffering during the abrupt traffic spike.'
      });
      metrics.push({
        label: 'Post-Spike Baseline Recovery',
        value: recoveryClean ? 'Restored Promptly' : 'Persistent Degraded State',
        status: recoveryClean ? 'GOOD' : 'CRITICAL',
        detail: 'System returned to steady-state performance once the burst subsided.'
      });
      observations.push(
        recoveryClean
          ? 'Traffic burst was successfully absorbed and system rapidly regained baseline throughput.'
          : 'Elevated tail latency or residual errors persisted after the spike completed.'
      );
      break;
    }

    case 'Endurance Test': {
      // Check for latency drift
      let driftPct = 5.0; // Default nominal drift
      if (timeline && timeline.length >= 6) {
        const earlySlice = timeline.slice(0, Math.floor(timeline.length * 0.3));
        const lateSlice = timeline.slice(Math.floor(timeline.length * 0.7));
        const earlyAvg = earlySlice.reduce((s, p) => s + p.avg, 0) / Math.max(1, earlySlice.length);
        const lateAvg = lateSlice.reduce((s, p) => s + p.avg, 0) / Math.max(1, lateSlice.length);
        if (earlyAvg > 0) {
          driftPct = ((lateAvg - earlyAvg) / earlyAvg) * 100;
        }
      }
      const driftHealthy = driftPct < 20;
      behaviorScore = driftHealthy ? 94 : driftPct < 50 ? 72 : 40;

      metrics.push({
        label: 'Timeline Latency Drift',
        value: `${driftPct > 0 ? '+' : ''}${driftPct.toFixed(1)}%`,
        status: driftHealthy ? 'GOOD' : driftPct < 50 ? 'WARNING' : 'CRITICAL',
        detail: 'Latency change between early and late test intervals.'
      });
      metrics.push({
        label: 'Memory / Resource Stability',
        value: status5xx === 0 ? 'No Resource Exhaustion' : `${status5xx} 5xx errors`,
        status: status5xx === 0 ? 'GOOD' : 'WARNING',
        detail: 'Absence of connection leaks or memory accumulation.'
      });
      observations.push(
        driftHealthy
          ? 'No significant latency drift or memory degradation observed across sustained duration.'
          : `Latency drifted upwards by ${driftPct.toFixed(1)}% over the run, suggesting resource or connection accumulation.`
      );
      break;
    }

    case 'Volume Test': {
      const ioHealthy = p95Ms < profile.latency.warningP95Ms && errorRate <= profile.errorRate.warningPct;
      behaviorScore = ioHealthy ? 91 : 68;

      metrics.push({
        label: 'I/O & Payload Processing',
        value: ioHealthy ? 'Efficient Buffer Handling' : 'I/O Backpressure Detected',
        status: ioHealthy ? 'GOOD' : 'WARNING',
        detail: 'Capacity to serialize, validate, and write large payloads without timing out.'
      });
      metrics.push({
        label: 'Network & Buffer Saturation',
        value: status5xx === 0 ? 'No Socket Timeouts' : `${status5xx} Gateway Timeouts`,
        status: status5xx === 0 ? 'GOOD' : 'CRITICAL',
        detail: 'Network socket and memory buffer pool efficiency under high payload weight.'
      });
      observations.push(
        ioHealthy
          ? 'High volume requests processed with consistent throughput and minimal serialization overhead.'
          : 'High payload density caused latency expansion or socket read timeouts.'
      );
      break;
    }

    case 'Concurrency Test': {
      const concurrencyStable = errorRate <= profile.errorRate.warningPct && p95Ms <= profile.latency.warningP95Ms;
      behaviorScore = concurrencyStable ? 93 : 62;

      metrics.push({
        label: 'Lock & Thread Contention',
        value: concurrencyStable ? 'Low Contention' : 'Contention Delays',
        status: concurrencyStable ? 'GOOD' : 'WARNING',
        detail: 'Evaluates database transaction locking and thread pool dispatch delays.'
      });
      metrics.push({
        label: 'Parallel Connection Stability',
        value: errorRate === 0 ? 'Zero Connection Drops' : `${errorRate.toFixed(2)}% dropped/failed`,
        status: errorRate === 0 ? 'GOOD' : errorRate <= profile.errorRate.warningPct ? 'WARNING' : 'CRITICAL',
        detail: 'Simultaneous connection handling without reset or refusal.'
      });
      observations.push(
        concurrencyStable
          ? 'Parallel threads operated without deadlock, thread pool starvation, or connection reset.'
          : 'Parallel concurrency caused queuing delays or connection drops.'
      );
      break;
    }
  }

  return {
    testType,
    primaryQuestion: profile.question,
    behaviorAssessment: observations[0] || 'Standard behavior observed.',
    behaviorScore: Math.max(0, Math.min(100, behaviorScore)),
    keyObservations: observations,
    metrics
  };
}

/**
 * Evaluates hard critical threshold boundaries.
 * CRITICAL RULE: "Critical must NOT depend on the score."
 * Determined solely by whether a designated critical threshold was violated.
 */
function evaluateCriticalViolations(
  p95Ms: number,
  avgMs: number,
  errorRate: number,
  status5xx: number,
  totalRequests: number,
  profile: DynamicTestProfile,
  timeouts = 0,
  rps = 0
): CriticalViolation[] {
  const violations: CriticalViolation[] = [];

  // 1. Error rate critical violation
  if (errorRate > profile.errorRate.criticalPct) {
    violations.push({
      id: 'crit-err-rate',
      type: 'ERROR_RATE_EXCEEDED',
      metric: 'Error Rate',
      actual: `${errorRate.toFixed(2)}%`,
      threshold: `${profile.errorRate.criticalPct}%`,
      message: `Error rate of ${errorRate.toFixed(2)}% exceeded the critical threshold of ${profile.errorRate.criticalPct}% for ${profile.testType}.`,
      severity: 'CRITICAL'
    });
  }

  // 2. P95 latency critical violation
  if (p95Ms > profile.latency.criticalP95Ms) {
    violations.push({
      id: 'crit-p95-latency',
      type: 'LATENCY_EXCEEDED',
      metric: 'P95 Latency',
      actual: `${p95Ms.toLocaleString()} ms`,
      threshold: `${profile.latency.criticalP95Ms.toLocaleString()} ms`,
      message: `P95 tail latency of ${p95Ms.toLocaleString()} ms breached the critical limit of ${profile.latency.criticalP95Ms.toLocaleString()} ms for ${profile.testType}.`,
      severity: 'CRITICAL'
    });
  }

  // 3. Average latency critical violation
  if (avgMs > profile.latency.criticalAvgMs) {
    violations.push({
      id: 'crit-avg-latency',
      type: 'LATENCY_EXCEEDED',
      metric: 'Average Latency',
      actual: `${avgMs.toLocaleString()} ms`,
      threshold: `${profile.latency.criticalAvgMs.toLocaleString()} ms`,
      message: `Average latency of ${avgMs.toLocaleString()} ms breached the critical ceiling of ${profile.latency.criticalAvgMs.toLocaleString()} ms.`,
      severity: 'CRITICAL'
    });
  }

  // 4. Server 5xx systemic failure (> critical 5xx threshold)
  const critical5xx = profile.http5xx?.criticalPct ?? 5.0;
  if (totalRequests > 0) {
    const fiveXxRate = (status5xx / totalRequests) * 100;
    if (fiveXxRate > critical5xx) {
      violations.push({
        id: 'crit-5xx-rate',
        type: 'SYSTEMIC_FAILURE',
        metric: 'HTTP 5xx Server Crashes',
        actual: `${fiveXxRate.toFixed(2)}% (${status5xx} errors)`,
        threshold: `${critical5xx.toFixed(2)}%`,
        message: `HTTP 5xx server failure rate of ${fiveXxRate.toFixed(2)}% indicates severe backend crashes or gateway collapse.`,
        severity: 'CRITICAL'
      });
    }
  }

  // 5. Timeout systemic failure (> critical timeout threshold)
  const criticalTimeout = profile.timeout?.criticalPct ?? 5.0;
  if (totalRequests > 0 && timeouts > 0) {
    const timeoutRate = (timeouts / totalRequests) * 100;
    if (timeoutRate > criticalTimeout) {
      violations.push({
        id: 'crit-timeout-rate',
        type: 'UNRESPONSIVE',
        metric: 'Request Timeouts',
        actual: `${timeoutRate.toFixed(2)}% (${timeouts} timeouts)`,
        threshold: `${criticalTimeout.toFixed(2)}%`,
        message: `Request timeout rate of ${timeoutRate.toFixed(2)}% indicates severe downstream unresponsiveness.`,
        severity: 'CRITICAL'
      });
    }
  }

  // 6. Throughput collapse below critical floor (when testing with live load)
  const criticalRps = profile.throughput.criticalRps ?? 30;
  // A true throughput collapse happens when the system is starved, crashing, or unable to process load (< critical floor).
  // It is NOT a collapse if totalRequests is high and latency/error rates are healthy (which indicates high completed volume).
  const isHighVolumeSuccess = totalRequests >= 500 && errorRate <= profile.errorRate.targetPct && p95Ms <= profile.latency.targetP95Ms;
  if (!isHighVolumeSuccess && rps > 0 && rps < criticalRps && totalRequests > 100) {
    violations.push({
      id: 'crit-throughput-collapse',
      type: 'CRITICAL_SLA_FAILED',
      metric: 'Throughput Collapse',
      actual: `${Math.round(rps)} RPS`,
      threshold: `< ${criticalRps} RPS`,
      message: `Throughput collapsed to ${Math.round(rps)} RPS, falling below the critical floor of ${criticalRps} RPS.`,
      severity: 'CRITICAL'
    });
  }

  return violations;
}

/**
 * Evaluates formal SLA Quality Gates with 3-tier threshold classification:
 * 🟢 GOOD: Actual meets or beats preferred Target
 * 🟢 ACCEPTABLE: Worse than Target, but within Warning threshold (SLA PASSES, 0 Warnings)
 * 🟡 WARNING: Exceeds Warning threshold (SLA WARNING / AT_RISK)
 * 🔴 CRITICAL: Exceeds Critical threshold (SLA FAILED / CRITICAL)
 */
function evaluateSlaGates(
  p95Ms: number,
  p99Ms: number,
  avgMs: number,
  errorRate: number,
  rps: number,
  status5xx: number,
  profile: DynamicTestProfile,
  totalRequests = 0,
  timeouts = 0
): SlaEvaluation {
  const minRps = profile.throughput.minRpsTarget;
  const warningRps = profile.throughput.warningRps ?? Math.round(minRps * 0.7);
  const criticalRps = profile.throughput.criticalRps ?? Math.round(minRps * 0.3);

  const fiveXxRate = totalRequests > 0 ? (status5xx / totalRequests) * 100 : (status5xx > 0 ? 0.2 : 0);
  const timeoutRate = totalRequests > 0 ? (timeouts / totalRequests) * 100 : (timeouts > 0 ? 0.1 : 0);

  const target5xxPct = profile.http5xx?.targetPct ?? 0.5;
  const warning5xxPct = profile.http5xx?.warningPct ?? 2.0;
  const critical5xxPct = profile.http5xx?.criticalPct ?? 5.0;

  const targetTimeoutPct = profile.timeout?.targetPct ?? 0.5;
  const warningTimeoutPct = profile.timeout?.warningPct ?? 2.0;
  const criticalTimeoutPct = profile.timeout?.criticalPct ?? 5.0;

  // 1. Throughput (RPS)
  const rpsTier: MetricTier =
    rps >= minRps ? 'GOOD' : rps >= warningRps ? 'ACCEPTABLE' : rps >= criticalRps ? 'WARNING' : 'CRITICAL';
  const rpsStatus: SlaGateResult['status'] =
    rps >= warningRps ? 'PASS' : rps >= criticalRps ? 'WARNING' : 'FAIL';

  // 2. Average Response Time
  const avgTier: MetricTier =
    avgMs <= profile.latency.targetAvgMs
      ? 'GOOD'
      : avgMs <= profile.latency.warningAvgMs
      ? 'ACCEPTABLE'
      : avgMs <= profile.latency.criticalAvgMs
      ? 'WARNING'
      : 'CRITICAL';
  const avgStatus: SlaGateResult['status'] =
    avgMs <= profile.latency.warningAvgMs ? 'PASS' : avgMs <= profile.latency.criticalAvgMs ? 'WARNING' : 'FAIL';

  // 3. P95 Tail Latency
  const p95Tier: MetricTier =
    p95Ms <= profile.latency.targetP95Ms
      ? 'GOOD'
      : p95Ms <= profile.latency.warningP95Ms
      ? 'ACCEPTABLE'
      : p95Ms <= profile.latency.criticalP95Ms
      ? 'WARNING'
      : 'CRITICAL';
  const p95Status: SlaGateResult['status'] =
    p95Ms <= profile.latency.warningP95Ms ? 'PASS' : p95Ms <= profile.latency.criticalP95Ms ? 'WARNING' : 'FAIL';

  // 4. Error Rate Limit
  const errTier: MetricTier =
    errorRate <= profile.errorRate.targetPct
      ? 'GOOD'
      : errorRate <= profile.errorRate.warningPct
      ? 'ACCEPTABLE'
      : errorRate <= profile.errorRate.criticalPct
      ? 'WARNING'
      : 'CRITICAL';
  const errStatus: SlaGateResult['status'] =
    errorRate <= profile.errorRate.warningPct ? 'PASS' : errorRate <= profile.errorRate.criticalPct ? 'WARNING' : 'FAIL';

  // 5. HTTP 5xx Server Error Rate
  const fiveXxTier: MetricTier =
    fiveXxRate <= target5xxPct
      ? 'GOOD'
      : fiveXxRate <= warning5xxPct
      ? 'ACCEPTABLE'
      : fiveXxRate <= critical5xxPct
      ? 'WARNING'
      : 'CRITICAL';
  const fiveXxStatus: SlaGateResult['status'] =
    fiveXxRate <= warning5xxPct ? 'PASS' : fiveXxRate <= critical5xxPct ? 'WARNING' : 'FAIL';

  // 6. Request Timeout Rate
  const timeoutTier: MetricTier =
    timeoutRate <= targetTimeoutPct
      ? 'GOOD'
      : timeoutRate <= warningTimeoutPct
      ? 'ACCEPTABLE'
      : timeoutRate <= criticalTimeoutPct
      ? 'WARNING'
      : 'CRITICAL';
  const timeoutStatus: SlaGateResult['status'] =
    timeoutRate <= warningTimeoutPct ? 'PASS' : timeoutRate <= criticalTimeoutPct ? 'WARNING' : 'FAIL';

  const gates: SlaGateResult[] = [
    {
      name: 'Throughput',
      metric: 'Throughput (RPS)',
      actual: `${Math.round(rps).toLocaleString()} RPS`,
      target: `≥${minRps} RPS`,
      warning: `<${warningRps} RPS`,
      critical: `<${criticalRps} RPS`,
      status: rpsStatus,
      tier: rpsTier,
      isCritical: rpsTier === 'CRITICAL'
    },
    {
      name: 'Avg Response',
      metric: 'Average Latency',
      actual: `${Math.round(avgMs).toLocaleString()} ms`,
      target: `≤${profile.latency.targetAvgMs.toLocaleString()} ms`,
      warning: `>${profile.latency.warningAvgMs.toLocaleString()} ms`,
      critical: `>${profile.latency.criticalAvgMs.toLocaleString()} ms`,
      status: avgStatus,
      tier: avgTier,
      isCritical: avgTier === 'CRITICAL'
    },
    {
      name: 'P95 Latency',
      metric: 'P95 Latency',
      actual: `${Math.round(p95Ms).toLocaleString()} ms`,
      target: `≤${profile.latency.targetP95Ms.toLocaleString()} ms`,
      warning: `>${profile.latency.warningP95Ms.toLocaleString()} ms`,
      critical: `>${profile.latency.criticalP95Ms.toLocaleString()} ms`,
      status: p95Status,
      tier: p95Tier,
      isCritical: p95Tier === 'CRITICAL'
    },
    {
      name: 'Error Rate',
      metric: 'Error %',
      actual: `${errorRate.toFixed(1)}%`,
      target: `≤${profile.errorRate.targetPct}%`,
      warning: `>${profile.errorRate.warningPct}%`,
      critical: `>${profile.errorRate.criticalPct}%`,
      status: errStatus,
      tier: errTier,
      isCritical: errTier === 'CRITICAL'
    },
    {
      name: 'HTTP 5xx',
      metric: 'HTTP 5xx Rate',
      actual: `${fiveXxRate.toFixed(1)}%`,
      target: `≤${target5xxPct}%`,
      warning: `>${warning5xxPct}%`,
      critical: `>${critical5xxPct}%`,
      status: fiveXxStatus,
      tier: fiveXxTier,
      isCritical: fiveXxTier === 'CRITICAL'
    },
    {
      name: 'Timeout',
      metric: 'Timeout Rate',
      actual: `${timeoutRate.toFixed(1)}%`,
      target: `≤${targetTimeoutPct}%`,
      warning: `>${warningTimeoutPct}%`,
      critical: `>${criticalTimeoutPct}%`,
      status: timeoutStatus,
      tier: timeoutTier,
      isCritical: timeoutTier === 'CRITICAL'
    }
  ];

  const passedGates = gates.filter(g => g.status === 'PASS').length;
  const warningGates = gates.filter(g => g.status === 'WARNING').length;
  const failedGates = gates.filter(g => g.status === 'FAIL').length;
  const criticalCount = gates.filter(g => g.isCritical).length;

  let status: SlaEvaluation['status'] = 'PASSED';
  if (failedGates > 0 || criticalCount > 0) {
    status = 'FAILED';
  } else if (warningGates > 0) {
    status = 'AT_RISK';
  }

  const summary =
    status === 'PASSED'
      ? `All ${gates.length} SLA quality gates passed (${passedGates}/${gates.length}).`
      : status === 'AT_RISK'
      ? `${warningGates} SLA gate(s) reached Warning threshold. System operational within tolerance.`
      : `${failedGates} SLA quality gate(s) breached Critical acceptance ceiling.`;

  return {
    status,
    passedGates,
    totalGates: gates.length,
    warningGates,
    failedGates,
    criticalCount,
    gates,
    summary
  };
}

/**
 * Evaluates Production Recommendation separately from raw score.
 */
function evaluateProductionRecommendation(
  isCritical: boolean,
  sla: SlaEvaluation,
  p95Ms: number,
  errorRate: number,
  profile: DynamicTestProfile,
  recommendations: RecommendationItem[]
): ProductionRecommendation {
  const actionItems: string[] = [];
  const blockers: string[] = [];

  if (isCritical || sla.criticalCount > 0) {
    blockers.push('Critical threshold violations detected under tested conditions.');
  }
  if (errorRate > profile.errorRate.warningPct) {
    blockers.push(`Error rate (${errorRate.toFixed(2)}%) exceeds tolerable production thresholds.`);
  }
  if (p95Ms > profile.latency.warningP95Ms) {
    actionItems.push(`P95 tail latency (${p95Ms} ms) requires profiling and indexing optimization.`);
  }
  if (recommendations.some(r => r.severity === 'CRITICAL')) {
    actionItems.push('Address critical endpoint bottlenecks identified in technical evaluation.');
  }

  let status: ProductionStatus;
  let summary: string;
  let readinessVerdict: string;

  if (isCritical || blockers.length > 0 || sla.criticalCount > 0) {
    status = 'BLOCKED / NOT READY';
    summary = 'Not recommended for production deployment due to critical reliability or latency violations.';
    readinessVerdict = 'BLOCKED — Action required before staging or release.';
  } else if (sla.status === 'FAILED' || recommendations.some(r => r.severity === 'WARNING' || r.severity === 'CRITICAL')) {
    status = 'NEEDS REMEDIATION';
    summary = 'Requires engineering remediation to satisfy latency or error targets before release.';
    readinessVerdict = 'NEEDS REMEDIATION — Performance remediation required.';
  } else if (sla.status === 'AT_RISK' || recommendations.some(r => r.severity === 'INFO')) {
    status = 'READY WITH OPTIMIZATION';
    summary = 'Operable in production with ongoing telemetry monitoring and planned optimizations.';
    readinessVerdict = 'READY WITH OPTIMIZATION INSIGHTS — Deploy with standard monitoring.';
  } else {
    status = 'READY FOR PRODUCTION';
    summary = 'Fully production ready. All SLA acceptance criteria met with robust resilience.';
    readinessVerdict = 'READY FOR PRODUCTION — Exceeds all benchmark criteria.';
  }

  return {
    status,
    summary,
    readinessVerdict,
    actionItems: actionItems.length ? actionItems : ['Continue routine performance regression monitoring.'],
    blockers
  };
}

/**
 * Determines overall performance rating based on the user specification:
 * 🟢 EXCELLENT
 * 🟢 HEALTHY
 * 🟡 NEEDS ATTENTION
 * 🟠 DEGRADED
 * 🔴 CRITICAL
 * ❌ FAILED
 *
 * Core rule: Critical is determined by actual threshold violations, NOT by score.
 */
function determineSystemStatus(
  isCritical: boolean,
  healthScore: number,
  errorRate: number,
  p95Ms: number,
  avgMs: number,
  sla: SlaEvaluation,
  profile: DynamicTestProfile,
  endpoints: EndpointResult[]
): { status: PerformanceRating; explanation: string } {
  // 1. Hard Critical violations take precedence
  if (isCritical || sla.criticalCount > 0 || sla.failedGates > 0) {
    return {
      status: 'CRITICAL',
      explanation: 'Marked CRITICAL due to hard critical threshold violations (e.g. error rate, tail latency, or 5xx crash ceiling breached), independent of health score.'
    };
  }

  // 2. Degraded state: multiple warnings or severe health score depression
  const isDegraded =
    sla.warningGates >= 3 ||
    (sla.warningGates >= 2 && healthScore < 60) ||
    healthScore < 50;

  if (isDegraded) {
    return {
      status: 'DEGRADED',
      explanation: 'System experienced significant latency dilation or elevated error rates across multiple metrics under stress.'
    };
  }

  // 3. Needs Attention: warning threshold breached on any metric (> warning limit)
  const hasWarningGate = sla.warningGates > 0 || sla.status === 'AT_RISK';
  const hasEndpointCriticalOrWarning = endpoints.some(
    e => e.rating === 'CRITICAL' || e.rating === 'WARNING' || e.failureRate > profile.errorRate.warningPct
  );

  if (hasWarningGate || hasEndpointCriticalOrWarning || healthScore < 70) {
    return {
      status: 'NEEDS ATTENTION',
      explanation: 'System operated within overall capacity, but warning thresholds were breached and warrant investigation.'
    };
  }

  // 4. Excellent: optimal targets achieved across all dimensions with near-perfect reliability (Health Score >= 95)
  const isExcellent =
    healthScore >= 95 &&
    errorRate <= profile.errorRate.targetPct * 0.5 &&
    p95Ms <= profile.latency.targetP95Ms &&
    avgMs <= profile.latency.targetAvgMs &&
    sla.status === 'PASSED' &&
    sla.warningGates === 0;

  if (isExcellent) {
    return {
      status: 'EXCELLENT',
      explanation: 'Flawless performance execution meeting or exceeding all preferred target metrics.'
    };
  }

  // 5. Healthy: all metrics within Target or Acceptable range (<= Warning threshold), 0 Warnings, 0 Critical
  return {
    status: 'HEALTHY',
    explanation: 'System is healthy with all SLA acceptance criteria satisfied and zero critical or warning breaches.'
  };
}

/**
 * Backward compatibility helper to convert legacy score to PerformanceRating.
 */
export function ratingFromScore(score: number): PerformanceRating {
  if (score >= 95) return 'EXCELLENT';
  if (score >= 80) return 'HEALTHY';
  if (score >= 60) return 'NEEDS ATTENTION';
  if (score >= 40) return 'DEGRADED';
  return 'CRITICAL';
}

/**
 * Evaluates an individual endpoint independently from the system.
 * Endpoint evaluation remains distinct from overall system evaluation.
 */
export function evaluateEndpoint(
  p95Ms: number,
  errorRatePct: number,
  thresholds: ThresholdConfig = DEFAULT_THRESHOLDS,
  testType?: TestType
): PerformanceRating {
  const profile = getTestProfile(testType, thresholds);

  // Critical condition for single endpoint
  if (errorRatePct > profile.errorRate.criticalPct || p95Ms > profile.latency.criticalP95Ms) {
    return 'CRITICAL';
  }

  // Warning condition (breached warning threshold)
  if (errorRatePct > profile.errorRate.warningPct || p95Ms > profile.latency.warningP95Ms) {
    return 'WARNING';
  }

  // Excellent condition (well under target)
  if (errorRatePct === 0 && p95Ms <= profile.latency.targetP95Ms * 0.75) {
    return 'EXCELLENT';
  }

  // Good condition (under target)
  if (errorRatePct <= profile.errorRate.targetPct && p95Ms <= profile.latency.targetP95Ms) {
    return 'GOOD';
  }

  // Acceptable condition (between target and warning) -> Healthy
  return 'HEALTHY';
}

// ============================================================================
// MAIN SYSTEM EVALUATION ENGINE
// ============================================================================

export function evaluateSystem(
  p95Ms: number,
  p99Ms: number,
  avgMs: number,
  errorRatePct: number,
  endpoints: EndpointResult[] = [],
  thresholds: ThresholdConfig = DEFAULT_THRESHOLDS,
  testType?: TestType,
  _engine?: TestEngine,
  timeline?: LiveMetricPoint[],
  systemRps?: number,
  totalRunRequests?: number,
  durationSec?: number
): DynamicSystemEvaluation {
  // 1. Resolve dynamic profile for the specific test type
  const profile = getTestProfile(testType, thresholds);

  // Ensure monotonic percentile sanity (P99 >= P95 >= Avg)
  const saneAvg = Math.max(0, avgMs);
  const saneP95 = Math.max(saneAvg, p95Ms);
  const saneP99 = Math.max(saneP95, p99Ms);

  // 2. Calculate aggregates
  const endpointRequestsSum = endpoints.reduce((n, e) => n + Math.max(0, e.requests || 0), 0);
  const totalRequests = Math.max(endpointRequestsSum, totalRunRequests || 0);
  const totalFailures = endpoints.reduce((n, e) => n + Math.max(0, e.errorCount || 0), 0);
  const status5xx = endpoints.reduce((n, e) => n + Math.max(0, e.status5xx || 0), 0);
  const status4xx = endpoints.reduce((n, e) => n + Math.max(0, e.status4xx || 0), 0);
  const totalTimeouts = endpoints.reduce((n, e) => n + Math.max(0, e.timeouts || 0), 0);

  const observedErrorRate = totalRequests > 0 && totalFailures > 0 ? (totalFailures / totalRequests) * 100 : errorRatePct;
  
  // Calculate aggregate endpoint throughput
  const endpointRpsSum = endpoints.reduce((n, e) => n + Math.max(0, e.rps || 0), 0);

  // Compute steady-state timeline RPS if timeline points exist
  let timelineRps = 0;
  if (timeline && timeline.length > 0) {
    const nonZeroRps = timeline.map(t => t.rps || 0).filter(r => r > 0);
    if (nonZeroRps.length > 0) {
      timelineRps = Math.round(nonZeroRps.reduce((a, b) => a + b, 0) / nonZeroRps.length);
    }
  }

  // Calculate throughput from totalRequests / duration
  const effectiveDuration = Math.max(
    1,
    durationSec || (timeline && timeline.length > 0 ? (timeline[timeline.length - 1]?.elapsedSec || timeline.length) : 0) || 1800
  );
  const calculatedRpsFromRequests = totalRequests > 0 ? Math.round(totalRequests / effectiveDuration) : 0;

  // Resolve true representative benchmark RPS
  const observedRps = Math.max(
    (typeof systemRps === 'number' && systemRps > 10) ? systemRps : (calculatedRpsFromRequests || systemRps || 0),
    endpointRpsSum,
    timelineRps,
    calculatedRpsFromRequests,
    1
  );

  // 3. Score the two assessment dimensions separately.
  // Reliability = 80% of the final assessment. Performance = 20%.
  const avgScore = scoreLatencyMetric(saneAvg, profile.latency.targetAvgMs, profile.latency.warningAvgMs, profile.latency.criticalAvgMs);
  const p95Score = scoreLatencyMetric(saneP95, profile.latency.targetP95Ms, profile.latency.warningP95Ms, profile.latency.criticalP95Ms);
  const p99Score = scoreLatencyMetric(saneP99, profile.latency.targetP99Ms, profile.latency.warningP99Ms, profile.latency.criticalP99Ms);

  const performanceScore = Math.round(
    p95Score * 0.40 +
    p99Score * 0.25 +
    avgScore * 0.20 +
    scoreThroughputMetric(observedRps, profile.throughput.minRpsTarget, profile.throughput.warningRps, profile.throughput.criticalRps) * 0.15
  );

  const successScore = scoreErrorRateMetric(
    observedErrorRate,
    profile.errorRate.targetPct,
    profile.errorRate.warningPct,
    profile.errorRate.criticalPct
  );
  const fiveXxRate = totalRequests > 0 ? (status5xx / totalRequests) * 100 : 0;
  const timeoutRate = totalRequests > 0 ? (totalTimeouts / totalRequests) * 100 : 0;
  const fourXxRate = totalRequests > 0 ? (status4xx / totalRequests) * 100 : 0;

  const fiveXxScore = scoreErrorRateMetric(
    fiveXxRate,
    profile.http5xx?.targetPct ?? 0.5,
    profile.http5xx?.warningPct ?? 2,
    profile.http5xx?.criticalPct ?? 5
  );
  const timeoutScore = scoreErrorRateMetric(
    timeoutRate,
    profile.timeout?.targetPct ?? 0.5,
    profile.timeout?.warningPct ?? 2,
    profile.timeout?.criticalPct ?? 5
  );
  const fourXxScore = scoreErrorRateMetric(fourXxRate, 1, 3, 5);

  // 4. Test-specific behavior analysis
  const behavior = evaluateTestBehavior(
    profile.testType,
    profile,
    saneP95,
    saneAvg,
    observedErrorRate,
    status5xx,
    endpoints,
    timeline
  );

  // 5. Reliability component: 35% success/failure, 20% 5xx, 15% timeouts,
  //    5% 4xx, 5% stability. These weights sum to the full 80% reliability dimension.
  const reliabilityScore = Math.round(
    successScore * 0.35 +
    fiveXxScore * 0.20 +
    timeoutScore * 0.15 +
    fourXxScore * 0.05 +
    behavior.behaviorScore * 0.05
  );

  // 6. Overall score: Reliability 80% + Performance 20%.
  const healthScore = Math.round(reliabilityScore * 0.80 + performanceScore * 0.20);
  const latencyScore = Math.round(p95Score * 0.50 + avgScore * 0.30 + p99Score * 0.20);
  const throughputScore = scoreThroughputMetric(
    observedRps,
    profile.throughput.minRpsTarget,
    profile.throughput.warningRps,
    profile.throughput.criticalRps
  );

  // 7. Evaluate Critical Violations (Critical must NOT depend on score)
  const criticalViolations = evaluateCriticalViolations(
    saneP95,
    saneAvg,
    observedErrorRate,
    status5xx,
    totalRequests,
    profile,
    totalTimeouts,
    observedRps
  );
  const isCritical = criticalViolations.length > 0;

  // 7. Evaluate SLA Gates independently
  const sla = evaluateSlaGates(
    saneP95,
    saneP99,
    saneAvg,
    observedErrorRate,
    observedRps,
    status5xx,
    profile,
    totalRequests,
    totalTimeouts
  );

  // 8. Generate recommendations
  const recommendations: RecommendationItem[] = [];
  endpoints.forEach((ep) => {
    const latencyConcern = ep.p95 > profile.latency.targetP95Ms;
    const errorConcern = ep.failureRate > profile.errorRate.targetPct;
    if (!latencyConcern && !errorConcern) return;

    const errorCritical = ep.failureRate > profile.errorRate.criticalPct;
    const latencyCritical = ep.p95 > profile.latency.criticalP95Ms;
    const severity: 'CRITICAL' | 'WARNING' = (errorCritical || latencyCritical) ? 'CRITICAL' : 'WARNING';

    const investigationPoints: string[] = [];
    if (errorConcern) {
      investigationPoints.push('Review server application logs and 5xx exception traces.');
      investigationPoints.push('Verify database connection-pool exhaustion and connection timeouts.');
      investigationPoints.push('Check reverse proxy / API gateway connection timeout limits.');
    }
    if (latencyConcern) {
      investigationPoints.push('Profile slow queries, missing database indices, or sequential table scans.');
      investigationPoints.push('Inspect downstream service call latency and synchronous dependency chains.');
      investigationPoints.push('Examine CPU throttling, garbage collection pauses, or thread pool saturation.');
    }
    if (ep.method === 'POST' || ep.method === 'PUT' || ep.method === 'PATCH' || ep.method === 'DELETE') {
      investigationPoints.push('Investigate transaction isolation levels, write locks, and payload parsing overhead.');
    }

    const isTrueWarning = ep.failureRate > profile.errorRate.warningPct || ep.p95 > profile.latency.warningP95Ms;
    recommendations.push({
      id: `rec-${ep.id}`,
      endpoint: `${ep.method} ${ep.endpoint}`,
      severity: isTrueWarning ? severity : 'INFO',
      title: `${ep.method} ${ep.endpoint} ${isTrueWarning ? 'warning' : 'optimization observation'}`,
      reason: `${ep.method} ${ep.endpoint} measured P95 of ${ep.p95.toFixed(0)} ms with ${ep.failureRate.toFixed(2)}% errors under ${profile.testType}. ${isTrueWarning ? 'A warning threshold was exceeded and investigation is recommended.' : 'The endpoint remains within its acceptable range, although a preferred target may not have been met.'}`,
      investigationPoints
    });
  });

  if (!recommendations.length) {
    recommendations.push({
      id: 'rec-general',
      endpoint: 'Overall System',
      severity: 'INFO',
      title: 'Target compliance verified',
      reason: 'No endpoint exceeded defined target thresholds during this test.',
      investigationPoints: [
        'Maintain automated performance regression pipelines in CI/CD.',
        'Monitor tail latency trends across sustained release cycles.'
      ]
    });
  }

  // 9. Evaluate Production Readiness independently from score
  const production = evaluateProductionRecommendation(
    isCritical,
    sla,
    p95Ms,
    observedErrorRate,
    profile,
    recommendations
  );

  // 10. Determine overall performance status
  const { status, explanation } = determineSystemStatus(
    isCritical,
    healthScore,
    observedErrorRate,
    p95Ms,
    avgMs,
    sla,
    profile,
    endpoints
  );

  // Endpoint classifications for UI and backward compatibility
  const criticalEndpoints = endpoints.filter(e => e.rating === 'CRITICAL' || e.failureRate > profile.errorRate.criticalPct);
  const warningEndpoints = endpoints.filter(e => e.rating === 'WARNING' || e.rating === 'NEEDS ATTENTION' || e.rating === 'DEGRADED');
  const goodEndpoints = endpoints.filter(e => e.rating === 'HEALTHY' || e.rating === 'GOOD');
  const excellentEndpoints = endpoints.filter(e => e.rating === 'EXCELLENT');
  const veryGoodEndpoints = endpoints.filter(e => e.rating === 'VERY GOOD' || e.rating === 'HEALTHY');

  // Summary & verdict
  const summary = isCritical
    ? `Test marked CRITICAL due to ${criticalViolations.length} threshold violation(s): ${criticalViolations.map(v => v.metric).join(', ')}. Health score is ${healthScore}/100.`
    : `Health score: ${healthScore}/100 (Latency: ${latencyScore}, Reliability: ${reliabilityScore}, Throughput: ${throughputScore}, Behavior: ${behavior.behaviorScore}). ${explanation}`;

  const verdict = production.readinessVerdict;
  const ratingScore = status === 'EXCELLENT' ? 5 : status === 'HEALTHY' ? 4 : status === 'NEEDS ATTENTION' ? 3 : status === 'DEGRADED' ? 2 : 1;

  return {
    status,
    statusExplanation: explanation,
    isCritical,
    criticalViolations,
    healthScore,
    scoreBreakdown: {
      latencyScore,
      reliabilityScore,
      throughputScore,
      behaviorScore: behavior.behaviorScore,
      weights: profile.weights
    },
    sla,
    production,
    behavior,
    // Backward compatibility mappings
    overallRating: status,
    ratingScore,
    reliabilityScore,
    performanceScore,
    overallScore: healthScore,
    summary,
    verdict,
    criticalEndpoints,
    warningEndpoints,
    goodEndpoints,
    excellentEndpoints,
    veryGoodEndpoints,
    recommendations,
    profileUsed: profile
  };
}
