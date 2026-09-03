import React, { useState, useEffect } from 'react';
import { Sidebar, NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { OverviewView } from './views/OverviewView';
import { TestBuilderView } from './views/TestBuilderView';
import { LiveMonitoringView } from './views/LiveMonitoringView';
import { ResultsView } from './views/ResultsView';
import { ReportsView } from './views/ReportsView';
import { HistoryView } from './views/HistoryView';
import { SettingsView } from './views/SettingsView';
import { NotificationToast } from './components/NotificationToast';
import { dbService } from './lib/db';
import { testRunnerService } from './lib/testRunner';
import { TestRun, AppSettings, TestType } from './types';
import { generateStagesForTestType } from './lib/k6Generator';

interface AppErrorBoundaryProps {
  children: React.ReactNode;
}

interface AppErrorBoundaryState {
  error: Error | null;
}

class AppErrorBoundary extends React.Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  constructor(props: AppErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
          <div className="max-w-xl w-full rounded-2xl border border-red-200 dark:border-red-900 bg-white dark:bg-slate-900 p-6 shadow-xl">
            <h1 className="text-xl font-semibold text-red-600 dark:text-red-400">EAII PTT could not start</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">The application hit a startup error instead of showing a blank page.</p>
            <pre className="mt-4 overflow-auto rounded-lg bg-slate-100 dark:bg-slate-950 p-3 text-xs">{this.state.error.message}</pre>
            <button className="mt-4 rounded-lg px-4 py-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900" onClick={() => location.reload()}>Reload</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem('eaii_sidebar_collapsed');
    return saved === 'true';
  });
  const [runs, setRuns] = useState<TestRun[]>(() => dbService.getRuns());
  const [activeRun, setActiveRun] = useState<TestRun | null>(null);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(() => {
    const list = dbService.getRuns();
    return list.length > 0 ? list[0].id : null;
  });
  const [settings, setSettings] = useState<AppSettings>(() => dbService.getSettings());
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('eaii_dark_mode');
    return saved !== null ? saved === 'true' : true; // Default to dark mode first
  });

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('eaii_sidebar_collapsed', String(next));
      return next;
    });
  };

  // Sync dark mode class on document root
  useEffect(() => {
    document.title = 'EAII Performance Testing Tool';
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('eaii_dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('eaii_dark_mode', 'false');
    }
  }, [darkMode]);

  // Track if user explicitly selected a run in Reports/Results/History
  const [userSelectedRunId, setUserSelectedRunId] = useState<string | null>(null);

  // Subscribe to test runner updates
  useEffect(() => {
    const unsubscribe = testRunnerService.subscribe((updatedRun) => {
      setActiveRun(updatedRun ? { ...updatedRun } : null);
      if (updatedRun) {
        setRuns(dbService.getRuns());
        // Only auto-switch selectedRunId if user hasn't explicitly chosen to inspect another completed report
        setSelectedRunId((prevSelected) => {
          if (!prevSelected) return updatedRun.id;
          return prevSelected;
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // Explicit manual start only. App launch never starts/resumes a benchmark and never opens a browser.
  const handleStartTest = (newRunConfig: TestRun) => {
    testRunnerService.startTest(newRunConfig);
    setRuns(dbService.getRuns());
    setSelectedRunId(newRunConfig.id);
    setCurrentTab('live');
  };

  const handleStopTest = () => {
    testRunnerService.stopTest();
    setRuns(dbService.getRuns());
  };

  const handleContinueNextTest = (current: TestRun) => {
    const plan = current.projectTestPlan || [current.testType];
    const nextIndex = Math.max(0, (current.sequenceIndex ?? plan.indexOf(current.testType))) + 1;
    const nextType = plan[nextIndex];
    if (!nextType) return;
    const runId = `RUN-${Math.floor(100 + Math.random() * 900)}`;
    const stored = dbService.getTestConfiguration(current.projectName || 'EAII PTT Performance Project', nextType);
    const users = stored?.users ?? current.users;
    const spawnRate = stored?.spawnRate ?? current.spawnRate ?? 10;
    const durationSec = stored?.durationSec ?? current.durationSec;
    const rampUpSec = stored?.rampUpSec ?? current.rampUpSec;
    const nextRun: TestRun = {
      ...current,
      id: runId,
      projectName: current.projectName,
      projectTestPlan: plan,
      sequenceIndex: nextIndex,
      name: `${nextType} — ${current.projectName || current.name}`,
      testType: nextType,
      users,
      spawnRate,
      durationSec,
      rampUpSec,
      duration: `${Math.round(durationSec/60)} min`,
      rampUp: `${Math.max(0.1, rampUpSec/60)} min`,
      stages: generateStagesForTestType(nextType, users, durationSec, rampUpSec),
      startedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      startTimestamp: Date.now(),
      elapsedSec: 0,
      finishedAt: undefined,
      status: 'CREATED',
      requests: 0, rps: 0, avgResponseMs: 0, p90Ms: 0, p95Ms: 0, p99Ms: 0, maxMs: 0,
      errorRate: 0, status2xx: 0, status4xx: 0, status5xx: 0, rating: 'EXCELLENT',
      endpointResults: [], errors: [], timeline: [], logs: []
    };
    handleStartTest(nextRun);
  };

  const handleRerunTest = (templateRun: TestRun) => {
    const rerunConfig: TestRun = {
      ...templateRun,
      id: `RUN-${Math.floor(100 + Math.random() * 900)}`,
      name: `${templateRun.name} (Rerun)`,
      startedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      startTimestamp: Date.now(),
      elapsedSec: 0,
      finishedAt: undefined,
      status: 'CREATED',
      requests: 0,
      rps: 0,
      avgResponseMs: 0,
      p90Ms: 0,
      p95Ms: 0,
      p99Ms: 0,
      maxMs: 0,
      errorRate: 0,
      status2xx: 0,
      status4xx: 0,
      status5xx: 0,
      endpointResults: [],
      errors: [],
      timeline: [],
      logs: []
    };

    handleStartTest(rerunConfig);
  };

  const handleSelectRun = (runId: string, targetTab?: NavTab) => {
    setSelectedRunId(runId);
    if (targetTab) {
      setCurrentTab(targetTab);
    }
  };

  const handleDeleteRun = (runId: string) => {
    dbService.deleteRun(runId);
    const remaining = dbService.getRuns();
    setRuns(remaining);
    if (selectedRunId === runId) {
      setSelectedRunId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const handleDeleteRunsByProject = (projectName: string) => {
    dbService.deleteRunsByProject(projectName);
    const remaining = dbService.getRuns();
    setRuns(remaining);
    if (remaining.length > 0) {
      if (!remaining.some(r => r.id === selectedRunId)) {
        setSelectedRunId(remaining[0].id);
      }
    } else {
      setSelectedRunId(null);
    }
  };

  const handleSaveSettings = (newSettings: AppSettings) => {
    dbService.saveSettings(newSettings);
    setSettings(newSettings);
  };

  const handleResetSampleData = () => {
    dbService.resetToDefaults();
    const updated = dbService.getRuns();
    setRuns(updated);
    setSelectedRunId(updated.length > 0 ? updated[0].id : null);
  };

  return (
    <div id="eaii-ptt-root" className="min-h-screen bg-[#f8fafc] dark:bg-[#07090e] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        activeRun={activeRun}
        isDarkMode={darkMode}
        onToggleTheme={() => setDarkMode(!darkMode)}
        onNewTestClick={() => setCurrentTab('tests')}
        onOpenSidebar={() => setMobileSidebarOpen(true)}
        isSidebarCollapsed={sidebarCollapsed}
        onToggleCollapseSidebar={toggleSidebarCollapse}
        onSelectRunId={handleSelectRun}
      />

      {/* Global Real-time Notification Toast System */}
      <NotificationToast
        onNavigate={(runId, tab) => handleSelectRun(runId, tab)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          isTestRunning={!!activeRun && activeRun.status === 'RUNNING'}
          isOpen={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapse}
        />

        {/* Main Application Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {currentTab === 'overview' && (
              <OverviewView
                runs={runs}
                activeRun={activeRun}
                onSelectTab={setCurrentTab}
                onSelectRun={handleSelectRun}
              />
            )}

            {currentTab === 'tests' && (
              <TestBuilderView
                onStartTest={handleStartTest}
                onCancel={() => setCurrentTab('overview')}
              />
            )}

            {currentTab === 'live' && (
              <LiveMonitoringView
                activeRun={activeRun}
                onStopTest={handleStopTest}
                onSelectTab={setCurrentTab}
                onSelectRun={handleSelectRun}
              />
            )}

            {currentTab === 'results' && (
              <ResultsView
                runs={runs}
                selectedRunId={selectedRunId}
                onSelectRunId={setSelectedRunId}
                onSelectTab={setCurrentTab}
                onRerunTest={handleRerunTest}
                onContinueNextTest={handleContinueNextTest}
              />
            )}

            {currentTab === 'reports' && (
              <ReportsView
                runs={runs}
                selectedRunId={selectedRunId}
                onSelectRunId={setSelectedRunId}
                onDeleteProject={handleDeleteRunsByProject}
                onDeleteRun={handleDeleteRun}
              />
            )}

            {currentTab === 'history' && (
              <HistoryView
                runs={runs}
                onSelectRun={handleSelectRun}
                onRerunTest={handleRerunTest}
                onDeleteRun={handleDeleteRun}
                onDeleteProject={handleDeleteRunsByProject}
              />
            )}

            {currentTab === 'settings' && (
              <SettingsView
                settings={settings}
                onSaveSettings={handleSaveSettings}
                onResetSampleData={handleResetSampleData}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function AppWithErrorBoundary() { return <AppErrorBoundary><App /></AppErrorBoundary>; }
