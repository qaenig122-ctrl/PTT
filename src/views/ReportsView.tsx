import React, { useMemo, useState } from 'react';
import {
  Download,
  FileText,
  CheckCircle2,
  Layers,
  FolderGit2,
  LayoutGrid,
  ShieldCheck,
  AlertTriangle,
  Archive,
  FileArchive,
  Activity,
  Filter,
  Tag,
  Trash2,
  X,
  Globe
} from 'lucide-react';
import { TestRun, TestType } from '../types';
import { evaluateSystem } from '../lib/evaluator';
import {
  buildIndividualReport,
  buildProjectSummary,
  buildProjectZipBundle,
  buildIndividualZipBundle,
  testDescriptions
} from '../lib/reportGenerator';
import { notificationService } from '../lib/notificationService';
import { ReportDashboardBody } from '../components/ReportDashboardBody';

interface ReportsViewProps {
  runs: TestRun[];
  selectedRunId: string | null;
  onSelectRunId: (id: string) => void;
  onDeleteProject?: (projectName: string) => void;
  onDeleteRun?: (runId: string) => void;
}

const ALL_TEST_TYPES: TestType[] = [
  'Load Test',
  'Stress Test',
  'Spike Test',
  'Endurance Test',
  'Volume Test',
  'Concurrency Test'
];

