export type TestEngine = 'k6' | 'locust' | 'other';

export type LiveDashboardType = 'locust' | 'grafana' | 'eaii';

export type TestType = 
  | 'Load Test' 
  | 'Stress Test' 
  | 'Spike Test' 
  | 'Endurance Test' 
  | 'Volume Test' 
  | 'Concurrency Test';

export type TestStatus = 
  | 'CREATED' 
  | 'STARTING' 
  | 'RUNNING' 
  | 'COMPLETED' 
  | 'STOPPED' 
  | 'FAILED';

export type PerformanceRating =
  | 'EXCELLENT'
  | 'HEALTHY'
  | 'NEEDS ATTENTION'
  | 'DEGRADED'
  | 'CRITICAL'
  | 'FAILED'
  | 'VERY GOOD'
  | 'GOOD'
  | 'WARNING';

export type MetricTier = 'GOOD' | 'ACCEPTABLE' | 'WARNING' | 'CRITICAL';

export type SlaStatus = 'PASSED' | 'AT_RISK' | 'FAILED';

export type ProductionStatus =
  | 'READY FOR PRODUCTION'
  | 'READY WITH OPTIMIZATION'
  | 'NEEDS REMEDIATION'
  | 'BLOCKED / NOT READY';

export interface LatencyThresholdTier {
  targetAvgMs: number;
  warningAvgMs: number;
  criticalAvgMs: number;
  targetP95Ms: number;
  warningP95Ms: number;
  criticalP95Ms: number;
  targetP99Ms: number;
  warningP99Ms: number;
  criticalP99Ms: number;
}

export interface ErrorRateThresholdTier {
  targetPct: number;
  warningPct: number;
  criticalPct: number;
}

export interface ThroughputThresholdTier {
  minRpsTarget: number;
  warningRps?: number;
  criticalRps?: number;
}

export interface TestProfileWeights {
  latency: number;
  errorRate: number;
  throughput: number;
  behavior: number;
}

export interface DynamicTestProfile {
  testType: TestType;
  question: string;
  focus: string;
  latency: LatencyThresholdTier;
  errorRate: ErrorRateThresholdTier;
  http5xx?: ErrorRateThresholdTier;
  timeout?: ErrorRateThresholdTier;
  throughput: {
    minRpsTarget: number;
    warningRps?: number;
    criticalRps?: number;
  };
  weights: TestProfileWeights;
  behaviorLabel: string;
}

export interface CriticalViolation {
  id: string;
  type:
    | 'ERROR_RATE_EXCEEDED'
    | 'LATENCY_EXCEEDED'
    | 'CRITICAL_SLA_FAILED'
    | 'SYSTEMIC_FAILURE'
    | 'UNRESPONSIVE'
    | 'TEST_ABORTED';
  metric: string;
  actual: string | number;
  threshold: string | number;
  message: string;
  severity: 'CRITICAL';
}

export interface SlaGateResult {
  name: string;
  metric: string;
  actual: string;
  target: string;
  warning: string;
  critical: string;
  status: 'PASS' | 'WARNING' | 'FAIL';
  tier: MetricTier;
  isCritical?: boolean;
}

export interface SlaEvaluation {
  status: SlaStatus;
  passedGates: number;
  totalGates: number;
  warningGates: number;
  failedGates: number;
  criticalCount: number;
  gates: SlaGateResult[];
  summary: string;
}

export interface ProductionRecommendation {
  status: ProductionStatus;
  summary: string;
  readinessVerdict: string;
  actionItems: string[];
  blockers: string[];
}

export interface TestBehaviorAnalysis {
  testType: TestType;
  primaryQuestion: string;
  behaviorAssessment: string;
  behaviorScore: number;
  keyObservations: string[];
  metrics: {
    label: string;
    value: string;
    status: 'GOOD' | 'WARNING' | 'CRITICAL';
    detail: string;
  }[];
}

export interface RecommendationItem {
  id: string;
  endpoint: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  reason: string;
  investigationPoints: string[];
}

