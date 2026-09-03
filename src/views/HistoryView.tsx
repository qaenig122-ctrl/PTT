import React, { useState, useMemo } from 'react';
import {
  History,
  Search,
  Filter,
  Play,
  RotateCcw,
  Trash2,
  ExternalLink,
  FileText,
  Star,
  Activity,
  Layers,
  ChevronRight,
  ChevronDown,
  MonitorPlay,
  FolderOpen,
  LayoutList,
  FolderMinus,
  AlertTriangle,
  X,
  CheckCircle2,
  BarChart3,
  Globe
} from 'lucide-react';
import { TestRun, PerformanceRating, TestType } from '../types';
import { NavTab } from '../components/Sidebar';

interface HistoryViewProps {
  runs: TestRun[];
  onSelectRun: (runId: string, tab?: NavTab) => void;
  onRerunTest: (run: TestRun) => void;
  onDeleteRun: (runId: string) => void;
  onDeleteProject?: (projectName: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  runs,
  onSelectRun,
  onRerunTest,
  onDeleteRun,
  onDeleteProject
}) => {
  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState<string>('ALL');
  const [engineFilter, setEngineFilter] = useState<string>('ALL');
  const [ratingFilter, setRatingFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [viewLayout, setViewLayout] = useState<'list' | 'grouped'>('list');
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({});

  // Delete modal state
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [runToDelete, setRunToDelete] = useState<TestRun | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => {
      setFeedbackMessage(prev => prev === msg ? null : prev);
    }, 4000);
  };

  // Group runs by project
  const projectGroups = useMemo(() => {
    const map = new Map<string, TestRun[]>();
    for (const r of runs) {
      const pName = r.projectName || 'EAII PTT Benchmark Project';
      if (!map.has(pName)) map.set(pName, []);
      map.get(pName)!.push(r);
    }
    return Array.from(map.entries()).map(([name, pRuns]) => ({
      name,
      runs: pRuns,
      count: pRuns.length,
      latestRun: pRuns[0],
      totalRequests: pRuns.reduce((sum, r) => sum + (r.requests || 0), 0),
      avgRps: Math.round(pRuns.reduce((sum, r) => sum + (r.rps || 0), 0) / (pRuns.length || 1)),
      bestRating: pRuns.some(r => r.rating === 'EXCELLENT')
        ? 'EXCELLENT'
        : pRuns.some(r => r.rating === 'VERY GOOD')
        ? 'VERY GOOD'
        : pRuns.some(r => r.rating === 'GOOD')
        ? 'GOOD'
        : pRuns.some(r => r.rating === 'WARNING')
        ? 'WARNING'
        : 'CRITICAL'
    }));
  }, [runs]);

  // Unique project names for selector
  const allProjectNames = useMemo(() => {
    const set = new Set<string>();
    runs.forEach(r => {
      set.add(r.projectName || 'EAII PTT Benchmark Project');
    });
    return Array.from(set);
  }, [runs]);

  const filteredRuns = useMemo(() => {
    return runs.filter((r) => {
      const pName = r.projectName || 'EAII PTT Benchmark Project';
      const matchesSearch =
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.id.toLowerCase().includes(search.toLowerCase()) ||
        pName.toLowerCase().includes(search.toLowerCase());
      const matchesProject = projectFilter === 'ALL' || pName === projectFilter;
      const matchesEngine = engineFilter === 'ALL' || r.engine === engineFilter;
      const matchesRating = ratingFilter === 'ALL' || r.rating === ratingFilter;
      const matchesType = typeFilter === 'ALL' || r.testType === typeFilter;
      return matchesSearch && matchesProject && matchesEngine && matchesRating && matchesType;
    });
  }, [runs, search, projectFilter, engineFilter, ratingFilter, typeFilter]);

  const toggleProjectExpand = (projectName: string) => {
    setExpandedProjects(prev => ({
      ...prev,
      [projectName]: !prev[projectName]
    }));
  };

  const handleDeleteProjectConfirm = () => {
    if (!projectToDelete || !onDeleteProject) return;
    const targetName = projectToDelete;
    const targetCount = runs.filter(r => (r.projectName || 'EAII PTT Benchmark Project') === targetName).length;
    onDeleteProject(targetName);
    setProjectToDelete(null);
    if (projectFilter === targetName) {
      setProjectFilter('ALL');
    }
    showFeedback(`Successfully deleted ${targetCount} benchmark run${targetCount === 1 ? '' : 's'} for project "${targetName}".`);
  };

  const handleDeleteRunConfirm = () => {
    if (!runToDelete) return;
    const targetId = runToDelete.id;
    const targetName = runToDelete.name;
    onDeleteRun(targetId);
    setRunToDelete(null);
    showFeedback(`Successfully deleted benchmark execution "${targetName}" (${targetId}).`);
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

  const getEngineBadge = (engine: string) => {
    if (engine.toLowerCase() === 'locust') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <span>🦗</span>
          <span>Locust</span>
        </span>
      );
    }
    if (engine.toLowerCase() === 'k6') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
          <span>⚡</span>
          <span>k6 (Grafana)</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
        <span>{engine}</span>
      </span>
    );
  };

  const targetProjectRuns = useMemo(() => {
    if (!projectToDelete) return [];
    return runs.filter(r => (r.projectName || 'EAII PTT Benchmark Project') === projectToDelete);
  }, [runs, projectToDelete]);

  return (
    <div id="test-history-container" className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Historical Benchmark Runs</h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Query past test executions, delete runs by project name, compare Locust vs k6 performance, and re-run baselines.
            </p>
          </div>

          {/* Quick Actions & Layout Toggle */}
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setViewLayout('list')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewLayout === 'list'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <LayoutList className="w-3.5 h-3.5" />
                <span>List View</span>
              </button>
              <button
                onClick={() => setViewLayout('grouped')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewLayout === 'grouped'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Group by Project ({projectGroups.length})</span>
              </button>
            </div>

            {/* Quick Delete by Project Button */}
            {onDeleteProject && allProjectNames.length > 0 && (
              <button
                onClick={() => setProjectToDelete(projectFilter !== 'ALL' ? projectFilter : allProjectNames[0])}
                className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 rounded-lg text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 transition-all cursor-pointer"
                title="Delete all test runs for a project"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete by Project</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative min-w-44 flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search run ID, project name, test name..."
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white w-full focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Project Name Filter */}
          <div className="flex items-center gap-1.5">
            <FolderOpen className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white cursor-pointer font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 max-w-[200px] truncate"
            >
              <option value="ALL">All Projects ({runs.length} runs)</option>
              {projectGroups.map(p => (
                <option key={p.name} value={p.name}>
                  {p.name} ({p.count} runs)
                </option>
              ))}
            </select>
          </div>

          {/* Engine Filter */}
          <select
            value={engineFilter}
            onChange={(e) => setEngineFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white cursor-pointer font-medium focus:outline-none"
          >
            <option value="ALL">All Engines</option>
            <option value="k6">k6 (Grafana)</option>
            <option value="locust">Locust</option>
          </select>

          {/* Test Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white cursor-pointer font-medium focus:outline-none"
          >
            <option value="ALL">All Test Types</option>
            <option value="Load Test">Load Test</option>
            <option value="Stress Test">Stress Test</option>
            <option value="Spike Test">Spike Test</option>
            <option value="Endurance Test">Endurance Test</option>
            <option value="Volume Test">Volume Test</option>
            <option value="Concurrency Test">Concurrency Test</option>
          </select>

          {/* Rating Filter */}
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white cursor-pointer font-medium focus:outline-none"
          >
            <option value="ALL">All Ratings</option>
            <option value="EXCELLENT">EXCELLENT</option>
            <option value="VERY GOOD">VERY GOOD</option>
            <option value="GOOD">GOOD</option>
            <option value="WARNING">WARNING</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>

          {(search || projectFilter !== 'ALL' || engineFilter !== 'ALL' || typeFilter !== 'ALL' || ratingFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearch('');
                setProjectFilter('ALL');
                setEngineFilter('ALL');
                setTypeFilter('ALL');
                setRatingFilter('ALL');
              }}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer font-medium ml-1"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Active Project Banner with Delete Action */}
        {projectFilter !== 'ALL' && (
          <div className="mt-3 p-3 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-slate-600 dark:text-slate-300 font-medium">Filtering by Project:</span>
              <span className="font-bold text-slate-900 dark:text-white font-mono bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                {projectFilter}
              </span>
              <span className="text-slate-400">({filteredRuns.length} runs matched)</span>
            </div>

            <div className="flex items-center gap-2">
              {onDeleteProject && (
                <button
                  onClick={() => setProjectToDelete(projectFilter)}
                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete All Runs in "{projectFilter}"</span>
                </button>
              )}
              <button
                onClick={() => setProjectFilter('ALL')}
                className="px-2 py-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* VIEW MODE 1: GROUPED BY PROJECT */}
      {viewLayout === 'grouped' ? (
        <div className="space-y-4">
          {projectGroups.length === 0 ? (
            <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-xs">
              No project history records found.
            </div>
          ) : (
            projectGroups.map((group) => {
              const isExpanded = expandedProjects[group.name] ?? true;
              return (
                <div
                  key={group.name}
                  className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs transition-all"
                >
                  {/* Project Group Header Card */}
                  <div className="p-4 bg-slate-50/60 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => toggleProjectExpand(group.name)}>
                      <button className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                        <FolderOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{group.name}</h3>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-mono text-[11px] font-bold">
                            <Globe className="w-3 h-3 text-emerald-500" />
                            {group.runs[0]?.baseUrl || 'https://api.example.com'}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                            {group.count} {group.count === 1 ? 'run' : 'runs'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          Total Requests: {group.totalRequests.toLocaleString()} • Avg RPS: {group.avgRps} • Best Rating: {group.bestRating}
                        </p>
                      </div>
                    </div>

                    {/* Project Header Action Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setProjectFilter(group.name);
                          setViewLayout('list');
                        }}
                        className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Filter className="w-3 h-3 text-indigo-500" />
                        <span>Filter List</span>
                      </button>

                      {onDeleteProject && (
                        <button
                          onClick={() => setProjectToDelete(group.name)}
                          className="px-2.5 py-1 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-800 rounded-lg text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 cursor-pointer transition-colors"
                          title={`Delete all ${group.count} runs for project ${group.name}`}
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete Project History</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Project Runs Table when Expanded */}
                  {isExpanded && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50/50 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold text-[10px] uppercase tracking-wider">
                          <tr>
                            <th className="py-2.5 px-4">Run ID & Test Name</th>
                            <th className="py-2.5 px-4">Engine</th>
                            <th className="py-2.5 px-4">Type & VUs</th>
                            <th className="py-2.5 px-4 text-right">RPS</th>
                            <th className="py-2.5 px-4 text-right">Avg Latency</th>
                            <th className="py-2.5 px-4 text-right">P95</th>
                            <th className="py-2.5 px-4 text-right">Error %</th>
                            <th className="py-2.5 px-4 text-right">Rating</th>
                            <th className="py-2.5 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                          {group.runs.map((r) => {
                            const isLocust = r.engine.toLowerCase() === 'locust';
                            return (
                              <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                                <td className="py-2.5 px-4">
                                  <div
                                    onClick={() => onSelectRun(r.id, 'results')}
                                    className="cursor-pointer group"
                                  >
                                    <div className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                                      {r.name}
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5 flex-wrap">
                                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold inline-flex items-center gap-0.5">
                                        <Globe className="w-2.5 h-2.5" />
                                        {r.baseUrl || 'https://api.example.com'}
                                      </span>
                                      <span>•</span>
                                      <span>{r.id}</span>
                                      <span>•</span>
                                      <span>{r.startedAt}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-2.5 px-4">{getEngineBadge(r.engine)}</td>
                                <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300">
                                  {r.testType} ({r.users} VUs)
                                </td>
                                <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">{r.rps}</td>
                                <td className="py-2.5 px-4 text-right font-mono text-slate-600 dark:text-slate-300">{r.avgResponseMs} ms</td>
                                <td className="py-2.5 px-4 text-right font-mono font-bold text-amber-500">{r.p95Ms} ms</td>
                                <td className="py-2.5 px-4 text-right font-mono">{r.errorRate}%</td>
                                <td className="py-2.5 px-4 text-right">{getRatingBadge(r.rating)}</td>
                                <td className="py-2.5 px-4 text-right space-x-1.5">
                                  <button
                                    onClick={() => onSelectRun(r.id, 'results')}
                                    className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-[11px] font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center gap-1 cursor-pointer"
                                    title="View Results"
                                  >
                                    <FileText className="w-3 h-3" />
                                    <span>Results</span>
                                  </button>
                                  <button
                                    onClick={() => onRerunTest(r)}
                                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-indigo-600 dark:text-indigo-400 cursor-pointer"
                                    title="Re-run Baseline"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                  </button>
                                   <button
                                    onClick={() => setRunToDelete(r)}
                                    className="p-1 hover:bg-rose-100 dark:hover:bg-rose-950/50 rounded text-rose-500 cursor-pointer"
                                    title="Delete Single Record"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* VIEW MODE 2: STANDARD LIST VIEW */
        <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Test Run & Project</th>
                  <th className="py-3 px-4">Engine</th>
                  <th className="py-3 px-4">Test Type</th>
                  <th className="py-3 px-4 text-right">RPS</th>
                  <th className="py-3 px-4 text-right">Avg (ms)</th>
                  <th className="py-3 px-4 text-right">P95 (ms)</th>
                  <th className="py-3 px-4 text-right">P99 (ms)</th>
                  <th className="py-3 px-4 text-right">Error %</th>
                  <th className="py-3 px-4 text-right">Rating</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {filteredRuns.length > 0 ? (
                  filteredRuns.map((r) => {
                    const isLocust = r.engine.toLowerCase() === 'locust';
                    const pName = r.projectName || 'EAII PTT Benchmark Project';
                    return (
                      <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4">
                          <div
                            onClick={() => onSelectRun(r.id, 'results')}
                            className="cursor-pointer group"
                          >
                            <div className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                              {r.name}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5 flex-wrap">
                              <span className="text-emerald-600 dark:text-emerald-400 font-semibold inline-flex items-center gap-1">
                                <Globe className="w-3 h-3 text-emerald-500" />
                                {r.baseUrl || 'https://api.example.com'}
                              </span>
                              <span>•</span>
                              <span>{r.id}</span>
                              <span>•</span>
                              <span>{r.startedAt}</span>
                              <span>•</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setProjectFilter(pName);
                                }}
                                className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold cursor-pointer"
                                title={`Filter by project ${pName}`}
                              >
                                {pName}
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {getEngineBadge(r.engine)}
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                          {r.users} VUs • {r.duration}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                          {r.rps}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-slate-600 dark:text-slate-300">
                          {r.avgResponseMs}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-amber-500">
                          {r.p95Ms}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-slate-600 dark:text-slate-300">
                          {r.p99Ms}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-slate-700 dark:text-slate-300">
                          {r.errorRate}%
                        </td>
                        <td className="py-3 px-4 text-right">
                          {getRatingBadge(r.rating)}
                        </td>
                        <td className="py-3 px-4 text-right space-x-1.5">
                          <button
                            onClick={() => onSelectRun(r.id, 'results')}
                            className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-[11px] font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center gap-1 cursor-pointer"
                            title="View Detailed Results"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Results</span>
                          </button>

                          <button
                            onClick={() => onSelectRun(r.id, 'live')}
                            className={`p-1 rounded cursor-pointer transition-colors ${
                              isLocust
                                ? 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                                : 'text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/40'
                            }`}
                            title={isLocust ? 'View in Locust Live Dashboard' : 'View in Grafana K6 Dashboard'}
                          >
                            {isLocust ? <MonitorPlay className="w-3.5 h-3.5" /> : <Activity className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            onClick={() => onRerunTest(r)}
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-indigo-600 dark:text-indigo-400 cursor-pointer"
                            title="Re-run Baseline"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setRunToDelete(r)}
                            className="p-1 hover:bg-rose-100 dark:hover:bg-rose-950/50 rounded text-rose-500 cursor-pointer"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-400 text-xs">
                      No historical benchmark runs match the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FEEDBACK TOAST BANNER */}
      {feedbackMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs font-semibold animate-in slide-in-from-bottom-5 duration-200 border border-slate-700 dark:border-slate-300">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{feedbackMessage}</span>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="p-1 hover:opacity-75 cursor-pointer ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* DELETE SINGLE RUN CONFIRMATION MODAL */}
      {runToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Benchmark Run</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Remove execution record from benchmark database
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRunToDelete(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
              <div className="font-bold text-slate-900 dark:text-white">{runToDelete.name}</div>
              <div className="text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-2 font-mono text-[11px]">
                <span>ID: {runToDelete.id}</span>
                <span>•</span>
                <span>{runToDelete.engine}</span>
                <span>•</span>
                <span>{runToDelete.users} VUs</span>
                <span>•</span>
                <span>P95: {runToDelete.p95Ms}ms</span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Project: <b className="text-slate-800 dark:text-slate-200">{runToDelete.projectName || 'EAII PTT Benchmark Project'}</b>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Are you sure you want to permanently delete this benchmark run? All latency percentiles, endpoint statistics, and findings will be deleted.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setRunToDelete(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteRunConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Run</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE BY PROJECT MODAL / CONFIRMATION DIALOG */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Project Benchmark History</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Permanently delete all execution runs for a specific project
                  </p>
                </div>
              </div>
              <button
                onClick={() => setProjectToDelete(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Target Project Selector in Modal */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Select Project to Delete:
              </label>
              <select
                value={projectToDelete}
                onChange={(e) => setProjectToDelete(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              >
                {allProjectNames.map(pName => {
                  const count = runs.filter(r => (r.projectName || 'EAII PTT Benchmark Project') === pName).length;
                  return (
                    <option key={pName} value={pName}>
                      {pName} ({count} {count === 1 ? 'run' : 'runs'})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Preview of Executions to be deleted */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Runs to be permanently deleted ({targetProjectRuns.length}):</span>
              </div>
              <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {targetProjectRuns.map(r => (
                  <div key={r.id} className="p-2.5 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-[11px]">{r.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{r.id} • {r.testType} • {r.users} VUs</div>
                    </div>
                    <div>
                      {getRatingBadge(r.rating)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Warning Box */}
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 rounded-xl text-xs text-rose-700 dark:text-rose-300 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Irreversible Action</span>
              </div>
              <p className="text-[11px] text-rose-600 dark:text-rose-400 leading-relaxed">
                This will delete all <b>{targetProjectRuns.length}</b> historical executions, latency percentiles, SLA gate evaluations, and findings associated with <b>"{projectToDelete}"</b>.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setProjectToDelete(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProjectConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete All {targetProjectRuns.length} Runs</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
