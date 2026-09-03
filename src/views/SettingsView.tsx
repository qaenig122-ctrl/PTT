import React, { useState } from 'react';
import {
  Settings,
  Server,
  Sliders,
  Copy,
  Check,
  Download,
  RotateCcw,
  ShieldCheck,
  FileCode,
  Layers,
  Database,
  ExternalLink
} from 'lucide-react';
import { AppSettings } from '../types';
import { dbService } from '../lib/db';
import {
  generatePrometheusConfig,
  generateDockerComposeConfig,
  generateGrafanaDashboardJson
} from '../lib/observabilityConfig';

interface SettingsViewProps {
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
  onResetSampleData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  onResetSampleData
}) => {
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [savedFeedback, setSavedFeedback] = useState(false);
  const [activeConfigTab, setActiveConfigTab] = useState<'docker' | 'prometheus' | 'grafana'>('docker');
  const [copied, setCopied] = useState(false);
  const [engines, setEngines] = useState<any[]>(() => dbService.getEngines());

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  const dockerCompose = generateDockerComposeConfig();
  const prometheusYaml = generatePrometheusConfig(formData.prometheusUrl);
  const grafanaJson = generateGrafanaDashboardJson();

  const getActiveCode = () => {
    switch (activeConfigTab) {
      case 'docker':
        return dockerCompose;
      case 'prometheus':
        return prometheusYaml;
      case 'grafana':
        return grafanaJson;
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getActiveCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadConfig = () => {
    const filename =
      activeConfigTab === 'docker' ? 'docker-compose.yml' :
      activeConfigTab === 'prometheus' ? 'prometheus.yml' : 'eaii_performance_dashboard.json';
    const blob = new Blob([getActiveCode()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="settings-container" className="space-y-6 animate-in fade-in duration-300 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Settings & Observability Stack</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure SLA threshold evaluation rules, Prometheus remote-write endpoints, and deployment configs
          </p>
        </div>

        {savedFeedback && (
          <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-lg border border-emerald-300 dark:border-emerald-800 flex items-center gap-1.5 animate-in fade-in">
            <Check className="w-3.5 h-3.5" />
            <span>Settings Saved</span>
          </span>
        )}
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-6 space-y-6">
          {/* SLA Thresholds */}
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-500" />
              <span>SLA Performance Thresholds</span>
            </h3>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  Excellent P95 (&le; ms)
                </label>
                <input
                  type="number"
                  value={formData.slaThresholds.excellentP95Ms}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      slaThresholds: { ...formData.slaThresholds, excellentP95Ms: Number(e.target.value) }
                    })
                  }
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  Good P95 (&le; ms)
                </label>
                <input
                  type="number"
                  value={formData.slaThresholds.goodP95Ms}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      slaThresholds: { ...formData.slaThresholds, goodP95Ms: Number(e.target.value) }
                    })
                  }
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  Warning P95 (&le; ms)
                </label>
                <input
                  type="number"
                  value={formData.slaThresholds.warningP95Ms}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      slaThresholds: { ...formData.slaThresholds, warningP95Ms: Number(e.target.value) }
                    })
                  }
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  Max Error Rate (&le; %)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.slaThresholds.errorRateLimitPct}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      slaThresholds: { ...formData.slaThresholds, errorRateLimitPct: Number(e.target.value) }
                    })
                  }
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-500"/> Engine-aware live dashboards
            </h3>
            <p className="text-[11px] text-slate-500">The live dashboard follows the selected engine. Grafana is never forced globally.</p>
            <div className="space-y-3">
              {engines.map(engine => <div key={engine.id} className="grid grid-cols-1 sm:grid-cols-[1fr_1.4fr_auto] gap-2 items-center">
                <div><b className="text-xs text-slate-900 dark:text-white">{engine.name}</b><span className="block text-[10px] text-slate-500">{engine.liveDashboardType === 'grafana' ? 'Grafana' : engine.liveDashboardType === 'locust' ? 'Locust Web UI' : 'EAII PTT internal'}</span></div>
                <input value={engine.dashboardUrl || ''} onChange={e => setEngines(prev => prev.map(x => x.id===engine.id ? {...x,dashboardUrl:e.target.value,supportsLiveDashboard:!!e.target.value} : x))}
                  placeholder={engine.liveDashboardType === 'locust' ? 'http://localhost:8089' : 'Grafana URL (optional)'}
                  className="px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"/>
                <button type="button" onClick={() => dbService.saveEngine(engine)} className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-bold">Save</button>
              </div>)}
            </div>
          </div>

          {/* Observability Server Settings */}
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <Server className="w-4 h-4 text-orange-500" />
              <span>Prometheus & Grafana Ingestion</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  Prometheus URL
                </label>
                <input
                  type="text"
                  value={formData.prometheusUrl}
                  onChange={(e) => setFormData({ ...formData, prometheusUrl: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  Default Target Base URL
                </label>
                <input
                  type="text"
                  value={formData.defaultTargetUrl}
                  onChange={(e) => setFormData({ ...formData, defaultTargetUrl: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center">
              <button
                type="button"
                onClick={onResetSampleData}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Demo SQLite State</span>
              </button>

              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Infrastructure Code Export (Docker Compose, Prometheus, Grafana) */}
        <div className="lg:col-span-6 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs flex flex-col justify-between">
          <div>
            <div className="bg-slate-900 p-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
              <div className="flex items-center gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveConfigTab('docker')}
                  className={`px-2.5 py-1 rounded text-xs font-mono font-semibold transition-colors ${
                    activeConfigTab === 'docker' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  docker-compose.yml
                </button>
                <button
                  type="button"
                  onClick={() => setActiveConfigTab('prometheus')}
                  className={`px-2.5 py-1 rounded text-xs font-mono font-semibold transition-colors ${
                    activeConfigTab === 'prometheus' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  prometheus.yml
                </button>
                <button
                  type="button"
                  onClick={() => setActiveConfigTab('grafana')}
                  className={`px-2.5 py-1 rounded text-xs font-mono font-semibold transition-colors ${
                    activeConfigTab === 'grafana' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  grafana.json
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
                  title="Copy Configuration"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadConfig}
                  className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
                  title="Download File"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <pre className="p-4 bg-[#0a0d12] text-slate-300 font-mono text-[11px] leading-relaxed max-h-[460px] overflow-y-auto">
              <code>{getActiveCode()}</code>
            </pre>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Spin up stack with: <code className="text-indigo-500 font-mono">docker-compose up -d</code></span>
            <span>Prometheus remote-write enabled</span>
          </div>
        </div>
      </form>
    </div>
  );
};