export interface DynamicSystemEvaluation {
  status: PerformanceRating;
  statusExplanation: string;
  isCritical: boolean;
  criticalViolations: CriticalViolation[];
  healthScore: number;
  scoreBreakdown: {
    latencyScore: number;
    reliabilityScore: number;
    throughputScore: number;
    behaviorScore: number;
    weights: TestProfileWeights;
  };
  sla: SlaEvaluation;
  production: ProductionRecommendation;
  behavior: TestBehaviorAnalysis;
  // Backward compatibility fields
  overallRating: PerformanceRating;
  ratingScore: number;
  reliabilityScore: number;
  performanceScore: number;
  overallScore: number;
  summary: string;
  verdict: string;
  criticalEndpoints: EndpointResult[];
  warningEndpoints: EndpointResult[];
  goodEndpoints: EndpointResult[];
  excellentEndpoints: EndpointResult[];
  veryGoodEndpoints: EndpointResult[];
  recommendations: RecommendationItem[];
  profileUsed: DynamicTestProfile;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';


export type ServerEnvironmentType = 'staging' | 'production' | 'cloud' | 'development' | 'qa' | 'on-premise';

export interface EnvironmentHardwareConfig {
  os?: string;
  serverEnvironment?: 'staging' | 'production' | 'cloud' | 'development' | 'qa' | 'on-premise' | string;
  advancedEnvironment?: string;
  ram?: string;
  hardDisk?: string;
  cpuCores?: string;
  downloadSpeedMbps?: number | string;
  uploadSpeedMbps?: number | string;
}

export interface TestConfiguration {
  testType: TestType;
  loadModel?: 'VU_BASED' | 'TARGET_RPS';
  targetRps?: number;
  users: number;
  maxVUs?: number;
  spawnRate: number;
  durationSec: number;
  rampUpSec: number;
  thresholds?: ThresholdConfig;
  environmentConfig?: EnvironmentHardwareConfig;
}

export interface EngineConfiguration {
  id: string;
  name: string;
  type: TestEngine;
  enabled: boolean;
  supportsLiveDashboard: boolean;
  liveDashboardType: LiveDashboardType;
  dashboardUrl?: string;
  configuration?: Record<string, unknown>;
}

export interface EndpointConfig {
  id: string;
  name?: string;
  method: HttpMethod;
  path: string;
  description?: string;
  headers?: Record<string, string>;
  body?: string;
  expectedStatus?: number;
  weight?: number; // Traffic distribution weight
  enabled?: boolean; // Safe execution selection (GET checked by default, POST/PUT/DELETE deliberate opt-in)
}

export interface LoadStage {
  duration: string; // e.g. "30s", "5m", "10m"
  durationSec: number;
  targetUsers: number;
}

export interface ThresholdConfig {
  p95ExcellentMs?: number;
  p95GoodMs?: number;
  p95WarningMs: number;
  p95CriticalMs?: number;
  p99WarningMs?: number;
  errorRateExcellentPct?: number;
  errorRateGoodPct?: number;
  errorRateWarningPct: number;
  errorRateCriticalPct?: number;
  minRpsTarget?: number;
  throughputWarningRps?: number;
  throughputCriticalRps?: number;
  http5xxWarningPct?: number;
  http5xxCriticalPct?: number;
  timeoutWarningPct?: number;
  timeoutCriticalPct?: number;
}

export interface EndpointResult {
  id: string;
  runId: string;
  method: HttpMethod;
  endpoint: string;
  requests: number;
  rps: number;
  avg: number;
  p90: number;
  p95: number;
  p99: number;
  max: number;
  failureRate: number;
  status2xx: number;
  status4xx: number;
  status5xx: number;
  timeouts?: number;
  rating: PerformanceRating;
  /** Separate diagnostic dimensions; overall endpoint rating is weighted 80/20. */
  reliabilityRating?: PerformanceRating;
  performanceRating?: PerformanceRating;
  overallScore?: number;
  errorCount: number;
}

export interface ErrorRecord {
  id: string;
  runId: string;
  endpoint: string;
  status: number | string;
  message: string;
  count: number;
  timestamp: string;
}

export interface LiveMetricPoint {
  time: string;
  timestamp: number;
  elapsedSec: number;
  rps: number;
  p95: number;
  p99: number;
  avg: number;
  activeVUs: number;
  errorRate: number;
  requests: number;
  endpointMetrics?: Record<string, {
    rps: number;
    avg: number;
    p95: number;
    p99: number;
    errorRate: number;
    requests: number;
    status: PerformanceRating;
  }>;
}

export interface TestRun {
  id: string;
  /** Project identity; each execution belongs to one project. */
  projectName?: string;
  /** Configured project test plan, in execution order. */
  projectTestPlan?: TestType[];
  sequenceIndex?: number;
  currentPlanIndex?: number;
  name: string;
  engine: TestEngine;
  testType: TestType;
  baseUrl: string;
  users: number;
  maxVUs?: number;
  loadModel?: 'VU_BASED' | 'TARGET_RPS';
  targetRps?: number;
  spawnRate?: number;
  duration: string; // e.g. "30 min"
  durationSec: number;
  rampUp?: string; // e.g. "2 min"
  rampUpSec: number;
  status: TestStatus;
  startedAt: string;
  startTimestamp?: number;
  elapsedSec?: number;
  finishedAt?: string;
  exitCode?: number;
  error?: string;
  endpoints: EndpointConfig[];
  stages?: LoadStage[];
  
