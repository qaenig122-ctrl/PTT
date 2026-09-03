import React, { useMemo } from 'react';
import {
  CheckCircle2,
  Clock,
  Play,
  Pause,
  SkipForward,
  Square,
  Sparkles,
  Layers,
  Zap,
  ArrowRight,
  BarChart3,
  FileText,
  RefreshCw,
  AlertCircle,
  Globe
} from 'lucide-react';
import { SequentialPlanState, TestRun, TestType } from '../types';
import { dbService } from '../lib/db';
import { testRunnerService } from '../lib/testRunner';
import { NavTab } from './Sidebar';

interface SequentialPipelineStepperProps {
  planState: SequentialPlanState;
  activeRun: TestRun | null;
  onSelectRun: (runId: string, tab?: NavTab) => void;
  onSelectTab: (tab: NavTab) => void;
}

const DEFAULT_6_TYPES: TestType[] = [
  'Load Test',
  'Stress Test',
  'Spike Test',
  'Endurance Test',
  'Volume Test',
  'Concurrency Test'
];

export const SequentialPipelineStepper: React.FC<SequentialPipelineStepperProps> = ({
  planState,
  activeRun,
  onSelectRun,
  onSelectTab
}) => {
  const projectName = planState.projectName || activeRun?.projectName || 'Performance Project';
  const planQueue = planState.plan && planState.plan.length > 0 ? planState.plan : DEFAULT_6_TYPES;

  const projectBaseUrl = useMemo(() => {
    if (activeRun?.baseUrl) return activeRun.baseUrl;
    if (planState.completedRuns) {
      const firstRun = Object.values(planState.completedRuns).find(r => r?.baseUrl);
      if (firstRun?.baseUrl) return firstRun.baseUrl;
    }
    const dbRuns = dbService.getRunsByProject(projectName);
    if (dbRuns.length > 0 && dbRuns[0].baseUrl) return dbRuns[0].baseUrl;
    return 'https://api.example.com';
  }, [activeRun, planState.completedRuns, projectName]);

  // Map each test type strictly to runs completed in this session/suite or saved in database
  const completedRunMap = useMemo(() => {
    const map = new Map<TestType, TestRun>();

    // 1. Session completed runs from testRunner
    if (planState.completedRuns) {
      Object.entries(planState.completedRuns).forEach(([type, run]) => {
        if (run && (run.status === 'COMPLETED' || run.status === 'STOPPED')) {
          map.set(type as TestType, run);
        }
      });
    }

    // 2. If activeRun just completed in this suite
    if (
      activeRun &&
      (activeRun.status === 'COMPLETED' || activeRun.status === 'STOPPED')
    ) {
      map.set(activeRun.testType, activeRun);
    }

    // 3. Database runs for this project
    const dbRuns = dbService.getRunsByProject(projectName);
    dbRuns.forEach(r => {
      if ((r.status === 'COMPLETED' || r.status === 'STOPPED') && !map.has(r.testType)) {
        map.set(r.testType, r);
      }
    });

    return map;
  }, [planState.completedRuns, planState.completedTypes, activeRun, projectName]);

  // Determine current active step index dynamically
  const activeStepIdx = useMemo(() => {
    if (activeRun && (activeRun.status === 'RUNNING' || activeRun.status === 'STARTING')) {
      const idx = planQueue.indexOf(activeRun.testType);
      if (idx >= 0) return idx;
    }
    return planState.currentIndex;
  }, [activeRun, planState.currentIndex, planQueue]);

  const isRunning = activeRun?.status === 'RUNNING' || activeRun?.status === 'STARTING';
  const isCurrentCompleted = activeRun?.status === 'COMPLETED';

  // Find the next test step in queue
  const firstWaitingIndex = planQueue.findIndex(t => !completedRunMap.has(t) && (!activeRun || activeRun.testType !== t || activeRun.status === 'COMPLETED' || activeRun.status === 'STOPPED'));
  const nextStepIndex = firstWaitingIndex >= 0 ? firstWaitingIndex : (activeStepIdx + 1 < planQueue.length ? activeStepIdx + 1 : -1);
  const nextType = nextStepIndex >= 0 ? planQueue[nextStepIndex] : null;

  // Next type configuration from SQLite
  const nextCfg = useMemo(() => {
    if (!nextType) return null;
    return dbService.getTestConfiguration(projectName, nextType);
  }, [projectName, nextType]);

  // Count how many tests in the active plan are completed (strict COMPLETED status only)
  const completedCount = useMemo(() => {
    return planQueue.filter(t => {
      const run = completedRunMap.get(t);
      return run && run.status === 'COMPLETED';
    }).length;
  }, [planQueue, completedRunMap]);

  const allCompleted = completedCount >= planQueue.length || planState.isSuiteCompleted;

  const handleStartNextNow = () => {
    if (nextStepIndex >= 0) {
      const projRuns = dbService.getRunsByProject(projectName);
      const engineToUse = activeRun?.engine || planState.engine || (projRuns[0]?.engine) || 'k6';
      testRunnerService.startPlanStep(nextStepIndex, projectName, planQueue, {
        ...(activeRun || {}),
        engine: engineToUse,
        baseUrl: projectBaseUrl
      });
      onSelectTab('live');
    } else {
      testRunnerService.skipToNextPlanTest();
    }
  };

  const handleStartStep = (stepIdx: number) => {
    const projRuns = dbService.getRunsByProject(projectName);
    const engineToUse = activeRun?.engine || planState.engine || (projRuns[0]?.engine) || 'k6';
    testRunnerService.startPlanStep(stepIdx, projectName, planQueue, {
      ...(activeRun || {}),
      engine: engineToUse,
      baseUrl: projectBaseUrl
    });
    // Retry is a real pipeline restart: immediately open the live dashboard
    // so the user can see STARTING -> RUNNING telemetry, then auto-advance
    // to the following step when this retry completes.
    onSelectTab('live');
  };

  const handlePause = () => {
    testRunnerService.pauseSequentialPlan();
  };

  const handleResume = () => {
    testRunnerService.resumeSequentialPlan();
  };

  const handleStopSuite = () => {
    testRunnerService.stopSequentialPlan();
  };

  return (
    <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Automated Sequential Test Pipeline
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                {completedCount} of {planQueue.length} Completed
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                Project: <b className="text-slate-700 dark:text-slate-300 font-semibold">{projectName}</b>
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-mono text-[11px] font-bold">
                <Globe className="w-3 h-3 text-emerald-500" />
                {projectBaseUrl}
              </span>
              <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
              <span className="hidden sm:inline">Tests execute automatically in sequence.</span>
            </div>
          </div>
        </div>

        {/* Global Pipeline Status Pill */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Screen WakeLock / Stay Awake indicator */}
          <button
            type="button"
            onClick={() => testRunnerService.setStayAwake(!planState.stayAwakeEnabled)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border cursor-pointer transition-colors ${
              planState.wakeLockActive
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                : planState.stayAwakeEnabled
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                : 'bg-slate-50 dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800 opacity-60'
            }`}
            title="Browser Wake Lock is active. When launched with run_windows.bat, the native Windows power guard also blocks system sleep while tests are running; the display may still turn off."
          >
            <span className={`w-2 h-2 rounded-full ${planState.wakeLockActive ? 'bg-indigo-500 animate-pulse' : 'bg-slate-400'}`} />
            <span>{planState.wakeLockActive ? 'Stay Awake Active' : planState.stayAwakeEnabled ? 'WakeLock Ready' : 'WakeLock Disabled'}</span>
          </button>

          {planState.isAutoAdvancing && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800 animate-pulse">
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Next Test Starting in {planState.nextAutoAdvanceSec}s</span>
            </span>
          )}

          {isRunning && !planState.isAutoAdvancing && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Step {activeStepIdx + 1} Active</span>
            </span>
          )}

          {planState.isPaused && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
              <Pause className="w-3.5 h-3.5" />
              <span>Suite Paused</span>
            </span>
          )}

          {allCompleted && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
              <span>All 6 Tests Completed</span>
            </span>
          )}
        </div>
      </div>

      {/* Auto-Advance Notification Countdown Banner */}
      {planState.isAutoAdvancing && nextType && (
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-emerald-500/10 border border-amber-300/80 dark:border-amber-700/60 flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-sm shadow-md animate-bounce">
              {planState.nextAutoAdvanceSec}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                  ⚡ Auto-Advancing to Step {(nextStepIndex >= 0 ? nextStepIndex : activeStepIdx + 1) + 1}: {nextType}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200">
                  Starts in {planState.nextAutoAdvanceSec}s
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                Current test completed. System is automatically loading configured parameters ({nextCfg?.users ?? 100} VUs, {Math.round((nextCfg?.durationSec ?? 1800) / 60)} min).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleStartNextNow}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer flex items-center gap-1.5 transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Start {nextType} Now</span>
            </button>
            <button
              onClick={handlePause}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg cursor-pointer flex items-center gap-1.5 transition-colors"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>Pause</span>
            </button>
          </div>
        </div>
      )}

      {/* Manual / Waiting Next-in-Queue Ready Action Banner (Shown when not running and next step is waiting) */}
      {!isRunning && !planState.isAutoAdvancing && !allCompleted && nextType && (
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-emerald-500/10 border border-blue-200 dark:border-blue-800/80 flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-md">
              {(nextStepIndex >= 0 ? nextStepIndex : activeStepIdx + 1) + 1}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                  ▶ Next Test Ready in Queue: Step {(nextStepIndex >= 0 ? nextStepIndex : activeStepIdx + 1) + 1} — {nextType}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-semibold">
                  {nextCfg?.users ?? 500} VUs • {Math.round((nextCfg?.durationSec ?? 1800) / 60)} min
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                Ready to continue sequential automation pipeline. Click to start immediately or resume automated progression.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleStartNextNow}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer flex items-center gap-1.5 transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Continue Pipeline: Start {nextType}</span>
            </button>
            <button
              onClick={handleResume}
              className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg cursor-pointer flex items-center gap-1.5 transition-colors"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Auto-Advance All</span>
            </button>
          </div>
        </div>
      )}

      {/* Paused Notification Banner */}
      {planState.isPaused && (
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Sequential Execution Paused
              </span>
              <span className="text-[11px] text-slate-600 dark:text-slate-300">
                You can review telemetry, adjust configurations, or resume the pipeline when ready.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResume}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer flex items-center gap-1.5 transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Resume Suite</span>
            </button>
            <button
              onClick={handleStartNextNow}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg cursor-pointer flex items-center gap-1.5 transition-colors"
            >
              <SkipForward className="w-3.5 h-3.5" />
              <span>Skip to Next</span>
            </button>
            <button
              onClick={handleStopSuite}
              className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 text-xs font-semibold rounded-lg cursor-pointer flex items-center gap-1.5 transition-colors"
            >
              <Square className="w-3.5 h-3.5" />
              <span>Stop Suite</span>
            </button>
          </div>
        </div>
      )}

      {/* Suite Completed Banner */}
      {allCompleted && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-emerald-500/10 border border-purple-300 dark:border-purple-800 flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-600 text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-extrabold text-slate-900 dark:text-white block">
                🎉 Full 6-Test Performance Benchmark Suite Completed!
              </span>
              <span className="text-[11px] text-slate-600 dark:text-slate-300">
                All 6 test types executed automatically. Complete Prometheus metrics, response percentiles, and SLA ratings are safely saved to SQLite.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectTab('reports')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer flex items-center gap-1.5 transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Executive Report</span>
            </button>
            <button
              onClick={() => onSelectTab('results')}
              className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg cursor-pointer flex items-center gap-1.5 transition-colors"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Compare Results</span>
            </button>
            <button
              onClick={() => onSelectTab('tests')}
              className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg cursor-pointer flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>New Suite</span>
            </button>
          </div>
        </div>
      )}

      {/* 6-Step Horizontal Pipeline Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
        {planQueue.map((testType, idx) => {
          const completedRun = completedRunMap.get(testType);
          const isDone = !!completedRun;
          const isCurrentRun = activeRun?.testType === testType && (isRunning || isCurrentCompleted);
          const isNextToStart = (planState.isAutoAdvancing && nextType === testType) || (!isRunning && !isDone && nextType === testType);
          const stepNumber = idx + 1;

          // Target configuration
          const cfg = dbService.getTestConfiguration(projectName, testType);
          const defaultUsers: Record<TestType, number> = {
            'Load Test': 100,
            'Stress Test': 500,
            'Spike Test': 1000,
            'Endurance Test': 50,
            'Volume Test': 150,
            'Concurrency Test': 250
          };
          const defaultDuration: Record<TestType, number> = {
            'Load Test': 1800,
            'Stress Test': 1800,
            'Spike Test': 600,
            'Endurance Test': 3600,
            'Volume Test': 2700,
            'Concurrency Test': 900
          };
          const usersCount = cfg?.users ?? defaultUsers[testType] ?? 100;
          const durationMins = Math.round((cfg?.durationSec ?? defaultDuration[testType] ?? 1800) / 60);

          return (
            <div
              key={testType}
              onClick={() => {
                if (completedRun) {
                  onSelectRun(completedRun.id, 'results');
                } else if (!isRunning) {
                  handleStartStep(idx);
                }
              }}
              title={
                isDone
                  ? `Click to inspect ${testType} results in Results tab`
                  : !isRunning
                  ? `Click to start ${testType} (Step ${stepNumber}) immediately`
                  : undefined
              }
              className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between group ${
                isCurrentRun && isRunning
                  ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 ring-2 ring-indigo-500/30'
                  : isNextToStart && planState.isAutoAdvancing
                  ? 'border-amber-400 bg-amber-50/50 dark:bg-amber-950/30 ring-2 ring-amber-500/30'
                  : isDone
                  ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20 hover:border-emerald-400 cursor-pointer shadow-2xs'
                  : !isRunning
                  ? 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-xs cursor-pointer'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/30 opacity-75'
              }`}
            >
              <div>
                {/* Step # and Status Indicator */}
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    STEP {stepNumber}
                  </span>

                  {isDone && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 fill-emerald-100 dark:fill-emerald-950" />
                      <span>Done</span>
                    </span>
                  )}

                  {isCurrentRun && isRunning && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                      <span>Live</span>
                    </span>
                  )}

                  {isNextToStart && planState.isAutoAdvancing && (
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 animate-pulse">
                      In {planState.nextAutoAdvanceSec}s
                    </span>
                  )}

                  {!isDone && !isCurrentRun && !planState.isAutoAdvancing && (
                    <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                      {!isRunning ? (
                        <span className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:font-bold transition-colors">
                          Ready ▶
                        </span>
                      ) : (
                        'Waiting'
                      )}
                    </span>
                  )}
                </div>

                {/* Test Name */}
                <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {testType}
                </h4>

                {/* Specs */}
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                  {usersCount} VUs • {durationMins}m
                </p>
              </div>

              {/* Status Footer */}
              <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                {isCurrentRun && activeRun?.status === 'STARTING' ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                        STARTING TEST...
                      </span>
                      <span className="font-mono font-bold text-slate-600 dark:text-slate-400">
                        {activeRun?.users} VUs
                      </span>
                    </div>
                    <div className="text-[9px] text-slate-500 dark:text-slate-400">Live dashboard opening — test will continue automatically.</div>
                  </div>
                ) : isDone && completedRun ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px]">
                      {completedRun.status === 'STOPPED' ? (
                        <span className="font-bold px-1.5 py-0.2 rounded text-[9px] bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                          STOPPED
                        </span>
                      ) : (
                        <span className={`font-bold px-1.5 py-0.2 rounded text-[9px] ${
                          completedRun.rating === 'EXCELLENT'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : completedRun.rating === 'GOOD' || completedRun.rating === 'VERY GOOD'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                            : completedRun.rating === 'WARNING'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}>
                          {completedRun.rating}
                        </span>
                      )}
                      <span className="font-mono font-bold text-slate-600 dark:text-slate-400">
                        P95: {completedRun.p95Ms}ms
                      </span>
                    </div>

                    {/* Direct Quick Action Buttons for Completed Phase */}
                    <div className="flex items-center gap-1 pt-1" onClick={(e) => e.stopPropagation()}>
                      {completedRun.status === 'STOPPED' ? (
                        <>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartStep(idx);
                            }}
                            className="flex-1 py-1 px-1.5 rounded-md bg-amber-600 hover:bg-amber-700 text-white text-[9px] font-bold flex items-center justify-center gap-1 shadow-2xs cursor-pointer transition-colors"
                            title={`Restart ${testType} from the beginning, monitor it live, then continue automatically`}
                          >
                            <RefreshCw className="w-2.5 h-2.5" />
                            <span>Retry &amp; Continue</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectRun(completedRun.id, 'reports');
                            }}
                            className="flex-1 py-1 px-1.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[9px] font-bold flex items-center justify-center gap-1 border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors"
                            title={`View partial report for stopped ${testType}`}
                          >
                            <FileText className="w-2.5 h-2.5" />
                            <span>Partial</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectRun(completedRun.id, 'reports');
                            }}
                            className="flex-1 py-1 px-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-[9px] font-bold flex items-center justify-center gap-1 shadow-2xs cursor-pointer transition-colors"
                            title={`View interactive executive report for ${testType}`}
                          >
                            <FileText className="w-2.5 h-2.5" />
                            <span>Report</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectRun(completedRun.id, 'results');
                            }}
                            className="flex-1 py-1 px-1.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[9px] font-bold flex items-center justify-center gap-1 border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors"
                            title={`Inspect telemetry & metrics for ${testType}`}
                          >
                            <BarChart3 className="w-2.5 h-2.5 text-indigo-500" />
                            <span>Results</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ) : isCurrentRun && isRunning ? (
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      {activeRun?.users} VUs Live
                    </span>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                      {Math.round(activeRun?.rps || 0)} RPS
                    </span>
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-400 italic">
                    {isNextToStart && planState.isAutoAdvancing ? (
                      'Auto-starting next...'
                    ) : !isRunning ? (
                      <span className="text-indigo-600 dark:text-indigo-400 font-semibold group-hover:underline">
                        Click to start now
                      </span>
                    ) : (
                      'Waiting in queue'
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
