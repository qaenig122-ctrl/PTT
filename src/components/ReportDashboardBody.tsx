import React, { useMemo } from 'react';
import { TestRun } from '../types';
import { buildIndividualReport } from '../lib/reportGenerator';

interface ReportDashboardBodyProps {
  run: TestRun;
  onDownloadHtml?: () => void;
  onDownloadPdf?: () => void;
  onDownloadXlsx?: () => void;
}

/**
 * The in-app report preview intentionally uses the exact same HTML renderer
 * as the standalone HTML export. This keeps the report users see in EAII PTT
 * visually identical to the HTML file they download.
 */
export const ReportDashboardBody: React.FC<ReportDashboardBodyProps> = ({ run }) => {
  const reportHtml = useMemo(() => buildIndividualReport(run, '/logo.png'), [run]);

  return (
    <div className="w-full max-w-[1080px] mx-auto overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <iframe
        title={`EAII PTT Performance Report — ${run.projectName || run.name}`}
        srcDoc={reportHtml}
        className="block w-full border-0"
        style={{ minHeight: '2400px', height: 'calc(100vh - 180px)' }}
        sandbox="allow-same-origin"
      />
    </div>
  );
};
