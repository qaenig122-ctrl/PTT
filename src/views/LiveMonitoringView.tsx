import React, { useState, useMemo, useEffect } from 'react';
import {
  Radio,
  Square,
  Users,
  Activity,
  Zap,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  MonitorPlay,
  Layers,
  LayoutGrid,
  Globe
} from 'lucide-react';
import { TestRun, PerformanceRating, LiveMetricPoint } from '../types';
import { dbService } from '../lib/db';
import { testRunnerService } from '../lib/testRunner';
import { NavTab } from '../components/Sidebar';
import { LocustDashboardView } from './LocustDashboardView';
import { GrafanaDashboardView } from './GrafanaDashboardView';
import { SequentialPipelineStepper } from '../components/SequentialPipelineStepper';

interface LiveMonitoringViewProps {
  activeRun: TestRun | null;
  onStopTest: () => void;
  onSelectTab: (tab: NavTab) => void;
  onSelectRun: (runId: string, tab?: NavTab) => void;
}

export const LiveMonitoringView: React.FC<LiveMonitoringViewProps> = ({
  activeRun,
  onStopTest,
  onSelectTab,
  onSelectRun
}) => {
  const initialEngine = (activeRun?.engine || dbService.getRuns()[0]?.engine || 'k6').toLowerCase();
  const [viewMode, setViewMode] = useState<'k6' | 'locust' | 'metrics'>(initialEngine === 'locust' ? 'locust' : 'k6');
  const [planState, setPlanState] = useState(testRunnerService.getSequentialPlanState());
  const lastActiveRunIdRef = React.useRef<string | null>(activeRun?.id || null);

  // Auto-switch viewMode only when a brand-new distinct test run starts
  useEffect(() => {
    if (activeRun?.id && activeRun.id !== lastActiveRunIdRef.current) {
      lastActiveRunIdRef.current = activeRun.id;
      setViewMode(activeRun.engine.toLowerCase() === 'locust' ? 'locust' : 'k6');
    }
  }, [activeRun?.id, activeRun?.engine]);

  // Real-time wall-clock synchronized timing
  const [now, setNow] = useState<number>(Date.now());
  const isRunning = activeRun?.status === 'RUNNING' || activeRun?.status === 'STARTING';

  useEffect(() => {
    const unsub = testRunnerService.subscribe(() => {
      setPlanState({ ...testRunnerService.getSequentialPlanState() });
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (isRunning) {
      // 250ms tick ensures smooth, immediate seconds counting with 0 drift
      const timer = setInterval(() => {
        setNow(Date.now());
      }, 250);
      return () => clearInterval(timer);
    }
  }, [isRunning]);

  const totalDurationSec = Math.max(1, activeRun?.durationSec || 60);

  const elapsedSec = useMemo(() => {
    if (!activeRun) return 0;
    if (activeRun.status === 'COMPLETED' || activeRun.status === 'STOPPED') {
      return Math.min(totalDurationSec, activeRun.elapsedSec ?? totalDurationSec);
    }
    if (activeRun.startTimestamp) {
      const wallDiff = Math.floor((now - activeRun.startTimestamp) / 1000);
      return Math.min(totalDurationSec, Math.max(0, Math.max(wallDiff, activeRun.elapsedSec || 0)));
    }
    return Math.min(totalDurationSec, activeRun.elapsedSec || 0);
  }, [activeRun?.status, activeRun?.startTimestamp, activeRun?.elapsedSec, totalDurationSec, now]);

  const remainingSec = Math.max(0, totalDurationSec - elapsedSec);
  const progressPercent = Math.min(100, Math.max(0, (elapsedSec / totalDurationSec) * 100));

  const formatElapsed = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getRatingBadge = (rating: PerformanceRating) => {
    switch (rating) {
      case 'EXCELLENT':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">EXCELLENT</span>;
      case 'VERY GOOD':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300 dark:border-blue-800">VERY GOOD</span>;
      case 'GOOD':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-300 dark:border-sky-800">GOOD</span>;
      case 'WARNING':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">WARNING</span>;
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800">CRITICAL</span>;
    }
  };

  if (!activeRun) {
    const recentRuns = dbService.getRuns();
    const lastRun = recentRuns[0] || null;

    if (lastRun) {
      const historicalDuration = lastRun.durationSec || (lastRun.timeline?.length ? lastRun.timeline[lastRun.timeline.length - 1].elapsedSec : 120) || 120;
      return (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  Completed Benchmark Record
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Duration: {formatElapsed(historicalDuration)}
                </span>
                {getRatingBadge(lastRun.rating)}
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                {lastRun.name} ({lastRun.engine.toUpperCase()} Telemetry)
              </h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-mono text-xs font-bold">
                  <Globe className="w-3.5 h-3.5 text-emerald-500" />
                  Target URL: {lastRun.baseUrl || 'https://api.example.com'}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  • Completed at {lastRun.finishedAt || lastRun.startedAt || 'earlier session'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* 3-way toggle for historical inspection */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-xs">
                <button
                  id="tab-history-k6"
                  onClick={() => setViewMode('k6')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    viewMode === 'k6'
                      ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-500/30'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <MonitorPlay className="w-3.5 h-3.5" />
                  <span>Grafana (k6)</span>
                </button>

                <button
                  id="tab-history-locust"
                  onClick={() => setViewMode('locust')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    viewMode === 'locust'
                      ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/30'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Locust UI</span>
                </button>

                <button
                  id="tab-history-metrics"
                  onClick={() => setViewMode('metrics')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    viewMode === 'metrics'
                      ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Unified Metrics</span>
                </button>
              </div>

              <button
                onClick={() => onSelectTab('tests')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer flex items-center gap-1.5 transition-colors"
              >
                <Zap className="w-3.5 h-3.5 fill-white" />
                <span>Start New Test</span>
              </button>
            </div>
          </div>

          <SequentialPipelineStepper
            planState={planState}
            activeRun={lastRun}
            onSelectRun={onSelectRun}
            onSelectTab={onSelectTab}
          />

          {viewMode === 'locust' ? (
            <LocustDashboardView run={lastRun} activeRun={null} elapsedSec={historicalDuration} />
          ) : viewMode === 'k6' ? (
            <GrafanaDashboardView
              runs={recentRuns}
              activeRun={null}
              selectedRunId={lastRun.id}
              elapsedSec={historicalDuration}
              onSelectRunId={(id) => onSelectRun(id, 'live')}
            />
          ) : (
            <div className="space-y-6">
              {/* 7 Metric Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs">
                  <div className="text-[11px] text-slate-400 font-medium">Virtual Users</div>
                  <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{lastRun.users}</div>
                  <div className="mt-1 text-[10px] text-slate-500">Peak concurrency</div>
                </div>
                <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs">
                  <div className="text-[11px] text-slate-400 font-medium">Target APIs</div>
                  <div className="mt-1 text-2xl font-black text-purple-600 dark:text-purple-400">{lastRun.endpoints?.length || 4}</div>
                  <div className="mt-1 text-[10px] text-purple-500">Active endpoints</div>
                </div>
                <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs">
                  <div className="text-[11px] text-slate-400 font-medium">Requests</div>
                  <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{lastRun.requests.toLocaleString()}</div>
                  <div className="mt-1 text-[10px] text-slate-500">Completed reqs</div>
                </div>
                <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs">
                  <div className="text-[11px] text-slate-400 font-medium">RPS</div>
                  <div className="mt-1 text-2xl font-black text-indigo-600 dark:text-indigo-400">{lastRun.rps}</div>
                  <div className="mt-1 text-[10px] text-indigo-500">Average throughput</div>
                </div>
                <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs">
                  <div className="text-[11px] text-slate-400 font-medium">Avg Latency</div>
                  <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{lastRun.avgResponseMs} ms</div>
                  <div className="mt-1 text-[10px] text-emerald-500">Mean response</div>
                </div>
                <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs">
                  <div className="text-[11px] text-slate-400 font-medium">P95</div>
                  <div className="mt-1 text-2xl font-black text-amber-500">{lastRun.p95Ms} ms</div>
                  <div className="mt-1 text-[10px] text-amber-500">95th percentile</div>
                </div>
                <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs">
                  <div className="text-[11px] text-slate-400 font-medium">Error Rate</div>
                  <div className="mt-1 text-2xl font-black text-rose-500">{lastRun.errorRate}%</div>
                  <div className="mt-1 text-[10px] text-rose-500">HTTP failures</div>
                </div>
              </div>

              {/* Endpoints breakdown */}
              <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-3">Endpoint Final Breakdown</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="text-slate-400 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="pb-2">Endpoint</th>
                        <th className="pb-2">Method</th>
                        <th className="pb-2 text-right">Requests</th>
                        <th className="pb-2 text-right">RPS</th>
                        <th className="pb-2 text-right">Avg (ms)</th>
                        <th className="pb-2 text-right">P95 (ms)</th>
                        <th className="pb-2 text-right">Errors</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {lastRun.endpointResults?.map((ep) => (
                        <tr key={ep.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="py-2 text-slate-900 dark:text-white font-semibold">{ep.endpoint}</td>
                          <td className="py-2"><span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px]">{ep.method}</span></td>
                          <td className="py-2 text-right text-slate-700 dark:text-slate-300">{ep.requests.toLocaleString()}</td>
                          <td className="py-2 text-right font-bold text-indigo-500">{ep.rps}</td>
                          <td className="py-2 text-right text-slate-700 dark:text-slate-300">{ep.avg}ms</td>
                          <td className="py-2 text-right font-bold text-amber-500">{ep.p95}ms</td>
                          <td className="py-2 text-right text-rose-500">{ep.failureRate.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div id="live-monitoring-empty" className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center shadow-xs">
        <Radio className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-900 dark:text-white">No Test Currently Running</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
          Start a new benchmark in the Test Builder to stream live Locust or Grafana telemetry in real-time.
        </p>
        <button
          onClick={() => onSelectTab('tests')}
          className="mt-5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer"
        >
          Create New Test
        </button>
      </div>
    );
  }

  const isLocust = activeRun.engine.toLowerCase() === 'locust';
  const isK6 = activeRun.engine.toLowerCase() === 'k6';

  const activeEndpointsCount = activeRun.endpointResults?.length ||
    activeRun.endpoints?.filter(e => e.enabled !== false).length ||
    activeRun.endpoints?.length ||
    1;

  // If viewMode is 'engine', render the engine's dedicated dashboard directly
  return (
    <div id="live-monitoring-view" className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner with Engine Switcher */}
      <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500 text-white animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
              LIVE
            </span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {activeRun.status === 'RUNNING' ? 'Test Running' : activeRun.status}
            </h2>
          </div>
          <div className="mt-1.5 flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
              Project: <b className="text-slate-900 dark:text-white font-extrabold">{activeRun.projectName || 'Performance Project'}</b>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-mono text-xs font-bold shadow-2xs">
              <Globe className="w-3.5 h-3.5 text-emerald-500" />
              Target: {activeRun.baseUrl}
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5 flex-wrap">
              <span>•</span>
              <span className="font-bold text-slate-900 dark:text-white">{activeRun.name}</span>
              <span>•</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400 uppercase">{activeRun.engine}</span>
              <span>•</span>
              <span>{activeRun.users} VUs</span>
              <span>•</span>
              <span className="font-bold text-purple-600 dark:text-purple-400">{activeEndpointsCount} Target APIs</span>
              <span>•</span>
              <span className="font-bold text-sky-600 dark:text-sky-400">{(activeRun.requests || 0).toLocaleString()} Total Reqs</span>
              <span>•</span>
              <span>{activeRun.duration}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          {/* View Mode Toggle: Grafana (k6), Locust, Unified Metrics */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-xs">
            <button
              id="tab-view-k6"
              onClick={() => setViewMode('k6')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'k6'
                  ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <MonitorPlay className="w-3.5 h-3.5" />
              <span>Grafana (k6)</span>
            </button>

            <button
              id="tab-view-locust"
              onClick={() => setViewMode('locust')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'locust'
                  ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Locust UI</span>
            </button>

            <button
              id="tab-view-metrics"
              onClick={() => setViewMode('metrics')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'metrics'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Unified Metrics</span>
            </button>
          </div>

          <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800">
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">Elapsed</span>
              <span className="text-base sm:text-lg font-mono font-black text-slate-900 dark:text-white">
                {formatElapsed(elapsedSec)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">Total Time</span>
              <span className="text-base sm:text-lg font-mono font-black text-indigo-600 dark:text-indigo-400">
                {formatElapsed(totalDurationSec)}
              </span>
            </div>
            <div className="text-right hidden md:block">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">Remaining</span>
              <span className="text-xs sm:text-sm font-mono font-bold text-slate-600 dark:text-slate-300">
                {formatElapsed(remainingSec)}
              </span>
            </div>
          </div>

          {activeRun.status === 'RUNNING' && (
            <button
              id="btn-stop-test"
              onClick={onStopTest}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-sm shadow-rose-600/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Square className="w-3.5 h-3.5 fill-white" />
              <span>Stop Test</span>
            </button>
          )}

          {activeRun.status === 'STOPPED' && (
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300 dark:border-amber-700 text-xs font-black flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>TEST STOPPED</span>
              </span>
              <button
                onClick={() => onSelectRun(activeRun.id, 'results')}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>View Results &amp; Report →</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Automated Sequential Test Pipeline Stepper */}
      <SequentialPipelineStepper
        planState={planState}
        activeRun={activeRun}
        onSelectRun={onSelectRun}
        onSelectTab={onSelectTab}
      />

      {/* Execution Timeline & Progress Bar */}
      <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl px-5 py-4 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200 flex-wrap">
            <Clock className="w-4 h-4 text-indigo-500 shrink-0" />
            <span className="font-bold">Test Execution Timeline:</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">
              Elapsed {formatElapsed(elapsedSec)}
            </span>
            <span className="text-slate-400">/</span>
            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
              Total {formatElapsed(totalDurationSec)}
            </span>
            <span className="text-slate-400">•</span>
            <span className="font-mono text-slate-500 dark:text-slate-400">
              {formatElapsed(remainingSec)} remaining
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
              {progressPercent.toFixed(1)}%
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {activeRun.status}
            </span>
          </div>
        </div>

        {/* Master Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-500 h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Phase Breakdown Visualizer (Ramp-Up, Steady State, Ramp-Down) & Live VU Tracker */}
        {(() => {
          const targetVUs = activeRun.users || 100;
          const rampUpSec = Math.max(5, activeRun.rampUpSec || Math.min(30, Math.max(5, Math.floor(totalDurationSec * 0.15))));
          const rampDownSec = Math.max(5, Math.min(30, Math.max(5, Math.floor(totalDurationSec * 0.15))));
          const steadySec = Math.max(1, totalDurationSec - rampUpSec - rampDownSec);

          const rampUpProgress = Math.min(100, Math.max(0, (elapsedSec / Math.max(1, rampUpSec)) * 100));
          const steadyElapsed = Math.max(0, elapsedSec - rampUpSec);
          const steadyProgress = Math.min(100, Math.max(0, (steadyElapsed / Math.max(1, steadySec)) * 100));
          const rampDownElapsed = Math.max(0, elapsedSec - (rampUpSec + steadySec));
          const rampDownProgress = Math.min(100, Math.max(0, (rampDownElapsed / Math.max(1, rampDownSec)) * 100));

          const currentLiveVUs = activeRun.timeline.length > 0
            ? activeRun.timeline[activeRun.timeline.length - 1].activeVUs
            : (activeRun.status === 'RUNNING' ? Math.round(targetVUs * (progressPercent / 100)) : targetVUs);

          let currentPhase: 'RAMP_UP' | 'STEADY' | 'RAMP_DOWN' = 'STEADY';
          if (elapsedSec <= rampUpSec) {
            currentPhase = 'RAMP_UP';
          } else if (elapsedSec <= rampUpSec + steadySec) {
            currentPhase = 'STEADY';
          } else {
            currentPhase = 'RAMP_DOWN';
          }

          return (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                    <span>Load Profile Phases:</span>
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5 ${
                    currentPhase === 'RAMP_UP'
                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                      : currentPhase === 'STEADY'
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30'
                  }`}>
                    <span className="w-2 h-2 rounded-full bg-current animate-pulse shrink-0" />
                    {currentPhase === 'RAMP_UP' && (
                      <span>
                        Phase 1: Ramp-Up (0 → {targetVUs} VUs) • {rampUpProgress.toFixed(0)}% ({formatElapsed(Math.min(elapsedSec, rampUpSec))} / {formatElapsed(rampUpSec)})
                      </span>
                    )}
                    {currentPhase === 'STEADY' && (
                      <span>
                        Phase 2: Steady State (Plateau {targetVUs} VUs) • {steadyProgress.toFixed(0)}% ({formatElapsed(Math.min(steadyElapsed, steadySec))} / {formatElapsed(steadySec)})
                      </span>
                    )}
                    {currentPhase === 'RAMP_DOWN' && (
                      <span>
                        Phase 3: Ramp-Down ({targetVUs} → 0 VUs) • {rampDownProgress.toFixed(0)}% ({formatElapsed(Math.min(rampDownElapsed, rampDownSec))} / {formatElapsed(rampDownSec)})
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px] flex-wrap">
                  <span className="text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800 font-bold">
                    {activeEndpointsCount} Target APIs
                  </span>
                  <span className="text-slate-400">Live Concurrency:</span>
                  <span className="font-black text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                    {currentLiveVUs} / {targetVUs} VUs
                  </span>
                </div>
              </div>

              {/* Multi-Phase Progressive Fill Bars */}
              <div className="flex items-center gap-1.5 w-full">
                {/* Phase 1: Ramp-Up Progress Bar */}
                <div
                  className="relative h-3 rounded-md overflow-hidden bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-2xs"
                  style={{ flex: `${rampUpSec} 1 0%` }}
                  title={`Phase 1: Ramp-Up (0 to ${targetVUs} VUs) - ${rampUpProgress.toFixed(1)}%`}
                >
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-300 ease-out relative rounded-sm flex items-center justify-end pr-0.5"
                    style={{ width: `${rampUpProgress}%` }}
                  >
                    {currentPhase === 'RAMP_UP' && rampUpProgress > 0 && rampUpProgress < 100 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping mr-0.5" />
                    )}
                  </div>
                </div>

                {/* Phase 2: Steady State Progress Bar */}
                <div
                  className="relative h-3 rounded-md overflow-hidden bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-2xs"
                  style={{ flex: `${steadySec} 1 0%` }}
                  title={`Phase 2: Steady State (${targetVUs} VUs) - ${steadyProgress.toFixed(1)}%`}
                >
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-300 ease-out relative rounded-sm flex items-center justify-end pr-0.5"
                    style={{ width: `${steadyProgress}%` }}
                  >
                    {currentPhase === 'STEADY' && steadyProgress > 0 && steadyProgress < 100 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping mr-0.5" />
                    )}
                  </div>
                </div>

                {/* Phase 3: Ramp-Down Progress Bar */}
                <div
                  className="relative h-3 rounded-md overflow-hidden bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-2xs"
                  style={{ flex: `${rampDownSec} 1 0%` }}
                  title={`Phase 3: Ramp-Down (${targetVUs} to 0 VUs) - ${rampDownProgress.toFixed(1)}%`}
                >
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 transition-all duration-300 ease-out relative rounded-sm flex items-center justify-end pr-0.5"
                    style={{ width: `${rampDownProgress}%` }}
                  >
                    {currentPhase === 'RAMP_DOWN' && rampDownProgress > 0 && rampDownProgress < 100 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping mr-0.5" />
                    )}
                  </div>
                </div>
              </div>

              {/* Segment Labels and Duration Boundaries */}
              <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400 font-mono pt-0.5">
                <div className={`flex items-center gap-1 ${currentPhase === 'RAMP_UP' ? 'text-amber-500 dark:text-amber-400 font-bold' : ''}`}>
                  <span>▲ Phase 1: Ramp-Up</span>
                  <span className="text-[9px] opacity-80">({formatElapsed(rampUpSec)} • {rampUpProgress.toFixed(0)}%)</span>
                </div>
                <div className={`flex items-center gap-1 ${currentPhase === 'STEADY' ? 'text-emerald-500 dark:text-emerald-400 font-bold' : ''}`}>
                  <span>■ Phase 2: Steady State</span>
                  <span className="text-[9px] opacity-80">({formatElapsed(steadySec)} • {steadyProgress.toFixed(0)}%)</span>
                </div>
                <div className={`flex items-center gap-1 ${currentPhase === 'RAMP_DOWN' ? 'text-indigo-500 dark:text-indigo-400 font-bold' : ''}`}>
                  <span>▼ Phase 3: Ramp-Down</span>
                  <span className="text-[9px] opacity-80">({formatElapsed(rampDownSec)} • {rampDownProgress.toFixed(0)}%)</span>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* View rendering: k6 (Grafana), locust (Locust UI), or metrics (Unified Metrics) */}
      {viewMode === 'k6' ? (
        <GrafanaDashboardView
          runs={[activeRun]}
          activeRun={activeRun}
          selectedRunId={activeRun.id}
          elapsedSec={elapsedSec}
          onSelectRunId={(id) => onSelectRun(id, 'live')}
        />
      ) : viewMode === 'locust' ? (
        <LocustDashboardView run={activeRun} activeRun={activeRun} elapsedSec={elapsedSec} onStopTest={onStopTest} />
      ) : (
        /* Unified Metrics View */
        <div className="space-y-6">
          {/* 7 Metric Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs">
              <div className="text-[11px] text-slate-400 font-medium">Virtual Users</div>
              <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                {activeRun.timeline.length ? activeRun.timeline[activeRun.timeline.length - 1].activeVUs : activeRun.users}
              </div>
              <div className="mt-1 text-[10px] text-slate-500">Peak: {activeRun.users} VUs</div>
            </div>

            <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs">
              <div className="text-[11px] text-slate-400 font-medium">Target APIs</div>
              <div className="mt-1 text-2xl font-black text-purple-600 dark:text-purple-400">
                {activeEndpointsCount}
              </div>
              <div className="mt-1 text-[10px] text-purple-500">Active endpoints</div>
            </div>

            <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs">
              <div className="text-[11px] text-slate-400 font-medium">Requests</div>
              <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                {activeRun.requests.toLocaleString()}
              </div>
              <div className="mt-1 text-[10px] text-slate-500">Accumulated</div>
            </div>

            <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs">
              <div className="text-[11px] text-slate-400 font-medium">RPS</div>
              <div className="mt-1 text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {activeRun.rps}
              </div>
              <div className="mt-1 text-[10px] text-indigo-500">Live throughput</div>
            </div>

            <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs">
              <div className="text-[11px] text-slate-400 font-medium">Avg Response</div>
              <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                {activeRun.avgResponseMs} <span className="text-xs font-normal text-slate-400">ms</span>
              </div>
              <div className="mt-1 text-[10px] text-emerald-500">Mean latency</div>
            </div>

            <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs">
              <div className="text-[11px] text-slate-400 font-medium">P95</div>
              <div className="mt-1 text-2xl font-black text-amber-500">
                {activeRun.p95Ms} <span className="text-xs font-normal text-slate-400">ms</span>
              </div>
              <div className="mt-1 text-[10px] text-amber-500">95th percentile</div>
            </div>

            <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs">
              <div className="text-[11px] text-slate-400 font-medium">Error Rate</div>
              <div className="mt-1 text-2xl font-black text-rose-500">
                {activeRun.errorRate}%
              </div>
              <div className="mt-1 text-[10px] text-rose-500">HTTP 4xx / 5xx</div>
            </div>
          </div>

          {/* Endpoint Performance Table */}
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Live Route Performance ({activeRun.endpointResults.length || activeEndpointsCount} APIs)
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">
                Tagged by: endpoint + testid
              </span>
            </div>

            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800 text-[11px]">
                  <tr>
                    <th className="pb-2">Endpoint</th>
                    <th className="pb-2">Method</th>
                    <th className="pb-2 text-right">RPS</th>
                    <th className="pb-2 text-right">Avg (ms)</th>
                    <th className="pb-2 text-right">P95 (ms)</th>
                    <th className="pb-2 text-right">Error (%)</th>
                    <th className="pb-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {activeRun.endpointResults.map((ep) => (
                    <tr key={ep.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 font-mono text-slate-900 dark:text-white">
                        {ep.endpoint}
                      </td>
                      <td className="py-2.5">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">
                          {ep.method}
                        </span>
                      </td>
                      <td className="py-2.5 text-right font-bold text-slate-800 dark:text-slate-200">
                        {ep.rps}
                      </td>
                      <td className="py-2.5 text-right text-slate-600 dark:text-slate-300">
                        {ep.avg}
                      </td>
                      <td className="py-2.5 text-right font-bold text-slate-900 dark:text-white">
                        {ep.p95}
                      </td>
                      <td className="py-2.5 text-right text-slate-600 dark:text-slate-300">
                        {ep.failureRate.toFixed(1)}
                      </td>
                      <td className="py-2.5 text-right">
                        {activeRun.status === 'RUNNING' || activeRun.status === 'STARTING' ? <span className="text-[10px] font-bold text-slate-500">TESTING</span> : getRatingBadge(ep.rating)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
