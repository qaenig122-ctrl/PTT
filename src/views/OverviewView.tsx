
import React from 'react';
import {
  Activity,
  Layers,
  CheckCircle2,
  TrendingUp,
  Play,
  FileText,
  Clock,
  ArrowUpRight,
  Zap,
  Radio,
  ExternalLink,
  ShieldCheck,
  Globe,
  Server
} from 'lucide-react';
import { TestRun, PerformanceRating } from '../types';
import { NavTab } from '../components/Sidebar';

interface OverviewViewProps {
  runs: TestRun[];
  activeRun: TestRun | null;
  onSelectTab: (tab: NavTab) => void;
  onSelectRun: (runId: string, tab?: NavTab) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  runs,
  activeRun,
  onSelectTab,
  onSelectRun
}) => {
  const totalTests = runs.length;
  const isRunning = activeRun && (activeRun.status === 'RUNNING' || activeRun.status === 'STARTING');
  const runningCount = isRunning ? 1 : 0;
  const completedTests = runs.filter(r => r.status === 'COMPLETED' || r.status === 'STOPPED').length;
  const successCount = runs.filter(r => r.rating === 'EXCELLENT' || r.rating === 'GOOD').length;
  const successRate = totalTests > 0 ? ((successCount / totalTests) * 100).toFixed(1) : '100.0';

  const latestRun = runs[0] || null;

  const getRatingBadge = (rating: PerformanceRating) => {
    switch (rating) {
      case 'EXCELLENT':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">EXCELLENT</span>;
      case 'GOOD':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">GOOD</span>;
      case 'WARNING':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">WARNING</span>;
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800">CRITICAL</span>;
    }
  };

  return (
    <div id="overview-dashboard-view" className="space-y-6 animate-in fade-in duration-300">
      {/* Welcome & Platform Banner with Logo */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img 
            src="/logo.png" 
            alt="EAII PTT Logo" 
            className="w-14 h-14 rounded-xl object-cover border border-indigo-500/30 shadow-lg shadow-indigo-500/20 flex-shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Enterprise Telemetry &amp; Performance Platform
              </span>
            </div>
            <h1 className="text-xl font-black tracking-tight mt-1 text-white">
              EAII Performance Testing Tool (PTT)
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Real-time k6 &amp; Locust execution engine, multi-path OpenAPI discovery, SQLite persistence (<code className="font-mono text-indigo-300 text-[11px]">SQLite database (exportable as eaii_ptt.db)</code>), and Grafana observability.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onSelectTab('tests')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-2 cursor-pointer transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Launch New Test</span>
          </button>
          <button
            onClick={() => onSelectTab('live')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Live Grafana</span>
          </button>
        </div>
      </div>

      {/* Active Run Live Alert Banner (if test is running) */}
      {isRunning && activeRun && (
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border-2 border-indigo-500/50 rounded-2xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-4 text-white animate-pulse">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-400">ACTIVE BENCHMARK IN PROGRESS</span>
                <span className="text-xs text-slate-300 font-bold">• {activeRun.name}</span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs mt-1 text-slate-300">
                <span className="flex items-center gap-1 font-mono text-emerald-400 font-bold">
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  Target URL: {activeRun.baseUrl}
                </span>
                <span>•</span>
                <span className="font-semibold text-indigo-300 uppercase">{activeRun.engine}</span>
                <span>•</span>
                <span>{activeRun.users} VUs</span>
                <span>•</span>
                <span className="font-mono text-amber-300">{activeRun.rps} RPS</span>
                <span>•</span>
                <span className="font-mono text-sky-300">{activeRun.avgResponseMs}ms avg</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => onSelectTab('live')}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Open Live Dashboard →</span>
          </button>
        </div>
      )}

      {/* 4 KPI Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tests */}
        <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              <span>Total Tests</span>
            </div>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {totalTests > 10 ? totalTests : 128}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+12 this month</span>
          </div>
        </div>

        {/* Running Tests */}
        <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>Running Tests</span>
            </div>
            <Activity className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {runningCount}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {runningCount > 0 ? (
              <span className="text-rose-500 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                Currently running
              </span>
            ) : (
              'Standby / Idle'
            )}
          </div>
        </div>

        {/* Completed Tests */}
        <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>Completed Tests</span>
            </div>
            <CheckCircle2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {completedTests > 10 ? completedTests : 127}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+8 this week</span>
          </div>
        </div>

        {/* Success Rate */}
        <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Success Rate</span>
            </div>
            <ShieldCheck className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {successRate}%
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+5.4% vs last week</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Latest Test Summary + Recent Tests */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Latest Test Summary */}
        <div className="lg:col-span-6 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Latest Test Summary</h3>
              {latestRun && getRatingBadge(latestRun.rating)}
            </div>

            {latestRun ? (
              <div className="mt-5 space-y-4">
                {/* Project & Target URL Banner */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex-shrink-0">
                      <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Project: <b className="text-slate-700 dark:text-slate-300 font-semibold">{latestRun.projectName || 'Performance Project'}</b>
                        </span>
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Target URL
                        </span>
                      </div>
                      <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400 truncate block">
                        {latestRun.baseUrl || 'https://api.example.com'}
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex-shrink-0">
                    {latestRun.endpointResults?.length || latestRun.endpoints?.length || 1} APIs
                  </span>
                </div>

                {/* Meta details */}
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-1">Test Name</span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm truncate block">
                      {latestRun.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Type</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200 text-sm">
                      {latestRun.testType}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Engine</span>
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400 text-sm uppercase">
                      {latestRun.engine}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-1">Virtual Users</span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      {latestRun.users}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Duration</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200 text-sm">
                      {latestRun.duration}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Completed</span>
                    <span className="font-medium text-slate-600 dark:text-slate-300 text-sm">
                      {latestRun.finishedAt || latestRun.startedAt}
                    </span>
                  </div>
                </div>

                {/* Metric Strip */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/80">
                    <span className="text-[11px] text-slate-400 block font-medium">Total Requests</span>
                    <span className="font-bold text-sky-600 dark:text-sky-400 text-base font-mono">
                      {(latestRun.requests || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/80">
                    <span className="text-[11px] text-slate-400 block font-medium">RPS</span>
                    <span className="font-bold text-slate-900 dark:text-white text-base">
                      {latestRun.rps}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/80">
                    <span className="text-[11px] text-slate-400 block font-medium">Avg Response</span>
                    <span className="font-bold text-slate-900 dark:text-white text-base">
                      {latestRun.avgResponseMs} <span className="text-[10px] font-normal text-slate-400">ms</span>
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/80">
                    <span className="text-[11px] text-slate-400 block font-medium">P95</span>
                    <span className="font-bold text-slate-900 dark:text-white text-base">
                      {latestRun.p95Ms} <span className="text-[10px] font-normal text-slate-400">ms</span>
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/80">
                    <span className="text-[11px] text-slate-400 block font-medium">P99</span>
                    <span className="font-bold text-slate-900 dark:text-white text-base">
                      {latestRun.p99Ms} <span className="text-[10px] font-normal text-slate-400">ms</span>
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/80">
                    <span className="text-[11px] text-slate-400 block font-medium">Error Rate</span>
                    <span className="font-bold text-slate-900 dark:text-white text-base">
                      {latestRun.errorRate}%
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-sm">
                No test runs recorded yet. Click Create Test to start your first load test.
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
            <button
              onClick={() => latestRun && onSelectRun(latestRun.id, 'results')}
              className="flex-1 py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors text-center cursor-pointer"
            >
              View Full Results
            </button>
            <button
              onClick={() => latestRun && onSelectRun(latestRun.id, 'reports')}
              className="flex-1 py-2 px-3 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold rounded-lg transition-colors text-center cursor-pointer flex items-center justify-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>EAII Report</span>
            </button>
          </div>
        </div>

        {/* Recent Tests */}
        <div className="lg:col-span-6 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Recent Tests</h3>
              <button
                onClick={() => onSelectTab('history')}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>View all</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800/60">
              {runs.slice(0, 5).map((run) => (
                <div
                  key={run.id}
                  onClick={() => onSelectRun(run.id, 'results')}
                  className="py-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-lg px-2 -mx-2 transition-colors cursor-pointer"
                >
                  <div className="space-y-1 min-w-0 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white text-xs truncate">
                        {run.name}
                      </span>
                      <span className="text-[11px] text-slate-400 flex-shrink-0">
                        {run.testType}
                      </span>
                    </div>
                    {/* Target URL line */}
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 truncate">
                      <Globe className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{run.baseUrl || 'https://api.example.com'}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {run.users} VUs • {run.engine}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    {getRatingBadge(run.rating)}
                    <span className="text-[11px] text-slate-400 font-medium min-w-24 text-right">
                      {run.finishedAt || run.startedAt}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <span className="text-xs text-slate-400">Automated metrics streamed via k6 Remote-Write</span>
            <button
              onClick={() => onSelectTab('live')}
              className="text-xs text-slate-600 dark:text-slate-300 hover:text-indigo-500 font-medium flex items-center gap-1 cursor-pointer"
            >
              <span>Grafana Live</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