  // Results summary
  requests: number;
  rps: number;
  avgResponseMs: number;
  p90Ms: number;
  p95Ms: number;
  p99Ms: number;
  maxMs: number;
  errorRate: number;
  status2xx: number;
  status4xx: number;
  status5xx: number;
  rating: PerformanceRating;
  
  // Detailed results
  endpointResults: EndpointResult[];
  errors: ErrorRecord[];
  timeline: LiveMetricPoint[];
  logs: string[];
  thresholds?: ThresholdConfig;
  environmentConfig?: EnvironmentHardwareConfig;
  dynamicEvaluation?: DynamicSystemEvaluation;
  k6Summary?: {
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
        value: number;
      };
      vus?: { value: number; min: number; max: number };
    };
  };
}

export interface ObservabilitySettings {
  prometheusUrl: string;
  grafanaUrl: string;
  databasePath: string;
  k6Command: string;
  locustCommand: string;
  exportPrometheusMetrics: boolean;
  grafanaRefreshIntervalSec: number;
  thresholds: ThresholdConfig;
}

export interface AppSettings {
  prometheusUrl: string;
  defaultTargetUrl: string;
  slaThresholds: {
    excellentP95Ms: number;
    goodP95Ms: number;
    warningP95Ms: number;
    errorRateLimitPct: number;
  };
}

export interface AppNotification {
  id: string;
  type: 'start' | 'complete' | 'fail' | 'warning' | 'info';
  title: string;
  message: string;
  runId?: string;
  projectName?: string;
  testType?: TestType;
  score?: number;
  rating?: PerformanceRating;
  timestamp: string;
  read?: boolean;
}

export interface SequentialPlanState {
  sessionId?: string;
  projectName: string;
  plan: TestType[];
  currentIndex: number;
  engine?: TestEngine;
  baseUrl?: string;
  endpoints?: EndpointConfig[];
  isSequential: boolean;
  isPaused: boolean;
  pausedReason?: string;
  nextAutoAdvanceSec?: number | null;
  isAutoAdvancing?: boolean;
  isSuiteCompleted?: boolean;
  completedTypes?: TestType[];
  completedRuns?: Record<string, TestRun>;
  wakeLockActive?: boolean;
  stayAwakeEnabled?: boolean;
  isResumedFromSleep?: boolean;
  lastSleepGapSec?: number;
}

export interface HARRequest {
  method: string;
  url: string;
  headers: { name: string; value: string }[];
  postData?: {
    mimeType?: string;
    text?: string;
  };
}

export interface HARArchive {
  log: {
    entries: {
      request: HARRequest;
      response?: {
        status: number;
      };
    }[];
  };
}
