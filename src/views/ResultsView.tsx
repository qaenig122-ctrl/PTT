import React, { useState, useMemo } from 'react';
import {
  FileCheck,
  Activity,
  FileText,
  Search,
  Download,
  Filter,
  Star,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  ChevronRight,
  Terminal,
  Clock,
  RotateCcw,
  LayoutDashboard,
  FolderGit2,
  Layers,
  Globe
} from 'lucide-react';
import { TestRun, PerformanceRating, HttpMethod } from '../types';
import { NavTab } from '../components/Sidebar';
import { evaluateSystem } from '../lib/evaluator';
import { ReportDashboardBody } from '../components/ReportDashboardBody';

interface ResultsViewProps {
  runs: TestRun[];
  selectedRunId: string | null;
  onSelectRunId: (id: string) => void;
  onSelectTab: (tab: NavTab) => void;
  onRerunTest: (run: TestRun) => void;
  onContinueNextTest?: (run: TestRun) => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  runs,
  selectedRunId,
  onSelectRunId,
  onSelectTab,
  onRerunTest,
  onContinueNextTest
}) => {
  const [activeTab, setActiveTab] = useState<'report' | 'summary' | 'endpoints' | 'errors' | 'timeline' | 'logs'>('report');
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');
  const [ratingFilter, setRatingFilter] = useState<string>('ALL');

  const currentRun = runs.find(r => r.id === selectedRunId) || runs[0];

  // Group all runs strictly by Project Categorization
  const projects = useMemo(() => {
    const map = new Map<string, TestRun[]>();
    for (const r of runs) {
      const pName = r.projectName || 'EAII PTT Benchmark Project';
      if (!map.has(pName)) map.set(pName, []);
      map.get(pName)!.push(r);
    }
    return Array.from(map.entries()).map(([name, pRuns]) => ({
      name,
      runs: [...pRuns].sort((a, b) => (a.sequenceIndex ?? 0) - (b.sequenceIndex ?? 0))
    }));
  }, [runs]);

  const activeProjectName = currentRun?.projectName || projects[0]?.name || 'EAII PTT Benchmark Project';
  const activeProject = projects.find(p => p.name === activeProjectName) || projects[0];
  const activeProjectRuns = activeProject?.runs || [];

  const handleSelectProject = (projectName: string) => {
    const p = projects.find(proj => proj.name === projectName);
    if (p && p.runs.length > 0) {
      onSelectRunId(p.runs[0].id);
    }
  };

  if (!currentRun) {
    return (
      <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center shadow-xs">
        <FileCheck className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-900 dark:text-white">No Test Results Available</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Execute a performance test or select a run from history to review comprehensive evaluation metrics.
        </p>
      </div>
    );
  }

  const diagnosis = currentRun.dynamicEvaluation || evaluateSystem(
    currentRun.p95Ms,
    currentRun.p99Ms,
    currentRun.avgResponseMs,
    currentRun.errorRate,
    currentRun.endpointResults,
    currentRun.thresholds,
    currentRun.testType,
    currentRun.engine,
    currentRun.timeline,
    currentRun.rps
  );

  const getRatingBadge = (rating: PerformanceRating, status?: string) => {
    if (status === 'STOPPED') {
      return (
        <span className="px-2.5 py-0.5 rounded text-xs font-black bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300 dark:border-amber-700 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          <span>STOPPED (PARTIAL RUN)</span>
        </span>
      );
    }
    switch (rating) {
      case 'EXCELLENT':
        return <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">EXCELLENT</span>;
      case 'GOOD':
        return <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300 dark:border-blue-800">GOOD</span>;
      case 'WARNING':
        return <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">WARNING</span>;
      case 'CRITICAL':
        return <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800">CRITICAL</span>;
    }
  };

  const filteredEndpoints = currentRun.endpointResults.filter((ep) => {
    const matchesSearch = ep.endpoint.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMethod = methodFilter === 'ALL' || ep.method === methodFilter;
    const matchesRating = ratingFilter === 'ALL' || ep.rating === ratingFilter;
    return matchesSearch && matchesMethod && matchesRating;
  });

  const handleExportCSV = () => {
    const headers = ['Endpoint', 'Method', 'Requests', 'RPS', 'Avg_ms', 'P90_ms', 'P95_ms', 'P99_ms', 'Max_ms', 'Error_Rate_Pct', 'Rating'];
    const rows = currentRun.endpointResults.map(ep => [
      ep.endpoint,
      ep.method,
      ep.requests,
      ep.rps,
      ep.avg,
      ep.p90,
      ep.p95,
      ep.p99,
      ep.max,
      ep.failureRate,
      ep.rating
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${currentRun.id}_endpoints_results.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="test-results-container" className="space-y-6 animate-in fade-in duration-300">
      {/* 1. PROJECT CATEGORIZATION SELECTOR RIBBON */}
      <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-xs font-black tracking-wider text-slate-700 dark:text-slate-300 uppercase">
              Project Categorization ({projects.length})
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">
            Categorized test results &amp; metrics by project
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {projects.map((proj) => {
            const isSelected = proj.name === activeProjectName;
            const projBaseUrl = proj.runs[0]?.baseUrl || 'https://api.example.com';
            return (
              <button
                key={proj.name}
                onClick={() => handleSelectProject(proj.name)}
                className={`p-3 rounded-lg text-left transition-all border cursor-pointer flex items-center justify-between gap-2 ${
                  isSelected
                    ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-400 dark:border-blue-700 ring-2 ring-blue-500/20'
                    : 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white truncate max-w-[150px]">
                      {proj.name}
                    </h4>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-mono text-[9px] font-bold">
                      <Globe className="w-2.5 h-2.5 text-emerald-500" />
                      {projBaseUrl}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {proj.runs.length} Phase{proj.runs.length > 1 ? 's' : ''} executed
                  </div>
                </div>
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0"></span>
                )}
              </button>
            );
          })}
        </div>

        {/* Phase pills within active project */}
        {activeProjectRuns.length > 1 && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-blue-500" />
              <span>Phases in {activeProjectName}:</span>
            </span>
            {activeProjectRuns.map((r, idx) => {
              const isRunActive = r.id === currentRun.id;
              return (
                <button
                  key={r.id}
                  onClick={() => onSelectRunId(r.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isRunActive
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>Phase {idx + 1} · {r.testType}</span>
                  <span className={`px-1 rounded text-[9px] font-black ${
                    r.rating === 'EXCELLENT'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : r.rating === 'GOOD'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {r.rating}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Top Header */}
      <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Results — {currentRun.name}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                {currentRun.testType}
              </span>
              {getRatingBadge(currentRun.rating, currentRun.status)}
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                Project: <b className="text-slate-700 dark:text-slate-300">{currentRun.projectName || activeProjectName}</b>
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-mono text-[11px] font-bold">
                <Globe className="w-3 h-3 text-emerald-500" />
                {currentRun.baseUrl || 'https://api.example.com'}
              </span>
              <span>•</span>
              <span>Test Type: <b className="text-indigo-600 dark:text-indigo-400">{currentRun.testType}</b></span>
              <span>•</span>
              <span>Engine: {currentRun.engine}</span>
              <span>•</span>
              <span>{currentRun.users} VUs</span>
              <span>•</span>
              <span>{currentRun.duration}</span>
              <span>•</span>
              <span>{currentRun.startedAt}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Test Selector Dropdown with Project Grouping */}
          <select
            value={currentRun.id}
            onChange={(e) => onSelectRunId(e.target.value)}
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            {projects.map((proj) => (
              <optgroup key={proj.name} label={`📁 ${proj.name}`}>
                {proj.runs.map((r, pIdx) => (
                  <option key={r.id} value={r.id}>
                    Phase {pIdx + 1}: {r.testType} — {r.name} ({r.rating})
                  </option>
                ))}
              </optgroup>
            ))}
          </select>

          <button
            onClick={() => onSelectTab('live')}
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5 text-orange-500" />
            <span>View Grafana</span>
          </button>

          <button
            onClick={() => onSelectTab('reports')}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Generate Report</span>
          </button>

          {currentRun.status === 'COMPLETED' && onContinueNextTest && (currentRun.projectTestPlan?.some((_,i)=>i > (currentRun.sequenceIndex ?? 0))) && (
            <button onClick={() => onContinueNextTest(currentRun)} className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5">
              Continue to Next Test →
            </button>
          )}

          <button
            onClick={() => onRerunTest(currentRun)}
            className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg"
            title="Rerun Test"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex gap-6 text-xs font-semibold">
        {[
          { id: 'report', label: 'Formal Report' },
          { id: 'summary', label: 'Summary' },
          { id: 'endpoints', label: `Endpoints (${currentRun.endpointResults.length})` },
          { id: 'errors', label: `Errors (${currentRun.errors.length})` },
          { id: 'timeline', label: 'Timeline' },
          { id: 'logs', label: 'Logs' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`pb-3 transition-colors relative cursor-pointer ${
              activeTab === tab.id
                ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400"></span>
            )}
          </button>
        ))}
      </div>

      {/* TAB 0: FORMAL REPORT (Exact match to report dashboard body) */}
      {activeTab === 'report' && (
        <ReportDashboardBody run={currentRun} />
      )}

      {/* TAB 1: SUMMARY */}
      {activeTab === 'summary' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Test Summary Left Card */}
          <div className="lg:col-span-4 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm pb-3 border-b border-slate-100 dark:border-slate-800">
              Test Summary
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Project Name</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{currentRun.projectName || currentRun.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Engine</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400 uppercase">{currentRun.engine}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Virtual Users</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{currentRun.users} VUs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Duration</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{currentRun.duration}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Target URL</span>
                <span className="font-mono text-slate-600 dark:text-slate-300 truncate max-w-xs">{currentRun.baseUrl}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Start Time</span>
                <span className="text-slate-600 dark:text-slate-300">{currentRun.startedAt}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">End Time</span>
                <span className="text-slate-600 dark:text-slate-300">{currentRun.finishedAt || currentRun.startedAt}</span>
              </div>
            </div>
          </div>

          {/* Performance Overview Right Card */}
          <div className="lg:col-span-8 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-5">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm pb-3 border-b border-slate-100 dark:border-slate-800">
              Performance Overview
            </h3>

            {/* 6 Metric Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] text-slate-400 block font-medium">Requests</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1 block">
                  {currentRun.requests.toLocaleString()}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] text-slate-400 block font-medium">RPS</span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1 block">
                  {currentRun.rps}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] text-slate-400 block font-medium">Avg Response</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1 block">
                  {currentRun.avgResponseMs} <span className="text-xs font-normal text-slate-400">ms</span>
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] text-slate-400 block font-medium">P95</span>
                <span className="text-2xl font-black text-amber-500 font-mono mt-1 block">
                  {currentRun.p95Ms} <span className="text-xs font-normal text-slate-400">ms</span>
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] text-slate-400 block font-medium">P99</span>
                <span className="text-2xl font-black text-rose-500 font-mono mt-1 block">
                  {currentRun.p99Ms} <span className="text-xs font-normal text-slate-400">ms</span>
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] text-slate-400 block font-medium">Error Rate</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1 block">
                  {currentRun.errorRate}%
                </span>
              </div>
            </div>

            {/* Overall Rating & Diagnostic Box */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-medium">Overall Rating</span>
                <div className="flex items-center gap-2">
                  <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                    {diagnosis.overallRating}
                  </span>
                  <div className="flex text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < diagnosis.ratingScore ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md">
                  {diagnosis.summary}
                </p>
              </div>

              <button
                onClick={() => onSelectTab('reports')}
                className="px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs cursor-pointer"
              >
                View Evaluation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ENDPOINTS */}
      {activeTab === 'endpoints' && (
        <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              {/* Search */}
              <div className="relative min-w-48">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search endpoint..."
                  className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white w-full"
                />
              </div>

              {/* Method Filter */}
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white cursor-pointer"
              >
                <option value="ALL">All Methods</option>
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>

              {/* Rating Filter */}
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white cursor-pointer"
              >
                <option value="ALL">All Ratings</option>
                <option value="EXCELLENT">EXCELLENT</option>
                <option value="VERY GOOD">VERY GOOD</option>
                <option value="GOOD">GOOD</option>
                <option value="WARNING">WARNING</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>

            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>

          {/* Endpoints Table */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold text-[11px]">
                <tr>
                  <th className="py-2.5 px-4">Endpoint</th>
                  <th className="py-2.5 px-4">Method</th>
                  <th className="py-2.5 px-4 text-right">Requests</th>
                  <th className="py-2.5 px-4 text-right">RPS</th>
                  <th className="py-2.5 px-4 text-right">Avg (ms)</th>
                  <th className="py-2.5 px-4 text-right">P95 (ms)</th>
                  <th className="py-2.5 px-4 text-right">P99 (ms)</th>
                  <th className="py-2.5 px-4 text-right">Error Rate</th>
                  <th className="py-2.5 px-4 text-right">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {filteredEndpoints.map((ep) => (
                  <tr key={ep.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {ep.endpoint}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-100 dark:bg-slate-800">
                        {ep.method}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-700 dark:text-slate-300">
                      {ep.requests.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {ep.rps}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600 dark:text-slate-300">
                      {ep.avg}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {ep.p95}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600 dark:text-slate-300">
                      {ep.p99 > 1000 ? `${(ep.p99 / 1000).toFixed(1)} s` : `${ep.p99} ms`}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-700 dark:text-slate-300">
                      {ep.failureRate.toFixed(1)}%
                    </td>
                    <td className="py-3 px-4 text-right">
                      {getRatingBadge(ep.rating)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2">
            <span>Showing {filteredEndpoints.length} of {currentRun.endpointResults.length} entries</span>
            <span>All responses validated via status 2xx/3xx assertions</span>
          </div>
        </div>
      )}

      {/* TAB 3: ERRORS */}
      {activeTab === 'errors' && (
        <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">
            Captured HTTP & SLA Errors ({currentRun.errors.length})
          </h3>

          {currentRun.errors.length > 0 ? (
            <div className="space-y-3">
              {currentRun.errors.map((err) => (
                <div
                  key={err.id}
                  className="p-4 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 flex items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-xs">
                          {err.endpoint}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200 text-[10px] font-mono font-bold">
                          HTTP {err.status}
                        </span>
                      </div>
                      <p className="text-xs text-rose-700 dark:text-rose-300 mt-1 font-mono">
                        {err.message}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400 block">
                      {err.count.toLocaleString()} occurrences
                    </span>
                    <span className="text-[10px] text-slate-400">Captured at {err.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <span>Zero HTTP errors encountered during this test run.</span>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">
            Load Progression Timeline
          </h3>

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto max-h-96">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold text-[11px] sticky top-0">
                <tr>
                  <th className="py-2.5 px-4">Time</th>
                  <th className="py-2.5 px-4 text-right">VUs</th>
                  <th className="py-2.5 px-4 text-right">RPS</th>
                  <th className="py-2.5 px-4 text-right">P95 (ms)</th>
                  <th className="py-2.5 px-4 text-right">P99 (ms)</th>
                  <th className="py-2.5 px-4 text-right">Avg (ms)</th>
                  <th className="py-2.5 px-4 text-right">Error %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {currentRun.timeline.map((pt, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2 px-4 text-slate-500">{pt.time} (T+{pt.elapsedSec}s)</td>
                    <td className="py-2 px-4 text-right text-indigo-500 font-bold">{pt.activeVUs}</td>
                    <td className="py-2 px-4 text-right text-emerald-500 font-bold">{pt.rps}</td>
                    <td className="py-2 px-4 text-right text-amber-500">{pt.p95}</td>
                    <td className="py-2 px-4 text-right text-rose-500">{pt.p99}</td>
                    <td className="py-2 px-4 text-right text-slate-600 dark:text-slate-300">{pt.avg}</td>
                    <td className="py-2 px-4 text-right text-slate-600 dark:text-slate-300">{pt.errorRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: LOGS */}
      {activeTab === 'logs' && (
        <div className="bg-[#0a0d12] border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 space-y-1.5 max-h-96 overflow-y-auto">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-slate-400 text-[11px]">
            <Terminal className="w-3.5 h-3.5" />
            <span>EAII Engine stdout / execution trace</span>
          </div>
          {currentRun.logs.map((log, i) => (
            <div key={i} className="leading-relaxed">
              <span className="text-slate-500">{`[${i + 1}]`}</span> {log}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
