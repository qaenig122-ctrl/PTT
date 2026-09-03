
import React, { useEffect, useRef, useState } from 'react';
import {
  Layers,
  Globe,
  Users,
  Clock,
  Plus,
  Trash2,
  Edit2,
  FileCode2,
  Play,
  Upload,
  CheckCircle2,
  AlertCircle,
  Code,
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
  Zap,
  Sliders,
  FileText,
  Sparkles,
  BookOpen,
  Compass,
  Terminal,
  Send,
  HelpCircle,
  Search,
  ExternalLink,
  Shuffle,
  Info,
  Network,
  Server,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Filter,
  Cpu,
  HardDrive,
  Wifi,
  Activity,
  Download
} from 'lucide-react';
import { EndpointConfig, HttpMethod, TestConfiguration, TestEngine, TestRun, TestType } from '../types';
import { generateK6Script, generateStagesForTestType } from '../lib/k6Generator';
import { generateLocustScript } from '../lib/locustGenerator';
import { parseHARJson } from '../lib/harParser';
import { parseOpenApiSpec } from '../lib/openapiParser';
import { parsePostmanCollection } from '../lib/postmanParser';
import { parseCurlCommand } from '../lib/curlParser';
import { discoverApiSpecification, DiscoveryResult } from '../lib/apiDiscovery';
import {
  PRESET_FLOW_TEMPLATES,
  COMMON_DOC_PATHS,
  TESTING_TECHNIQUES,
  FlowTemplate
} from '../lib/flowTemplates';
import { INITIAL_SAMPLE_ENDPOINTS, dbService } from '../lib/db';

interface TestBuilderViewProps {
  onStartTest: (runConfig: TestRun) => void;
  onCancel: () => void;
}

type ImportSourceTab = 'templates' | 'openapi' | 'postman' | 'curl' | 'discovery' | 'har';