export const ReportsView: React.FC<ReportsViewProps> = ({
  runs,
  selectedRunId,
  onSelectRunId,
  onDeleteProject,
  onDeleteRun
}) => {
  const [downloading, setDownloading] = useState(false);
  const [downloadType, setDownloadType] = useState<string>('');
  const [viewMode, setViewMode] = useState<'individual' | 'consolidated'>('individual');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

  // Extract all distinct projects
  const projects = useMemo(() => {
    const map = new Map<string, TestRun[]>();
    for (const r of runs) {
      const pName = r.projectName || 'EAII PTT Benchmark Project';
      if (!map.has(pName)) map.set(pName, []);
      map.get(pName)!.push(r);
    }

    return Array.from(map.entries()).map(([name, pRuns]) => {
      const sorted = [...pRuns].sort((a, b) => (a.sequenceIndex ?? 0) - (b.sequenceIndex ?? 0));
      const totalReqs = sorted.reduce((sum, r) => sum + r.requests, 0);
      const total5xx = sorted.reduce((sum, r) => sum + r.status5xx, 0);
      const uniqueTestTypes = Array.from(new Set(sorted.map((r) => r.testType)));
      const avgScore = sorted.length
        ? sorted.reduce(
            (sum, r) =>
              sum +
              (r.dynamicEvaluation?.overallScore ??
                evaluateSystem(
                  r.p95Ms,
                  r.p99Ms,
                  r.avgResponseMs,
                  r.errorRate,
                  r.endpointResults,
                  r.thresholds,
                  r.testType,
                  r.engine,
                  r.timeline,
                  r.rps
                ).overallScore),
            0
          ) / sorted.length
        : 0;

      const rating =
        avgScore >= 90
          ? 'EXCELLENT'
          : avgScore >= 75
          ? 'GOOD'
          : avgScore >= 60
          ? 'WARNING'
          : 'CRITICAL';

      return {
        name,
        baseUrl: sorted[0]?.baseUrl || 'https://api.example.com',
        runs: sorted,
        uniqueTestTypes,
        totalRequests: totalReqs,
        total5xx,
        avgScore,
        rating,
        lastRunAt: sorted[sorted.length - 1]?.startedAt || 'Recently'
      };
    });
  }, [runs]);

  // Global counts per test type
  const testTypeCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: runs.length };
    for (const t of ALL_TEST_TYPES) {
      counts[t] = runs.filter((r) => r.testType === t).length;
    }
    return counts;
  }, [runs]);

  // Current active project
  const currentRun = runs.find((r) => r.id === selectedRunId) || runs[0];
  const activeProjectName = currentRun?.projectName || projects[0]?.name || 'EAII PTT Benchmark Project';
  const activeProject = projects.find((p) => p.name === activeProjectName) || projects[0];

  const projectRuns = activeProject?.runs || [];

  // Filtered runs within active project or globally
  const displayedProjectRuns = useMemo(() => {
    if (selectedTypeFilter === 'ALL') return projectRuns;
    return projectRuns.filter((r) => r.testType === selectedTypeFilter);
  }, [projectRuns, selectedTypeFilter]);

  const handleSelectTestTypeFilter = (filterType: string) => {
    setSelectedTypeFilter(filterType);
    if (filterType === 'ALL') {
      return;
    }
    // If the currently selected run already matches this filter, switch to individual view
    if (currentRun && currentRun.testType === filterType) {
      setViewMode('individual');
      return;
    }
    // Look in current active project first
    const matchingInActiveProject = projectRuns.find((r) => r.testType === filterType);
    if (matchingInActiveProject) {
      onSelectRunId(matchingInActiveProject.id);
      setViewMode('individual');
      return;
    }
    // Otherwise look across all projects for any run matching this test type
    const anyMatchingRun = runs.find((r) => r.testType === filterType);
    if (anyMatchingRun) {
      onSelectRunId(anyMatchingRun.id);
      setViewMode('individual');
    }
  };

  const handleSelectProject = (projName: string) => {
    const targetProject = projects.find((p) => p.name === projName);
    if (targetProject && targetProject.runs.length > 0) {
      if (selectedTypeFilter !== 'ALL') {
        const matchingRun = targetProject.runs.find((r) => r.testType === selectedTypeFilter);
        if (matchingRun) {
          onSelectRunId(matchingRun.id);
          setViewMode('individual');
          return;
        }
      }
      onSelectRunId(targetProject.runs[0].id);
      setViewMode('individual');
    }
  };

  const download = (blob: Blob, name: string) => {
    const u = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = u;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(u), 1000);
  };

  const getLogo = async () => {
    try {
      const r = await fetch('/logo.png');
      const b = await r.blob();
      return await new Promise<string>((res) => {
        const f = new FileReader();
        f.onload = () => res(String(f.result));
        f.readAsDataURL(b);
      });
    } catch {
      return '';
    }
  };

  const downloadOne = async (run: TestRun) => {
    setDownloading(true);
    setDownloadType('html');
    try {
      const logo = await getLogo();
      const sanitizedName = (run.projectName || run.name).replace(/[^a-zA-Z0-9_-]/g, '_');
      const sanitizedType = (run.testType || 'Load_Test').replace(/[^a-zA-Z0-9_-]/g, '_');
      download(
        new Blob([buildIndividualReport(run, logo)], { type: 'text/html' }),
        `EAII_PTT_${sanitizedName}_${sanitizedType}_Report.html`
      );
      notificationService.push({
        type: 'complete',
        title: '📄 HTML Report Downloaded',
        message: `Interactive standalone HTML report for "${run.projectName || run.name}" (${run.testType}) downloaded.`,
        projectName: run.projectName
      });
    } finally {
      setDownloading(false);
      setDownloadType('');
    }
  };

  const downloadOneZip = async (run: TestRun) => {
    setDownloading(true);
    setDownloadType('zip-phase');
    try {
      const logo = await getLogo();
      const sanitizedName = (run.projectName || run.name).replace(/[^a-zA-Z0-9_-]/g, '_');
      const sanitizedType = (run.testType || 'Load_Test').replace(/[^a-zA-Z0-9_-]/g, '_');
      const zipBlob = await buildIndividualZipBundle(run, logo);
      download(zipBlob, `EAII_PTT_${sanitizedName}_${sanitizedType}_Report.zip`);
      notificationService.push({
        type: 'complete',
        title: '📦 ZIP Archive Downloaded',
        message: `ZIP archive with ${run.testType} standalone HTML report downloaded.`,
        projectName: run.projectName
      });
    } catch (err) {
      console.error('Failed to create ZIP bundle:', err);
    } finally {
      setDownloading(false);
      setDownloadType('');
    }
  };

  const downloadProjectSummaryHtml = async () => {
    setDownloading(true);
    setDownloadType('consolidated-html');
    try {
      const logo = await getLogo();
      const sanitizedName = activeProjectName.replace(/[^a-zA-Z0-9_-]/g, '_');
      download(
        new Blob([buildProjectSummary(activeProjectName, projectRuns, logo)], { type: 'text/html' }),
        `EAII_PTT_${sanitizedName}_Consolidated_Report.html`
      );
      notificationService.push({
        type: 'complete',
        title: '📄 Consolidated Project HTML Downloaded',
        message: `Downloaded consolidated benchmark report for "${activeProjectName}".`,
        projectName: activeProjectName
      });
    } finally {
      setDownloading(false);
      setDownloadType('');
    }
  };

  const downloadProjectZip = async () => {
    setDownloading(true);
    setDownloadType('project-zip');
    try {
      const logo = await getLogo();
      const sanitizedName = activeProjectName.replace(/[^a-zA-Z0-9_-]/g, '_');
      const zipBlob = await buildProjectZipBundle(activeProjectName, projectRuns, logo);
      download(zipBlob, `EAII_PTT_${sanitizedName}_Test_Reports.zip`);
      notificationService.push({
        type: 'complete',
        title: '📦 Project ZIP Suite Downloaded',
        message: `ZIP archive downloaded with only HTML reports for each test type (${projectRuns.map(r => r.testType).join(', ')}).`,
        projectName: activeProjectName
      });
    } catch (err) {
      console.error('Failed to create project ZIP suite:', err);
    } finally {
      setDownloading(false);
      setDownloadType('');
    }
  };

  if (!currentRun || !activeProject) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <FileText className="mx-auto w-12 h-12 text-slate-300 dark:text-slate-600" />
        <h3 className="mt-3 font-bold text-base text-slate-900 dark:text-white">No Project Reports Available</h3>
        <p className="text-xs text-slate-500 mt-1">Complete a benchmark run to view and export reports.</p>
      </div>
    );
  }

  return (
    <div id="reports-view" className="space-y-6 animate-in fade-in duration-300">
      {/* 1. TEST TYPE CATEGORIZATION FILTER BAR */}
      <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-xs font-black tracking-wider text-slate-700 dark:text-slate-300 uppercase">
              Categorize Reports By Test Type
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">
            Filter all project benchmark reports by execution test type
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleSelectTestTypeFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedTypeFilter === 'ALL'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <span>All Test Types</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
              selectedTypeFilter === 'ALL'
                ? 'bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}>
              {testTypeCounts['ALL'] || 0}
            </span>
          </button>

          {ALL_TEST_TYPES.map((t) => {
            const count = testTypeCounts[t] || 0;
            const isSelected = selectedTypeFilter === t;
            return (
              <button
                key={t}
                onClick={() => handleSelectTestTypeFilter(t)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-2xs ring-2 ring-indigo-400/40'
                    : count > 0
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50'
                    : 'bg-slate-100 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500 opacity-60'
                }`}
              >
                <span>{t}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  isSelected
                    ? 'bg-white/20 text-white'
                    : 'bg-indigo-200/60 dark:bg-indigo-800/60 text-indigo-800 dark:text-indigo-200'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {selectedTypeFilter !== 'ALL' && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/70 flex items-center justify-between text-xs">
            <span className="text-indigo-700 dark:text-indigo-300 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
              Filtered by Test Type: <b>{selectedTypeFilter}</b> ({displayedProjectRuns.length} matching in active project, {testTypeCounts[selectedTypeFilter] || 0} total)
            </span>
            <button
              onClick={() => handleSelectTestTypeFilter('ALL')}
              className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline font-medium cursor-pointer"
            >
              Reset to All Types
            </button>
          </div>
        )}
      </div>

      {/* 2. PROJECT SELECTOR CARDS RIBBON (Organized By Project) */}
      <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-xs font-black tracking-wider text-slate-700 dark:text-slate-300 uppercase">
              Projects &amp; Benchmark Suites ({projects.length})
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">
            Select a project to explore its test benchmark reports
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {projects.map((proj) => {
            const isSelected = proj.name === activeProjectName;
            return (
              <button
                key={proj.name}
                onClick={() => handleSelectProject(proj.name)}
                className={`p-4 rounded-xl text-left transition-all border cursor-pointer flex flex-col justify-between gap-3 ${
                  isSelected
                    ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 ring-2 ring-blue-500/20'
                    : 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-1">
                        {proj.name}
                      </h4>
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-mono text-[9px] font-bold">
                        <Globe className="w-2.5 h-2.5 text-emerald-500" />
                        {proj.baseUrl}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {proj.runs.length} test phase{proj.runs.length > 1 ? 's' : ''} executed
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-black uppercase flex-shrink-0 ${
                      proj.rating === 'EXCELLENT'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : proj.rating === 'GOOD'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {proj.rating}
                  </span>
                </div>

                {/* Categorized Test Types in this project */}
                <div className="flex flex-wrap items-center gap-1">
                  {proj.uniqueTestTypes.map((tType) => (
                    <span
                      key={tType}
                      className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                    >
                      {tType}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-slate-600 dark:text-slate-400">
                  <span>Score: <b className="text-slate-900 dark:text-white">{proj.avgScore.toFixed(0)}/100</b></span>
                  <span>{proj.totalRequests.toLocaleString()} reqs</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. ACTIVE PROJECT HEADER & HTML EXPORT */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1117] p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <img
              src="/logo.png"
              alt="EAII PTT Logo"
              className="w-13 h-13 rounded-2xl object-cover shadow-sm border border-slate-200 dark:border-slate-700/80 flex-shrink-0"
            />
            <div>
              <div className="text-[10px] font-black tracking-[.18em] text-blue-600 dark:text-blue-400 uppercase">
                Active Project Benchmark Suite
              </div>
              <div className="flex flex-wrap items-center gap-2.5 mt-0.5">
                <h1 className="text-xl lg:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  {activeProjectName}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-mono text-xs font-bold">
                  <Globe className="w-3.5 h-3.5 text-emerald-500" />
                  Target URL: {activeProject.baseUrl}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
                <span><b>{projectRuns.length}</b> Phase{projectRuns.length > 1 ? 's' : ''}</span>
                <span>•</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {activeProject.uniqueTestTypes.join(', ')}
                </span>
                <span>•</span>
                <span><b>{activeProject.totalRequests.toLocaleString()}</b> Total Requests</span>
                <span>•</span>
                <span>Average Score: <b className="text-blue-600 dark:text-blue-400">{activeProject.avgScore.toFixed(0)} / 100</b></span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Project ZIP Suite Download Button */}
            <button
              onClick={downloadProjectZip}
              disabled={downloading}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-60 transition-all"
              title="Download ZIP containing only the HTML reports for each test type"
            >
              <Archive className="w-4 h-4" />
              <span>
                {downloading && downloadType === 'project-zip'
                  ? 'Packing ZIP…'
                  : 'Download Project ZIP (HTMLs Only)'}
              </span>
            </button>

            {/* Standalone HTML Report Button */}
            {viewMode === 'individual' ? (
              <button
                onClick={() => downloadOne(currentRun)}
                disabled={downloading}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-60 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>
                  {downloading && downloadType === 'html'
                    ? 'Exporting HTML…'
                    : 'Download Phase HTML'}
                </span>
              </button>
            ) : (
              <button
                onClick={downloadProjectSummaryHtml}
                disabled={downloading}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-60 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>
                  {downloading && downloadType === 'consolidated-html'
                    ? 'Exporting HTML…'
                    : 'Download Consolidated HTML'}
                </span>
              </button>
            )}

            {/* Phase ZIP download when viewing individual phase */}
            {viewMode === 'individual' && (
              <button
                onClick={() => downloadOneZip(currentRun)}
                disabled={downloading}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center gap-1.5 text-slate-700 dark:text-slate-200 cursor-pointer transition-colors"
                title="Download single phase ZIP archive"
              >
                <FileArchive className="w-3.5 h-3.5 text-indigo-500" />
                <span>
                  {downloading && downloadType === 'zip-phase'
                    ? 'Zipping…'
                    : 'Download Phase ZIP'}
                </span>
              </button>
            )}

            {viewMode === 'individual' && projectRuns.length > 1 && (
              <button
                onClick={downloadProjectSummaryHtml}
                disabled={downloading}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center gap-1.5 text-slate-700 dark:text-slate-200 cursor-pointer transition-colors"
                title="Download consolidated multi-phase HTML summary"
              >
                <FileText className="w-3.5 h-3.5 text-blue-500" />
                <span>Consolidated HTML</span>
              </button>
            )}

            {onDeleteProject && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-800 text-xs font-bold flex items-center gap-1.5 text-rose-600 dark:text-rose-400 cursor-pointer transition-colors"
                title={`Delete all ${projectRuns.length} runs for project "${activeProject.name}"`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Project Runs</span>
              </button>
            )}
          </div>
        </div>

        {/* PROJECT TEST PHASES NAVIGATION TABS */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setViewMode('consolidated')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
              viewMode === 'consolidated'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Consolidated Project Summary</span>
          </button>

          {(selectedTypeFilter === 'ALL' ? projectRuns : displayedProjectRuns).map((r, idx) => {
            const isRunActive = viewMode === 'individual' && r.id === currentRun.id;
            const phaseNumber = r.sequenceIndex ?? idx + 1;
            return (
              <button
                key={r.id}
                onClick={() => {
                  onSelectRunId(r.id);
                  setViewMode('individual');
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                  isRunActive
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs ring-2 ring-indigo-500/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>Phase {phaseNumber} · <b className={isRunActive ? '' : 'text-indigo-600 dark:text-indigo-400'}>{r.testType}</b></span>
                {r.status === 'STOPPED' ? (
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    STOPPED
                  </span>
                ) : (
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-black ${
                    r.rating === 'EXCELLENT'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : r.rating === 'GOOD'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {r.rating}
                  </span>
                )}
              </button>
            );
          })}

          {selectedTypeFilter !== 'ALL' && displayedProjectRuns.length < projectRuns.length && (
            <button
              onClick={() => handleSelectTestTypeFilter('ALL')}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 bg-slate-200/60 dark:bg-slate-800/80 cursor-pointer transition-colors"
            >
              + Show All {projectRuns.length} Phases
            </button>
          )}
        </div>
      </div>

      {/* 4. REPORT CONTENT: CONSOLIDATED OR INDIVIDUAL */}
      {viewMode === 'consolidated' ? (
        /* CONSOLIDATED PROJECT SUMMARY VIEW */
        <div className="space-y-6">
          {/* Top 4 KPI Cards for Project */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center gap-4">
              <div className="w-13 h-13 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  TOTAL REQUESTS
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                  {activeProject.totalRequests.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center gap-4">
              <div className="w-13 h-13 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  COMPLETED PHASES
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                  {projectRuns.length}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center gap-4">
              <div className="w-13 h-13 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-100 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  TOTAL 5XX ERRORS
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                  {activeProject.total5xx.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center gap-4">
              <div className="w-13 h-13 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  PROJECT RATING
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                  {activeProject.rating}
                </div>
              </div>
            </div>
          </div>

          {/* Project Benchmark Comparison Table Categorized By Test Type */}
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Project Benchmark Phase Comparison by Test Type
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Comprehensive performance breakdown of each phase categorized by its test type
                </p>
              </div>
              <span className="text-xs font-bold text-slate-500">
                Showing {displayedProjectRuns.length} of {projectRuns.length} Phase(s)
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-semibold text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Phase</th>
                    <th className="py-3 px-4">Test Type</th>
                    <th className="py-3 px-4">Workload</th>
                    <th className="py-3 px-4">Engine</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Rating</th>
                    <th className="py-3 px-4 text-right">Requests</th>
                    <th className="py-3 px-4 text-right">RPS</th>
                    <th className="py-3 px-4 text-right">P95 (ms)</th>
                    <th className="py-3 px-4 text-right">Error Rate</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {displayedProjectRuns.map((r, idx) => {
                    const diag =
                      r.dynamicEvaluation ||
                      evaluateSystem(
                        r.p95Ms,
                        r.p99Ms,
                        r.avgResponseMs,
                        r.errorRate,
                        r.endpointResults,
                        r.thresholds,
                        r.testType,
                        r.engine,
                        r.timeline,
                        r.rps
                      );
                    return (
                      <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-bold text-blue-600">Phase {idx + 1}</td>
                        <td className="py-3 px-4">
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-black bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 inline-block font-sans">
                            {r.testType}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                          {r.users} VUs • {r.duration}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase">
                            {r.engine}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">{diag.overallScore.toFixed(0)} / 100</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            diag.overallRating === 'EXCELLENT' || diag.overallRating === 'VERY GOOD'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : diag.overallRating === 'GOOD'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          }`}>
                            {diag.overallRating}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">{r.requests.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right font-bold text-emerald-600">{r.rps}</td>
                        <td className="py-3 px-4 text-right font-bold text-amber-500">{r.p95Ms}</td>
                        <td className={`py-3 px-4 text-right font-bold ${r.errorRate > 0 ? 'text-rose-500' : 'text-slate-500'}`}>
                          {r.errorRate.toFixed(2)}%
                        </td>
                        <td className="py-3 px-4 text-right font-sans">
                          <button
                            onClick={() => {
                              onSelectRunId(r.id);
                              setViewMode('individual');
                            }}
                            className="px-2.5 py-1 rounded bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 font-bold text-[11px] cursor-pointer"
                          >
                            View Full Report →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Test Types Catalog & Objectives Card */}
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4 text-indigo-600" />
              <span>Test Type Categorization &amp; Methodology</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Standardized performance testing types evaluated within EAII PTT benchmarks:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {ALL_TEST_TYPES.map((t) => {
                const count = projectRuns.filter((r) => r.testType === t).length;
                return (
                  <div
                    key={t}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-extrabold text-xs text-indigo-600 dark:text-indigo-400">
                          {t}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-200/70 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                          {count} phase{count !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                        {testDescriptions[t]}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* INDIVIDUAL PHASE FORMAL REPORT */
        <ReportDashboardBody
          run={currentRun}
          onDownloadHtml={() => downloadOne(currentRun)}
        />
      )}
      {/* IN-APP CONFIRMATION MODAL FOR DELETING PROJECT */}
      {showDeleteModal && activeProject && onDeleteProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Project Benchmark History</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Permanently delete all runs for this project
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
              <div className="font-bold text-slate-900 dark:text-white">{activeProject.name}</div>
              <div className="text-slate-500 dark:text-slate-400 font-medium">
                Contains <b className="text-rose-600 dark:text-rose-400">{projectRuns.length}</b> benchmark test run{projectRuns.length === 1 ? '' : 's'} across {activeProject.uniqueTestTypes.join(', ')}.
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Are you sure you want to permanently delete all benchmark test executions for <b>"{activeProject.name}"</b>? All metrics, SLA gate scores, and findings will be deleted from the database.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteProject(activeProject.name);
                  setShowDeleteModal(false);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete All {projectRuns.length} Runs</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
