import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  RefreshCw,
  Clock,
  Filter,
  Layers,
  ChevronDown,
  Maximize2,
  Share2,
  Settings,
  ExternalLink,
  Globe
} from 'lucide-react';
import { TestRun, PerformanceRating } from '../types';

interface GrafanaDashboardViewProps {
  runs: TestRun[];
  activeRun: TestRun | null;
  selectedRunId: string | null;
  elapsedSec?: number;
  onSelectRunId: (id: string) => void;
}

export const GrafanaDashboardView: React.FC<GrafanaDashboardViewProps> = ({
  runs,
  activeRun,
  selectedRunId,
  elapsedSec: propsElapsedSec,
  onSelectRunId
}) => {
  const [selectedTestId, setSelectedTestId] = useState<string>(selectedRunId || (runs[0] ? runs[0].id : ''));
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('All');
  const [timeRange, setTimeRange] = useState<string>('Last 30 minutes');
  const [refreshInterval, setRefreshInterval] = useState<string>('5s');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  useEffect(() => {
    if (selectedRunId) {
      setSelectedTestId(selectedRunId);
    }
  }, [selectedRunId]);

  // Find targeted run
  const currentRun = activeRun && (activeRun.id === selectedTestId || !selectedTestId) 
    ? activeRun 
    : runs.find(r => r.id === selectedTestId) || runs[0];

  // Real-time wall-clock synchronized timing
  const [now, setNow] = useState<number>(Date.now());
  const isRunning = currentRun?.status === 'RUNNING' || currentRun?.status === 'STARTING';

  useEffect(() => {
    if (isRunning && propsElapsedSec === undefined) {
      const timer = setInterval(() => {
        setNow(Date.now());
      }, 250);
      return () => clearInterval(timer);
    }
  }, [isRunning, propsElapsedSec]);

  const totalDurationSec = Math.max(1, currentRun?.durationSec || 60);

  const elapsedSec = useMemo(() => {
    if (propsElapsedSec !== undefined) {
      return Math.min(totalDurationSec, propsElapsedSec);
    }
    if (!currentRun) return 0;
    if (currentRun.status === 'COMPLETED' || currentRun.status === 'STOPPED') {
      return Math.min(totalDurationSec, currentRun.elapsedSec ?? totalDurationSec);
    }
    if (currentRun.startTimestamp) {
      const wallDiff = Math.floor((now - currentRun.startTimestamp) / 1000);
      return Math.min(totalDurationSec, Math.max(0, Math.max(wallDiff, currentRun.elapsedSec || 0)));
    }
    return Math.min(totalDurationSec, currentRun.elapsedSec || 0);
  }, [propsElapsedSec, currentRun?.status, currentRun?.startTimestamp, currentRun?.elapsedSec, totalDurationSec, now]);

  const remainingSec = Math.max(0, totalDurationSec - elapsedSec);

  const formatElapsed = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  if (!currentRun) {
    return (
      <div className="bg-[#111217] text-white p-12 text-center rounded-xl border border-[#202226]">
        <Activity className="w-12 h-12 text-orange-500 mx-auto mb-3" />
        <h3 className="text-base font-bold">No Prometheus Telemetry Found</h3>
        <p className="text-xs text-slate-400 mt-1">Please start or select a test run to view Grafana dashboard panels.</p>
      </div>
    );
  }

  // Filter endpoint metrics (strictly omits non-selected endpoints)
  const activeEndpoints = (currentRun.endpoints || []).filter(e => e.enabled !== false);
  const effectiveRunEndpoints = activeEndpoints.length > 0 ? activeEndpoints : currentRun.endpoints;

  const allEndpoints = currentRun.endpointResults.length > 0
    ? currentRun.endpointResults
    : effectiveRunEndpoints.map(e => ({
        id: e.id,
        runId: currentRun.id,
        method: e.method,
        endpoint: e.path,
        requests: currentRun.requests > 0 ? Math.round(currentRun.requests / Math.max(1, effectiveRunEndpoints.length)) : 0,
        rps: Math.round(currentRun.rps / Math.max(1, effectiveRunEndpoints.length)),
        avg: currentRun.avgResponseMs,
        p90: currentRun.p90Ms,
        p95: currentRun.p95Ms,
        p99: currentRun.p99Ms,
        max: currentRun.maxMs,
        failureRate: currentRun.errorRate,
        status2xx: Math.max(0, currentRun.status2xx),
        status4xx: Math.max(0, currentRun.status4xx),
        status5xx: Math.max(0, currentRun.status5xx),
        rating: currentRun.rating,
        errorCount: Math.round(currentRun.requests * (currentRun.errorRate / 100))
      }));

  const filteredEndpoints = selectedEndpoint === 'All'
    ? allEndpoints
    : allEndpoints.filter(e => `${e.method} ${e.endpoint}` === selectedEndpoint || e.endpoint === selectedEndpoint);

  // Exact metrics for selected scope (Overall vs Single Endpoint) directly from test execution / Prometheus
  const scopedMetrics = useMemo(() => {
    let rps = currentRun.rps;
    let avg = currentRun.avgResponseMs;
    let p95 = currentRun.p95Ms;
    let p99 = currentRun.p99Ms;
    let errorRate = currentRun.errorRate;
    const vus = currentRun.users;

    if (selectedEndpoint !== 'All' && filteredEndpoints.length > 0) {
      const ep = filteredEndpoints[0];
      rps = ep.rps;
      avg = ep.avg;
      p95 = ep.p95;
      p99 = ep.p99;
      errorRate = ep.failureRate;
    } else if (selectedEndpoint === 'All') {
      const totalEpRps = filteredEndpoints.reduce((sum, ep) => sum + (ep.rps || 0), 0);
      if (totalEpRps > 0 && (!rps || rps <= 5)) {
        rps = totalEpRps;
      }
    }

    return { rps, avg, p95, p99, errorRate, vus };
  }, [selectedEndpoint, filteredEndpoints, currentRun]);

  const timeline = useMemo(() => {
    if (currentRun.timeline && currentRun.timeline.length > 0) {
      if (selectedEndpoint === 'All') {
        return currentRun.timeline;
      }
      // If single endpoint selected and timeline has per-endpoint metrics
      return currentRun.timeline.map(p => {
        const epData = p.endpointMetrics?.[selectedEndpoint];
        if (epData) {
          return {
            ...p,
            rps: epData.rps,
            p95: epData.p95,
            p99: epData.p99,
            avg: epData.avg,
            errorRate: epData.errorRate
          };
        }
        return p;
      });
    }
    if (currentRun.status === 'STARTING' || currentRun.status === 'RUNNING') {
      return [{
        time: currentRun.startedAt || '00:00:00',
        timestamp: currentRun.startTimestamp || Date.now(),
        elapsedSec: 0,
        rps: currentRun.rps,
        p95: currentRun.p95Ms,
        p99: currentRun.p99Ms,
        avg: currentRun.avgResponseMs,
        activeVUs: currentRun.users,
        errorRate: currentRun.errorRate,
        requests: currentRun.requests
      }];
    }
    return [];
  }, [currentRun.timeline, currentRun.status, currentRun.startedAt, currentRun.startTimestamp, currentRun.rps, currentRun.p95Ms, currentRun.p99Ms, currentRun.avgResponseMs, currentRun.users, currentRun.errorRate, currentRun.requests, selectedEndpoint]);

  const epLabelMatcher = selectedEndpoint === 'All' ? '.*' : selectedEndpoint;
  const isLocust = (currentRun.engine || '').toLowerCase() === 'locust';

  return (
    <div id="grafana-observability-container" className="bg-[#111217] text-slate-200 rounded-xl border border-[#202226] overflow-hidden shadow-2xl animate-in fade-in duration-300 font-sans">
      {/* Grafana Navigation Top Bar */}
      <div className="bg-[#181b1f] border-b border-[#202226] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left Breadcrumb */}
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-white font-bold text-[10px] shadow-xs">
            G
          </div>
          <span className="text-slate-400">Home</span>
          <span className="text-slate-600">/</span>
          <span className="text-slate-400">Dashboards</span>
          <span className="text-slate-600">/</span>
          <span className="font-bold text-white tracking-wide">
            {isLocust ? 'Locust Telemetry Dashboard' : 'EAII Performance Dashboard'}
          </span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
            isLocust
              ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/40'
              : 'bg-indigo-950/70 text-indigo-300 border border-indigo-500/40'
          }`}>
            {isLocust ? 'Locust (Python)' : 'k6 (JavaScript)'}
          </span>
        </div>

        {/* Right Toolbar */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 px-2.5 py-1 bg-[#202226] border border-[#2c3235] rounded text-slate-300">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-transparent border-none text-xs text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="Last 5 minutes">Last 5 minutes</option>
              <option value="Last 15 minutes">Last 15 minutes</option>
              <option value="Last 30 minutes">Last 30 minutes</option>
              <option value="Last 1 hour">Last 1 hour</option>
            </select>
          </div>

          <button
            onClick={handleManualRefresh}
            className="p-1.5 bg-[#202226] hover:bg-[#2c3235] rounded border border-[#2c3235] text-slate-300 cursor-pointer"
            title="Refresh Dashboard"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-orange-400' : ''}`} />
          </button>

          <div className="flex items-center gap-1 px-2 py-1 bg-[#202226] border border-[#2c3235] rounded text-slate-300">
            <span className="text-[11px] text-slate-400">Auto:</span>
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(e.target.value)}
              className="bg-transparent border-none text-xs text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="5s">5s</option>
              <option value="10s">10s</option>
              <option value="30s">30s</option>
              <option value="Off">Off</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grafana Variables Filter Bar ($testid and $endpoint) */}
      <div className="bg-[#14161a] border-b border-[#202226] px-4 py-2 flex flex-wrap items-center gap-3 text-xs">
        {/* Target URL Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/40 border border-emerald-500/30 rounded font-mono text-[11px]">
          <Globe className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-400">Target:</span>
          <span className="text-emerald-400 font-bold max-w-[220px] truncate" title={currentRun.baseUrl || 'https://api.example.com'}>
            {currentRun.baseUrl || 'https://api.example.com'}
          </span>
        </div>

        {/* Test Run Variable ($testid) */}
        <div className="flex items-center gap-2">
          <span className="text-[#8e8e8e] font-semibold">Test Run:</span>
          <select
            value={selectedTestId}
            onChange={(e) => {
              setSelectedTestId(e.target.value);
              onSelectRunId(e.target.value);
            }}
            className="bg-[#202226] border border-[#2c3235] rounded px-2.5 py-1 text-slate-200 focus:outline-none focus:border-orange-500 font-medium cursor-pointer"
          >
            {runs.map(r => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.engine}, {r.users} VUs)
              </option>
            ))}
          </select>
        </div>

        {/* Engine Badge */}
        <span className={`px-2 py-1 rounded font-mono text-[11px] font-extrabold uppercase ${
          isLocust
            ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
            : 'bg-indigo-950/60 text-indigo-300 border border-indigo-500/40'
        }`}>
          Engine: {currentRun.engine.toUpperCase()}
        </span>

        {/* Endpoint Variable ($endpoint) */}
        <div className="flex items-center gap-2">
          <span className="text-[#8e8e8e] font-semibold">Endpoint:</span>
          <select
            value={selectedEndpoint}
            onChange={(e) => setSelectedEndpoint(e.target.value)}
            className="bg-[#202226] border border-[#2c3235] rounded px-2.5 py-1 text-slate-200 focus:outline-none focus:border-orange-500 font-mono text-[11px] cursor-pointer"
          >
            <option value="All">All Endpoints ({allEndpoints.length} APIs)</option>
            {allEndpoints.map(ep => (
              <option key={ep.id} value={`${ep.method} ${ep.endpoint}`}>
                {ep.method} {ep.endpoint}
              </option>
            ))}
          </select>
        </div>

        {/* Number of APIs Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#202226] border border-indigo-500/30 rounded font-mono text-[11px]">
          <span className="text-indigo-400 font-bold">{allEndpoints.length}</span>
          <span className="text-slate-400">APIs in Benchmark</span>
        </div>

        {/* Execution Time Display */}
        <div className="flex items-center gap-2 px-2.5 py-1 bg-[#202226] border border-[#2c3235] rounded font-mono text-[11px]">
          <Clock className="w-3.5 h-3.5 text-orange-400" />
          <span className="text-slate-400">Time:</span>
          <span className="text-orange-400 font-bold">{formatElapsed(elapsedSec)}</span>
          <span className="text-slate-600">/</span>
          <span className="text-slate-300">{formatElapsed(totalDurationSec)}</span>
          {currentRun.status === 'RUNNING' && (
            <span className="text-slate-400 text-[10px]">({formatElapsed(remainingSec)} left)</span>
          )}
        </div>

        <div className="ml-auto text-[11px] text-slate-500 font-mono">
          DS: Prometheus ({isLocust ? 'locust_exporter:9646' : 'k6_remote_write:9090'})
        </div>
      </div>

      {/* Main Grafana Dashboard Content Area */}
      <div className="p-4 space-y-4">
        {/* Row 1: Stat Panels (7 Panels including Total Requests and Target APIs) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {/* Target APIs Count Panel */}
          <div className="bg-[#181b1f] border border-[#202226] rounded-lg p-3.5 relative overflow-hidden flex flex-col justify-between">
            <div className="text-[11px] text-[#8e8e8e] font-bold tracking-wide">Target APIs</div>
            <div className="my-2 flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-[#a855f7] font-mono tracking-tight">
                {allEndpoints.length}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {selectedEndpoint === 'All' ? 'APIs active' : 'selected'}
              </span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono truncate" title={isLocust ? 'count by(name) (locust_requests_total)' : 'count by(endpoint) (k6_http_reqs_total)'}>
              {isLocust ? 'count by(name) (locust_requests_total)' : 'count by(endpoint) (k6_http_reqs_total)'}
            </div>
          </div>

          {/* Total Requests Panel */}
          <div className="bg-[#181b1f] border border-[#202226] rounded-lg p-3.5 relative overflow-hidden flex flex-col justify-between">
            <div className="text-[11px] text-[#8e8e8e] font-bold tracking-wide">
              {selectedEndpoint === 'All' ? 'Total Requests' : 'Endpoint Requests'}
            </div>
            <div className="my-2 flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-[#38bdf8] font-mono tracking-tight">
                {(selectedEndpoint === 'All' 
                  ? (currentRun.requests || 0)
                  : (filteredEndpoints[0]?.requests || 0)
                ).toLocaleString()}
              </span>
              <span className="text-xs text-slate-400 font-mono">reqs</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono truncate" title={isLocust ? `sum(locust_requests_total{testid="${currentRun.id}"})` : `sum(k6_http_reqs_total{testid="${currentRun.id}"})`}>
              {isLocust
                ? `sum(locust_requests_total{testid="${currentRun.id.slice(0, 8)}..."})`
                : `sum(k6_http_reqs_total{testid="${currentRun.id.slice(0, 8)}..."})`
              }
            </div>
          </div>

          {/* RPS */}
          <div className="bg-[#181b1f] border border-[#202226] rounded-lg p-3.5 relative overflow-hidden flex flex-col justify-between">
            <div className="text-[11px] text-[#8e8e8e] font-bold tracking-wide">
              {selectedEndpoint === 'All' ? 'Overall Live RPS' : 'Endpoint Live RPS'}
            </div>
            <div className="my-2">
              <span className="text-3xl font-black text-[#52c41a] font-mono tracking-tight">
                {scopedMetrics.rps}
              </span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono truncate" title={isLocust ? `rate(locust_requests_total{testid="${currentRun.id}"}[10s])` : `sum(rate(k6_http_reqs_total{testid="${currentRun.id}", endpoint=~"${epLabelMatcher}"}[10s]))`}>
              {isLocust
                ? `rate(locust_requests_total{testid="${currentRun.id.slice(0, 10)}..."})`
                : `rate(k6_http_reqs_total{testid="${currentRun.id.slice(0, 10)}..."})`
              }
            </div>
          </div>

          {/* P95 */}
          <div className="bg-[#181b1f] border border-[#202226] rounded-lg p-3.5 relative overflow-hidden flex flex-col justify-between">
            <div className="text-[11px] text-[#8e8e8e] font-bold tracking-wide">
              {selectedEndpoint === 'All' ? 'Overall P95 Latency' : 'Endpoint P95 Latency'}
            </div>
            <div className="my-2">
              <span className="text-3xl font-black text-[#faad14] font-mono tracking-tight">
                {scopedMetrics.p95} <span className="text-sm font-normal text-slate-400">ms</span>
              </span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono truncate" title={isLocust ? `histogram_quantile(0.95, sum by (le) (rate(locust_response_time_ms_bucket{testid="${currentRun.id}"}[10s])))` : `histogram_quantile(0.95, sum by (le) (rate(k6_http_req_duration_seconds_bucket{testid="${currentRun.id}", endpoint=~"${epLabelMatcher}"}[10s]))) * 1000`}>
              {isLocust
                ? `histogram_quantile(0.95, sum by (le) rate(locust_resp_bucket{testid="${currentRun.id.slice(0, 8)}..."}))`
                : `histogram_quantile(0.95, sum by (le) rate(..._bucket{testid="${currentRun.id.slice(0, 8)}..."}))`
              }
            </div>
          </div>

          {/* P99 */}
          <div className="bg-[#181b1f] border border-[#202226] rounded-lg p-3.5 relative overflow-hidden flex flex-col justify-between">
            <div className="text-[11px] text-[#8e8e8e] font-bold tracking-wide">
              {selectedEndpoint === 'All' ? 'Overall P99 Latency' : 'Endpoint P99 Latency'}
            </div>
            <div className="my-2">
              <span className="text-3xl font-black text-[#ff7875] font-mono tracking-tight">
                {scopedMetrics.p99} <span className="text-sm font-normal text-slate-400">ms</span>
              </span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono truncate" title={isLocust ? `histogram_quantile(0.99, sum by (le) (rate(locust_response_time_ms_bucket{testid="${currentRun.id}"}[10s])))` : `histogram_quantile(0.99, sum by (le) (rate(k6_http_req_duration_seconds_bucket{testid="${currentRun.id}", endpoint=~"${epLabelMatcher}"}[10s]))) * 1000`}>
              {isLocust
                ? `histogram_quantile(0.99, sum by (le) rate(locust_resp_bucket{testid="${currentRun.id.slice(0, 8)}..."}))`
                : `histogram_quantile(0.99, sum by (le) rate(..._bucket{testid="${currentRun.id.slice(0, 8)}..."}))`
              }
            </div>
          </div>

          {/* Error Rate */}
          <div className="bg-[#181b1f] border border-[#202226] rounded-lg p-3.5 relative overflow-hidden flex flex-col justify-between">
            <div className="text-[11px] text-[#8e8e8e] font-bold tracking-wide">
              {selectedEndpoint === 'All' ? 'Overall Error Rate' : 'Endpoint Error Rate'}
            </div>
            <div className="my-2">
              <span className="text-3xl font-black text-[#52c41a] font-mono tracking-tight">
                {scopedMetrics.errorRate.toFixed(2)}%
              </span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono truncate" title={isLocust ? `(sum(rate(locust_requests_fails_total{testid="${currentRun.id}"}[10s])) / sum(rate(locust_requests_total{testid="${currentRun.id}"}[10s]))) * 100` : `(sum(rate(k6_http_req_failed_total{testid="${currentRun.id}"}[10s])) / sum(rate(k6_http_reqs_total{testid="${currentRun.id}"}[10s]))) * 100`}>
              {isLocust
                ? `locust_fails / locust_total * 100 {testid="${currentRun.id.slice(0, 8)}..."}`
                : `failed_total / reqs_total * 100 {testid="${currentRun.id.slice(0, 8)}..."}`
              }
            </div>
          </div>

          {/* Virtual Users */}
          <div className="bg-[#181b1f] border border-[#202226] rounded-lg p-3.5 relative overflow-hidden flex flex-col justify-between">
            <div className="text-[11px] text-[#8e8e8e] font-bold tracking-wide">
              {isLocust ? 'Locust Users' : 'Live / Target VUs'}
            </div>
            <div className="my-2 flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-[#1890ff] font-mono tracking-tight">
                {timeline.length > 0 ? timeline[timeline.length - 1].activeVUs : currentRun.users}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                / {currentRun.users} max
              </span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              {isLocust
                ? `locust_users{testid="${currentRun.id.slice(0, 8)}..."}`
                : `k6_vus{testid="${currentRun.id.slice(0, 8)}..."}`
              }
            </div>
          </div>
        </div>

        {/* Row 2: Concurrency, Throughput, and Latency Timeseries */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Virtual Users Over Time (Ramp-up -> Steady -> Ramp-down) */}
          <div className="bg-[#181b1f] border border-[#202226] rounded-lg p-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#202226]">
              <span className="text-xs font-bold text-slate-300">
                {isLocust ? 'Locust Users (Ramp / Steady / Ramp-Down)' : 'Virtual Users (Ramp / Steady / Ramp-Down)'}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {isLocust ? 'locust_users' : 'k6_vus'}
              </span>
            </div>
            <div className="h-44 w-full pt-3">
              <svg className="w-full h-full" viewBox="0 0 500 140" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="grafana-blue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1890ff" stopOpacity="0.30" />
                    <stop offset="100%" stopColor="#1890ff" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <line x1="0" y1="35" x2="500" y2="35" stroke="#22262b" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="0" y1="70" x2="500" y2="70" stroke="#22262b" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="0" y1="105" x2="500" y2="105" stroke="#22262b" strokeWidth="1" strokeDasharray="3 3" />
                
                {timeline.length > 1 && (
                  <>
                    <path
                      d={`${timeline.map((p, i) => {
                        const x = (i / (timeline.length - 1)) * 500;
                        const maxVUs = Math.max(...timeline.map(t => t.activeVUs || t.requests), currentRun.users, 10);
                        const y = 130 - ((p.activeVUs ?? currentRun.users) / maxVUs) * 110;
                        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                      }).join(' ')} L 500 135 L 0 135 Z`}
                      fill="url(#grafana-blue)"
                    />
                    <path
                      d={timeline.map((p, i) => {
                        const x = (i / (timeline.length - 1)) * 500;
                        const maxVUs = Math.max(...timeline.map(t => t.activeVUs || t.requests), currentRun.users, 10);
                        const y = 130 - ((p.activeVUs ?? currentRun.users) / maxVUs) * 110;
                        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                      }).join(' ')}
                      fill="none"
                      stroke="#1890ff"
                      strokeWidth="2"
                    />
                  </>
                )}
              </svg>
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1 px-1">
              <span>{timeline[0]?.time || '00:00'}</span>
              <span>{timeline[Math.floor(timeline.length / 2)]?.time || '00:15'}</span>
              <span>{timeline[timeline.length - 1]?.time || '00:30'}</span>
            </div>
          </div>

          {/* RPS Over Time */}
          <div className="bg-[#181b1f] border border-[#202226] rounded-lg p-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#202226]">
              <span className="text-xs font-bold text-slate-300">
                {selectedEndpoint === 'All' ? 'Throughput (RPS Over Time)' : `Throughput (${selectedEndpoint})`}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">sum(rate(...))</span>
            </div>
            <div className="h-44 w-full pt-3">
              <svg className="w-full h-full" viewBox="0 0 500 140" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="grafana-green" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#52c41a" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#52c41a" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <line x1="0" y1="35" x2="500" y2="35" stroke="#22262b" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="0" y1="70" x2="500" y2="70" stroke="#22262b" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="0" y1="105" x2="500" y2="105" stroke="#22262b" strokeWidth="1" strokeDasharray="3 3" />
                
                {timeline.length > 1 && (
                  <>
                    <path
                      d={`${timeline.map((p, i) => {
                        const x = (i / (timeline.length - 1)) * 500;
                        const maxRps = Math.max(...timeline.map(t => t.rps), 10);
                        const y = 130 - (p.rps / maxRps) * 110;
                        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                      }).join(' ')} L 500 135 L 0 135 Z`}
                      fill="url(#grafana-green)"
                    />
                    <path
                      d={timeline.map((p, i) => {
                        const x = (i / (timeline.length - 1)) * 500;
                        const maxRps = Math.max(...timeline.map(t => t.rps), 10);
                        const y = 130 - (p.rps / maxRps) * 110;
                        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                      }).join(' ')}
                      fill="none"
                      stroke="#52c41a"
                      strokeWidth="2"
                    />
                  </>
                )}
              </svg>
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1 px-1">
              <span>{timeline[0]?.time || '00:00'}</span>
              <span>{timeline[Math.floor(timeline.length / 2)]?.time || '00:15'}</span>
              <span>{timeline[timeline.length - 1]?.time || '00:30'}</span>
            </div>
          </div>

          {/* P95 Over Time */}
          <div className="bg-[#181b1f] border border-[#202226] rounded-lg p-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#202226]">
              <span className="text-xs font-bold text-slate-300">
                {selectedEndpoint === 'All' ? 'P95 Response Time Over Time' : `P95 Response Time (${selectedEndpoint})`}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">histogram_quantile(0.95, ...)</span>
            </div>
            <div className="h-44 w-full pt-3">
              <svg className="w-full h-full" viewBox="0 0 500 140" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="grafana-gold" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#faad14" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#faad14" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <line x1="0" y1="35" x2="500" y2="35" stroke="#22262b" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="0" y1="70" x2="500" y2="70" stroke="#22262b" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="0" y1="105" x2="500" y2="105" stroke="#22262b" strokeWidth="1" strokeDasharray="3 3" />
                
                {timeline.length > 1 && (
                  <>
                    <path
                      d={`${timeline.map((p, i) => {
                        const x = (i / (timeline.length - 1)) * 500;
                        const maxP95 = Math.max(...timeline.map(t => t.p95), 100);
                        const y = 130 - (p.p95 / maxP95) * 110;
                        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                      }).join(' ')} L 500 135 L 0 135 Z`}
                      fill="url(#grafana-gold)"
                    />
                    <path
                      d={timeline.map((p, i) => {
                        const x = (i / (timeline.length - 1)) * 500;
                        const maxP95 = Math.max(...timeline.map(t => t.p95), 100);
                        const y = 130 - (p.p95 / maxP95) * 110;
                        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                      }).join(' ')}
                      fill="none"
                      stroke="#faad14"
                      strokeWidth="2"
                    />
                  </>
                )}
              </svg>
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1 px-1">
              <span>{timeline[0]?.time || '00:00'}</span>
              <span>{timeline[Math.floor(timeline.length / 2)]?.time || '00:15'}</span>
              <span>{timeline[timeline.length - 1]?.time || '00:30'}</span>
            </div>
          </div>
        </div>

        {/* Row 3: Top Endpoints Table */}
        <div className="bg-[#181b1f] border border-[#202226] rounded-lg p-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#202226]">
            <span className="text-xs font-bold text-slate-300">
              Endpoint Real-Time Performance Breakdown ({filteredEndpoints.length} of {allEndpoints.length} APIs)
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              {selectedEndpoint === 'All' ? 'All Target APIs' : `Filtered: ${selectedEndpoint}`}
            </span>
          </div>

          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[#8e8e8e] font-semibold border-b border-[#202226] text-[11px]">
                <tr>
                  <th className="py-2">Endpoint</th>
                  <th className="py-2">Method</th>
                  <th className="py-2 text-right">RPS</th>
                  <th className="py-2 text-right">Avg (ms)</th>
                  <th className="py-2 text-right">P95 (ms)</th>
                  <th className="py-2 text-right">P99 (ms)</th>
                  <th className="py-2 text-right">Error Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#202226] font-mono text-[11px]">
                {filteredEndpoints.map((ep) => (
                  <tr key={ep.id} className="hover:bg-[#202226]/50">
                    <td className="py-2.5 font-bold text-slate-200">{ep.endpoint}</td>
                    <td className="py-2.5 text-slate-400">{ep.method}</td>
                    <td className="py-2.5 text-right font-bold text-[#52c41a]">{ep.rps}</td>
                    <td className="py-2.5 text-right text-slate-300">{ep.avg}</td>
                    <td className="py-2.5 text-right font-bold text-[#faad14]">{ep.p95}</td>
                    <td className="py-2.5 text-right text-slate-300">{ep.p99 > 1000 ? `${(ep.p99 / 1000).toFixed(1)} s` : `${ep.p99} ms`}</td>
                    <td className="py-2.5 text-right text-slate-300">{ep.failureRate.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