export const TestBuilderView: React.FC<TestBuilderViewProps> = ({
  onStartTest,
  onCancel
}) => {
  // SQLite-backed project draft. This is loaded before React state is created so a
  // browser restart or complete machine power-off does not reset the Test Builder.
  const savedProjectDraft = dbService.getProjectDraft<any>();
  const draftLoadedRef = useRef(true);

  const [currentStep, setCurrentStep] = useState<number>(savedProjectDraft?.currentStep ?? 1);
  
  // Form state
  const [engine, setEngine] = useState<TestEngine>(savedProjectDraft?.engine ?? 'k6');
  const [testType, setTestType] = useState<TestType>(savedProjectDraft?.testType ?? 'Load Test');
  const [projectName, setProjectName] = useState<string>(savedProjectDraft?.projectName ?? 'Office API Performance Testing');
  const [projectTestPlan, setProjectTestPlan] = useState<TestType[]>(savedProjectDraft?.projectTestPlan ?? ['Load Test','Stress Test','Spike Test','Endurance Test','Volume Test','Concurrency Test']);
  const [testName, setTestName] = useState<string>(savedProjectDraft?.testName ?? '');
  const [baseUrl, setBaseUrl] = useState<string>(savedProjectDraft?.baseUrl ?? 'https://api.example.com');
  const [users, setUsers] = useState<number>(savedProjectDraft?.users ?? 100);
  const [durationMinutes, setDurationMinutes] = useState<number>(savedProjectDraft?.durationMinutes ?? 30);
  const [rampUpMinutes, setRampUpMinutes] = useState<number>(savedProjectDraft?.rampUpMinutes ?? 2);
  const [prometheusUrl, setPrometheusUrl] = useState<string>(savedProjectDraft?.prometheusUrl ?? 'http://127.0.0.1:9090');

  const TEST_TYPES: TestType[] = ['Load Test','Stress Test','Spike Test','Endurance Test','Volume Test','Concurrency Test'];
  const DEFAULT_CONFIGS: Record<TestType, TestConfiguration> = {
    'Load Test': { testType:'Load Test', users:100, spawnRate:10, durationSec:1800, rampUpSec:120 },
    'Stress Test': { testType:'Stress Test', users:500, spawnRate:20, durationSec:1800, rampUpSec:300 },
    'Spike Test': { testType:'Spike Test', users:1000, spawnRate:100, durationSec:600, rampUpSec:30 },
    'Endurance Test': { testType:'Endurance Test', users:50, spawnRate:5, durationSec:3600, rampUpSec:300 },
    'Volume Test': { testType:'Volume Test', users:150, spawnRate:15, durationSec:2700, rampUpSec:180 },
    'Concurrency Test': { testType:'Concurrency Test', users:250, spawnRate:25, durationSec:900, rampUpSec:150 }
  };
  const [testConfigs, setTestConfigs] = useState<Record<TestType, TestConfiguration>>(DEFAULT_CONFIGS);
  useEffect(() => {
    const loaded = {...DEFAULT_CONFIGS};
    TEST_TYPES.forEach(type => {
      const stored = dbService.getTestConfiguration(projectName, type);
      if (stored) loaded[type] = {testType:type, users:stored.users, spawnRate:stored.spawnRate, durationSec:stored.durationSec, rampUpSec:stored.rampUpSec};
    });
    setTestConfigs(loaded);
    const selected = loaded[testType];
    setUsers(selected.users);
    setDurationMinutes(Math.max(1, Math.round(selected.durationSec / 60)));
    setRampUpMinutes(Math.max(0.1, selected.rampUpSec / 60));
  }, [projectName]);

  const persistConfig = (type: TestType, cfg: TestConfiguration) => {
    setTestConfigs(prev => ({...prev, [type]: cfg}));
    dbService.saveTestConfiguration(projectName, type, cfg);
  };
  const updateSelectedConfig = (patch: Partial<TestConfiguration>) => {
    const cfg = {...testConfigs[testType], ...patch, testType};
    persistConfig(testType, cfg);
    setUsers(cfg.users);
    setDurationMinutes(Math.max(1, Math.round(cfg.durationSec / 60)));
    setRampUpMinutes(Math.max(0.1, cfg.rampUpSec / 60));
  };
  const selectTestType = (type: TestType) => {
    const current = testConfigs[testType];
    persistConfig(testType, current);
    const stored = dbService.getTestConfiguration(projectName, type);
    const cfg = stored ? {
      testType:type, users:stored.users, spawnRate:stored.spawnRate,
      durationSec:stored.durationSec, rampUpSec:stored.rampUpSec
    } : testConfigs[type];
    setTestConfigs(prev => ({...prev, [type]: cfg}));
    setTestType(type);
    setUsers(cfg.users);
    setDurationMinutes(Math.max(1, Math.round(cfg.durationSec / 60)));
    setRampUpMinutes(Math.max(0.1, cfg.rampUpSec / 60));
  };
  
  // Endpoints list
  const [endpoints, setEndpoints] = useState<EndpointConfig[]>(savedProjectDraft?.endpoints ?? INITIAL_SAMPLE_ENDPOINTS);

  // Persist the editable project itself in SQLite. This runs on every meaningful
  // builder change, not only when a test is started, so power loss cannot erase the
  // current project definition. sql.js is persisted by db.ts into IndexedDB.
  useEffect(() => {
    if (!draftLoadedRef.current) return;
    dbService.saveProjectDraft({
      version: 2,
      currentStep,
      engine,
      testType,
      projectName,
      projectTestPlan,
      testName,
      baseUrl,
      users,
      durationMinutes,
      rampUpMinutes,
      prometheusUrl,
      testConfigs,
      endpoints,
      updatedAt: new Date().toISOString()
    });
  }, [currentStep, engine, testType, projectName, projectTestPlan, testName, baseUrl, users, durationMinutes, rampUpMinutes, prometheusUrl, testConfigs, endpoints]);

  // Endpoint Modal State
  const [showEndpointModal, setShowEndpointModal] = useState<boolean>(false);
  const [editingEndpointIndex, setEditingEndpointIndex] = useState<number | null>(null);
  const [epMethod, setEpMethod] = useState<HttpMethod>('GET');
  const [epPath, setEpPath] = useState<string>('/api/users');
  const [epDesc, setEpDesc] = useState<string>('');
  const [epWeight, setEpWeight] = useState<number>(10);
  const [epHeaders, setEpHeaders] = useState<string>('{\n  "Accept": "application/json"\n}');
  const [epBody, setEpBody] = useState<string>('');

  // Unified Import Hub Modal State
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [activeImportTab, setActiveImportTab] = useState<ImportSourceTab>('templates');
  const [importInput, setImportInput] = useState<string>('');
  const [importUrl, setImportUrl] = useState<string>('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);
  const [isDiscovering, setIsDiscovering] = useState<boolean>(false);
  const [discoveryUrl, setDiscoveryUrl] = useState<string>('');
  const [discoveryResult, setDiscoveryResult] = useState<DiscoveryResult | null>(null);
  const [showProbedDetails, setShowProbedDetails] = useState<boolean>(false);

  // Techniques Guide Modal State
  const [showTechniquesModal, setShowTechniquesModal] = useState<boolean>(false);

  // Script preview copy state
  const [copied, setCopied] = useState<boolean>(false);
  const [previewTab, setPreviewTab] = useState<'k6' | 'locust'>('locust');
  const [scriptScope, setScriptScope] = useState<'suite' | 'single'>('suite');

  // Endpoint Table Search & View Filter State
  const [endpointSearchQuery, setEndpointSearchQuery] = useState<string>('');
  const [endpointFilterView, setEndpointFilterView] = useState<'ALL' | 'SELECTED_ONLY' | 'GET_ONLY' | 'MUTATING_ONLY'>('ALL');

  // Environment & Hardware Specifications State (Preserved in test records)
  const [os, setOs] = useState<string>('Ubuntu 22.04 LTS (x86_64)');
  const [serverEnvironment, setServerEnvironment] = useState<string>('staging');
  const [advancedEnvironment, setAdvancedEnvironment] = useState<string>('AWS EKS Cluster (eu-west-1) • Kubernetes v1.28 • Nginx Ingress • 3 Replicas');
  const [ram, setRam] = useState<string>('16 GB DDR5');
  const [hardDisk, setHardDisk] = useState<string>('500 GB NVMe SSD');
  const [cpuCores, setCpuCores] = useState<string>('8 vCPUs (Intel Xeon 3.2GHz)');
  const [downloadSpeedMbps, setDownloadSpeedMbps] = useState<number | string>(1000);
  const [uploadSpeedMbps, setUploadSpeedMbps] = useState<number | string>(500);

  const steps = [
    { num: 1, title: '1. Test Configuration' },
    { num: 2, title: '2. Endpoints & Flow' },
    { num: 3, title: '3. Load Configuration' },
    { num: 4, title: '4. Advanced Settings' },
    { num: 5, title: '5. Review & Start' },
  ];

  // Validation
  const validateStep = (step: number): string | null => {
    if (step === 1) {
      if (!projectName.trim()) return 'Project Name is required';
      if (!baseUrl.trim() || !baseUrl.startsWith('http')) return 'A valid Target Base URL starting with http:// or https:// is required';
    }
    if (step === 2) {
      if (endpoints.length === 0) return 'At least one endpoint is required for the load test';
    }
    if (step === 3) {
      if (users <= 0) return 'Virtual Users must be greater than 0';
      if (durationMinutes <= 0) return 'Duration must be greater than 0';
    }
    return null;
  };

  const handleNext = () => {
    const error = validateStep(currentStep);
    if (error) {
      alert(error);
      return;
    }
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleOpenAddEndpoint = () => {
    setEditingEndpointIndex(null);
    setEpMethod('GET');
    setEpPath('/api/items');
    setEpDesc('Query item list');
    setEpWeight(10);
    setEpHeaders('{\n  "Accept": "application/json"\n}');
    setEpBody('');
    setShowEndpointModal(true);
  };

  const handleOpenEditEndpoint = (idx: number) => {
    const ep = endpoints[idx];
    setEditingEndpointIndex(idx);
    setEpMethod(ep.method);
    setEpPath(ep.path);
    setEpDesc(ep.name || ep.description || '');
    setEpWeight(ep.weight || 10);
    setEpHeaders(JSON.stringify(ep.headers || {}, null, 2));
    setEpBody(ep.body || '');
    setShowEndpointModal(true);
  };

  const handleSaveEndpoint = () => {
    let parsedHeaders = {};
    try {
      if (epHeaders.trim()) parsedHeaders = JSON.parse(epHeaders);
    } catch {
      alert('Headers must be valid JSON');
      return;
    }

    const newEp: EndpointConfig = {
      id: editingEndpointIndex !== null ? endpoints[editingEndpointIndex].id : `ep-${Date.now()}`,
      name: epDesc.trim() || `${epMethod} ${epPath}`,
      method: epMethod,
      path: epPath.startsWith('/') ? epPath : `/${epPath}`,
      description: epDesc,
      headers: parsedHeaders,
      body: epBody.trim() ? epBody : undefined,
      weight: Math.max(1, epWeight || 1),
      expectedStatus: epMethod === 'POST' ? 201 : 200
    };

    if (editingEndpointIndex !== null) {
      const updated = [...endpoints];
      updated[editingEndpointIndex] = newEp;
      setEndpoints(updated);
    } else {
      setEndpoints([...endpoints, newEp]);
    }
    setShowEndpointModal(false);
  };

  const handleDeleteEndpoint = (idx: number) => {
    setEndpoints(endpoints.filter((_, i) => i !== idx));
  };

  // Preset Template loader
  const handleApplyTemplate = (tpl: FlowTemplate) => {
    setEndpoints(tpl.endpoints);
    setUsers(tpl.recommendedVUs);
    setDurationMinutes(tpl.recommendedDurationMin);
    setShowImportModal(false);
    setImportSuccessMsg(`Loaded template "${tpl.name}" with ${tpl.endpoints.length} endpoints!`);
    setTimeout(() => setImportSuccessMsg(null), 3000);
  };

  // OpenAPI / Swagger local file importer
  const handleOpenApiFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Allow selecting the same file again later.
    event.target.value = '';
    if (!file) return;

    setImportError(null);
    setDiscoveryResult(null);

    const fileName = file.name.toLowerCase();
    const supported = ['.json', '.yaml', '.yml', '.js'].some((ext) => fileName.endsWith(ext));
    if (!supported) {
      setImportError('Unsupported file. Upload a Swagger/OpenAPI .json, .yaml, .yml, or JavaScript (.js) Swagger configuration file.');
      return;
    }

    try {
      const content = await file.text();
      if (!content.trim()) {
        setImportError(`The file "${file.name}" is empty.`);
        return;
      }

      const parsed = parseOpenApiSpec(content);
      if (parsed.endpoints.length === 0) {
        setImportError(`No API operations were found in "${file.name}".`);
        return;
      }

      if (parsed.detectedBaseUrl && (!baseUrl || baseUrl === 'https://api.example.com')) {
        setBaseUrl(parsed.detectedBaseUrl);
      }

      setEndpoints(parsed.endpoints);
      setShowImportModal(false);
      setImportInput('');
      setImportUrl('');
      setImportSuccessMsg(`Successfully imported ${parsed.endpoints.length} endpoints from "${file.name}"!`);
      setTimeout(() => setImportSuccessMsg(null), 3500);
    } catch (err: any) {
      setImportError(err?.message || `Failed to parse "${file.name}" as an OpenAPI/Swagger specification.`);
    }
  };

  // OpenAPI / Swagger Importer
  const handleImportOpenApi = async () => {
    setImportError(null);
    setDiscoveryResult(null);
    try {
      let content = importInput.trim();
      const specUrl = importUrl.trim();

      // If user provided a URL and no inline spec text
      if (!content && specUrl) {
        setIsDiscovering(true);
        try {
          const disc = await discoverApiSpecification(specUrl);
          setIsDiscovering(false);
          if (disc.success && disc.endpoints && disc.endpoints.length > 0) {
            setEndpoints(disc.endpoints);
            if (disc.detectedBaseUrl && (!baseUrl || baseUrl === 'https://api.example.com')) {
              setBaseUrl(disc.detectedBaseUrl);
            }
            setShowImportModal(false);
            setImportInput('');
            setImportUrl('');
            setImportSuccessMsg(`Discovered & imported ${disc.endpoints.length} endpoints from "${disc.discoveredPath || specUrl}"!`);
            setTimeout(() => setImportSuccessMsg(null), 3500);
            return;
          } else {
            setDiscoveryResult(disc);
            setImportError(disc.diagnostics.statusSummary);
            return;
          }
        } catch (discErr: any) {
          setIsDiscovering(false);
          setImportError(discErr.message || 'Failed to analyze specification URL.');
          return;
        }
      }

      if (!content) {
        setImportError('Please paste OpenAPI/Swagger JSON or YAML, or enter an API / documentation URL.');
        return;
      }

      const parsed = parseOpenApiSpec(content);
      if (parsed.endpoints.length === 0) {
        setImportError('No valid operations found in the OpenAPI spec.');
        return;
      }

      if (parsed.detectedBaseUrl && (!baseUrl || baseUrl === 'https://api.example.com')) {
        setBaseUrl(parsed.detectedBaseUrl);
      }

      setEndpoints(parsed.endpoints);
      setShowImportModal(false);
      setImportInput('');
      setImportUrl('');
      setImportSuccessMsg(`Successfully imported ${parsed.endpoints.length} endpoints from OpenAPI spec!`);
      setTimeout(() => setImportSuccessMsg(null), 3500);
    } catch (err: any) {
      setImportError(err.message || 'Failed to parse OpenAPI specification.');
    }
  };

  // Postman Importer
  const handleImportPostman = () => {
    setImportError(null);
    setDiscoveryResult(null);
    try {
      if (!importInput.trim()) {
        setImportError('Please paste a valid Postman Collection (v2.0/v2.1) JSON.');
        return;
      }
      const parsed = parsePostmanCollection(importInput.trim());
      if (parsed.endpoints.length === 0) {
        setImportError('No requests found in this Postman collection.');
        return;
      }
      if (parsed.detectedBaseUrl && (!baseUrl || baseUrl === 'https://api.example.com')) {
        setBaseUrl(parsed.detectedBaseUrl);
      }
      setEndpoints(parsed.endpoints);
      setShowImportModal(false);
      setImportInput('');
      setImportSuccessMsg(`Imported ${parsed.endpoints.length} requests from "${parsed.collectionName}"!`);
      setTimeout(() => setImportSuccessMsg(null), 3500);
    } catch (err: any) {
      setImportError(err.message || 'Failed to parse Postman collection JSON.');
    }
  };

  // cURL Importer
  const handleImportCurl = () => {
    setImportError(null);
    setDiscoveryResult(null);
    try {
      if (!importInput.trim()) {
        setImportError('Please paste one or more cURL commands.');
        return;
      }
      const parsed = parseCurlCommand(importInput.trim());
      if (parsed.endpoints.length === 0) {
        setImportError('Could not parse any valid cURL commands.');
        return;
      }
      if (parsed.detectedBaseUrl && (!baseUrl || baseUrl === 'https://api.example.com')) {
        setBaseUrl(parsed.detectedBaseUrl);
      }
      setEndpoints(parsed.endpoints);
      setShowImportModal(false);
      setImportInput('');
      setImportSuccessMsg(`Parsed ${parsed.endpoints.length} endpoint(s) from cURL command(s)!`);
      setTimeout(() => setImportSuccessMsg(null), 3500);
    } catch (err: any) {
      setImportError(err.message || 'Failed to parse cURL commands.');
    }
  };

  // Auto-Discovery Prober
  const handleAutoDiscoverProbe = async () => {
    setImportError(null);
    setDiscoveryResult(null);
    const target = (discoveryUrl || baseUrl || '').trim();

    if (!target) {
      setImportError('Please enter a target URL or base API path to probe.');
      return;
    }

    setIsDiscovering(true);
    try {
      const res = await discoverApiSpecification(target);
      setDiscoveryResult(res);
      setIsDiscovering(false);

      if (res.success && res.endpoints && res.endpoints.length > 0) {
        setEndpoints(res.endpoints);
        if (res.detectedBaseUrl && (!baseUrl || baseUrl === 'https://api.example.com')) {
          setBaseUrl(res.detectedBaseUrl);
        }
        setShowImportModal(false);
        setImportSuccessMsg(`Discovered live OpenAPI schema at "${res.discoveredPath || target}" (${res.endpoints.length} routes)!`);
        setTimeout(() => setImportSuccessMsg(null), 3500);
      }
    } catch (e: any) {
      setIsDiscovering(false);
      setImportError(e.message || 'Discovery probe failed.');
    }
  };

  // HAR Importer
  const handleProcessHar = () => {
    setImportError(null);
    try {
      const res = parseHARJson(importInput);
      if (res.endpoints.length === 0) {
        setImportError('No valid HTTP requests could be extracted from this HAR.');
        return;
      }
      if (res.baseUrl && (!baseUrl || baseUrl === 'https://api.example.com')) {
        setBaseUrl(res.baseUrl);
      }
      setEndpoints(res.endpoints);
      setShowImportModal(false);
      setImportInput('');
      setImportSuccessMsg(`Imported ${res.endpoints.length} endpoints from HAR!`);
      setTimeout(() => setImportSuccessMsg(null), 3500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setImportError(message);
    }
  };

  const durationSec = durationMinutes * 60;
  const rampUpSec = rampUpMinutes * 60;
  const stages = generateStagesForTestType(testType, users, durationSec, rampUpSec);

  // Selected endpoints only (omits disabled / unselected endpoints from scripts & execution)
  const selectedEndpoints = endpoints.filter(e => e.enabled !== false);
  const activeEndpointsToRun = selectedEndpoints.length > 0 ? selectedEndpoints : endpoints;

  const isSequentialScript = scriptScope === 'suite';
  const dynamicScriptTestId = `RUN-${Date.now().toString().slice(-4)}`;

  const k6Script = generateK6Script({
    testId: dynamicScriptTestId,
    testName: isSequentialScript
      ? `All 6 Test Types Sequential Pipeline — ${projectName}`
      : `${testType} — ${projectName}`,
    testType,
    testPlan: projectTestPlan.length > 0 ? projectTestPlan : TEST_TYPES,
    isSequentialSuite: isSequentialScript,
    testConfigs,
    baseUrl,
    users,
    durationSec,
    rampUpSec,
    endpoints: activeEndpointsToRun,
    prometheusUrl
  });

  const locustScript = generateLocustScript({
    testId: dynamicScriptTestId,
    testName: isSequentialScript
      ? `All 6 Test Types Sequential Pipeline — ${projectName}`
      : `${testType} — ${projectName}`,
    testType,
    testPlan: projectTestPlan.length > 0 ? projectTestPlan : TEST_TYPES,
    isSequentialSuite: isSequentialScript,
    testConfigs,
    baseUrl,
    users,
    endpoints: activeEndpointsToRun
  });

  const handleCopyScript = () => {
    const code = previewTab === 'k6' ? k6Script : locustScript;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadScript = () => {
    const code = previewTab === 'k6' ? k6Script : locustScript;
    const filename = previewTab === 'k6'
      ? `${projectName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_k6_test.js`
      : `${projectName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_locustfile.py`;
    const mimeType = previewTab === 'k6' ? 'application/javascript' : 'text/x-python';

    const blob = new Blob([code], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExecuteStart = (runEntireSuite = true) => {
    TEST_TYPES.forEach(type => dbService.saveTestConfiguration(projectName, type, testConfigs[type]));

    const planToRun = runEntireSuite
      ? (projectTestPlan.length > 0 ? projectTestPlan : TEST_TYPES)
      : [testType];

    const firstType = runEntireSuite ? (planToRun[0] || 'Load Test') : testType;
    const activeCfg = testConfigs[firstType] || testConfigs[testType];
    const durSec = activeCfg.durationSec;
    const durationMin = Math.max(1, Math.round(durSec / 60));
    const rampSec = activeCfg.rampUpSec;
    const rampMin = Math.max(1, Math.round(rampSec / 60));
    const activeUsers = activeCfg.users;
    const runId = `RUN-${Math.floor(100 + Math.random() * 900)}`;

    const newRun: TestRun = {
      id: runId,
      projectName,
      projectTestPlan: planToRun,
      sequenceIndex: 0,
      name: `${firstType} — ${projectName}`,
      engine,
      testType: firstType,
      baseUrl,
      users: activeUsers,
      spawnRate: activeCfg.spawnRate,
      thresholds: activeCfg.thresholds,
      environmentConfig: {
        os,
        serverEnvironment,
        advancedEnvironment,
        ram,
        hardDisk,
        cpuCores,
        downloadSpeedMbps,
        uploadSpeedMbps
      },
      duration: `${durationMin} min`,
      durationSec: durSec,
      rampUp: `${rampMin} min`,
      rampUpSec: rampSec,
      status: 'CREATED',
      startedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      startTimestamp: Date.now(),
      elapsedSec: 0,
      endpoints: activeEndpointsToRun,
      stages: generateStagesForTestType(firstType, activeUsers, durSec, rampSec),
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
      rating: 'EXCELLENT',
      endpointResults: [],
      errors: [],
      timeline: [],
      logs: []
    };

    onStartTest(newRun);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-600" />
            <span>Interactive Test Builder</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Build, import, parameterize, and execute distributed load tests for k6 and Locust.
          </p>
        </div>

        {/* Global Action Chips */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowTechniquesModal(true)}
            className="px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-500" />
            <span>Testing Techniques & Guide</span>
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg transition-colors"
          >
            Back to Overview
          </button>
        </div>
      </div>

      {importSuccessMsg && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
          <span className="font-semibold">{importSuccessMsg}</span>
        </div>
      )}

      {/* 5-Step Stepper Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
        <div className="grid grid-cols-5 gap-2">
          {steps.map((step) => {
            const isDone = step.num < currentStep;
            const isCurrent = step.num === currentStep;

            return (
              <button
                key={step.num}
                type="button"
                onClick={() => {
                  if (step.num < currentStep) setCurrentStep(step.num);
                }}
                disabled={step.num > currentStep}
                className={`flex items-center gap-2 p-2.5 rounded-xl text-left transition-all ${
                  isCurrent
                    ? 'bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 font-bold'
                    : isDone
                    ? 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer'
                    : 'text-slate-400 opacity-60 cursor-not-allowed'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${
                    isCurrent
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : isDone
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {isDone ? <Check className="w-3.5 h-3.5" /> : step.num}
                </div>
                <div className="truncate hidden sm:block">
                  <span className="text-[11px] block">{step.title}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Step Workspace */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="space-y-6">
          {/* STEP 1: Test Configuration */}
          {currentStep === 1 && (
            <div className="space-y-5">
              {/* Engine Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Load Testing Engine
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setEngine('k6');
                      setPreviewTab('k6');
                    }}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      engine === 'k6'
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-600/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">k6 (JavaScript)</span>
                      {engine === 'k6' && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      High-performance Go runtime. Streams Prometheus remote-write metrics natively.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEngine('locust');
                      setPreviewTab('locust');
                    }}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      engine === 'locust'
                        ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-600/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">Locust (Python)</span>
                      {engine === 'locust' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Code-driven Python test framework with user task weighting and correlation.
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEngine('other')}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      engine === 'other'
                        ? 'border-slate-600 bg-slate-50 dark:bg-slate-800/60 ring-2 ring-slate-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">Other Engine</span>
                      {engine === 'other' && <CheckCircle2 className="w-4 h-4 text-slate-600" />}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Uses EAII PTT internal monitoring unless a compatible external dashboard is configured.
                    </p>
                  </button>
                </div>
              </div>

              {/* Project Name & Target Base URL Side-by-Side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Project Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="e.g. Office API Performance Testing"
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Logical group name for this test suite and its multi-phase reports.
                  </p>
                </div>

                {/* Target Base URL */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Target Base URL (with Project)
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-emerald-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={baseUrl}
                      onChange={(e) => setBaseUrl(e.target.value)}
                      placeholder="https://api.example.com"
                      className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    All test endpoints below will be appended to this base domain.
                  </p>
                </div>
              </div>

              {/* Project Test Plan */}
            </div>
          )}

          {/* STEP 2: Endpoints & Flow */}
          {currentStep === 2 && (
            <div className="space-y-4">
              {/* Header & Quick Source Triggers */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Configured Endpoints ({endpoints.length})</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono">
                      Prometheus tagged
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Import easily via OpenAPI, Postman, cURL, Flow Blueprints, or auto-discover from live URL.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveImportTab('templates');
                      setShowImportModal(true);
                    }}
                    className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Flow Blueprints</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveImportTab('openapi');
                      setShowImportModal(true);
                    }}
                    className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <FileCode2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Swagger / OpenAPI</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveImportTab('curl');
                      setShowImportModal(true);
                    }}
                    className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Terminal className="w-3.5 h-3.5 text-cyan-600" />
                    <span>cURL Commands</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveImportTab('discovery');
                      setShowImportModal(true);
                    }}
                    className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Compass className="w-3.5 h-3.5 text-purple-600" />
                    <span>Live Auto-Probe</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenAddEndpoint}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Endpoint</span>
                  </button>
                </div>
              </div>

              {/* Endpoint Selection & Smart Auto-Filtration Bar */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-xl text-xs shadow-2xs space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Filter className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Active Targets:</span>
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full font-mono font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 text-[11px]">
                      {endpoints.filter(e => e.enabled !== false).length} of {endpoints.length} selected
                    </span>

                    {/* Method Counter Badges */}
                    <div className="hidden sm:flex items-center gap-1 ml-1 text-[10px] font-mono">
                      <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold">
                        GET: {endpoints.filter(e => e.method === 'GET' && e.enabled !== false).length}/{endpoints.filter(e => e.method === 'GET').length}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">
                        POST: {endpoints.filter(e => e.method === 'POST' && e.enabled !== false).length}/{endpoints.filter(e => e.method === 'POST').length}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-semibold">
                        PUT/PATCH: {endpoints.filter(e => (e.method === 'PUT' || e.method === 'PATCH') && e.enabled !== false).length}/{endpoints.filter(e => e.method === 'PUT' || e.method === 'PATCH').length}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-semibold">
                        DEL: {endpoints.filter(e => e.method === 'DELETE' && e.enabled !== false).length}/{endpoints.filter(e => e.method === 'DELETE').length}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] text-slate-500 font-medium mr-0.5">Quick Action:</span>

                    {/* Smart Auto Filter (Safe Reads Only) */}
                    <button
                      type="button"
                      onClick={() => setEndpoints(endpoints.map(e => ({ ...e, enabled: e.method === 'GET' || e.method === 'HEAD' })))}
                      className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 transition cursor-pointer flex items-center gap-1"
                      title="Auto-enable only non-mutating safe GET endpoints"
                    >
                      <span>GET Only (Safe Reads)</span>
                    </button>

                    {/* Smart Auto Filter (Writes / Mutating Only) */}
                    <button
                      type="button"
                      onClick={() => setEndpoints(endpoints.map(e => ({ ...e, enabled: e.method === 'POST' || e.method === 'PUT' || e.method === 'PATCH' || e.method === 'DELETE' })))}
                      className="px-2.5 py-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg hover:bg-amber-100 transition cursor-pointer flex items-center gap-1"
                      title="Auto-enable mutating write operations (POST/PUT/PATCH/DELETE)"
                    >
                      <span>Writes Only</span>
                    </button>

                    {/* Smart Auto Filter (Core / High-Traffic Auto Detection) */}
                    <button
                      type="button"
                      onClick={() => {
                        setEndpoints(endpoints.map(e => {
                          const path = e.path.toLowerCase();
                          const isCore = path.includes('auth') || path.includes('login') || path.includes('user') ||
                            path.includes('dashboard') || path.includes('overview') || path.includes('search') ||
                            path.includes('count') || path.includes('categories') || path.includes('health') ||
                            path.endsWith('s') || e.method === 'GET';
                          return { ...e, enabled: isCore };
                        }));
                      }}
                      className="px-2.5 py-1 text-[11px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-100 transition cursor-pointer flex items-center gap-1"
                      title="Auto-select core business routes based on path and purpose"
                    >
                      <Sparkles className="w-3 h-3 text-purple-600" />
                      <span>Auto-Detect Core API</span>
                    </button>

                    {/* Select All */}
                    <button
                      type="button"
                      onClick={() => setEndpoints(endpoints.map(e => ({ ...e, enabled: true })))}
                      className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-750 transition cursor-pointer"
                    >
                      Select All
                    </button>

                    {/* Clear All */}
                    <button
                      type="button"
                      onClick={() => setEndpoints(endpoints.map(e => ({ ...e, enabled: false })))}
                      className="px-2.5 py-1 text-[11px] font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition cursor-pointer"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                {/* Search & View Tab Filter */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-800/80">
                  <div className="flex items-center gap-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setEndpointFilterView('ALL')}
                      className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                        endpointFilterView === 'ALL'
                          ? 'bg-indigo-600 text-white font-bold'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      All ({endpoints.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setEndpointFilterView('SELECTED_ONLY')}
                      className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                        endpointFilterView === 'SELECTED_ONLY'
                          ? 'bg-emerald-600 text-white font-bold'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      Selected Only ({endpoints.filter(e => e.enabled !== false).length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setEndpointFilterView('GET_ONLY')}
                      className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                        endpointFilterView === 'GET_ONLY'
                          ? 'bg-blue-600 text-white font-bold'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      GET ({endpoints.filter(e => e.method === 'GET').length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setEndpointFilterView('MUTATING_ONLY')}
                      className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                        endpointFilterView === 'MUTATING_ONLY'
                          ? 'bg-amber-600 text-white font-bold'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      Mutating ({endpoints.filter(e => e.method !== 'GET' && e.method !== 'HEAD').length})
                    </button>
                  </div>

                  <div className="relative min-w-[200px] max-w-xs flex-1">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search routes by path or method..."
                      value={endpointSearchQuery}
                      onChange={(e) => setEndpointSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                    {endpointSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setEndpointSearchQuery('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-[10px]"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Endpoints Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3 w-10 text-center">Run</th>
                      <th className="py-2.5 px-4 w-20">Method</th>
                      <th className="py-2.5 px-4">Endpoint Route</th>
                      <th className="py-2.5 px-4">Name / Payload</th>
                      <th className="py-2.5 px-4 w-24 text-center">Weight</th>
                      <th className="py-2.5 px-4 text-right w-24">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                    {endpoints.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          No endpoints configured. Click <b>Flow Blueprints</b> or <b>Add Endpoint</b> above.
                        </td>
                      </tr>
                    ) : (
                      endpoints
                        .map((ep, originalIdx) => ({ ep, originalIdx }))
                        .filter(({ ep }) => {
                          if (endpointFilterView === 'SELECTED_ONLY' && ep.enabled === false) return false;
                          if (endpointFilterView === 'GET_ONLY' && ep.method !== 'GET' && ep.method !== 'HEAD') return false;
                          if (endpointFilterView === 'MUTATING_ONLY' && (ep.method === 'GET' || ep.method === 'HEAD')) return false;
                          if (endpointSearchQuery.trim()) {
                            const q = endpointSearchQuery.toLowerCase();
                            const matches = ep.path.toLowerCase().includes(q) ||
                              ep.method.toLowerCase().includes(q) ||
                              (ep.name && ep.name.toLowerCase().includes(q));
                            if (!matches) return false;
                          }
                          return true;
                        })
                        .map(({ ep, originalIdx }) => {
                        const isEnabled = ep.enabled !== false;
                        const isMutating = ep.method !== 'GET' && ep.method !== 'HEAD' && ep.method !== 'OPTIONS';
                        const methodColor = 
                          ep.method === 'GET' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300' :
                          ep.method === 'POST' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' :
                          ep.method === 'PUT' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300' :
                          ep.method === 'DELETE' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300' :
                          'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300';
                        
                        return (
                          <tr key={ep.id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition ${!isEnabled ? 'opacity-40 bg-slate-50/30 dark:bg-slate-900/30' : ''}`}>
                            <td className="py-3 px-3 text-center">
                              <input
                                type="checkbox"
                                checked={isEnabled}
                                onChange={(e) => {
                                  const updated = [...endpoints];
                                  updated[originalIdx] = { ...ep, enabled: e.target.checked };
                                  setEndpoints(updated);
                                }}
                                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                              />
                            </td>
                            <td className="py-3 px-4 font-bold">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${methodColor}`}>
                                {ep.method}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono font-medium text-indigo-600 dark:text-indigo-400">
                              <div className="flex items-center gap-1.5">
                                <span>{ep.path}</span>
                                {isMutating && (
                                  <span className="px-1.5 py-0.5 text-[9px] font-sans font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 rounded" title="Mutating request requires payload & deliberation">
                                    Mutating
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-slate-500 dark:text-slate-400 truncate max-w-xs">
                              {ep.name || ep.description || (ep.body ? 'Custom JSON body' : 'Standard request')}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300">
                                {ep.weight || 10}x
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right space-x-1">
                              <button
                                onClick={() => handleOpenEditEndpoint(originalIdx)}
                                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300"
                                title="Edit Endpoint"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteEndpoint(originalIdx)}
                                className="p-1 hover:bg-rose-100 dark:hover:bg-rose-950/50 rounded text-rose-600 dark:text-rose-400"
                                title="Delete Endpoint"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 3: Load Configuration */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Target Virtual Users (VUs)
                  </label>
                  <div className="relative">
                    <Users className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="number"
                      min="1"
                      max="100000"
                      value={users}
                      onChange={(e) => updateSelectedConfig({users: Number(e.target.value)})}
                      className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Total Duration (Minutes)
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="number"
                      min="1"
                      max="720"
                      value={durationMinutes}
                      onChange={(e) => updateSelectedConfig({durationSec: Number(e.target.value) * 60})}
                      className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Ramp-up (Minutes)
                  </label>
                  <div className="relative">
                    <Zap className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="number"
                      min="0.1"
                      max="60"
                      step="0.5"
                      value={rampUpMinutes}
                      onChange={(e) => updateSelectedConfig({rampUpSec: Number(e.target.value) * 60})}
                      className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">Independent Test Configurations</h3>
                    <p className="text-[11px] text-slate-500 mt-1">Each test type is stored separately. Changing one never changes another.</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600">SQLite persisted</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {TEST_TYPES.map(type => {
                    const cfg = testConfigs[type];
                    const active = type === testType;
                    return <button key={type} type="button" onClick={() => selectTestType(type)}
                      className={`text-left p-4 rounded-xl border transition-all ${active ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/30 ring-2 ring-indigo-500/10' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300'}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900 dark:text-white">{type}</span>
                        {active && <CheckCircle2 className="w-4 h-4 text-indigo-600"/>}
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-3 text-[10px]">
                        <span className="text-slate-500"><b className="block text-sm text-slate-900 dark:text-white">{cfg.users}</b>VUs</span>
                        <span className="text-slate-500"><b className="block text-sm text-slate-900 dark:text-white">{cfg.spawnRate}</b>VUs/s</span>
                        <span className="text-slate-500"><b className="block text-sm text-slate-900 dark:text-white">{Math.round(cfg.durationSec/60)}m</b>Duration</span>
                      </div>
                    </button>;
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Spawn Rate (VUs/sec)</label>
                <input type="number" min="1" max="100000" value={testConfigs[testType].spawnRate}
                  onChange={e => updateSelectedConfig({spawnRate:Number(e.target.value)})}
                  className="w-full sm:w-64 px-3.5 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"/>
              </div>

              {/* Visual Stages Preview Chart */}
              <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Generated Load Stages ({testType})
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Total: {durationMinutes} min ({durationSec}s)
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    {stages.map((st, i) => (
                      <div key={i} className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <span className="text-[10px] text-slate-400 block">Stage {i + 1}</span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">{st.targetUsers} VUs</span>
                        <span className="text-[10px] text-slate-500 block">Duration: {st.duration}</span>
                      </div>
                    ))}
                  </div>

                  {/* SVG Ramp Curve */}
                  <div className="h-20 w-full pt-2">
                    <svg className="w-full h-full text-indigo-500" viewBox="0 0 500 80" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="grad-stage" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="currentColor" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M 0 75 L 80 15 L 420 15 L 500 75 Z"
                        fill="url(#grad-stage)"
                      />
                      <path
                        d="M 0 75 L 80 15 L 420 15 L 500 75"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Advanced Settings & Environment Specifications */}
          {currentStep === 4 && (
            <div className="space-y-5">
              {/* Preserved in test record notification banner */}
              <div className="p-3.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-2xs">
                    <Server className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-extrabold text-blue-900 dark:text-blue-200 text-xs block">
                      Target Server &amp; Environment Profiling
                    </span>
                    <p className="text-[11px] text-blue-700 dark:text-blue-300">
                      RAM, CPU, storage and network settings are preserved in the test record.
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200 border border-blue-300 dark:border-blue-700 whitespace-nowrap">
                  Preserved in Test Record
                </span>
              </div>

              {/* Operating System & Server Environment */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <span>1. Operating System &amp; Server Environment</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Server Environment Type */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Server Environment: Staging, Production, or Cloud
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'staging', label: 'Staging' },
                        { id: 'production', label: 'Production' },
                        { id: 'cloud', label: 'Cloud / AWS' },
                        { id: 'qa', label: 'QA / Testing' },
                        { id: 'development', label: 'Development' },
                        { id: 'on-premise', label: 'On-Premise' }
                      ].map(env => (
                        <button
                          key={env.id}
                          type="button"
                          onClick={() => setServerEnvironment(env.id)}
                          className={`py-1.5 px-2 text-[11px] font-bold rounded-lg border transition-all cursor-pointer ${
                            serverEnvironment === env.id
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                          }`}
                        >
                          {env.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Operating System */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Operating System
                    </label>
                    <input
                      type="text"
                      value={os}
                      onChange={(e) => setOs(e.target.value)}
                      placeholder="e.g. Ubuntu 22.04 LTS (x86_64)"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                    />
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {['Ubuntu 22.04 LTS', 'Alpine Linux 3.19', 'Debian 12', 'RHEL 9', 'Amazon Linux 2023', 'Windows Server 2022'].map(o => (
                        <button
                          key={o}
                          type="button"
                          onClick={() => setOs(o)}
                          className="px-2 py-0.5 text-[10px] rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
                        >
                          {o}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Advanced Environment */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Advanced Environment Architecture Details
                  </label>
                  <input
                    type="text"
                    value={advancedEnvironment}
                    onChange={(e) => setAdvancedEnvironment(e.target.value)}
                    placeholder="e.g. AWS EKS Cluster (eu-west-1) • Kubernetes v1.28 • Nginx Ingress • 3 Replicas"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Specify cluster nodes, container runtime, load balancer, or cloud region details for the audit record.
                  </p>
                </div>
              </div>

              {/* Hardware Specifications: RAM, Hard Disk, CPU Cores */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-emerald-600" />
                  <span>2. Hardware Specifications (RAM, Hard Disk, CPU Cores)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* RAM */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-indigo-500" />
                      <span>RAM</span>
                    </label>
                    <input
                      type="text"
                      value={ram}
                      onChange={(e) => setRam(e.target.value)}
                      placeholder="e.g. 16 GB DDR5"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                    />
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {['8 GB', '16 GB DDR5', '32 GB', '64 GB', '128 GB'].map(r => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRam(r)}
                          className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer"
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Hard Disk / Storage */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <HardDrive className="w-3.5 h-3.5 text-amber-500" />
                      <span>Hard Disk</span>
                    </label>
                    <input
                      type="text"
                      value={hardDisk}
                      onChange={(e) => setHardDisk(e.target.value)}
                      placeholder="e.g. 500 GB NVMe SSD"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                    />
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {['256 GB SSD', '500 GB NVMe', '1 TB SSD', '2 TB NVMe'].map(h => (
                        <button
                          key={h}
                          type="button"
                          onClick={() => setHardDisk(h)}
                          className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-amber-50 hover:text-amber-600 cursor-pointer"
                        >
                          {h}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* CPU Cores */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-emerald-500" />
                      <span>CPU Cores</span>
                    </label>
                    <input
                      type="text"
                      value={cpuCores}
                      onChange={(e) => setCpuCores(e.target.value)}
                      placeholder="e.g. 8 vCPUs (Intel Xeon 3.2GHz)"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                    />
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {['4 vCPUs', '8 vCPUs', '16 vCPUs', '32 Cores'].map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setCpuCores(c)}
                          className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-600 cursor-pointer"
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Network Speed Bandwidth: Download Speed & Upload Speed */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-cyan-600" />
                  <span>3. Network Speed &amp; Bandwidth Profile</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Download Speed */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Download Speed (Mbps)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max="100000"
                        value={downloadSpeedMbps}
                        onChange={(e) => setDownloadSpeedMbps(e.target.value)}
                        placeholder="1000"
                        className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold font-mono"
                      />
                      <span className="absolute right-3 top-2.5 text-[11px] font-bold text-slate-400">Mbps</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {[{ label: '100 Mbps', v: 100 }, { label: '500 Mbps', v: 500 }, { label: '1 Gbps (1000)', v: 1000 }, { label: '10 Gbps (10000)', v: 10000 }].map(d => (
                        <button
                          key={d.label}
                          type="button"
                          onClick={() => setDownloadSpeedMbps(d.v)}
                          className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-cyan-50 hover:text-cyan-600 cursor-pointer"
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Upload Speed */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Upload Speed (Mbps)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max="100000"
                        value={uploadSpeedMbps}
                        onChange={(e) => setUploadSpeedMbps(e.target.value)}
                        placeholder="500"
                        className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold font-mono"
                      />
                      <span className="absolute right-3 top-2.5 text-[11px] font-bold text-slate-400">Mbps</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {[{ label: '100 Mbps', v: 100 }, { label: '500 Mbps', v: 500 }, { label: '1 Gbps (1000)', v: 1000 }, { label: '5 Gbps (5000)', v: 5000 }].map(u => (
                        <button
                          key={u.label}
                          type="button"
                          onClick={() => setUploadSpeedMbps(u.v)}
                          className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-cyan-50 hover:text-cyan-600 cursor-pointer"
                        >
                          {u.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Telemetry & SLA Thresholds */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Prometheus Remote-Write Target URL
                  </label>
                  <input
                    type="text"
                    value={prometheusUrl}
                    onChange={(e) => setPrometheusUrl(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    k6 will transmit live telemetry directly using the Prometheus remote-write receiver.
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    SLA Performance Thresholds
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-emerald-600 dark:text-emerald-400 block font-medium">Excellent P95</span>
                      <span className="font-bold text-slate-900 dark:text-white">&le; 500 ms</span>
                    </div>
                    <div>
                      <span className="text-emerald-600 dark:text-emerald-400 block font-medium">Good P95</span>
                      <span className="font-bold text-slate-900 dark:text-white">&le; 1000 ms</span>
                    </div>
                    <div>
                      <span className="text-amber-600 dark:text-amber-400 block font-medium">Warning P95</span>
                      <span className="font-bold text-slate-900 dark:text-white">&le; 2000 ms</span>
                    </div>
                    <div>
                      <span className="text-rose-600 dark:text-rose-400 block font-medium">Critical P95</span>
                      <span className="font-bold text-slate-900 dark:text-white">&gt; 2000 ms</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Review & Start */}
          {currentStep === 5 && (
            <div className="space-y-5">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                  <span className="text-slate-400 block">Engine &amp; Type</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 uppercase">{engine} • {testType}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                  <span className="text-slate-400 block">Virtual Users</span>
                  <span className="font-bold text-slate-900 dark:text-white">{users} VUs</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                  <span className="text-slate-400 block">Duration / Ramp</span>
                  <span className="font-bold text-slate-900 dark:text-white">{durationMinutes}m / {rampUpMinutes}m</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                  <span className="text-slate-400 block">Endpoints</span>
                  <span className="font-bold text-slate-900 dark:text-white">{activeEndpointsToRun.length} Routes</span>
                </div>
              </div>

              {/* Hardware & Environment Summary Card */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-blue-600" />
                    <span>Target Hardware &amp; Network Configuration (Preserved)</span>
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                    Env: {serverEnvironment}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block">OS</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">{os}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Hardware (RAM / CPU / Disk)</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">{ram} • {cpuCores} • {hardDisk}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Network (Download / Upload)</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">↓ {downloadSpeedMbps} Mbps / ↑ {uploadSpeedMbps} Mbps</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Advanced Env Architecture</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">{advancedEnvironment}</span>
                  </div>
                </div>
              </div>

              {/* Code Preview Switcher & Pipeline Scope Controls */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
                {/* Header Controls Bar */}
                <div className="bg-slate-900 px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Engine Switcher */}
                    <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                      <button
                        type="button"
                        onClick={() => setPreviewTab('locust')}
                        className={`px-3 py-1.5 rounded-md text-xs font-mono font-bold transition-all cursor-pointer ${
                          previewTab === 'locust'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Locust (locustfile.py)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewTab('k6')}
                        className={`px-3 py-1.5 rounded-md text-xs font-mono font-bold transition-all cursor-pointer ${
                          previewTab === 'k6'
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        k6 (test.js)
                      </button>
                    </div>

                    {/* Scope Selector: All 6 Test Types vs Single Test */}
                    <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                      <button
                        type="button"
                        onClick={() => setScriptScope('suite')}
                        className={`px-2.5 py-1.5 rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          scriptScope === 'suite'
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span>⚡ All 6 Test Types (Full Pipeline)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setScriptScope('single')}
                        className={`px-2.5 py-1.5 rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          scriptScope === 'single'
                            ? 'bg-slate-700 text-white shadow-xs'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span>Single Phase: {testType}</span>
                      </button>
                    </div>
                  </div>

                  {/* Actions: Copy & Download */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyScript}
                      className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 cursor-pointer font-semibold transition-colors"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadScript}
                      className="flex items-center gap-1.5 text-xs text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors shadow-2xs"
                      title="Download runnable script file"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download {previewTab === 'k6' ? 'k6 script (.js)' : 'Locust (.py)'}</span>
                    </button>
                  </div>
                </div>

                {/* Scope Description Banner */}
                {scriptScope === 'suite' && (
                  <div className="bg-slate-950/80 px-4 py-2 text-[11px] text-blue-300 border-b border-slate-800 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                      <span><strong>6-Phase Automated Execution:</strong> Load Test (100 VUs) → Stress Test (500 VUs) → Spike Test (1000 VUs) → Endurance Test (50 VUs) → Volume Test (150 VUs) → Concurrency Test (250 VUs)</span>
                    </span>
                  </div>
                )}

                <pre className="p-4 bg-[#0a0d12] text-slate-300 font-mono text-[11px] leading-relaxed max-h-72 overflow-y-auto">
                  <code>{previewTab === 'k6' ? k6Script : locustScript}</code>
                </pre>
              </div>

              {/* Measurement Pipeline & TestID Filtering Parity Guarantee */}
              <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/30 dark:bg-indigo-950/20 space-y-3">
                <div className="flex items-center gap-2">
                  <Network className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    k6 Measurement Pipeline & Prometheus Parity
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] text-slate-600 dark:text-slate-300">
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-slate-900 dark:text-white block mb-1">1. Isolated Test ID</span>
                    <code className="text-[10px] text-indigo-600 dark:text-indigo-400 block font-mono">
                      testid=&quot;${'{testid}'}&quot;
                    </code>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Prometheus queries filter only this specific run. No historical cross-run aggregation.
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-slate-900 dark:text-white block mb-1">2. Duration Histogram</span>
                    <code className="text-[10px] text-indigo-600 dark:text-indigo-400 block font-mono">
                      histogram_quantile(0.95, sum by(le)...)
                    </code>
                    <p className="text-[10px] text-slate-500 mt-1">
                      P95/P99 calculated strictly from actual k6 duration histogram buckets with no artificial clamping.
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-slate-900 dark:text-white block mb-1">3. Real k6 Source of Truth</span>
                    <code className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-mono">
                      handleSummary(data)
                    </code>
                    <p className="text-[10px] text-slate-500 mt-1">
                      All dashboard and PDF report values match the raw k6 summary JSON exactly.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Bottom Bar */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                if (currentStep === 1) onCancel();
                else setCurrentStep(currentStep - 1);
              }}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{currentStep === 1 ? 'Cancel' : 'Previous Step'}</span>
            </button>

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>Next: {steps[currentStep].title.replace(/^\d+\.\s*/, '')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleExecuteStart(false)}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Start Single Test ({testType})</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleExecuteStart(true)}
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-600 hover:from-indigo-700 hover:to-emerald-700 text-white text-xs font-bold rounded-lg shadow-md shadow-indigo-600/30 transition-all cursor-pointer flex items-center gap-2"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>Execute Full Suite Automatically ({projectTestPlan.length} Tests)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* UNIFIED IMPORT HUB MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Import & Discover Endpoints</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Easily pull endpoints from multiple sources without needing HAR captures.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportError(null);
                }}
                className="text-slate-400 hover:text-slate-600 text-xs px-2 py-1 rounded"
              >
                ✕ Close
              </button>
            </div>

            {/* Import Source Tabs */}
            <div className="flex flex-wrap gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
              <button
                onClick={() => {
                  setActiveImportTab('templates');
                  setImportError(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeImportTab === 'templates'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Flow Blueprints</span>
              </button>

              <button
                onClick={() => {
                  setActiveImportTab('openapi');
                  setImportError(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeImportTab === 'openapi'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <FileCode2 className="w-3.5 h-3.5" />
                <span>Swagger / OpenAPI</span>
              </button>

              <button
                onClick={() => {
                  setActiveImportTab('curl');
                  setImportError(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeImportTab === 'curl'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>cURL Commands</span>
              </button>

              <button
                onClick={() => {
                  setActiveImportTab('postman');
                  setImportError(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeImportTab === 'postman'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Postman (v2.1)</span>
              </button>

              <button
                onClick={() => {
                  setActiveImportTab('discovery');
                  setImportError(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeImportTab === 'discovery'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Live Auto-Probe</span>
              </button>

              <button
                onClick={() => {
                  setActiveImportTab('har');
                  setImportError(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeImportTab === 'har'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Browser HAR</span>
              </button>
            </div>

            {importError && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{importError}</span>
              </div>
            )}

            <div className="flex-1 overflow-y-auto pr-1 space-y-4">
              {/* TAB 1: Architectural Flow Templates */}
              {activeImportTab === 'templates' && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500">
                    Choose a realistic enterprise workload blueprint. Includes pre-configured endpoint weights, header schemas, and sample payload parameters.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PRESET_FLOW_TEMPLATES.map((tpl) => (
                      <div
                        key={tpl.id}
                        className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">{tpl.name}</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                              {tpl.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                            {tpl.description}
                          </p>
                          <div className="flex items-center gap-3 text-[10px] text-slate-400 mb-3 font-mono">
                            <span>{tpl.endpoints.length} Endpoints</span>
                            <span>•</span>
                            <span>Rec: {tpl.recommendedVUs} VUs</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleApplyTemplate(tpl)}
                          className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Apply This Flow</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: OpenAPI / Swagger */}
              {activeImportTab === 'openapi' && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500">
                    Paste raw OpenAPI / Swagger JSON or YAML, or enter an API Base URL / Documentation Spec URL.
                  </p>
                  <div className="rounded-xl border border-dashed border-indigo-300 dark:border-indigo-700 bg-indigo-50/50 dark:bg-indigo-950/20 p-3">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Upload Swagger / OpenAPI File
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id="openapi-file-upload"
                        type="file"
                        accept=".json,.yaml,.yml,.js,application/json,text/yaml,application/yaml,text/javascript,application/javascript"
                        onChange={handleOpenApiFile}
                        className="block w-full text-xs text-slate-600 dark:text-slate-300 file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-indigo-600 file:text-white file:text-xs file:font-semibold file:cursor-pointer"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Upload <code>.json</code>, <code>.yaml</code>, <code>.yml</code>, or <code>.js</code> Swagger/OpenAPI files. JS Swagger configurations are inspected for an embedded spec or spec URL.
                    </p>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Target URL or Spec URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={importUrl}
                        onChange={(e) => {
                          setImportUrl(e.target.value);
                          if (!discoveryUrl) setDiscoveryUrl(e.target.value);
                        }}
                        placeholder="e.g. http://196.188.240.103/office-api/api or https://petstore.swagger.io/v2/swagger.json"
                        className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleImportOpenApi}
                        disabled={isDiscovering || !importUrl.trim()}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer"
                      >
                        {isDiscovering ? <Zap className="w-3.5 h-3.5 animate-spin" /> : <Compass className="w-3.5 h-3.5" />}
                        <span>{isDiscovering ? 'Analyzing...' : 'Discover & Fetch'}</span>
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Accepts both exact spec URLs (<code>/swagger.json</code>) or general API mount paths (e.g. <code>/office-api/api</code>).
                    </p>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Or Paste Raw OpenAPI / Swagger JSON / YAML
                    </label>
                    <textarea
                      value={importInput}
                      onChange={(e) => setImportInput(e.target.value)}
                      placeholder={`openapi: 3.0.0\ninfo:\n  title: Sample API\n  version: 1.0.0\npaths:\n  /users:\n    get:\n      summary: Get all users`}
                      rows={6}
                      className="w-full p-2.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleImportOpenApi}
                    disabled={!importInput.trim()}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg cursor-pointer"
                  >
                    Import Pasted Specification
                  </button>
                </div>
              )}

              {/* TAB 3: cURL Commands */}
              {activeImportTab === 'curl' && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500">
                    Paste one or multiple <code>curl</code> commands copied from your browser DevTools (Right Click Request &rarr; Copy as cURL) or API documentation.
                  </p>
                  <textarea
                    value={importInput}
                    onChange={(e) => setImportInput(e.target.value)}
                    placeholder={`curl -X POST https://api.example.com/api/v1/auth/login \\\n  -H "Content-Type: application/json" \\\n  -d '{"username": "admin", "password": "123"}'`}
                    rows={7}
                    className="w-full p-2.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono leading-relaxed"
                  />
                  <button
                    type="button"
                    onClick={handleImportCurl}
                    disabled={!importInput.trim()}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg cursor-pointer"
                  >
                    Parse cURL Commands
                  </button>
                </div>
              )}

              {/* TAB 4: Postman Collection */}
              {activeImportTab === 'postman' && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500">
                    Export your collection from Postman (v2.1 JSON) and paste it here. All nested requests, query parameters, headers, and request bodies will be imported.
                  </p>
                  <textarea
                    value={importInput}
                    onChange={(e) => setImportInput(e.target.value)}
                    placeholder='{"info": {"name": "My API Collection", "schema": "..."}, "item": [...]}'
                    rows={7}
                    className="w-full p-2.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleImportPostman}
                    disabled={!importInput.trim()}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg cursor-pointer"
                  >
                    Import Postman Collection
                  </button>
                </div>
              )}

              {/* TAB 5: Live Auto-Discovery Probe */}
              {activeImportTab === 'discovery' && (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-2">
                      Enter any Base URL or API mount path (e.g. <code>http://196.188.240.103/office-api/api</code>). The engine automatically probes parent routes, application roots, and Swagger UI documents.
                    </p>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Target URL or Base API Path to Probe
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={discoveryUrl || baseUrl}
                        onChange={(e) => {
                          setDiscoveryUrl(e.target.value);
                          setBaseUrl(e.target.value);
                        }}
                        placeholder="e.g. http://196.188.240.103/office-api/api"
                        className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleAutoDiscoverProbe}
                        disabled={isDiscovering || !(discoveryUrl || baseUrl).trim()}
                        className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
                      >
                        {isDiscovering ? <Zap className="w-3.5 h-3.5 animate-spin" /> : <Compass className="w-3.5 h-3.5" />}
                        <span>{isDiscovering ? 'Probing Hierarchy...' : 'Run Auto-Discovery'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Multi-tier Probe Strategy Banner */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] space-y-1.5">
                    <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Network className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Multi-Tier Probing Strategy:</span>
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                      <div className="bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800">
                        <span className="font-bold block text-slate-700 dark:text-slate-300">1. Direct Path</span>
                        <span>/openapi.json, /swagger.json, /v3/api-docs</span>
                      </div>
                      <div className="bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800">
                        <span className="font-bold block text-slate-700 dark:text-slate-300">2. Parent Mount</span>
                        <span>/office-api/openapi.json, /v2/api-docs</span>
                      </div>
                      <div className="bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800">
                        <span className="font-bold block text-slate-700 dark:text-slate-300">3. Root Origin</span>
                        <span>/swagger-ui.html HTML bundle crawler</span>
                      </div>
                    </div>
                  </div>

                  {/* DISCOVERY DIAGNOSTICS RESULT PANEL */}
                  {discoveryResult && !discoveryResult.success && (
                    <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/70 dark:bg-amber-950/20 space-y-3">
                      <div className="flex items-start gap-2.5">
                        {discoveryResult.diagnostics.networkErrorDetected ? (
                          <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                        ) : (
                          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                            {discoveryResult.diagnostics.statusSummary}
                          </h4>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                            Tested {discoveryResult.totalLocationsProbed} documentation paths across entered URL, parent path hierarchy, and root origin.
                          </p>
                        </div>
                      </div>

                      {/* Technical Breakdown */}
                      <div className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400 bg-white/70 dark:bg-slate-900/70 p-3 rounded-lg border border-amber-200/60 dark:border-amber-900/30">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block text-[10px] uppercase tracking-wider">
                          Diagnostic Analysis:
                        </span>
                        <ul className="list-disc pl-4 space-y-1">
                          {discoveryResult.diagnostics.diagnosticDetails.map((detail, idx) => (
                            <li key={idx}>{detail}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Recommended Alternative Ingestion Actions */}
                      <div className="space-y-2 pt-1">
                        <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block">
                          Recommended next steps to import your endpoints:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveImportTab('openapi');
                              setImportInput('');
                            }}
                            className="p-2.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg text-left transition-colors cursor-pointer"
                          >
                            <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400 block flex items-center gap-1.5">
                              <FileCode2 className="w-3.5 h-3.5" />
                              <span>Paste OpenAPI / Swagger Spec</span>
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                              Copy JSON/YAML directly from your code repository or local dev Swagger.
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setActiveImportTab('postman');
                              setImportInput('');
                            }}
                            className="p-2.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg text-left transition-colors cursor-pointer"
                          >
                            <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400 block flex items-center gap-1.5">
                              <Send className="w-3.5 h-3.5" />
                              <span>Import Postman Collection</span>
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                              Export your tested collection from Postman (v2.1 JSON).
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setActiveImportTab('curl');
                              setImportInput('');
                            }}
                            className="p-2.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg text-left transition-colors cursor-pointer"
                          >
                            <span className="font-bold text-xs text-cyan-600 dark:text-cyan-400 block flex items-center gap-1.5">
                              <Terminal className="w-3.5 h-3.5" />
                              <span>Paste cURL Commands</span>
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                              Copy as cURL from browser DevTools Network tab.
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setActiveImportTab('templates');
                            }}
                            className="p-2.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg text-left transition-colors cursor-pointer"
                          >
                            <span className="font-bold text-xs text-purple-600 dark:text-purple-400 block flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Use Architecture Flow Blueprint</span>
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                              Pre-configured enterprise e-commerce, auth, and microservice traffic.
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Collapsible Full Probe Log */}
                      <div className="pt-2 border-t border-amber-200/60 dark:border-amber-900/40">
                        <button
                          type="button"
                          onClick={() => setShowProbedDetails(!showProbedDetails)}
                          className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                        >
                          {showProbedDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          <span>{showProbedDetails ? 'Hide' : 'Show'} detailed probe URL log ({discoveryResult.probedLocations.length} endpoints)</span>
                        </button>

                        {showProbedDetails && (
                          <div className="mt-2 max-h-40 overflow-y-auto space-y-1 font-mono text-[10px] p-2 bg-slate-900 text-slate-200 rounded-lg">
                            {discoveryResult.probedLocations.map((loc, idx) => (
                              <div key={idx} className="flex items-center justify-between py-0.5 border-b border-slate-800">
                                <span className="truncate pr-2">{loc.url}</span>
                                <span className={`px-1.5 py-0.2 rounded text-[9px] ${
                                  loc.status === 200 ? 'bg-emerald-900 text-emerald-300' :
                                  loc.status === 404 ? 'bg-slate-800 text-slate-400' :
                                  'bg-rose-950 text-rose-300'
                                }`}>
                                  {loc.status || 'FAILED'}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 6: HAR Import */}
              {activeImportTab === 'har' && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500">
                    Paste your browser Network Export HAR JSON. Static files like images and CSS are automatically filtered out.
                  </p>
                  <textarea
                    value={importInput}
                    onChange={(e) => setImportInput(e.target.value)}
                    placeholder='Paste {"log": { "entries": [...] }} here...'
                    rows={7}
                    className="w-full p-2.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleProcessHar}
                    disabled={!importInput.trim()}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg cursor-pointer"
                  >
                    Extract Endpoints from HAR
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TECHNIQUES & BEST PRACTICES GUIDE MODAL */}
      {showTechniquesModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Essential Performance Testing Techniques
                  </h3>
                  <p className="text-xs text-slate-500">
                    Industry techniques to generate realistic traffic, prevent false cache hits, and simulate human workflows.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTechniquesModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs px-2 py-1 rounded"
              >
                ✕ Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {TESTING_TECHNIQUES.map((tech, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-2.5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{tech.title}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                          {tech.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                        {tech.summary}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <pre className="p-2.5 rounded-lg bg-slate-900 text-emerald-400 font-mono text-[10px] overflow-x-auto leading-relaxed border border-slate-800">
                        <code>{tech.codeSnippet}</code>
                      </pre>
                      <div className="text-[10px] text-indigo-600 dark:text-indigo-400 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Benefit: {tech.benefit}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Dynamic Parameter Syntax Reference */}
              <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 space-y-2">
                <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 block">
                  Built-in Dynamic Parameter Tokens for Payloads & Headers:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono text-slate-700 dark:text-slate-300">
                  <div className="p-2 rounded bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-900">
                    <span className="font-bold text-indigo-600">{`{{VU_ID}}`}</span>
                    <span className="block text-[10px] text-slate-400">Current Virtual User #</span>
                  </div>
                  <div className="p-2 rounded bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-900">
                    <span className="font-bold text-indigo-600">{`{{TIMESTAMP}}`}</span>
                    <span className="block text-[10px] text-slate-400">Epoch millisecond</span>
                  </div>
                  <div className="p-2 rounded bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-900">
                    <span className="font-bold text-indigo-600">{`{{AUTH_TOKEN}}`}</span>
                    <span className="block text-[10px] text-slate-400">Chained JWT token</span>
                  </div>
                  <div className="p-2 rounded bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-900">
                    <span className="font-bold text-indigo-600">{`{{RANDOM_ID}}`}</span>
                    <span className="block text-[10px] text-slate-400">Randomized 6-char UUID</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Endpoint Modal */}
      {showEndpointModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {editingEndpointIndex !== null ? 'Edit Endpoint' : 'Add New Endpoint'}
            </h3>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Method</label>
                <select
                  value={epMethod}
                  onChange={(e) => setEpMethod(e.target.value as HttpMethod)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                  <option value="PATCH">PATCH</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Path</label>
                <input
                  type="text"
                  value={epPath}
                  onChange={(e) => setEpPath(e.target.value)}
                  placeholder="/api/users"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Name / Label</label>
                <input
                  type="text"
                  value={epDesc}
                  onChange={(e) => setEpDesc(e.target.value)}
                  placeholder="e.g. Fetch product listing"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Traffic Weight</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={epWeight}
                  onChange={(e) => setEpWeight(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Headers (JSON)</label>
              <textarea
                value={epHeaders}
                onChange={(e) => setEpHeaders(e.target.value)}
                rows={3}
                className="w-full p-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              />
            </div>

            {(epMethod === 'POST' || epMethod === 'PUT' || epMethod === 'PATCH') && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Request Body (JSON)</label>
                  <span className="text-[10px] text-indigo-500 font-mono">Supports {`{{VU_ID}}`}, {`{{TIMESTAMP}}`}</span>
                </div>
                <textarea
                  value={epBody}
                  onChange={(e) => setEpBody(e.target.value)}
                  rows={4}
                  placeholder='{"username": "user_{{VU_ID}}", "created": "{{TIMESTAMP}}"}'
                  className="w-full p-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>
            )}

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowEndpointModal(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEndpoint}
                className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
              >
                Save Endpoint
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
