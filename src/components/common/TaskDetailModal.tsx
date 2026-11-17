import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  FileSpreadsheet,
  ExternalLink,
  Download,
  CheckCircle2,
  RotateCcw,
  AlertTriangle,
  Layers,
  ShieldCheck,
  Factory,
  Terminal,
  Clock,
  Sparkles,
  Database,
  Search,
  Filter,
  Cloud,
  Check,
  UserCheck,
  Edit2,
  FileCode,
  FileText,
  AlertCircle,
  Image as ImageIcon,
  HardDrive,
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { TaskProgress } from './TaskProgress';
import confetti from 'canvas-confetti';

interface TaskDetailModalProps {
  taskId: string | null;
  onClose: () => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ taskId, onClose }) => {
  const {
    tasks,
    datasetRecords,
    currentUserRole,
    approveManagerQC,
    requestReworkQC,
    rejectQC,
    approveProduction,
    reScrapingRequest,
    reassignTaskScraper,
    employees,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'analytics' | 'explorer' | 'details' | 'history'>('analytics');
  const [reworkRemarks, setReworkRemarks] = useState('');
  const [showReworkForm, setShowReworkForm] = useState(false);
  const [reassignModal, setShowReassignModal] = useState(false);
  const [targetScraper, setTargetScraper] = useState('Sneha Patel');
  const [searchRecordQuery, setSearchRecordQuery] = useState('');
  const [completenessFilter, setCompletenessFilter] = useState<string | null>(null);

  const task = tasks.find((t) => t.id === taskId);

  if (!task) return null;

  // 10 Completeness Metrics
  const completenessFields = [
    { key: 'skuId', label: 'SKU ID', percent: 100 },
    { key: 'productUrl', label: 'Product URL', percent: 100 },
    { key: 'mpn', label: 'MPN / Part Number', percent: 99.8 },
    { key: 'title', label: 'Product Title', percent: 100 },
    { key: 'category', label: 'Taxonomy Category', percent: 99.4 },
    { key: 'imageUrl', label: 'High-Res Images', percent: 87.5 },
    { key: 'specifications', label: 'Specification JSON', percent: 92.3 },
    { key: 'bulletPoints', label: 'Bullet Points', percent: 94.0 },
    { key: 'documentUrl', label: 'Technical PDF Docs', percent: 75.0 },
    { key: 'description', label: 'Rich Description', percent: 98.1 },
  ];

  const filteredRecords = datasetRecords.filter((rec) => {
    const matchSearch =
      rec.skuId.toLowerCase().includes(searchRecordQuery.toLowerCase()) ||
      rec.mpn.toLowerCase().includes(searchRecordQuery.toLowerCase()) ||
      rec.title.toLowerCase().includes(searchRecordQuery.toLowerCase());
    const matchFilter = !completenessFilter || rec.missingFields.includes(completenessFilter);
    return matchSearch && matchFilter;
  });

  const handleApproveQC = () => {
    approveManagerQC(task.id, 'Manager approved: dataset meets all schema and completeness thresholds.');
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    onClose();
  };

  const handleValidateProduction = () => {
    approveProduction(task.id, 'Production deliverable validated and accepted for catalog ingestion.');
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    onClose();
  };

  const handleTriggerReScraping = () => {
    reScrapingRequest(
      task.id,
      reworkRemarks || 'Re-scraping requested: missing critical specifications and broken media links.',
      ['Missing Fields', 'Attribute Formatting']
    );
    setShowReworkForm(false);
    onClose();
  };

  const handleExecuteReassign = () => {
    reassignTaskScraper(task.id, targetScraper, 'Reassigned via Task Analytics Inspector');
    setShowReassignModal(false);
  };

  const scrapingEngineers = employees.filter(
    (e) => e.team.includes('Scraping') || e.role.toLowerCase().includes('scraping')
  );

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div 
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto"
    >
      <div className="w-full max-w-5xl bg-card rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up">
        {/* Top Header */}
        <div className="p-5 border-b border-border flex items-start justify-between gap-4 bg-slate-50/50 dark:bg-zinc-900/50">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                {task.id}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                Task Analytics & Data Inspector
              </span>
              <StatusBadge status={task.status} />
              <PriorityBadge priority={task.priority} />
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                {task.projectName}
              </span>
            </div>

            <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100">
              {task.title}
            </h2>

            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-zinc-400">
              <a
                href={`https://${task.website}`}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>{task.website}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <span>•</span>
              <span>Client: <strong>{task.client}</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                <Cloud className="w-3.5 h-3.5" />
                Google Drive Vault Synced
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between px-6 border-b border-border bg-card">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'analytics'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-zinc-100'
              }`}
            >
              <Database className="w-4 h-4" />
              Data Analytics & Quality
            </button>
            <button
              onClick={() => setActiveTab('explorer')}
              className={`py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'explorer'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-zinc-100'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              Dataset Explorer Preview
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'details'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-zinc-100'
              }`}
            >
              <Layers className="w-4 h-4" />
              Requirements & Team Scope
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'history'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-zinc-100'
              }`}
            >
              <Clock className="w-4 h-4" />
              QC & Audit Timeline ({task.qcHistory.length})
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
            <span>Deadline:</span>
            <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">{task.deadline}</span>
          </div>
        </div>

        {/* Tab Content Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: DATA ANALYTICS & QUALITY */}
          {activeTab === 'analytics' && (
            <div className="space-y-6 animate-fade-in">
              {/* File Info Strip */}
              <div className="p-4 rounded-xl border border-border bg-slate-50/60 dark:bg-zinc-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-mono font-bold text-slate-900 dark:text-zinc-100 text-xs">
                      {task.outputFileName || 'Mined_Scraped_Payload.xlsx'}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Size: {task.outputFileSize || '18.4 MB'} • {task.skuCount.toLocaleString()} Total Records
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
                    <Cloud className="w-3.5 h-3.5" />
                    Google Drive Backup Active
                  </span>
                </div>
              </div>

              {/* 8 Analytics Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl border border-border bg-card shadow-subtle">
                  <span className="text-[11px] text-slate-400 font-medium">Total Mined SKUs</span>
                  <div className="text-xl font-bold font-mono text-slate-900 dark:text-zinc-100 mt-1">
                    {task.skuCount.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-emerald-600 font-semibold">100% Target Matched</span>
                </div>

                <div className="p-3.5 rounded-xl border border-border bg-card shadow-subtle">
                  <span className="text-[11px] text-slate-400 font-medium">Exact Matches</span>
                  <div className="text-xl font-bold font-mono text-emerald-600 mt-1">
                    {(task.skuCount * 0.982).toFixed(0)}
                  </div>
                  <span className="text-[10px] text-slate-400">98.2% High Precision</span>
                </div>

                <div className="p-3.5 rounded-xl border border-border bg-card shadow-subtle">
                  <span className="text-[11px] text-slate-400 font-medium">Partial Matches</span>
                  <div className="text-xl font-bold font-mono text-amber-500 mt-1">
                    {(task.skuCount * 0.012).toFixed(0)}
                  </div>
                  <span className="text-[10px] text-slate-400">1.2% Missing Alt Img</span>
                </div>

                <div className="p-3.5 rounded-xl border border-border bg-card shadow-subtle">
                  <span className="text-[11px] text-slate-400 font-medium">Not Found / 404</span>
                  <div className="text-xl font-bold font-mono text-slate-900 dark:text-zinc-100 mt-1">
                    {(task.skuCount * 0.006).toFixed(0)}
                  </div>
                  <span className="text-[10px] text-slate-400">0.6% Delisted by Vendor</span>
                </div>

                <div className="p-3.5 rounded-xl border border-border bg-card shadow-subtle">
                  <span className="text-[11px] text-slate-400 font-medium">Duplicate Records</span>
                  <div className="text-xl font-bold font-mono text-emerald-600 mt-1">
                    0
                  </div>
                  <span className="text-[10px] text-emerald-600 font-semibold">Deduplicated Clean</span>
                </div>

                <div className="p-3.5 rounded-xl border border-border bg-card shadow-subtle">
                  <span className="text-[11px] text-slate-400 font-medium">Missing Field Flags</span>
                  <div className="text-xl font-bold font-mono text-amber-500 mt-1">
                    14
                  </div>
                  <span className="text-[10px] text-slate-400">PDF Specs Null</span>
                </div>

                <div className="p-3.5 rounded-xl border border-border bg-card shadow-subtle">
                  <span className="text-[11px] text-slate-400 font-medium">Total Image URLs</span>
                  <div className="text-xl font-bold font-mono text-slate-900 dark:text-zinc-100 mt-1">
                    {(task.skuCount * 0.97).toFixed(0)}
                  </div>
                  <span className="text-[10px] text-emerald-600">800x800 High Res</span>
                </div>

                <div className="p-3.5 rounded-xl border border-border bg-card shadow-subtle">
                  <span className="text-[11px] text-slate-400 font-medium">Technical Documents</span>
                  <div className="text-xl font-bold font-mono text-slate-900 dark:text-zinc-100 mt-1">
                    {(task.skuCount * 0.75).toFixed(0)}
                  </div>
                  <span className="text-[10px] text-slate-400">PDF Data Sheets</span>
                </div>
              </div>

              {/* Data Completeness Progress Bars */}
              <div className="p-5 rounded-xl border border-border bg-card shadow-subtle space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
                    Data Attribute Completeness Ratios
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Click any attribute to filter records below
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {completenessFields.map((field) => (
                    <div
                      key={field.key}
                      onClick={() =>
                        setCompletenessFilter(completenessFilter === field.key ? null : field.key)
                      }
                      className={`p-2.5 rounded-lg border cursor-pointer transition-colors ${
                        completenessFilter === field.key
                          ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40'
                          : 'border-border/70 hover:bg-slate-50 dark:hover:bg-zinc-800/60'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-medium text-slate-700 dark:text-zinc-300">
                          {field.label}
                        </span>
                        <span className="font-mono font-bold text-slate-900 dark:text-zinc-100">
                          {field.percent}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full ${
                            field.percent >= 98
                              ? 'bg-emerald-500'
                              : field.percent >= 85
                              ? 'bg-indigo-500'
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${field.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DATASET EXPLORER PREVIEW */}
          {activeTab === 'explorer' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search SKU ID, MPN, or title..."
                    value={searchRecordQuery}
                    onChange={(e) => setSearchRecordQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-border bg-slate-50 dark:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">
                    Showing <strong>{filteredRecords.length}</strong> preview records
                  </span>
                </div>
              </div>

              <div className="border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-zinc-900/80 border-b border-border text-slate-500 dark:text-zinc-400 sticky top-0 uppercase font-semibold text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3">SKU ID</th>
                        <th className="py-2.5 px-3">MPN</th>
                        <th className="py-2.5 px-3">Product Title</th>
                        <th className="py-2.5 px-3">Category</th>
                        <th className="py-2.5 px-3">Price</th>
                        <th className="py-2.5 px-3">Stock Status</th>
                        <th className="py-2.5 px-3 text-right">Integrity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredRecords.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40">
                          <td className="py-2.5 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                            {r.skuId}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-700 dark:text-zinc-300 whitespace-nowrap">
                            {r.mpn}
                          </td>
                          <td className="py-2.5 px-3 text-slate-900 dark:text-zinc-100 font-medium max-w-xs truncate">
                            {r.title}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 dark:text-zinc-400 whitespace-nowrap">
                            {r.category}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-zinc-100 whitespace-nowrap">
                            {r.price}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200">
                              {r.stockStatus}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right whitespace-nowrap">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                              {r.missingFields.length === 0 ? 'Verified' : 'Flagged'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: REQUIREMENTS & TEAM SCOPE */}
          {activeTab === 'details' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Team Allocations */}
                <div className="p-4 rounded-xl border border-border bg-card space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-emerald-600" />
                    Assigned Scraping Engineering Pod
                  </h3>
                  <div className="text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Engineering Pod:</span>
                      <span className="font-bold text-emerald-600">{task.assignedTeam}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Primary Scraper:</span>
                      <span className="font-semibold text-slate-800 dark:text-zinc-200">
                        {task.primaryAssignee || 'Unassigned'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Execution Phase:</span>
                      <span className="font-mono text-slate-600 dark:text-zinc-400">
                        {task.internalExecutionState || 'In Harvest'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Production Team */}
                <div className="p-4 rounded-xl border border-border bg-card space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
                    <Factory className="w-4 h-4 text-indigo-600" />
                    Production Operations Owner
                  </h3>
                  <div className="text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Production Pod:</span>
                      <span className="font-bold text-indigo-600">{task.productionTeam || 'Lawson Production'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Production User:</span>
                      <span className="font-semibold text-slate-800 dark:text-zinc-200">
                        {task.productionUser || 'Priya Nair'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Created At:</span>
                      <span className="font-mono text-slate-600 dark:text-zinc-400">{task.createdAt}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scraping Requirements */}
              <div className="p-4 rounded-xl border border-border bg-card space-y-3">
                <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
                  Mandatory Scraping Requirements
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-zinc-400">
                  {task.scrapingRequirements.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cloud Files & Google Drive Links */}
              <div className="p-4 rounded-xl border border-border bg-card space-y-3">
                <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
                  <Cloud className="w-4 h-4 text-emerald-600" />
                  Google Drive Cloud Storage Repositories
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg border border-border bg-slate-50 dark:bg-zinc-900 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800 dark:text-zinc-200">{task.inputFileName}</p>
                      <p className="text-[10px] text-slate-400">Input Seed File ({task.inputFileSize})</p>
                    </div>
                    <span className="text-[10px] text-emerald-600 font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 border border-emerald-200">
                      Drive Synced
                    </span>
                  </div>

                  <div className="p-3 rounded-lg border border-border bg-slate-50 dark:bg-zinc-900 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800 dark:text-zinc-200">{task.outputFileName || 'Pending Upload'}</p>
                      <p className="text-[10px] text-slate-400">Scraped Output File ({task.outputFileSize || '--'})</p>
                    </div>
                    <span className="text-[10px] text-indigo-600 font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 border border-indigo-200">
                      Drive Vault
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: QC & AUDIT TIMELINE */}
          {activeTab === 'history' && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-3">
                {task.qcHistory.map((entry) => (
                  <div key={entry.id} className="p-4 rounded-xl border border-border bg-card space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            entry.action === 'approved'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : entry.action === 'rework_requested'
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                          }`}
                        >
                          {entry.action.replace('_', ' ')}
                        </span>
                        <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                          {entry.performedBy}
                        </span>
                        <span className="text-[10px] text-slate-400">({entry.role})</span>
                      </div>
                      <span className="text-xs font-mono text-slate-400">{entry.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-900/60 p-2.5 rounded-lg border border-border">
                      {entry.remarks}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Re-scraping / Rework Prompt Modal Section */}
        {showReworkForm && (
          <div className="p-4 border-t border-amber-200 bg-amber-50/70 dark:bg-amber-950/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Submit Re-Scraping / Rework Request to Scraping Team
              </span>
              <button
                onClick={() => setShowReworkForm(false)}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
            </div>
            <textarea
              value={reworkRemarks}
              onChange={(e) => setReworkRemarks(e.target.value)}
              placeholder="Describe missing fields, incorrect attributes, or anti-bot blocks that need re-scraping..."
              className="w-full text-xs p-2.5 rounded-xl border border-border bg-card text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
              rows={2}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={handleTriggerReScraping}
                className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm"
              >
                Confirm Re-Scraping Request
              </button>
            </div>
          </div>
        )}

        {/* Reassign Modal Section */}
        {reassignModal && (
          <div className="p-4 border-t border-indigo-200 bg-indigo-50/70 dark:bg-indigo-950/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-800 dark:text-indigo-300 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-indigo-600" />
                Reassign Task to Scraping Engineer
              </span>
              <button
                onClick={() => setShowReassignModal(false)}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={targetScraper}
                onChange={(e) => setTargetScraper(e.target.value)}
                className="flex-1 text-xs px-3 py-2 rounded-xl border border-border bg-card text-slate-800 dark:text-zinc-200"
              >
                {scrapingEngineers.map((eng) => (
                  <option key={eng.id} value={eng.name}>
                    {eng.name} ({eng.workloadCapacity}% capacity)
                  </option>
                ))}
              </select>
              <button
                onClick={handleExecuteReassign}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm"
              >
                Reassign Scraper
              </button>
            </div>
          </div>
        )}

        {/* Bottom Role-Based Action Bar */}
        <div className="p-4 border-t border-border bg-slate-50/70 dark:bg-zinc-900/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                alert(`Downloading ${task.outputFileName || 'scraped dataset'} from Google Drive vault.`);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-semibold text-slate-700 dark:text-zinc-300 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Download Dataset
            </button>
            <a
              href="https://drive.google.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-semibold text-slate-700 dark:text-zinc-300 shadow-sm"
            >
              <Cloud className="w-3.5 h-3.5 text-emerald-600" />
              Open in Google Drive
            </a>
          </div>

          <div className="flex items-center gap-2">
            {/* MANAGER ACTIONS */}
            {currentUserRole === 'manager' && (
              <>
                <button
                  onClick={() => setShowReassignModal(true)}
                  className="px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-semibold text-slate-700 dark:text-zinc-300"
                >
                  Reassign Scraper
                </button>
                <button
                  onClick={() => setShowReworkForm(true)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-700 dark:text-amber-300 text-xs font-bold"
                >
                  <RotateCcw className="w-3 h-3" />
                  Request Rework
                </button>
                <button
                  onClick={handleApproveQC}
                  className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Approve Manager QC
                </button>
              </>
            )}

            {/* PRODUCTION LEAD ACTIONS */}
            {(currentUserRole === 'production_lead' || currentUserRole === 'production') && (
              <>
                <button
                  onClick={() => setShowReassignModal(true)}
                  className="px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-semibold text-slate-700 dark:text-zinc-300"
                >
                  Reassign Scraper
                </button>
                <button
                  onClick={() => setShowReworkForm(true)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-700 dark:text-amber-300 text-xs font-bold"
                >
                  <RotateCcw className="w-3 h-3" />
                  Request Re-Scraping
                </button>
                <button
                  onClick={handleValidateProduction}
                  className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Validate Production Deliverable
                </button>
              </>
            )}

            {/* PRODUCTION USER ACTIONS */}
            {currentUserRole === 'production_user' && (
              <>
                <button
                  onClick={() => setShowReworkForm(true)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-700 dark:text-amber-300 text-xs font-bold"
                >
                  <RotateCcw className="w-3 h-3" />
                  Request Re-Scraping
                </button>
                <button
                  onClick={handleValidateProduction}
                  className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Accept Deliverable
                </button>
              </>
            )}

            {/* SCRAPER ACTIONS */}
            {currentUserRole === 'scraper' && (
              <>
                <button
                  onClick={() => setShowReassignModal(true)}
                  className="px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-semibold text-slate-700 dark:text-zinc-300"
                >
                  Reassign to Peer Scraper
                </button>
                <button
                  onClick={() => {
                    alert(`Dataset uploaded for ${task.id}. Transferred to Google Drive vault and submitted for Manager QC.`);
                  }}
                  className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm"
                >
                  <Cloud className="w-3.5 h-3.5" />
                  Upload Output & Submit QC
                </button>
              </>
            )}

            {/* GUEST ACTIONS */}
            {currentUserRole === 'guest' && (
              <span className="text-xs text-slate-500 font-medium">
                Live Status: <strong>{task.status.replace('_', ' ')}</strong>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
