import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  UploadCloud,
  DownloadCloud,
  FileSpreadsheet,
  FileCode,
  FileArchive,
  FileText,
  CheckCircle2,
  Cloud,
  Clock,
  Sparkles,
  ArrowRight,
  RefreshCw,
  HardDrive,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ImportExportViewProps {
  initialTab?: 'import' | 'export';
}

export const ImportExportView: React.FC<ImportExportViewProps> = ({ initialTab = 'import' }) => {
  const { importExportLogs, importNewDataset, tasks } = useApp();

  const [activeTab, setActiveTab] = useState<'import' | 'export'>(initialTab);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [importStep, setImportStep] = useState<number>(0); // 0=idle, 1=upload, 2=preview, 3=mapping, 4=validation, 5=import, 6=drive
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [uploadedFileName, setUploadedFileName] = useState<string>('Grainger_Electrical_Seed_18k.xlsx');

  // Export State
  const [selectedExportTaskId, setSelectedExportTaskId] = useState<string>(tasks[0]?.id || '');
  const [exportFormat, setExportFormat] = useState<'xlsx' | 'csv' | 'json'>('xlsx');
  const [exportStep, setExportStep] = useState<number>(0);

  const steps = [
    'Upload',
    'Preview',
    'Schema Mapping',
    'Integrity Validation',
    'Ingestion',
    'Google Drive Backup',
  ];

  const exportSteps = [
    'Select Dataset',
    'Configure Columns',
    'Generate File',
    'Google Drive Upload',
    'Complete',
  ];

  const handleSimulateImport = () => {
    setIsProcessing(true);
    setImportStep(1);

    const timeouts = [
      setTimeout(() => setImportStep(2), 600),
      setTimeout(() => setImportStep(3), 1200),
      setTimeout(() => setImportStep(4), 1800),
      setTimeout(() => setImportStep(5), 2400),
      setTimeout(() => {
        setImportStep(6);
        setIsProcessing(false);
        importNewDataset({
          name: uploadedFileName,
          size: '5.4 MB',
          type: 'xlsx',
          recordsCount: 18400,
        });
        try {
          confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
        } catch {}
      }, 3000),
    ];
  };

  const handleSimulateExport = () => {
    setExportStep(1);
    setTimeout(() => setExportStep(2), 500);
    setTimeout(() => setExportStep(3), 1000);
    setTimeout(() => setExportStep(4), 1600);
    setTimeout(() => {
      setExportStep(5);
      try {
        confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
      } catch {}
    }, 2200);
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'xlsx':
      case 'csv':
        return <FileSpreadsheet className="w-4 h-4 text-emerald-600" />;
      case 'json':
        return <FileCode className="w-4 h-4 text-amber-500" />;
      case 'zip':
        return <FileArchive className="w-4 h-4 text-purple-600" />;
      default:
        return <FileText className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5 rounded-2xl border border-border bg-card shadow-subtle">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-zinc-100">
              Import & Export Operations Hub
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              High-throughput ingestion pipeline with automated schema mapping and Google Drive synchronization.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('import')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'import'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'border border-border text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            Import Center
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'export'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'border border-border text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            Export Center
          </button>
        </div>
      </div>

      {/* IMPORT CENTER WORKFLOW */}
      {activeTab === 'import' && (
        <div className="space-y-5">
          {/* Drag & Drop Area */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              if (e.dataTransfer.files?.[0]) {
                setUploadedFileName(e.dataTransfer.files[0].name);
              }
            }}
            className={`p-8 rounded-2xl border-2 border-dashed text-center transition-all ${
              dragActive
                ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40'
                : 'border-border hover:border-slate-400 dark:hover:border-zinc-700 bg-card'
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
              <UploadCloud className="w-6 h-6" />
            </div>

            <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
              Drag & Drop Seed / Extracted Datasets
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
              Supported formats: <strong className="text-slate-700 dark:text-zinc-300">Excel (.xlsx), CSV (.csv), JSON (.json), ZIP (.zip)</strong> up to 500MB.
            </p>

            <div className="flex items-center justify-center gap-3 mt-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-slate-50 dark:bg-zinc-900 text-xs font-mono text-slate-700 dark:text-zinc-300">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>{uploadedFileName}</span>
              </div>

              <button
                disabled={isProcessing}
                onClick={handleSimulateImport}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
              >
                {isProcessing ? 'Ingesting Pipeline...' : 'Start Pipeline Ingestion'}
              </button>
            </div>
          </div>

          {/* Visual Progress Indicator Pipeline */}
          <div className="p-5 rounded-2xl border border-border bg-card shadow-subtle space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
                Ingestion Pipeline Lifecycle
              </h4>
              <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400">
                {importStep === 6 ? 'Pipeline Complete (Synced to Drive)' : importStep > 0 ? `Stage ${importStep} of 6` : 'Ready to Ingest'}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
              {steps.map((st, idx) => {
                const stepNum = idx + 1;
                const isPassed = importStep >= stepNum;
                const isCurrent = importStep === stepNum && isProcessing;

                return (
                  <div
                    key={st}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isPassed
                        ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20'
                        : isCurrent
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20'
                        : 'border-border bg-slate-50/50 dark:bg-zinc-900/40'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold mb-1">
                      <span className="text-[10px] text-slate-400">Step {stepNum}</span>
                      {isPassed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    </div>
                    <div
                      className={`text-xs font-semibold truncate ${
                        isPassed
                          ? 'text-emerald-700 dark:text-emerald-300'
                          : isCurrent
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-slate-500'
                      }`}
                    >
                      {st}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* EXPORT CENTER WORKFLOW */}
      {activeTab === 'export' && (
        <div className="space-y-5">
          <div className="p-6 rounded-2xl border border-border bg-card shadow-subtle space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
              Configure Dataset Client Export
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Select Dataset / Task
                </label>
                <select
                  value={selectedExportTaskId}
                  onChange={(e) => setSelectedExportTaskId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-card text-xs text-slate-900 dark:text-zinc-100 outline-none font-mono"
                >
                  {tasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.id} - {t.projectName} ({t.skuCount.toLocaleString()} SKUs)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Export Package Format
                </label>
                <div className="flex gap-2">
                  {(['xlsx', 'csv', 'json'] as const).map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setExportFormat(fmt)}
                      className={`flex-1 py-2 rounded-lg border text-xs font-bold uppercase transition-all ${
                        exportFormat === fmt
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                          : 'border-border text-slate-600 dark:text-zinc-400 hover:bg-slate-100'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Target Destination
                </label>
                <div className="flex items-center gap-2 p-2 rounded-lg border border-border bg-slate-50 dark:bg-zinc-900 text-xs">
                  <Cloud className="w-4 h-4 text-blue-500" />
                  <span className="text-slate-700 dark:text-zinc-300">
                    Google Drive / Client Deliverables
                  </span>
                </div>
              </div>
            </div>

            {/* Export Process Indicator */}
            {exportStep > 0 && (
              <div className="pt-3 border-t border-border">
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="text-slate-400">Export Pipeline Progress:</span>
                  <span className="font-bold text-indigo-600">
                    {exportSteps[exportStep - 1]}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-2 text-[11px]">
                  {exportSteps.map((st, idx) => (
                    <div
                      key={st}
                      className={`p-2 rounded-lg border text-center font-medium ${
                        exportStep >= idx + 1
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-700'
                          : 'bg-slate-50 dark:bg-zinc-900 border-border text-slate-400'
                      }`}
                    >
                      {st}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleSimulateExport}
                className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all"
              >
                Generate Export & Sync to Drive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recent Imports & Exports Audit Table */}
      <div className="rounded-2xl border border-border bg-card shadow-subtle overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
            Recent Ingestion & Export File History
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {importExportLogs.length} Total Logs
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-zinc-400">
            <thead className="bg-slate-50/75 dark:bg-zinc-900/60 border-b border-border text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="p-3">Type</th>
                <th className="p-3">File Name</th>
                <th className="p-3">Records</th>
                <th className="p-3">Size</th>
                <th className="p-3">Uploaded By</th>
                <th className="p-3">Status</th>
                <th className="p-3">Google Drive Sync</th>
                <th className="p-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-mono">
              {importExportLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        log.type === 'import'
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                          : 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                      }`}
                    >
                      {log.type}
                    </span>
                  </td>

                  <td className="p-3">
                    <div className="flex items-center gap-2 font-sans font-medium text-slate-900 dark:text-zinc-100">
                      {getFileIcon(log.fileType)}
                      <span className="truncate max-w-[220px]">{log.fileName}</span>
                    </div>
                  </td>

                  <td className="p-3 font-bold text-slate-800 dark:text-zinc-200">
                    {log.recordsCount.toLocaleString()}
                  </td>

                  <td className="p-3 text-slate-500">{log.size}</td>

                  <td className="p-3 font-sans text-slate-700 dark:text-zinc-300">
                    {log.uploadedBy}
                  </td>

                  <td className="p-3 font-sans">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-semibold">
                      {log.status}
                    </span>
                  </td>

                  <td className="p-3 font-sans">
                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-zinc-300 text-xs">
                      <Cloud className="w-3.5 h-3.5 text-blue-500" />
                      <span className="capitalize">{log.gdriveSyncStatus}</span>
                    </div>
                  </td>

                  <td className="p-3 text-slate-400 text-[11px]">{log.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
