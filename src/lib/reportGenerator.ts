import JSZip from 'jszip';
import { TestRun, EndpointResult, PerformanceRating, TestType } from '../types';
import { DEFAULT_THRESHOLDS, evaluateSystem, ratingFromScore } from './evaluator';

const esc = (v: unknown) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const ratingClass = (r: string) => r.toLowerCase().replace(/\s+/g, '-');

export const testDescriptions: Record<TestType, string> = {
  'Load Test': 'Measures system behavior under expected normal load.',
  'Stress Test': 'Determines system behavior beyond normal operating capacity.',
  'Spike Test': 'Measures system response to sudden changes in load.',
  'Endurance Test': 'Measures system stability during sustained load over time.',
  'Volume Test': 'Measures system behavior when handling large volumes of data or requests.',
  'Concurrency Test': 'Measures system behavior when many users or requests operate simultaneously.'
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
:root {
  --blue: #1d4ed8;
  --blue-subtle: #eff6ff;
  --blue-border: #bfdbfe;
  --ink: #0f172a;
  --muted: #64748b;
  --line: #e2e8f0;
  --bg: #f4f6fb;
  --card-bg: #ffffff;
  --emerald: #059669;
  --amber: #d97706;
  --rose: #e11d48;
}

* { box-sizing: border-box; }
body {
  margin: 0;
  background: radial-gradient(1100px 520px at -5% -10%, #eaf1ff 0%, transparent 55%), radial-gradient(900px 480px at 105% 0%, #fff7e6 0%, transparent 50%), var(--bg);
  color: var(--ink);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  position: relative;
  min-height: 100vh;
}

/* WATERMARK OVERLAY */
.watermark-layer {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  opacity: 0.012;
  user-select: none;
}
.watermark-content {
  transform: rotate(-25deg);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-align: center;
}
.watermark-logo {
  width: 96px;
  height: 96px;
  object-fit: contain;
  filter: grayscale(100%);
}
.watermark-title {
  font-size: 22px;
  font-weight: 900;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #0f172a;
}
.watermark-sub {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.35em;
  color: #334155;
  text-transform: uppercase;
}

.report-container {
  width: 1080px;
  max-width: calc(100% - 32px);
  margin: 28px auto;
  padding: 0 0 40px;
  position: relative;
  z-index: 1;
}

@media print {
  body { background: #ffffff; }
  .report-container { width: 1080px; max-width: 1080px; margin: 0 auto; }
  .about-card, .brand-header-card, .accordion-card, .kpi-card { break-inside: avoid; }
}

/* TOP BRANDED HEADER (Performance Blue & Gold Theme) */
.brand-header-card {
  background: linear-gradient(135deg, #071328 0%, #0c2040 45%, #122b56 75%, #1e3a8a 100%);
  border: 1px solid rgba(245, 158, 11, 0.45);
  border-top: 3px solid #f59e0b;
  border-radius: 18px;
  padding: 24px 28px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  box-shadow: 0 12px 30px -8px rgba(7, 19, 40, 0.45), 0 0 20px rgba(245, 158, 11, 0.1);
  gap: 20px;
  position: relative;
  overflow: hidden;
  color: #ffffff;
}
.brand-header-watermark {
  position: absolute;
  right: -24px;
  bottom: -24px;
  width: 190px;
  height: 190px;
  opacity: 0.12;
  pointer-events: none;
  object-fit: contain;
  filter: brightness(1.2) drop-shadow(0 0 12px rgba(245, 158, 11, 0.3));
}
.brand-header-left {
  display: flex;
  align-items: center;
  gap: 18px;
  position: relative;
  z-index: 1;
}
.brand-header-logo {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  object-fit: cover;
  border: 2px solid rgba(245, 158, 11, 0.6);
  box-shadow: 0 4px 14px rgba(0,0,0,0.35), 0 0 12px rgba(245, 158, 11, 0.25);
  flex-shrink: 0;
  background: #0f172a;
}
.brand-eyebrow {
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: #fbbf24;
  text-shadow: 0 0 10px rgba(251, 191, 36, 0.3);
}
.brand-title {
  margin: 3px 0 0;
  font-size: 22px;
  font-weight: 900;
  color: #ffffff;
  letter-spacing: -0.02em;
}
.brand-meta {
  margin: 6px 0 0;
  font-size: 12px;
  color: #cbd5e1;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}
.brand-meta b {
  color: #fde68a;
}

.engine-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: rgba(15, 33, 64, 0.85);
  border: 1px solid rgba(245, 158, 11, 0.4);
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  color: #f1f5f9;
  white-space: nowrap;
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  position: relative;
  z-index: 1;
}
.engine-badge b {
  color: #fbbf24;
}

/* HARDWARE & ENVIRONMENT SPEC GRID */
.env-spec-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 16px;
  margin-top: 14px;
}
.env-spec-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-top: 10px;
}
.env-spec-item {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 8px 12px;
}
.env-spec-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  color: #64748b;
  margin-bottom: 2px;
}
.env-spec-val {
  font-size: 12px;
  font-weight: 800;
  color: #0f172a;
}
.env-banner-note {
  font-size: 11px;
  font-weight: 700;
  color: #1e40af;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* TOP 4 KPI CARDS */
.kpi-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 24px;
}
.kpi-card {
  background: var(--card-bg);
  border: 1px solid var(--line);
  border-radius: 18px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.03);
}
.kpi-icon {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.kpi-icon.blue { background: #eff6ff; color: #2563eb; border: 1px solid #dbeafe; }
.kpi-icon.green { background: #ecfdf5; color: #10b981; border: 1px solid #d1fae5; }
.kpi-icon.orange { background: #fffbeb; color: #f59e0b; border: 1px solid #fef3c7; }
.kpi-icon.red { background: #fff1f2; color: #f43f5e; border: 1px solid #ffe4e6; }
.kpi-icon svg { width: 28px; height: 28px; }

.kpi-label {
  font-size: 11px;
  font-weight: 800;
  color: #64748b;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-bottom: 2px;
}
.kpi-value {
  font-size: 26px;
  font-weight: 900;
  color: #0f172a;
  letter-spacing: -0.02em;
}

/* NUMBERED ACCORDION SECTIONS */
.accordion-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 24px;
}
.accordion-card {
  background: var(--card-bg);
  border: 1px solid var(--line);
  border-radius: 18px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.03);
  overflow: hidden;
}
details.accordion-card summary {
  list-style: none;
  cursor: pointer;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  user-select: none;
}
details.accordion-card summary::-webkit-details-marker { display: none; }
details.accordion-card[open] summary {
  border-bottom: 1px solid #f1f5f9;
}

.sec-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.sec-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: #eff6ff;
  border: 1px solid #dbeafe;
  color: #1d4ed8;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.sec-icon.amber {
  background: #fffbeb;
  border: 1px solid #fef3c7;
  color: #d97706;
}
.sec-icon svg { width: 22px; height: 22px; }

.sec-title {
  margin: 0;
  font-size: 13px;
  font-weight: 900;
  color: #1d4ed8;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.sec-desc {
  margin: 2px 0 0;
  font-size: 12px;
  color: #64748b;
}

.sec-right {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-shrink: 0;
}
.stat-pill {
  padding: 5px 14px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.stat-pill.blue { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
.stat-pill.amber { background: #fffbeb; color: #b45309; border: 1px solid #fde68a; }
.stat-pill.green { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; }
.stat-pill.rose { background: #fff1f2; color: #be123c; border: 1px solid #fecdd3; }

.inline-metrics {
  display: flex;
  gap: 18px;
  font-size: 11px;
  text-align: left;
}
.inline-metric-item span {
  display: block;
  font-size: 10px;
  color: #94a3b8;
  margin-bottom: 1px;
}
.inline-metric-item b {
  font-size: 13px;
  font-weight: 800;
  color: #0f172a;
}
.inline-metric-item b.green { color: #059669; }

.chevron {
  color: #1d4ed8;
  font-size: 14px;
  font-weight: bold;
}

.card-body {
  padding: 20px 24px;
  font-size: 12px;
  background: #fafcff;
}

/* 6 KPI MINI GRID IN SECTION 02 */
.kpi-mini-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}
.kpi-mini-box {
  padding: 12px 14px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
}
.kpi-mini-label {
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  color: #64748b;
  margin-bottom: 4px;
}
.kpi-mini-val {
  font-size: 10px;
  font-weight: 900;
  color: #0f172a;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}
.kpi-mini-val.green { color: #059669; }
.kpi-mini-val.amber { color: #d97706; }
.kpi-mini-val.rose { color: #e11d48; }

/* DATA TABLES */
.report-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  text-align: left;
}
.report-table th {
  padding: 10px 12px;
  background: #f8fafc;
  border-bottom: 1px solid var(--line);
  font-size: 10px;
  text-transform: uppercase;
  color: #64748b;
  font-weight: 800;
}
.report-table td {
  padding: 10px 12px;
  border-bottom: 1px solid #f1f5f9;
}
.sla-table { width: 100%; table-layout: fixed; }
.sla-table th:nth-child(1) { width: 26%; }
.sla-table th:nth-child(2) { width: 14%; }
.sla-table th:nth-child(3) { width: 15%; }
.sla-table th:nth-child(4) { width: 15%; }
.sla-table th:nth-child(5) { width: 15%; }
.sla-table th:nth-child(6) { width: 15%; }
.sla-table th.target-col, .sla-table td.target-col { background: #eff6ff; }
.sla-table th.warning-col, .sla-table td.warning-col { background: #fffbeb; }
.sla-table th.critical-col, .sla-table td.critical-col { background: #fff1f2; }
.sla-table th.target-col { color: #1d4ed8; border-bottom: 2px solid #93c5fd; }
.sla-table th.warning-col { color: #b45309; border-bottom: 2px solid #fbbf24; }
.sla-table th.critical-col { color: #be123c; border-bottom: 2px solid #fb7185; }
.sla-table td code { white-space: nowrap; font-weight: 800; }
.sla-table td.target-col code { color: #1d4ed8; }
.sla-table td.warning-col code { color: #b45309; }
.sla-table td.critical-col code { color: #be123c; }
@media (max-width: 900px) {
  .sla-table { min-width: 900px; }
  .sla-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
}
.pass-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 999px;
  background: #ecfdf5;
  color: #047857;
  font-size: 10px;
  font-weight: 900;
  border: 1px solid #a7f3d0;
}
.warn-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 999px;
  background: #fffbeb;
  color: #b45309;
  font-size: 10px;
  font-weight: 900;
  border: 1px solid #fde68a;
}
.fail-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 999px;
  background: #fff1f2;
  color: #be123c;
  font-size: 10px;
  font-weight: 900;
  border: 1px solid #fecdd3;
}
.neutral-badge {
  display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; border-radius: 999px;
  background: #f8fafc; color: #475569; font-size: 10px; font-weight: 900; border: 1px solid #cbd5e1;
}

/* ABOUT THIS REPORT */
.about-card {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #bfdbfe;
  background: linear-gradient(135deg, #eff6ff 0%, #f5f9ff 60%, #ffffff 100%);
  border-radius: 10px;
  padding: 8px 12px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 0 0 10px;
  box-shadow: 0 4px 14px -8px rgba(29, 78, 216, 0.25);
}
.about-icon {
  width: 17px; height: 17px; color: #2563eb; flex: 0 0 17px; margin-top: 1px;
}
.about-title { margin: 0; font-size: 10px; font-weight: 900; color: #1e3a8a; letter-spacing: 0.04em; text-transform: uppercase; }
.about-text { margin: 2px 0 0; max-width: 980px; font-size: 9px; color: #475569; line-height: 1.35; }

/* COMPACT FOOTER */
.report-footer {
  width: 100%; box-sizing: border-box; min-height: 34px;
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 7px 2px 0; border-top: 1px solid #e2e8f0;
  color: #64748b; font-size: 9px; line-height: 1.25;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}
.footer-brand { display: flex; align-items: center; gap: 6px; min-width: 0; }
.footer-brand span { line-height: 1.25; }
.footer-logo { width: 18px; height: 18px; object-fit: contain; flex: 0 0 18px; border: 0; border-radius: 0; }
.footer-meta { flex: 0 0 auto; text-align: right; white-space: nowrap; }

@media (max-width: 860px) {
  .report-container { width: calc(100% - 24px); max-width: calc(100% - 24px); }
  .kpi-row { grid-template-columns: repeat(2, 1fr); }
  .kpi-mini-grid { grid-template-columns: repeat(3, 1fr); }
  .inline-metrics { display: none; }
  .brand-header-card { flex-direction: column; align-items: flex-start; gap: 14px; }
  .report-footer { flex-direction: column; align-items: flex-start; gap: 10px; }
}

.kpi-value {
  font-size: 26px;
  font-weight: 900;
  color: #0f172a;
  letter-spacing: -0.02em;
}

/* NUMBERED ACCORDION SECTIONS */
.accordion-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 24px;
}
.accordion-card {
  background: var(--card-bg);
  border: 1px solid var(--line);
  border-radius: 18px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.03);
  overflow: hidden;
}
details.accordion-card summary {
  list-style: none;
  cursor: pointer;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  user-select: none;
}
details.accordion-card summary::-webkit-details-marker { display: none; }
details.accordion-card[open] summary {
  border-bottom: 1px solid #f1f5f9;
}

.sec-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.sec-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: #eff6ff;
  color: #1d4ed8;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.sec-icon.amber {
  background: #fffbeb;
  color: #d97706;
}
.sec-icon svg { width: 22px; height: 22px; }

.sec-title {
  margin: 0;
  font-size: 13px;
  font-weight: 900;
  color: #1d4ed8;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.sec-desc {
  margin: 2px 0 0;
  font-size: 12px;
  color: #64748b;
}

.sec-right {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-shrink: 0;
}
.stat-pill {
  padding: 5px 14px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
}
.stat-pill.blue { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
.stat-pill.amber { background: #fffbeb; color: #b45309; border: 1px solid #fde68a; }
.stat-pill.green { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; }

.inline-metrics {
  display: flex;
  gap: 18px;
  font-size: 11px;
  text-align: left;
}
.inline-metric-item span {
  display: block;
  font-size: 10px;
  color: #94a3b8;
  margin-bottom: 1px;
}
.inline-metric-item b {
  font-size: 13px;
  font-weight: 800;
  color: #0f172a;
}
.inline-metric-item b.green { color: #059669; }

.chevron {
  color: #1d4ed8;
  font-size: 14px;
  font-weight: bold;
}

.card-body {
  padding: 20px 24px;
  font-size: 12px;
  background: #fafcff;
}

/* DATA TABLES */
.report-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  text-align: left;
}
.report-table th {
  padding: 10px 12px;
  background: #f8fafc;
  border-bottom: 1px solid var(--line);
  font-size: 10px;
  text-transform: uppercase;
  color: #64748b;
  font-weight: 800;
}
.report-table td {
  padding: 10px 12px;
  border-bottom: 1px solid #f1f5f9;
}
.sla-table { width: 100%; table-layout: fixed; }
.sla-table th:nth-child(1) { width: 26%; }
.sla-table th:nth-child(2) { width: 14%; }
.sla-table th:nth-child(3) { width: 15%; }
.sla-table th:nth-child(4) { width: 15%; }
.sla-table th:nth-child(5) { width: 15%; }
.sla-table th:nth-child(6) { width: 15%; }
.sla-table th.target-col, .sla-table td.target-col { background: #eff6ff; }
.sla-table th.warning-col, .sla-table td.warning-col { background: #fffbeb; }
.sla-table th.critical-col, .sla-table td.critical-col { background: #fff1f2; }
.sla-table th.target-col { color: #1d4ed8; border-bottom: 2px solid #93c5fd; }
.sla-table th.warning-col { color: #b45309; border-bottom: 2px solid #fbbf24; }
.sla-table th.critical-col { color: #be123c; border-bottom: 2px solid #fb7185; }
.sla-table td code { white-space: nowrap; font-weight: 800; }
.sla-table td.target-col code { color: #1d4ed8; }
.sla-table td.warning-col code { color: #b45309; }
.sla-table td.critical-col code { color: #be123c; }
@media (max-width: 900px) {
  .sla-table { min-width: 900px; }
  .sla-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
}
.pass-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 999px;
  background: #ecfdf5;
  color: #047857;
  font-size: 10px;
  font-weight: 900;
}
.fail-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 999px;
  background: #fff1f2;
  color: #be123c;
  font-size: 10px;
  font-weight: 900;
}

/* ABOUT THIS REPORT */
.about-card {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #dbe4ef;
  background: #f8fafc;
  border-radius: 10px;
  padding: 8px 12px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 0 0 10px;
}
.about-icon {
  width: 17px;
  height: 17px;
  color: #2563eb;
  flex: 0 0 18px;
  margin-top: 1px;
}
.about-title {
  margin: 0;
  font-size: 10px;
  font-weight: 800;
  color: #1e3a8a;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.about-text {
  margin: 3px 0 0;
  max-width: 900px;
  font-size: 9px;
  color: #475569;
  line-height: 1.35;
}

.report-footer {
  width: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 2px 0;
  border-top: 1px solid #e2e8f0;
  color: #64748b;
  font-size: 9px;
}
.footer-brand {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
}
.footer-logo {
  width: 22px;
  height: 22px;
  object-fit: contain;
  flex: 0 0 22px;
}
.footer-brand span {
  line-height: 1.35;
}
.footer-meta {
  flex: 0 0 auto;
  text-align: right;
  white-space: nowrap;
}
@media (max-width: 700px) {
  .report-footer { flex-direction: column; align-items: flex-start; }
  .footer-meta { text-align: left; white-space: normal; }
}

/* FOOTER */
.report-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 18px;
  border-top: 1px solid var(--line);
  font-size: 11px;
  color: #64748b;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  gap: 10px;
}
.footer-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.footer-brand span {
  line-height: 1.45;
}
.footer-logo {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  object-fit: cover;
  border: 1px solid #cbd5e1;
}

@media (max-width: 860px) {
  .report-container { width: calc(100% - 24px); max-width: calc(100% - 24px); }
  .kpi-row { grid-template-columns: repeat(2, 1fr); }
  .inline-metrics { display: none; }
  .brand-header-card { flex-direction: column; align-items: flex-start; gap: 14px; }
  .report-footer { flex-direction: column; align-items: flex-start; gap: 10px; }
}
`;

export function buildIndividualReport(run: TestRun, logo = ''): string {
  const thresholds = run.thresholds || DEFAULT_THRESHOLDS;
  const durationSec = run.durationSec || run.elapsedSec || 0;
  const effectiveRps = run.rps > 0
    ? run.rps
    : (run.requests > 0 && durationSec > 0 ? run.requests / durationSec : 0);

  const d = evaluateSystem(
    run.p95Ms,
    run.p99Ms,
    run.avgResponseMs,
    run.errorRate,
    run.endpointResults,
    thresholds,
    run.testType,
    run.engine,
    run.timeline,
    effectiveRps,
    run.requests,
    durationSec
  );

  const escHtml = (value: unknown) => esc(value);
  const score = Math.round(d.overallScore || 0);
  const finalStatus = d.production.status || d.overallRating || 'NOT RECORDED';
  const statusClass =
    finalStatus === 'READY FOR PRODUCTION' ? 'green' :
    finalStatus === 'READY WITH OPTIMIZATION' ? 'blue' :
    finalStatus === 'NEEDS REMEDIATION' ? 'amber' : 'rose';

  const statusChip =
    run.status === 'COMPLETED' ? '🟢 Ready' :
    run.status === 'FAILED' ? '🔴 Failed' :
    `🟡 ${run.status || 'Not Recorded'}`;

  const successRate = run.requests > 0
    ? Math.max(0, 100 - run.errorRate)
    : 0;
  const timeoutCount = run.endpointResults.reduce(
    (sum, ep) => sum + Math.max(0, ep.timeouts || 0), 0
  );
  const timeoutRate = run.requests > 0 ? (timeoutCount / run.requests) * 100 : 0;
  const http5xx = run.requests > 0 ? (run.status5xx / run.requests) * 100 : 0;
  const http4xx = run.requests > 0 ? (run.status4xx / run.requests) * 100 : 0;

  const endpointRows = run.endpointResults.length
    ? run.endpointResults.map(ep => `
      <tr>
        <td><b style="color:#2563eb">${escHtml(ep.method)}</b></td>
        <td><code>${escHtml(ep.endpoint)}</code></td>
        <td style="text-align:right">${ep.requests.toLocaleString()}</td>
        <td style="text-align:right">${Number(ep.rps || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
        <td style="text-align:right">${Math.round(ep.avg || 0)} ms</td>
        <td style="text-align:right">${Math.round(ep.p95 || 0)} ms</td>
        <td style="text-align:right">${Math.round(ep.p99 || 0)} ms</td>
        <td style="text-align:right">${Number(ep.failureRate || 0).toFixed(2)}%</td>
        <td style="text-align:right"><span class="${ep.failureRate <= (thresholds.errorRateWarningPct ?? 2.5) ? 'pass-badge' : 'neutral-badge'}">${escHtml(ep.rating)}</span></td>
      </tr>`).join('')
    : `<tr><td colspan="9" style="text-align:center"><span class="neutral-badge">Not Recorded</span></td></tr>`;

  const slaRows = d.sla.gates.length
    ? d.sla.gates.map(g => {
      const statusClass = g.status === 'PASS' ? 'pass-badge' : g.status === 'WARNING' ? 'warn-badge' : 'fail-badge';
      return `
      <tr>
        <td><b>${escHtml(g.name)}</b></td>
        <td style="text-align:right"><code>${escHtml(g.actual)}</code></td>
        <td class="target-col" style="text-align:right"><code>${escHtml(g.target)}</code></td>
        <td class="warning-col" style="text-align:right"><code>${escHtml(g.warning)}</code></td>
        <td class="critical-col" style="text-align:right"><code>${escHtml(g.critical)}</code></td>
        <td style="text-align:right"><span class="${statusClass}">${escHtml(g.status)}</span></td>
      </tr>`;
    }).join('')
    : `<tr><td colspan="6" style="text-align:center"><span class="neutral-badge">No SLA gates recorded</span></td></tr>`;

  const slaStatus =
    d.sla.status === 'PASSED' ? '🟢 PASS' :
    d.sla.status === 'AT_RISK' ? '🟡 AT RISK' : '🔴 FAIL';

  const finalMessage = d.production.summary || d.verdict ||
    'Overall performance assessment completed from the recorded test results.';
  const recommendation = d.production.readinessVerdict || finalStatus;
  const logoSrc = logo || '/logo.png';

  const template = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>EAII PTT — Performance Report — __PROJECT__ (__TEST_TYPE__)</title>
  <style>
:root {
  --blue: #1d4ed8;
  --blue-subtle: #eff6ff;
  --blue-border: #bfdbfe;
  --ink: #0f172a;
  --muted: #64748b;
  --line: #e2e8f0;
  --bg: #f4f6fb;
  --card-bg: #ffffff;
  --emerald: #059669;
  --amber: #d97706;
  --rose: #e11d48;
}

* { box-sizing: border-box; }
body {
  margin: 0;
  background: radial-gradient(1100px 520px at -5% -10%, #eaf1ff 0%, transparent 55%), radial-gradient(900px 480px at 105% 0%, #fff7e6 0%, transparent 50%), var(--bg);
  color: var(--ink);
  font-family: "Comic Sans MS", "Comic Sans", "Chalkboard SE", "Marker Felt", cursive, sans-serif;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  position: relative;
  min-height: 100vh;
}

/* WATERMARK OVERLAY */
.watermark-layer {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(4, 1fr);
  align-items: center;
  justify-items: center;
  overflow: hidden;
  opacity: 0.09;
  user-select: none;
}
.watermark-layer .watermark-content {
  transform: rotate(-25deg);
}
.watermark-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-align: center;
}
.watermark-title {
  font-size: 22px;
  font-weight: 900;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #0f172a;
  white-space: nowrap;
}
.watermark-sub {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.28em;
  color: #334155;
  text-transform: uppercase;
  white-space: nowrap;
}

.report-container {
  width: 1080px;
  max-width: calc(100% - 32px);
  margin: 28px auto;
  padding: 0 0 40px;
  position: relative;
  z-index: 1;
}

@media print {
  body { background: #ffffff; }
  .report-container { width: 1080px; max-width: 1080px; margin: 0 auto; }
  .about-card, .brand-header-card, .accordion-card, .kpi-card { break-inside: avoid; }
}

/* TOP BRANDED HEADER */
.brand-header-card {
  background: linear-gradient(135deg, #071328 0%, #0c2040 45%, #122b56 75%, #1e3a8a 100%);
  border: 1px solid rgba(245, 158, 11, 0.45);
  border-top: 3px solid #f59e0b;
  border-radius: 18px;
  padding: 24px 28px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  box-shadow: 0 12px 30px -8px rgba(7, 19, 40, 0.45), 0 0 20px rgba(245, 158, 11, 0.1);
  gap: 20px;
  position: relative;
  overflow: hidden;
  color: #ffffff;
}
.brand-header-left {
  display: flex;
  align-items: center;
  gap: 18px;
  position: relative;
  z-index: 1;
}
.brand-header-logo {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  object-fit: cover;
  border: 2px solid rgba(245, 158, 11, 0.6);
  box-shadow: 0 4px 14px rgba(0,0,0,0.35), 0 0 12px rgba(245, 158, 11, 0.25);
  flex-shrink: 0;
  background: #0f172a;
}
.brand-header-watermark {
  position: absolute;
  right: -24px;
  bottom: -24px;
  width: 190px;
  height: 190px;
  opacity: 0.12;
  pointer-events: none;
  object-fit: contain;
  filter: brightness(1.2) drop-shadow(0 0 12px rgba(245, 158, 11, 0.3));
}
.watermark-logo {
  width: 96px;
  height: 96px;
  object-fit: contain;
  filter: grayscale(100%);
}
.footer-logo {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  object-fit: cover;
  border: 1px solid #cbd5e1;
}
.status-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: rgba(16, 185, 129, 0.18);
  border: 1px solid rgba(52, 211, 153, 0.55);
  color: #6ee7b7;
}
.brand-eyebrow {
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: #fbbf24;
  text-shadow: 0 0 10px rgba(251, 191, 36, 0.3);
}
.brand-title {
  margin: 3px 0 0;
  font-size: 22px;
  font-weight: 900;
  color: #ffffff;
  letter-spacing: -0.02em;
}
.brand-meta {
  margin: 6px 0 0;
  font-size: 12px;
  color: #cbd5e1;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}
.brand-meta b {
  color: #fde68a;
}

.engine-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: rgba(15, 33, 64, 0.85);
  border: 1px solid rgba(245, 158, 11, 0.4);
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  color: #f1f5f9;
  white-space: nowrap;
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  position: relative;
  z-index: 1;
}
.engine-badge b {
  color: #fbbf24;
}

/* TOP 4 KPI CARDS */
.kpi-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
  margin-bottom: 26px;
}
.kpi-card {
  position: relative;
  background: var(--card-bg);
  border: 1px solid var(--line);
  border-radius: 20px;
  padding: 22px 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.05), 0 12px 24px -14px rgba(15, 23, 42, 0.12);
  overflow: hidden;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.kpi-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(15, 23, 42, 0.08), 0 22px 36px -16px rgba(15, 23, 42, 0.2);
}
.kpi-card::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 20px;
  padding: 1px;
  background: linear-gradient(135deg, var(--accent-a, transparent), transparent 55%);
  opacity: 0.5;
  pointer-events: none;
}
.kpi-card::after {
  content: "";
  position: absolute;
  top: -40%;
  right: -30%;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--accent-glow, transparent) 0%, transparent 70%);
  pointer-events: none;
}
.kpi-card.tone-blue { --accent-a: #93c5fd; --accent-glow: rgba(37, 99, 235, 0.16); }
.kpi-card.tone-green { --accent-a: #6ee7b7; --accent-glow: rgba(16, 185, 129, 0.18); }
.kpi-card.tone-orange { --accent-a: #fcd34d; --accent-glow: rgba(245, 158, 11, 0.18); }
.kpi-card.tone-red { --accent-a: #fda4af; --accent-glow: rgba(244, 63, 94, 0.16); }

.kpi-icon {
  position: relative;
  width: 54px;
  height: 54px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  z-index: 1;
}
.kpi-icon.blue { background: linear-gradient(135deg, #dbeafe, #eff6ff); color: #1d4ed8; box-shadow: 0 6px 14px -6px rgba(37, 99, 235, 0.5), inset 0 0 0 1px #bfdbfe; }
.kpi-icon.green { background: linear-gradient(135deg, #a7f3d0, #ecfdf5); color: #047857; box-shadow: 0 6px 14px -6px rgba(5, 150, 105, 0.5), inset 0 0 0 1px #a7f3d0; }
.kpi-icon.orange { background: linear-gradient(135deg, #fde68a, #fffbeb); color: #b45309; box-shadow: 0 6px 14px -6px rgba(217, 119, 6, 0.5), inset 0 0 0 1px #fde68a; }
.kpi-icon.red { background: linear-gradient(135deg, #fecdd3, #fff1f2); color: #be123c; box-shadow: 0 6px 14px -6px rgba(225, 29, 72, 0.5), inset 0 0 0 1px #fecdd3; }
.kpi-icon svg { width: 26px; height: 26px; }

.kpi-label {
  font-size: 11px;
  font-weight: 800;
  color: #64748b;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 3px;
  position: relative;
  z-index: 1;
}
.kpi-value {
  font-size: 28px;
  font-weight: 900;
  color: #0f172a;
  letter-spacing: -0.02em;
  position: relative;
  z-index: 1;
}

/* NUMBERED ACCORDION SECTIONS */
.accordion-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 26px;
}
.accordion-card {
  position: relative;
  background: var(--card-bg);
  border: 1px solid var(--line);
  border-radius: 20px;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.04), 0 14px 28px -18px rgba(15, 23, 42, 0.15);
  overflow: hidden;
  transition: box-shadow 0.25s ease, border-color 0.25s ease;
}
.accordion-card::before {
  content: "";
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 4px;
  background: linear-gradient(90deg, #2563eb, #7c3aed 45%, #0ea5e9 100%);
  opacity: 0.9;
}
.accordion-card:hover {
  box-shadow: 0 6px 14px rgba(15, 23, 42, 0.07), 0 22px 40px -18px rgba(15, 23, 42, 0.22);
  border-color: #cbd5e1;
}
details.accordion-card summary {
  list-style: none;
  cursor: pointer;
  padding: 22px 24px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  user-select: none;
  transition: background 0.2s ease;
}
details.accordion-card summary:hover {
  background: linear-gradient(180deg, #f8fbff, transparent);
}
details.accordion-card summary::-webkit-details-marker { display: none; }
details.accordion-card[open] summary {
  border-bottom: 1px solid #f1f5f9;
}

.sec-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.sec-icon {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  background: linear-gradient(135deg, #dbeafe, #eff6ff);
  border: 1px solid #dbeafe;
  color: #1d4ed8;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 6px 14px -8px rgba(29, 78, 216, 0.55);
}
.sec-icon svg { width: 23px; height: 23px; }

.sec-title {
  margin: 0;
  font-size: 14px;
  font-weight: 900;
  color: #1d4ed8;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.sec-desc {
  margin: 2px 0 0;
  font-size: 13px;
  color: #64748b;
}

.sec-right {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-shrink: 0;
}
.stat-pill {
  padding: 5px 14px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.stat-pill.blue { background: linear-gradient(135deg,#dbeafe,#eff6ff); color: #1d4ed8; border: 1px solid #bfdbfe; box-shadow: 0 3px 8px -3px rgba(29,78,216,0.35); }
.stat-pill.amber { background: linear-gradient(135deg,#fde68a,#fffbeb); color: #b45309; border: 1px solid #fde68a; box-shadow: 0 3px 8px -3px rgba(180,83,9,0.35); }
.stat-pill.green { background: linear-gradient(135deg,#a7f3d0,#ecfdf5); color: #047857; border: 1px solid #a7f3d0; box-shadow: 0 3px 8px -3px rgba(4,120,87,0.35); }
.stat-pill.rose { background: linear-gradient(135deg,#fecdd3,#fff1f2); color: #be123c; border: 1px solid #fecdd3; box-shadow: 0 3px 8px -3px rgba(190,18,60,0.35); }

.chevron {
  color: #1d4ed8;
  font-size: 14px;
  font-weight: bold;
}

.card-body {
  padding: 20px 24px;
  font-size: 12px;
  background: #fafcff;
}

/* DATA TABLES */
.report-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  text-align: left;
}
.report-table th {
  padding: 10px 12px;
  background: #f8fafc;
  border-bottom: 1px solid var(--line);
  font-size: 10px;
  text-transform: uppercase;
  color: #64748b;
  font-weight: 800;
}
.report-table td {
  padding: 10px 12px;
  border-bottom: 1px solid #f1f5f9;
}
.sla-table th:nth-child(1) { width: 26%; }
.sla-table th:nth-child(2) { width: 14%; }
.sla-table th:nth-child(3) { width: 15%; }
.sla-table th:nth-child(4) { width: 15%; }
.sla-table th:nth-child(5) { width: 15%; }
.sla-table th:nth-child(6) { width: 15%; }
.sla-table td code { white-space: nowrap; }
@media (max-width: 900px) {
  .sla-table { min-width: 900px; }
  .sla-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
}
.pass-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 9px;
  border-radius: 999px;
  background: linear-gradient(135deg,#a7f3d0,#ecfdf5);
  color: #047857;
  font-size: 10px;
  font-weight: 900;
  border: 1px solid #a7f3d0;
  box-shadow: 0 2px 6px -2px rgba(4,120,87,0.4);
}
.neutral-badge {
  display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; border-radius: 999px;
  background: #f8fafc; color: #475569; font-size: 10px; font-weight: 900; border: 1px solid #cbd5e1;
}

/* ABOUT THIS REPORT */
.about-card {
  border: 1px solid #bfdbfe;
  background: linear-gradient(135deg, #eff6ff 0%, #f5f9ff 60%, #ffffff 100%);
  border-radius: 18px;
  padding: 18px 22px;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 24px;
  box-shadow: 0 4px 14px -8px rgba(29, 78, 216, 0.25);
}
.about-icon {
  width: 24px;
  height: 24px;
  color: #1d4ed8;
  flex-shrink: 0;
}
.about-title {
  margin: 0;
  font-size: 12px;
  font-weight: 900;
  color: #1d4ed8;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
.about-text {
  margin: 4px 0 0;
  font-size: 11px;
  color: #334155;
  line-height: 1.5;
}

/* FOOTER */
.report-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 18px;
  border-top: 1px solid var(--line);
  font-size: 11px;
  color: #64748b;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  gap: 10px;
}
.footer-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.footer-brand span {
  line-height: 1.45;
}

@media (max-width: 860px) {
  .report-container { width: calc(100% - 24px); max-width: calc(100% - 24px); }
  .kpi-row { grid-template-columns: repeat(2, 1fr); }
  .brand-header-card { flex-direction: column; align-items: flex-start; gap: 14px; }
  .report-footer { flex-direction: column; align-items: flex-start; gap: 10px; }
}

</style>
</head>
<body>
  <!-- WATERMARK OVERLAY -->
  <div class="watermark-layer" aria-hidden="true">
    <div class="watermark-content"><img src="__LOGO__" class="watermark-logo" alt="" /><div class="watermark-title">EAII PTT</div><div class="watermark-sub">CONFIDENTIAL</div></div>
    <div class="watermark-content"><img src="__LOGO__" class="watermark-logo" alt="" /><div class="watermark-title">EAII PTT</div><div class="watermark-sub">CONFIDENTIAL</div></div>
    <div class="watermark-content"><img src="__LOGO__" class="watermark-logo" alt="" /><div class="watermark-title">EAII PTT</div><div class="watermark-sub">CONFIDENTIAL</div></div>
    <div class="watermark-content"><img src="__LOGO__" class="watermark-logo" alt="" /><div class="watermark-title">EAII PTT</div><div class="watermark-sub">CONFIDENTIAL</div></div>
    <div class="watermark-content"><img src="__LOGO__" class="watermark-logo" alt="" /><div class="watermark-title">EAII PTT</div><div class="watermark-sub">CONFIDENTIAL</div></div>
    <div class="watermark-content"><img src="__LOGO__" class="watermark-logo" alt="" /><div class="watermark-title">EAII PTT</div><div class="watermark-sub">CONFIDENTIAL</div></div>
    <div class="watermark-content"><img src="__LOGO__" class="watermark-logo" alt="" /><div class="watermark-title">EAII PTT</div><div class="watermark-sub">CONFIDENTIAL</div></div>
    <div class="watermark-content"><img src="__LOGO__" class="watermark-logo" alt="" /><div class="watermark-title">EAII PTT</div><div class="watermark-sub">CONFIDENTIAL</div></div>
    <div class="watermark-content"><img src="__LOGO__" class="watermark-logo" alt="" /><div class="watermark-title">EAII PTT</div><div class="watermark-sub">CONFIDENTIAL</div></div>
    <div class="watermark-content"><img src="__LOGO__" class="watermark-logo" alt="" /><div class="watermark-title">EAII PTT</div><div class="watermark-sub">CONFIDENTIAL</div></div>
    <div class="watermark-content"><img src="__LOGO__" class="watermark-logo" alt="" /><div class="watermark-title">EAII PTT</div><div class="watermark-sub">CONFIDENTIAL</div></div>
    <div class="watermark-content"><img src="__LOGO__" class="watermark-logo" alt="" /><div class="watermark-title">EAII PTT</div><div class="watermark-sub">CONFIDENTIAL</div></div>
  </div>

  <div class="report-container">
    <!-- Header -->
    <div class="brand-header-card">
      <img src="__LOGO__" class="brand-header-watermark" alt="Header Watermark Logo" />
      <div class="brand-header-left">
        <img src="__LOGO__" class="brand-header-logo" alt="EAII PTT Logo" />
        <div>
          <div class="brand-eyebrow">Enterprise Telemetry &amp; Performance Platform</div>
          <h1 class="brand-title">__PROJECT__</h1>
          <div class="brand-meta">
            <b>__TEST_TYPE__</b>
            <span>•</span>
            <span>__ENGINE_VERSION__</span>
            <span>•</span>
            <span>__VUS__ VUs</span>
            <span>•</span>
            <span>__DURATION__</span>
          </div>
        </div>
      </div>
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
        <span class="status-chip">__STATUS_CHIP__</span>
        <span class="status-chip" style="background:rgba(244,63,94,0.16);border-color:rgba(251,113,133,0.5);color:#fda4af">🔒 Confidential</span>
        <div class="engine-badge">
          <span>Report ID:</span>
          <b>__REPORT_ID__</b>
        </div>
      </div>
    </div>

    <!-- 4 Top KPI Summary Cards -->
    <div class="kpi-row">
      <div class="kpi-card tone-blue">
        <div class="kpi-icon blue">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
        </div>
        <div>
          <div class="kpi-label">EAII SCORE</div>
          <div class="kpi-value">__SCORE__ <span style="font-size:14px;font-weight:700">/ 100</span></div>
        </div>
      </div>
      <div class="kpi-card tone-green">
        <div class="kpi-icon green">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
        </div>
        <div>
          <div class="kpi-label">THROUGHPUT</div>
          <div class="kpi-value">__RPS__ <span style="font-size:14px;font-weight:700">RPS</span></div>
        </div>
      </div>
      <div class="kpi-card tone-orange">
        <div class="kpi-icon orange">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        </div>
        <div>
          <div class="kpi-label">AVG RESPONSE</div>
          <div class="kpi-value">__AVG__ ms</div>
        </div>
      </div>
      <div class="kpi-card tone-red">
        <div class="kpi-icon red">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        </div>
        <div>
          <div class="kpi-label">ERROR RATE</div>
          <div class="kpi-value">__ERROR_RATE__%</div>
        </div>
      </div>
    </div>

    <div class="accordion-list">
      <!-- 01 · TEST SUMMARY -->
      <details class="accordion-card" open>
        <summary>
          <div class="sec-left">
            <div class="sec-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
            </div>
            <div>
              <h3 class="sec-title">01 · TEST SUMMARY</h3>
              <p class="sec-desc">Configuration and execution details for this test run.</p>
            </div>
          </div>
          <div class="sec-right"><span class="chevron">▼</span></div>
        </summary>
        <div class="card-body">
          <table class="report-table">
            <thead><tr><th>Metric</th><th>Description</th><th style="text-align:right">Result</th></tr></thead>
            <tbody>
              <tr><td>Project</td><td class="sec-desc" style="color:#64748b">Project being tested</td><td style="text-align:right"><b>__PROJECT__</b></td></tr>
              <tr><td>Target URL</td><td class="sec-desc" style="color:#64748b">API target under test</td><td style="text-align:right"><code>__BASE_URL__</code></td></tr>
              <tr><td>Environment</td><td class="sec-desc" style="color:#64748b">Test environment</td><td style="text-align:right"><span class="neutral-badge">__ENV__</span></td></tr>
              <tr><td>Test Type</td><td class="sec-desc" style="color:#64748b">Type of performance test</td><td style="text-align:right"><b>__TEST_TYPE__</b></td></tr>
              <tr><td>Engine</td><td class="sec-desc" style="color:#64748b">Testing engine</td><td style="text-align:right"><b>__ENGINE__</b></td></tr>
              <tr><td>Engine Version</td><td class="sec-desc" style="color:#64748b">Engine version</td><td style="text-align:right"><code>v0.48.0</code></td></tr>
              <tr><td>Virtual Users</td><td class="sec-desc" style="color:#64748b">Concurrent virtual users</td><td style="text-align:right"><b>__VUS__</b></td></tr>
              <tr><td>Duration</td><td class="sec-desc" style="color:#64748b">Test execution time</td><td style="text-align:right"><b>__DURATION__</b></td></tr>
              <tr><td>Test Status</td><td class="sec-desc" style="color:#64748b">Execution status</td><td style="text-align:right"><span class="pass-badge">__STATUS__</span></td></tr>
              <tr><td>Report ID</td><td class="sec-desc" style="color:#64748b">Unique report identifier</td><td style="text-align:right"><code>__REPORT_ID__</code></td></tr>
            </tbody>
          </table>
        </div>
      </details>

      <!-- 02 · TEST RESULTS -->
      <details class="accordion-card" open>
        <summary>
          <div class="sec-left">
            <div class="sec-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
            </div>
            <div>
              <h3 class="sec-title">02 · TEST RESULTS</h3>
              <p class="sec-desc">Aggregate results across the full test run.</p>
            </div>
          </div>
          <div class="sec-right"><span class="chevron">▼</span></div>
        </summary>
        <div class="card-body">
          <table class="report-table">
            <thead><tr><th>Metric</th><th>Description</th><th style="text-align:right">Result</th></tr></thead>
            <tbody>
              <tr><td>Total Requests</td><td class="sec-desc" style="color:#64748b">Total requests generated</td><td style="text-align:right"><b>__REQUESTS__</b></td></tr>
              <tr><td>Throughput</td><td class="sec-desc" style="color:#64748b">Requests processed per second</td><td style="text-align:right"><b style="color:#059669">__RPS__ RPS</b></td></tr>
              <tr><td>Average Response</td><td class="sec-desc" style="color:#64748b">Average response time</td><td style="text-align:right"><b>__AVG__ ms</b></td></tr>
              <tr><td>P95 Response</td><td class="sec-desc" style="color:#64748b">Response time for 95% of requests</td><td style="text-align:right"><b>__P95__ ms</b></td></tr>
              <tr><td>P99 Response</td><td class="sec-desc" style="color:#64748b">Response time for 99% of requests</td><td style="text-align:right"><b>__P99__ ms</b></td></tr>
              <tr><td>Success Rate</td><td class="sec-desc" style="color:#64748b">Successfully completed requests</td><td style="text-align:right"><b style="color:#059669">__SUCCESS_RATE__%</b></td></tr>
              <tr><td>Error Rate</td><td class="sec-desc" style="color:#64748b">Failed requests</td><td style="text-align:right"><b>__ERROR_RATE__%</b></td></tr>
              <tr><td>HTTP 5xx</td><td class="sec-desc" style="color:#64748b">Server-side error rate</td><td style="text-align:right"><b>__HTTP5XX__%</b></td></tr>
              <tr><td>HTTP 4xx</td><td class="sec-desc" style="color:#64748b">Client-side error rate</td><td style="text-align:right"><b>__HTTP4XX__%</b></td></tr>
              <tr><td>Timeouts</td><td class="sec-desc" style="color:#64748b">Requests exceeding timeout</td><td style="text-align:right"><b>__TIMEOUT__%</b></td></tr>
              <tr><td>Stability</td><td class="sec-desc" style="color:#64748b">Consistency during execution</td><td style="text-align:right"><span class="pass-badge">High</span></td></tr>
            </tbody>
          </table>
        </div>
      </details>

      <!-- 03 · SLA COMPLIANCE -->
      <details class="accordion-card" open>
        <summary>
          <div class="sec-left">
            <div class="sec-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
            </div>
            <div>
              <h3 class="sec-title">03 · SLA COMPLIANCE</h3>
              <p class="sec-desc">Verifies whether the system met the predefined performance, reliability, error, and availability acceptance targets.</p>
            </div>
          </div>
          <div class="sec-right"><span class="stat-pill green">__SLA_STATUS__</span><span class="chevron">▼</span></div>
        </summary>
        <div class="card-body">
          <div style="margin-bottom:14px;padding:14px 16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;color:#475569;font-size:11px;line-height:1.6">
            <b style="color:#0f172a">SLA (Service Level Agreement)</b> compliance verifies whether the system meets the predefined performance, reliability, error, and availability acceptance targets during the test.
          </div>
          <table class="report-table sla-table">
            <thead><tr><th>Metric</th><th style="text-align:right">Actual</th><th class="target-col" style="text-align:right">Target</th><th class="warning-col" style="text-align:right">Warning</th><th class="critical-col" style="text-align:right">Critical</th><th style="text-align:right">Status</th></tr></thead>
            <tbody>__SLA_ROWS__</tbody>
          </table></div>
          <div style="margin-top:14px;padding:14px 16px;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:12px;color:#047857;font-size:12px;font-weight:700;display:flex;align-items:center;gap:8px">
            __SLA_SUMMARY__
          </div>
        </div>
      </details>

      <!-- 04 · ENDPOINT PERFORMANCE -->
      <details class="accordion-card">
        <summary>
          <div class="sec-left">
            <div class="sec-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="16" y="16" width="6" height="6" rx="1"></rect><rect x="2" y="16" width="6" height="6" rx="1"></rect><rect x="9" y="2" width="6" height="6" rx="1"></rect><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"></path><line x1="12" y1="12" x2="12" y2="8"></line></svg>
            </div>
            <div>
              <h3 class="sec-title">04 · ENDPOINT PERFORMANCE</h3>
              <p class="sec-desc">Endpoint-level results are extracted directly from the test execution. Values are not estimated from overall test metrics.</p>
            </div>
          </div>
          <div class="sec-right"><span class="stat-pill blue">__ENDPOINT_COUNT__ Endpoints</span><span class="chevron">▼</span></div>
        </summary>
        <div class="card-body">
          <table class="report-table">
            <thead><tr><th>Method</th><th>Endpoint</th><th style="text-align:right">Requests</th><th style="text-align:right">RPS</th><th style="text-align:right">Avg</th><th style="text-align:right">P95</th><th style="text-align:right">P99</th><th style="text-align:right">Error</th><th style="text-align:right">Status</th></tr></thead>
            <tbody>__ENDPOINT_ROWS__</tbody>
          </table>
        </div>
      </details>

      <!-- 05 · FINAL ASSESSMENT -->
      <details class="accordion-card" open>
        <summary>
          <div class="sec-left">
            <div class="sec-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            </div>
            <div>
              <h3 class="sec-title">05 · FINAL ASSESSMENT</h3>
              <p class="sec-desc">Overall conclusion and recommendation based on test results and analysis.</p>
            </div>
          </div>
          <div class="sec-right"><span class="stat-pill green">__FINAL_STATUS__</span><span class="chevron">▼</span></div>
        </summary>
        <div class="card-body">
          <div style="text-align:center;padding:20px 16px;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;margin-bottom:14px">
            <span class="stat-pill green" style="font-size:13px;padding:8px 20px">__FINAL_STATUS__</span>
            <div style="font-size:11px;font-weight:900;text-transform:uppercase;color:#64748b;letter-spacing:0.05em;margin-top:16px">EAII Score</div>
            <div style="font-size:34px;font-weight:900;color:#0f172a;margin:4px 0">__SCORE__ <span style="font-size:14px;color:#64748b;font-weight:normal">/ 100</span></div>
          </div>
          <p style="margin:0 0 12px;font-size:13px;line-height:1.6;color:#1e293b">__FINAL_MESSAGE__</p>
          <div style="padding:14px 16px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;color:#1d4ed8;font-size:13px;font-weight:800">
            Recommendation: __RECOMMENDATION__
          </div>
        </div>
      </details>
    </div>

    <!-- About This Report Banner -->
    <div class="about-card">
      <svg class="about-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
      <div>
        <h4 class="about-title">ABOUT THIS REPORT</h4>
        <p class="about-text">This report is automatically generated by EAII PTT (Performance Testing Tool) based on the test execution and analysis. All times are in system timezone. Metrics are aggregated from the test engine and analyzed using the EAII PTT scoring model.</p>
      </div>
    </div>

    <!-- Footer -->
    <div class="report-footer">
      <div class="footer-brand">
        <img src="__LOGO__" class="footer-logo" alt="EAII Logo" />
        <span>Enterprise Application Integration &amp; Intelligence (EAII) – EAII PTT. All rights reserved.</span>
      </div>
      <div class="footer-meta">Report ID: __REPORT_ID__ &nbsp;|&nbsp; Engine: __ENGINE_VERSION__</div>
    </div>
  </div>
</body>
</html>`;

  return template
    .replaceAll('__LOGO__', logoSrc)
    .replaceAll('__PROJECT__', escHtml(run.projectName || run.name))
    .replaceAll('__TEST_TYPE__', escHtml(run.testType))
    .replaceAll('__ENGINE_VERSION__', escHtml(run.engine.toUpperCase()))
    .replaceAll('__ENGINE__', escHtml(run.engine))
    .replaceAll('__VUS__', run.users.toLocaleString())
    .replaceAll('__DURATION__', escHtml(run.duration || 'Not Recorded'))
    .replaceAll('__STATUS_CHIP__', statusChip)
    .replaceAll('__STATUS__', escHtml(run.status || 'Not Recorded'))
    .replaceAll('__REPORT_ID__', escHtml(run.id || 'RPT-UNKNOWN'))
    .replaceAll('__SCORE__', String(score))
    .replaceAll('__RPS__', effectiveRps.toLocaleString(undefined, { maximumFractionDigits: 2 }))
    .replaceAll('__AVG__', String(Math.round(run.avgResponseMs || 0)))
    .replaceAll('__ERROR_RATE__', run.errorRate.toFixed(2))
    .replaceAll('__BASE_URL__', escHtml(run.baseUrl || 'Not Recorded'))
    .replaceAll('__ENV__', escHtml(run.environmentConfig?.serverEnvironment || 'Not Recorded'))
    .replaceAll('__REQUESTS__', run.requests.toLocaleString())
    .replaceAll('__P95__', String(Math.round(run.p95Ms || 0)))
    .replaceAll('__P99__', String(Math.round(run.p99Ms || 0)))
    .replaceAll('__SUCCESS_RATE__', successRate.toFixed(2))
    .replaceAll('__HTTP5XX__', http5xx.toFixed(2))
    .replaceAll('__HTTP4XX__', http4xx.toFixed(2))
    .replaceAll('__TIMEOUT__', timeoutRate.toFixed(2))
    .replaceAll('__SLA_ROWS__', slaRows)
    .replaceAll('__SLA_STATUS__', slaStatus)
    .replaceAll('__SLA_SUMMARY__', escHtml(d.sla.summary))
    .replaceAll('__ENDPOINT_ROWS__', endpointRows)
    .replaceAll('__ENDPOINT_COUNT__', String(run.endpointResults.length))
    .replaceAll('__FINAL_STATUS__', escHtml(finalStatus))
    .replaceAll('__FINAL_MESSAGE__', escHtml(finalMessage))
    .replaceAll('__RECOMMENDATION__', escHtml(recommendation));
}

export function buildProjectSummary(projectName: string, runs: TestRun[], logo = ''): string {
  const ordered = [...runs].sort((a, b) => (a.sequenceIndex ?? 0) - (b.sequenceIndex ?? 0));
  const avg = ordered.length
    ? ordered.reduce(
        (n, r) =>
          n +
          evaluateSystem(r.p95Ms, r.p99Ms, r.avgResponseMs, r.errorRate, r.endpointResults)
            .overallScore,
        0
      ) / ordered.length
    : 0;
  const overall = ratingFromScore(avg);
  const totalRequests = ordered.reduce((n, r) => n + r.requests, 0);
  const total5xx = ordered.reduce((n, r) => n + r.status5xx, 0);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>EAII PTT — Project Summary — ${esc(projectName)}</title>
  <style>${css}</style>
</head>
<body>
  <!-- WATERMARK OVERLAY -->
  <div class="watermark-layer" aria-hidden="true">
    <div class="watermark-content">
      <img src="${logo || '/logo.png'}" class="watermark-logo" alt="EAII Watermark Logo" />
      <div class="watermark-title">EAII PERFORMANCE TESTING TOOL</div>
      <div class="watermark-sub">CONSOLIDATED PROJECT REPORT • CONFIDENTIAL</div>
    </div>
  </div>

  <div class="report-container">
    <div class="brand-header-card">
      <img src="${logo || '/logo.png'}" class="brand-header-watermark" alt="Header Watermark Logo" />
      <div class="brand-header-left">
        <img src="${logo || '/logo.png'}" class="brand-header-logo" alt="EAII PTT Logo" />
        <div>
          <div class="brand-eyebrow">Enterprise Telemetry &amp; Performance Platform</div>
          <h1 class="brand-title">EAII Performance Testing Tool (PTT)</h1>
          <div class="brand-meta">
            <b>${esc(projectName)}</b>
            <span>•</span>
            <b style="color:#fbbf24">Consolidated Project Assessment</b>
            <span>•</span>
            <span>${ordered.length} Test Phase(s)</span>
          </div>
        </div>
      </div>
      <div class="engine-badge">
        <span>Overall Score:</span>
        <b>${avg.toFixed(0)} / 100 (${esc(overall)})</b>
      </div>
    </div>

    <div class="kpi-row">
      <div class="kpi-card">
        <div class="kpi-icon blue">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>
        </div>
        <div>
          <div class="kpi-label">TOTAL REQUESTS</div>
          <div class="kpi-value">${totalRequests.toLocaleString()}</div>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon green">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
        </div>
        <div>
          <div class="kpi-label">COMPLETED TESTS</div>
          <div class="kpi-value">${ordered.length}</div>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon red">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        </div>
        <div>
          <div class="kpi-label">TOTAL 5XX ERRORS</div>
          <div class="kpi-value">${total5xx.toLocaleString()}</div>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon blue">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
        </div>
        <div>
          <div class="kpi-label">OVERALL RATING</div>
          <div class="kpi-value">${esc(overall)}</div>
        </div>
      </div>
    </div>

    <div class="accordion-card" style="margin-bottom:24px">
      <div style="padding:20px 24px;border-bottom:1px solid #f1f5f9;display:flex;justify-content:space-between;align-items:center">
        <div>
          <h3 class="sec-title">Project Benchmark Comparison by Test Type</h3>
          <p class="sec-desc">Overview of all executed performance test phases categorized by test type.</p>
        </div>
        <span class="stat-pill blue">${ordered.length} Phases Evaluated</span>
      </div>
      <div class="card-body" style="background:#fff">
        <table class="report-table">
          <thead>
            <tr>
              <th>Phase</th>
              <th>Test Type</th>
              <th>Workload</th>
              <th>Engine</th>
              <th>Score</th>
              <th>Rating</th>
              <th style="text-align:right">Requests</th>
              <th style="text-align:right">RPS</th>
              <th style="text-align:right">P95 (ms)</th>
              <th style="text-align:right">Error %</th>
            </tr>
          </thead>
          <tbody>
            ${ordered.map((r, idx) => {
              const d = evaluateSystem(r.p95Ms, r.p99Ms, r.avgResponseMs, r.errorRate, r.endpointResults);
              const badgeClass =
                d.overallRating === 'EXCELLENT' || d.overallRating === 'VERY GOOD'
                  ? 'green'
                  : d.overallRating === 'GOOD'
                  ? 'blue'
                  : d.overallRating === 'WARNING'
                  ? 'amber'
                  : 'rose';
              return `<tr>
                <td><b>Phase ${idx + 1}</b></td>
                <td><b style="color:#2563eb">${esc(r.testType)}</b></td>
                <td><code>${r.users} VUs • ${esc(r.duration)}</code></td>
                <td><span class="engine-badge" style="padding:2px 8px;font-size:10px">${esc(r.engine.toUpperCase())}</span></td>
                <td><b>${d.overallScore.toFixed(0)}</b> / 100</td>
                <td><span class="stat-pill ${badgeClass}">${esc(d.overallRating)}</span></td>
                <td style="text-align:right">${r.requests.toLocaleString()}</td>
                <td style="text-align:right"><b style="color:#059669">${r.rps}</b></td>
                <td style="text-align:right"><b style="color:#d97706">${r.p95Ms}</b></td>
                <td style="text-align:right;font-weight:bold;color:${r.errorRate > 0 ? '#e11d48' : '#64748b'}">${r.errorRate.toFixed(2)}%</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <div class="about-card">
      <svg class="about-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
      <div>
        <h4 class="about-title">ABOUT THIS REPORT</h4>
        <p class="about-text">This report is automatically generated by EAII PTT (Performance Testing Tool) based on the test execution and analysis. All times are in system timezone. Metrics are aggregated from the test engine and analyzed using the EAII PTT scoring model.</p>
      </div>
    </div>

    <div class="report-footer">
      <div class="footer-brand">
        <img src="${logo || '/logo.png'}" class="footer-logo" alt="EAII Logo" />
        <span>Enterprise Application Integration &amp; Intelligence (EAII) – EAII PTT. All rights reserved.</span>
      </div>
      <div class="footer-meta">Project: ${esc(projectName)}</div>
    </div>
  </div>
</body>
</html>`;
}

function crc32(data: Uint8Array) {
  let c = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    c ^= data[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return (c ^ 0xffffffff) >>> 0;
}

function u16(n: number) {
  return new Uint8Array([n & 255, (n >>> 8) & 255]);
}

function u32(n: number) {
  return new Uint8Array([n & 255, (n >>> 8) & 255, (n >>> 16) & 255, (n >>> 24) & 255]);
}

function concat(parts: Uint8Array[]) {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}

export function makeZip(entries: { name: string; content: string | Uint8Array }[]): Blob {
  const enc = new TextEncoder();
  const local: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;

  for (const e of entries) {
    const name = enc.encode(e.name);
    const data = typeof e.content === 'string' ? enc.encode(e.content) : e.content;
    const crc = crc32(data);
    const lh = concat([
      u32(0x04034b50),
      u16(20),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(crc),
      u32(data.length),
      u32(data.length),
      u16(name.length),
      u16(0),
      name,
      data
    ]);
    local.push(lh);
    const ch = concat([
      u32(0x02014b50),
      u16(20),
      u16(20),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(crc),
      u32(data.length),
      u32(data.length),
      u16(name.length),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(0),
      u32(offset),
      name
    ]);
    central.push(ch);
    offset += lh.length;
  }

  const cd = concat(central);
  const body = concat(local);
  const end = concat([
    u32(0x06054b50),
    u16(0),
    u16(0),
    u16(entries.length),
    u16(entries.length),
    u32(cd.length),
    u32(body.length),
    u16(0)
  ]);
  return new Blob([body, cd, end], { type: 'application/zip' });
}

export function buildXlsx(run: TestRun): Blob {
  const rows = [
    ['EAII PTT Performance Report'],
    ['Project', run.projectName || run.name],
    ['Test Type', run.testType],
    ['Engine', run.engine],
    ['Status', run.status],
    ['Overall Score', String(evaluateSystem(run.p95Ms, run.p99Ms, run.avgResponseMs, run.errorRate, run.endpointResults).overallScore.toFixed(1))],
    [],
    ['Endpoint', 'Method', 'Requests', 'RPS', 'Average (ms)', 'P95 (ms)', 'P99 (ms)', 'Max (ms)', 'Failure Rate (%)', '2xx', '4xx', '5xx', 'Rating'],
    ...run.endpointResults.map(ep => [
      ep.endpoint,
      ep.method,
      ep.requests,
      ep.rps,
      ep.avg,
      ep.p95,
      ep.p99,
      ep.max,
      ep.failureRate.toFixed(2),
      ep.status2xx,
      ep.status4xx,
      ep.status5xx,
      ep.rating
    ])
  ];

  const xesc = (v: any) => esc(v);
  const sheetRows = rows
    .map(
      (row, i) =>
        `<row r="${i + 1}">${row
          .map((v, j) => `<c r="${String.fromCharCode(65 + j)}${i + 1}" t="inlineStr"><is><t>${xesc(v)}</t></is></c>`)
          .join('')}</row>`
    )
    .join('');

  const sheet = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${sheetRows}</sheetData></worksheet>`;
  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>`;
  const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`;
  const wb = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Performance" sheetId="1" r:id="rId1"/></sheets></workbook>`;
  const wbRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>`;

  return new Blob(
    [
      makeZip([
        { name: '[Content_Types].xml', content: contentTypes },
        { name: '_rels/.rels', content: rels },
        { name: 'xl/workbook.xml', content: wb },
        { name: 'xl/_rels/workbook.xml.rels', content: wbRels },
        { name: 'xl/worksheets/sheet1.xml', content: sheet }
      ])
    ],
    { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
  );
}

export function buildPdf(run: TestRun): Blob {
  const thresholds = run.thresholds || DEFAULT_THRESHOLDS;
  const durationSec = run.durationSec || run.elapsedSec || 0;
  const effectiveRps = run.rps > 0
    ? run.rps
    : (run.requests > 0 && durationSec > 0 ? run.requests / durationSec : 0);

  const d = evaluateSystem(
    run.p95Ms, run.p99Ms, run.avgResponseMs, run.errorRate,
    run.endpointResults, thresholds, run.testType, run.engine,
    run.timeline, effectiveRps, run.requests, durationSec
  );

  const lines = [
    'EAII PTT — PERFORMANCE TEST REPORT',
    'Performance Testing Tool',
    '',
    `Project: ${run.projectName || run.name}`,
    `Test Type: ${run.testType}`,
    `Engine: ${run.engine.toUpperCase()}`,
    `Virtual Users: ${run.users}`,
    `Duration: ${run.duration || 'Not Recorded'}`,
    `Report ID: ${run.id}`,
    `Status: ${run.status}`,
    '',
    '01 — TEST SUMMARY',
    `Target URL: ${run.baseUrl || 'Not Recorded'}`,
    `Environment: ${run.environmentConfig?.serverEnvironment || 'Not Recorded'}`,
    '',
    '02 — TEST RESULTS',
    `EAII Score: ${Math.round(d.overallScore)} / 100`,
    `Total Requests: ${run.requests.toLocaleString()}`,
    `Throughput: ${effectiveRps.toFixed(2)} RPS`,
    `Average Response: ${Math.round(run.avgResponseMs)} ms`,
    `P95 Response: ${Math.round(run.p95Ms)} ms`,
    `P99 Response: ${Math.round(run.p99Ms)} ms`,
    `Success Rate: ${Math.max(0, 100 - run.errorRate).toFixed(2)}%`,
    `Error Rate: ${run.errorRate.toFixed(2)}%`,
    `HTTP 4xx: ${run.requests ? ((run.status4xx / run.requests) * 100).toFixed(2) : '0.00'}%`,
    `HTTP 5xx: ${run.requests ? ((run.status5xx / run.requests) * 100).toFixed(2) : '0.00'}%`,
    '',
    '03 — SLA COMPLIANCE',
    `SLA Status: ${d.sla.status}`,
    d.sla.summary,
    ...d.sla.gates.map(g => `${g.name}: Actual ${g.actual} | Target ${g.target} | ${g.status}`),
    '',
    '04 — ENDPOINT PERFORMANCE',
    ...run.endpointResults.slice(0, 40).map(ep =>
      `${ep.method} ${ep.endpoint} | Requests ${ep.requests} | RPS ${Number(ep.rps || 0).toFixed(2)} | Avg ${Math.round(ep.avg)} ms | P95 ${Math.round(ep.p95)} ms | P99 ${Math.round(ep.p99)} ms | Error ${Number(ep.failureRate || 0).toFixed(2)}%`
    ),
    '',
    '05 — FINAL ASSESSMENT',
    `Assessment: ${d.production.status || d.overallRating}`,
    d.production.summary || d.verdict || 'Assessment completed from recorded test results.',
    `Recommendation: ${d.production.readinessVerdict || d.production.status || d.overallRating}`,
    '',
    'Generated by EAII PTT'
  ];

  const escPdf = (v: string) =>
    v.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

  const maxLinesPerPage = 50;
  const pages: string[][] = [];
  for (let i = 0; i < lines.length; i += maxLinesPerPage) {
    pages.push(lines.slice(i, i + maxLinesPerPage));
  }

  const pageObjects: string[] = [];
  const pageKids: string[] = [];
  const fontObjectNumber = 3;
  let objectNumber = 4;

  for (const pageLines of pages) {
    const contentObject = objectNumber++;
    const pageObject = objectNumber++;
    const stream = [
      'BT',
      '/F1 9 Tf',
      '45 755 Td',
      ...pageLines.map((line, i) => `${i === 0 ? '' : '0 -14 Td'}(${escPdf(line)}) Tj`),
      'ET'
    ].join('\\n');

    pageObjects.push(
      `${contentObject} 0 obj\\n<< /Length ${stream.length} >>\\nstream\\n${stream}\\nendstream\\nendobj\\n`,
      `${pageObject} 0 obj\\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${fontObjectNumber} 0 R >> >> /Contents ${contentObject} 0 R >>\\nendobj\\n`
    );
    pageKids.push(`${pageObject} 0 R`);
  }

  const objects = [
    '1 0 obj\\n<< /Type /Catalog /Pages 2 0 R >>\\nendobj\\n',
    `2 0 obj\\n<< /Type /Pages /Kids [${pageKids.join(' ')}] /Count ${pages.length} >>\\nendobj\\n`,
    '3 0 obj\\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\\nendobj\\n',
    ...pageObjects
  ];

  let pdf = '%PDF-1.4\\n';
  const offsets: number[] = [0];
  for (let i = 0; i < objects.length; i++) {
    offsets[i + 1] = pdf.length;
    pdf += objects[i];
  }
  const xref = pdf.length;
  pdf += `xref\\n0 ${objects.length + 1}\\n0000000000 65535 f \\n`;
  for (let i = 1; i <= objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \\n`;
  }
  pdf += `trailer\\n<< /Size ${objects.length + 1} /Root 1 0 R >>\\nstartxref\\n${xref}\\n%%EOF`;

  return new Blob([pdf], { type: 'application/pdf' });
}

export async function buildProjectZipBundle(
  projectName: string,
  runs: TestRun[],
  logoDataUri?: string
): Promise<Blob> {
  const zip = new JSZip();

  // 1. Always include the Consolidated Project Summary Report (Master overview of all phases)
  const masterSummaryHtml = buildProjectSummary(projectName, runs, logoDataUri);
  zip.file(`00_Consolidated_Project_Summary_Report.html`, masterSummaryHtml);

  // Count occurrences of each test type to provide clean, conflict-free file names
  const testTypeCounts: Record<string, number> = {};
  runs.forEach(r => {
    const t = r.testType || 'Load_Test';
    testTypeCounts[t] = (testTypeCounts[t] || 0) + 1;
  });

  const seenTypes: Record<string, number> = {};

  // 2. Add the individual standalone HTML report for each phase
  runs.forEach((r, idx) => {
    const phaseHtml = buildIndividualReport(r, logoDataUri);
    const testTypeSanitized = (r.testType || 'Load_Test').replace(/[^a-zA-Z0-9_-]/g, '_');
    const phaseNum = r.sequenceIndex ?? (idx + 1);
    
    let fileName = `Phase_${phaseNum}_${testTypeSanitized}_Report.html`;
    if ((testTypeCounts[r.testType || 'Load_Test'] || 0) > 1) {
      seenTypes[r.testType] = (seenTypes[r.testType] || 0) + 1;
      fileName = `Phase_${phaseNum}_${testTypeSanitized}_Run_${seenTypes[r.testType]}_Report.html`;
    }
    zip.file(fileName, phaseHtml);
  });

  return await zip.generateAsync({ type: 'blob' });
}

export async function buildIndividualZipBundle(
  run: TestRun,
  logoDataUri?: string
): Promise<Blob> {
  const zip = new JSZip();
  const sanitizedTestType = (run.testType || 'Load_Test').replace(/[^a-zA-Z0-9_-]/g, '_');

  // ONLY the test type HTML report
  const html = buildIndividualReport(run, logoDataUri);
  zip.file(`${sanitizedTestType}_Report.html`, html);

  return await zip.generateAsync({ type: 'blob' });
}
