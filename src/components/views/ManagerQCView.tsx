import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  CheckCircle2,
  RotateCcw,
  XCircle,
  UserPlus,
  FileSpreadsheet,
  ExternalLink,
  AlertTriangle,
  Download,
  Clock,
  Sparkles,
  Layers,
  ChevronDown,
  Info,
  Eye,
  CheckSquare,
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import confetti from 'canvas-confetti';

export const ManagerQCView: React.FC = () => {
  const {
    tasks,
    selectedTaskIdForQC,
    setSelectedTaskIdForQC,
    datasetRecords,
    approveManagerQC,
    requestReworkQC,
    rejectQC,
    setCurrentView,
  } = useApp();

  // Find active task or default to first awaiting QC
  const currentTask =
    tasks.find((t) => t.id === selectedTaskIdForQC) ||
    tasks.find((t) => t.status === 'awaiting_manager_qc') ||
    tasks[0];

  const [remarks, setRemarks] = useState<string>('');
  const [filterMissingField, setFilterMissingField] = useState<string | null>(null);
  const [isDecisionSubmitted, setIsDecisionSubmitted] = useState<string | null>(null);
  const [activeInspectRecord, setActiveInspectRecord] = useState<typeof datasetRecords[0] | null>(null);

  // Completeness Metrics
  const completenessMetrics = [
    { key: 'skuId', label: 'SKU ID', percentage: 100 },
    { key: 'productUrl', label: 'Product URL', percentage: 100 },
    { key: 'mpn', label: 'MPN / Part Number', percentage: 99.8 },
    { key: 'title', label: 'Product Title', percentage: 100 },
    { key: 'category', label: 'Taxonomy Category', percentage: 99.4 },
    { key: 'imageUrl', label: 'High-Res Images', percentage: 87.5 },
    { key: 'specifications', label: 'Specification JSON', percentage: 92.3 },
    { key: 'bulletPoints', label: 'Bullet Points', percentage: 94.0 },
    { key: 'documentUrl', label: 'Technical PDF Docs', percentage: 75.0 },
  ];

  // Filter dataset based on selected completeness bar
  const displayedRecords = filterMissingField
    ? datasetRecords.filter((r) => r.missingFields.includes(filterMissingField) || r.status === 'duplicate')
    : datasetRecords;

  const handleApprove = () => {
    if (!currentTask) return;
    approveManagerQC(currentTask.id, remarks || 'Verified and approved by Operations Manager.');
    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch {
      // ignore
    }
    setIsDecisionSubmitted('approved');
    setRemarks('');
  };

  const handleRework = () => {
    if (!currentTask) return;
    requestReworkQC(
      currentTask.id,
      remarks || 'Please re-extract missing fields and broken media links.',
      filterMissingField ? [`Missing Field: ${filterMissingField}`] : ['Missing specifications', 'Broken CDN image links']
    );
    setIsDecisionSubmitted('rework');
    setRemarks('');
  };

  const handleReject = () => {
    if (!currentTask) return;
    rejectQC(currentTask.id, remarks || 'Dataset rejected due to critical schema violation.');
    setIsDecisionSubmitted('rejected');
    setRemarks('');
  };

  return (
    <div className="space-y-4 pb-12 animate-fade-in">
      {/* Top Banner: Task Switcher & Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 rounded-xl border border-border bg-card shadow-subtle">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                Manager Approval Workspace
              </h1>
              <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                {currentTask.id}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Audit scraped datasets, inspect attribute fill rates, and execute Manager Approval sign-off.
            </p>
          </div>
        </div>

        {/* Task Selector Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-500 dark:text-zinc-400">
            Select Review Task:
          </label>
          <select
            value={currentTask.id}
            onChange={(e) => {
              setSelectedTaskIdForQC(e.target.value);
              setIsDecisionSubmitted(null);
            }}
            className="px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-semibold text-slate-800 dark:text-zinc-200 outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
          >
            {tasks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.id} - {t.projectName} ({t.status.replace('_', ' ')})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Decision feedback banner if just triggered */}
      {isDecisionSubmitted && (
        <div
          className={`p-3 rounded-xl border flex items-center justify-between text-xs font-medium ${
            isDecisionSubmitted === 'approved'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 text-emerald-800 dark:text-emerald-300'
              : isDecisionSubmitted === 'rework'
              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 text-amber-800 dark:text-amber-300'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 text-rose-800 dark:text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>
              Decision applied to <strong className="font-mono">{currentTask.id}</strong>! Task status is now{' '}
              <strong className="capitalize">{currentTask.status.replace('_', ' ')}</strong>.
            </span>
          </div>
          <button
            onClick={() => setCurrentView('production-qc')}
            className="text-xs underline font-semibold"
          >
            View in Production Queue →
          </button>
        </div>
      )}

      {/* 3-COLUMN DESKTOP WORKSPACE LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* LEFT COLUMN: Task Information & Requirements (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Task Summary Card */}
          <div className="p-4 rounded-xl border border-border bg-card shadow-subtle space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                Task Information
              </span>
              <StatusBadge status={currentTask.status} size="sm" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                {currentTask.title}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                {currentTask.description}
              </p>
            </div>

            <div className="pt-2 border-t border-border space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Target Domain:</span>
                <a
                  href={`https://${currentTask.website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono font-medium text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-0.5"
                >
                  {currentTask.website}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Client:</span>
                <span className="font-medium text-slate-800 dark:text-zinc-200">
                  {currentTask.client}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Priority:</span>
                <PriorityBadge priority={currentTask.priority} />
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Target SKUs:</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-zinc-100">
                  {currentTask.skuCount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Deadline:</span>
                <span className="font-mono text-slate-700 dark:text-zinc-300">
                  {currentTask.deadline}
                </span>
              </div>
            </div>
          </div>

          {/* Assigned Scraping Team & Engineers */}
          <div className="p-4 rounded-xl border border-border bg-card shadow-subtle space-y-3">
            <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">
              Execution Team
            </span>

            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-border">
              <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                {currentTask.assignedTeam}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                Primary Lead: <strong className="text-slate-700 dark:text-zinc-300">{currentTask.primaryAssignee || 'Samuel P'}</strong>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] text-slate-400 block">Assigned Engineers:</span>
              <div className="flex flex-wrap gap-1">
                {currentTask.assignedEmployees.map((emp) => (
                  <span
                    key={emp}
                    className="px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-[11px] font-medium text-slate-700 dark:text-zinc-300"
                  >
                    {emp}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Input & Output File Artifacts */}
          <div className="p-4 rounded-xl border border-border bg-card shadow-subtle space-y-2.5">
            <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">
              Files & Seed Artifacts
            </span>

            <div className="p-2 rounded-lg border border-border bg-slate-50 dark:bg-zinc-900 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 overflow-hidden">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="truncate">
                  <div className="font-medium text-slate-800 dark:text-zinc-200 truncate">
                    {currentTask.inputFileName}
                  </div>
                  <div className="text-[10px] text-slate-400">{currentTask.inputFileSize}</div>
                </div>
              </div>
              <button
                className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                title="Download Seed File"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>

            {currentTask.outputFileName && (
              <div className="p-2 rounded-lg border border-indigo-100 dark:border-indigo-900 bg-indigo-50/40 dark:bg-indigo-950/20 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileSpreadsheet className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div className="truncate">
                    <div className="font-medium text-slate-800 dark:text-zinc-200 truncate">
                      {currentTask.outputFileName}
                    </div>
                    <div className="text-[10px] text-indigo-600 dark:text-indigo-400">
                      {currentTask.outputFileSize} (Latest Extract)
                    </div>
                  </div>
                </div>
                <button
                  className="p-1 rounded text-indigo-600 hover:text-indigo-800"
                  title="Download Extracted Output"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Scraping Requirements Checklist */}
          <div className="p-4 rounded-xl border border-border bg-card shadow-subtle space-y-2">
            <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">
              Extraction Checklist
            </span>
            <div className="space-y-1.5 text-xs text-slate-600 dark:text-zinc-400">
              {currentTask.scrapingRequirements.map((req, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-[11px] leading-tight">{req}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: Scraped File Preview, SKU Comparison, Completeness (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Health Diagnostics Summary */}
          <div className="grid grid-cols-4 gap-2">
            <div className="p-3 rounded-xl border border-border bg-card shadow-subtle text-center">
              <span className="text-[10px] font-medium text-slate-400 block">Total Scraped</span>
              <span className="text-base font-bold font-mono text-slate-900 dark:text-zinc-100">
                {currentTask.skuCount.toLocaleString()}
              </span>
            </div>
            <div className="p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20 text-center">
              <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 block">
                Exact Matches
              </span>
              <span className="text-base font-bold font-mono text-emerald-700 dark:text-emerald-300">
                99.2%
              </span>
            </div>
            <div className="p-3 rounded-xl border border-amber-100 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/20 text-center">
              <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400 block">
                Missing Values
              </span>
              <span className="text-base font-bold font-mono text-amber-700 dark:text-amber-300">
                1.4%
              </span>
            </div>
            <div className="p-3 rounded-xl border border-purple-100 dark:border-purple-900/60 bg-purple-50/30 dark:bg-purple-950/20 text-center">
              <span className="text-[10px] font-medium text-purple-600 dark:text-purple-400 block">
                Duplicates
              </span>
              <span className="text-base font-bold font-mono text-purple-700 dark:text-purple-300">
                0.2%
              </span>
            </div>
          </div>

          {/* Interactive Completeness Breakdown */}
          <div className="p-4 rounded-xl border border-border bg-card shadow-subtle space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                  Data Attribute Completeness & Missing Field Analysis
                </h3>
                <p className="text-[11px] text-slate-400">
                  Click any attribute bar to filter preview table to non-compliant rows
                </p>
              </div>
              {filterMissingField && (
                <button
                  onClick={() => setFilterMissingField(null)}
                  className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Clear filter (Showing {filterMissingField})
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-xs">
              {completenessMetrics.map((metric) => {
                const isSelected = filterMissingField === metric.key;

                return (
                  <div
                    key={metric.key}
                    onClick={() =>
                      setFilterMissingField(isSelected ? null : metric.key)
                    }
                    className={`p-2 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-sm'
                        : 'border-border/60 hover:border-slate-300 dark:hover:border-zinc-700 bg-slate-50/50 dark:bg-zinc-900/40'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-slate-600 dark:text-zinc-300 font-medium truncate">
                        {metric.label}
                      </span>
                      <span
                        className={`font-mono font-bold ${
                          metric.percentage >= 98
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : metric.percentage >= 90
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {metric.percentage}%
                      </span>
                    </div>

                    <div className="h-1.5 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          metric.percentage >= 98
                            ? 'bg-emerald-500'
                            : metric.percentage >= 90
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${metric.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scraped Records Inspection Table */}
          <div className="rounded-xl border border-border bg-card shadow-subtle overflow-hidden">
            <div className="p-3 border-b border-border bg-slate-50/60 dark:bg-zinc-900/40 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                Sample Extracted Records ({displayedRecords.length} inspected)
              </span>
              <button
                onClick={() => setCurrentView('analytics')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
              >
                <span>Full Dataset Explorer</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-zinc-400">
                <thead className="bg-slate-100/70 dark:bg-zinc-900 border-b border-border text-[10px] font-semibold text-slate-500 uppercase tracking-wider sticky top-0 z-10">
                  <tr>
                    <th className="p-2.5">SKU ID</th>
                    <th className="p-2.5">MPN</th>
                    <th className="p-2.5">Product Title</th>
                    <th className="p-2.5">Price</th>
                    <th className="p-2.5">Image / Specs</th>
                    <th className="p-2.5">Integrity</th>
                    <th className="p-2.5 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {displayedRecords.map((rec) => (
                    <tr
                      key={rec.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors ${
                        rec.status === 'missing_fields'
                          ? 'bg-amber-50/20 dark:bg-amber-950/10'
                          : rec.status === 'duplicate'
                          ? 'bg-rose-50/20 dark:bg-rose-950/10'
                          : ''
                      }`}
                    >
                      <td className="p-2.5 font-mono text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                        {rec.skuId}
                      </td>

                      <td className="p-2.5 font-mono text-[11px] text-slate-700 dark:text-zinc-300">
                        {rec.mpn}
                      </td>

                      <td className="p-2.5 max-w-[180px]">
                        <span className="font-medium text-slate-900 dark:text-zinc-100 truncate block">
                          {rec.title}
                        </span>
                      </td>

                      <td className="p-2.5 font-mono text-slate-800 dark:text-zinc-200 font-semibold">
                        {rec.price}
                      </td>

                      <td className="p-2.5">
                        <div className="flex items-center gap-1.5">
                          {rec.imageUrl ? (
                            <img
                              src={rec.imageUrl}
                              alt="thumb"
                              className="w-5 h-5 rounded object-cover ring-1 ring-border"
                            />
                          ) : (
                            <span className="px-1 py-0.5 rounded bg-rose-100 text-rose-700 text-[9px] font-bold">
                              No Img
                            </span>
                          )}
                          <span className="text-[10px] font-mono text-slate-400">
                            {Object.keys(rec.specifications).length} specs
                          </span>
                        </div>
                      </td>

                      <td className="p-2.5">
                        {rec.status === 'valid' ? (
                          <span className="px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-semibold">
                            Pass
                          </span>
                        ) : rec.status === 'duplicate' ? (
                          <span className="px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 text-[10px] font-semibold">
                            Duplicate
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 text-[10px] font-semibold">
                            Missing ({rec.missingFields.join(', ')})
                          </span>
                        )}
                      </td>

                      <td className="p-2.5 text-right">
                        <button
                          onClick={() => setActiveInspectRecord(rec)}
                          className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-zinc-800"
                          title="Quick View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: QC Decision Panel & History Timeline (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Decision Panel */}
          <div className="p-4 rounded-xl border border-border bg-card shadow-subtle space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                QC Decision Panel
              </span>
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
            </div>

            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              Submit your formal sign-off or assign corrective rework for the scraping pod.
            </p>

            {/* Remarks Textarea */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                QC Audit Remarks & Feedback:
              </label>
              <textarea
                rows={3}
                placeholder="Enter remarks, specific attribute instructions, or approval sign-off..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full p-2 rounded-lg border border-border bg-slate-50 dark:bg-zinc-900 text-xs text-slate-900 dark:text-zinc-100 outline-none focus:ring-1 focus:ring-indigo-500 placeholder-slate-400"
              />
            </div>

            {/* Quick remark snippet buttons */}
            <div className="flex flex-wrap gap-1">
              {[
                'Schema verified',
                'Missing specs on rows',
                'Broken CDN image links',
              ].map((snippet) => (
                <button
                  key={snippet}
                  type="button"
                  onClick={() => setRemarks((prev) => (prev ? `${prev} ${snippet}.` : `${snippet}.`))}
                  className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-[10px] text-slate-600 dark:text-zinc-400"
                >
                  +{snippet}
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2 border-t border-border">
              <button
                onClick={handleApprove}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve & Advance to Production</span>
              </button>

              <button
                onClick={handleRework}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-sm transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Request Rework from Pod</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleReject}
                  className="flex items-center justify-center gap-1 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900 hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-600 dark:text-rose-400 text-xs font-medium transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </button>

                <button
                  onClick={() => setCurrentView('task-assignment')}
                  className="flex items-center justify-center gap-1 py-1.5 rounded-lg border border-border hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-medium transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Reassign</span>
                </button>
              </div>
            </div>
          </div>

          {/* QC History Timeline */}
          <div className="p-4 rounded-xl border border-border bg-card shadow-subtle space-y-3">
            <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">
              QC Audit Timeline
            </span>

            <div className="space-y-3 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-zinc-800 pl-4">
              {currentTask.qcHistory.length > 0 ? (
                currentTask.qcHistory.map((entry) => (
                  <div key={entry.id} className="relative text-xs space-y-0.5">
                    <span
                      className={`absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full ring-2 ring-card ${
                        entry.action === 'approved'
                          ? 'bg-emerald-500'
                          : entry.action === 'rework_requested'
                          ? 'bg-amber-500'
                          : 'bg-indigo-500'
                      }`}
                    />
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 dark:text-zinc-200 capitalize">
                        {entry.action.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-slate-400">{entry.timestamp}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                      {entry.performedBy} ({entry.role})
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-zinc-300 italic pt-0.5">
                      &ldquo;{entry.remarks}&rdquo;
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400 italic">No QC actions logged yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Record Inspect Modal */}
      {activeInspectRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {activeInspectRecord.skuId}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                  {activeInspectRecord.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveInspectRecord(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {activeInspectRecord.imageUrl && (
              <img
                src={activeInspectRecord.imageUrl}
                alt="Product visual"
                className="w-full h-40 object-cover rounded-lg border border-border"
              />
            )}

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">MPN:</span>
                <span className="font-mono font-semibold">{activeInspectRecord.mpn}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Category:</span>
                <span>{activeInspectRecord.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Price:</span>
                <span className="font-mono font-bold text-emerald-600">{activeInspectRecord.price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Stock:</span>
                <span>{activeInspectRecord.stockStatus}</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                Extracted Specifications ({Object.keys(activeInspectRecord.specifications).length}):
              </span>
              <div className="max-h-36 overflow-y-auto p-2 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-border font-mono text-[11px] space-y-1">
                {Object.entries(activeInspectRecord.specifications).map(([key, val]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-slate-400">{key}:</span>
                    <span className="text-slate-800 dark:text-zinc-200">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setActiveInspectRecord(null)}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
