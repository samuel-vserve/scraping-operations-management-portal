import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { getEmployeeAssociatedTeams } from '../../types';
import {
  CheckSquare,
  Upload,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Clock,
  Sparkles,
  ArrowRight,
  X,
  FileCheck,
  RotateCcw,
  UserPlus,
  Share2,
  Sliders,
  Check,
  Zap,
  Database,
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { TaskProgress } from '../common/TaskProgress';
import { Task } from '../../types';
import confetti from 'canvas-confetti';

export const MyTasksScraperView: React.FC = () => {
  const {
    tasks,
    uploadScrapedFile,
    submitTaskForQC,
    reassignTaskScraper,
    updateTaskInternalProgress,
    employees,
    setCurrentView,
    setSelectedTaskIdForQC,
    setInspectedTaskId,
    currentEmployee,
    currentUserRole: _currentUserRole,
  } = useApp();

  const [scopeFilter, setScopeFilter] = useState<'all_pod' | 'mine'>('all_pod');

  // Associated scraping teams for the current employee (e.g. Core Scraping Engineering Pod)
  const myScraperTeams = useMemo(
    () => getEmployeeAssociatedTeams(currentEmployee),
    [currentEmployee]
  );

  // Engineer tasks (assigned directly to this employee or associated with their scraping pod)
  const myTasks = useMemo(() => {
    return tasks.filter((t) => {
      const isDirectlyAssigned =
        t.primaryAssignee?.toLowerCase() === currentEmployee.name.toLowerCase() ||
        t.assignedEmployees.some((e) => e.toLowerCase() === currentEmployee.name.toLowerCase());

      const isAssociatedPod =
        myScraperTeams.some((team) => team.toLowerCase() === t.assignedTeam?.toLowerCase()) ||
        t.assignedTeam === 'Core Scraping Engineering Pod';

      if (scopeFilter === 'mine') {
        return isDirectlyAssigned;
      }

      return isDirectlyAssigned || isAssociatedPod;
    });
  }, [tasks, currentEmployee, myScraperTeams, scopeFilter]);

  const assignedToMeCount = useMemo(() => {
    return tasks.filter(
      (t) =>
        t.primaryAssignee?.toLowerCase() === currentEmployee.name.toLowerCase() ||
        t.assignedEmployees.some((e) => e.toLowerCase() === currentEmployee.name.toLowerCase())
    ).length;
  }, [tasks, currentEmployee]);

  const [activeUploadTask, setActiveUploadTask] = useState<Task | null>(null);
  const [activeReassignTask, setActiveReassignTask] = useState<Task | null>(null);
  const [reassignTargetScraper, setReassignTargetScraper] = useState<string>('Sneha Patel');
  const [reassignReason, setReassignReason] = useState<string>('Workload rebalancing & concurrency scaling');

  const [activeProgressTask, setActiveProgressTask] = useState<Task | null>(null);
  const [newProgressVal, setNewProgressVal] = useState<number>(50);
  const [newExecutionState, setNewExecutionState] = useState<string>('Harvesting Catalog via Proxy Pool');

  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string; rows: number } | null>(null);
  const [detectedColumns, setDetectedColumns] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'in_progress' | 'rework' | 'awaiting_qc'>('all');

  const filteredTasks = myTasks.filter((t) => {
    if (activeTab === 'in_progress') return t.status === 'in_progress';
    if (activeTab === 'rework') return t.status === 'rework_required';
    if (activeTab === 'awaiting_qc') return t.status === 'awaiting_manager_qc';
    return true;
  });

  // Peer scrapers available in Core Scraping Engineering Pod or associated pods
  const peerScrapers = useMemo(() => {
    return employees.filter(
      (e) =>
        (e.team === 'Core Scraping Engineering Pod' || e.role.toLowerCase().includes('scraping')) &&
        e.name !== currentEmployee.name
    );
  }, [employees, currentEmployee]);

  const handleSimulateFileSelect = (task: Task) => {
    const isRework = task.status === 'rework_required';
    const sampleDetected = isRework
      ? ['SKU_ID', 'MPN', 'Title', 'Price', 'Thread_Size', 'Material', 'Coating', 'Images']
      : ['SKU_ID', 'MPN', 'Title', 'Category', 'Price', 'Stock_Status', 'Image_URLs', 'Specs_JSON', 'Extra_Notes'];

    setUploadedFile({
      name: `${task.website.replace('.com', '')}_Extracted_Batch_${Date.now().toString().slice(-4)}.xlsx`,
      size: '14.2 MB',
      rows: task.skuCount || 12450,
    });
    setDetectedColumns(sampleDetected);
  };

  const handleConfirmUpload = () => {
    if (!activeUploadTask || !uploadedFile) return;

    uploadScrapedFile(
      activeUploadTask.id,
      uploadedFile.name,
      uploadedFile.size,
      uploadedFile.rows
    );

    submitTaskForQC(activeUploadTask.id);

    try {
      confetti({ particleCount: 75, spread: 60, origin: { y: 0.6 } });
    } catch {}

    setActiveUploadTask(null);
    setUploadedFile(null);
  };

  const handleExecuteReassign = () => {
    if (!activeReassignTask || !reassignTargetScraper) return;
    reassignTaskScraper(activeReassignTask.id, reassignTargetScraper, reassignReason);
    setActiveReassignTask(null);
  };

  const handleSaveProgress = () => {
    if (!activeProgressTask) return;
    updateTaskInternalProgress(activeProgressTask.id, newProgressVal, newExecutionState);
    setActiveProgressTask(null);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5 rounded-2xl border border-border bg-card shadow-subtle">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                Scraping Engineer Worklist & Execution
              </h1>
              <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200">
                Core Scraping Pod
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Manage your assigned extraction tasks, update progress milestones, reassign peer workload, and pre-validate schemas before submitting for Manager Approval.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-xs font-mono font-bold text-slate-900 dark:text-zinc-100">
              {currentEmployee.name} ({currentEmployee.designation || 'Scraping Engineer'})
            </span>
            <span className="text-[11px] text-slate-400 block font-mono">
              Pod: {currentEmployee.team} • Load: {currentEmployee.workloadCapacity}%
            </span>
          </div>
          <img
            src={currentEmployee.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"}
            alt={currentEmployee.name}
            className="w-9 h-9 rounded-full ring-2 ring-emerald-500 object-cover"
          />
        </div>
      </div>

      {/* Pod Scope Toggle & Status Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-1">
        <div className="flex space-x-6 text-xs font-semibold text-slate-500 overflow-x-auto">
          {[
            { id: 'all', label: scopeFilter === 'mine' ? 'My Tasks' : 'All Pod Tasks', count: myTasks.length },
            { id: 'in_progress', label: 'In Extraction', count: myTasks.filter((t) => t.status === 'in_progress').length },
            { id: 'rework', label: 'Rework Queue', count: myTasks.filter((t) => t.status === 'rework_required').length },
            { id: 'awaiting_qc', label: 'Awaiting Manager QC', count: myTasks.filter((t) => t.status === 'awaiting_manager_qc').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 pb-3 relative transition-colors shrink-0 ${
                activeTab === tab.id
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold border-b-2 border-indigo-600 dark:border-indigo-400'
                  : 'hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              <span>{tab.label}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Scope Pill Toggle: All Pod vs Assigned to Me */}
        <div className="flex items-center p-1 rounded-lg border border-border bg-slate-50 dark:bg-zinc-900 text-xs font-semibold self-start sm:self-auto mb-2 sm:mb-0">
          <button
            onClick={() => setScopeFilter('all_pod')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              scopeFilter === 'all_pod'
                ? 'bg-card text-slate-900 dark:text-zinc-100 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-zinc-200'
            }`}
          >
            All Pod Tasks
          </button>
          <button
            onClick={() => setScopeFilter('mine')}
            className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5 ${
              scopeFilter === 'mine'
                ? 'bg-card text-slate-900 dark:text-zinc-100 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-zinc-200'
            }`}
          >
            <span>Assigned to Me</span>
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              {assignedToMeCount}
            </span>
          </button>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => {
            const isRework = task.status === 'rework_required';

            return (
              <div
                key={task.id}
                className={`p-5 rounded-2xl border bg-card shadow-subtle space-y-4 transition-all ${
                  isRework
                    ? 'border-amber-300 dark:border-amber-800 bg-amber-50/10 dark:bg-amber-950/10'
                    : 'border-border hover:border-slate-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        {task.id}
                      </span>
                      <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                        {task.title}
                      </h2>
                      <StatusBadge status={task.status} size="sm" />
                      <PriorityBadge priority={task.priority} />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Project: <strong className="text-slate-700 dark:text-zinc-300">{task.projectName}</strong> • Target:{' '}
                      <a
                        href={`https://${task.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-indigo-600 hover:underline inline-flex items-center gap-0.5"
                      >
                        {task.website}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                      Requested by: {task.productionUser || 'Priya Nair'} ({task.productionTeam || 'Production'})
                    </span>
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200">
                      {task.skuCount.toLocaleString()} SKUs Target
                    </span>
                  </div>
                </div>

                {/* Internal execution status pill */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 font-medium text-[11px]">Execution Phase:</span>
                  <span className="font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-[11px]">
                    {task.internalExecutionState || 'Harvesting Catalog via Proxy Pool'}
                  </span>
                  <button
                    onClick={() => {
                      setActiveProgressTask(task);
                      setNewProgressVal(task.progress);
                      setNewExecutionState(task.internalExecutionState || 'Harvesting Catalog via Proxy Pool');
                    }}
                    className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <Sliders className="w-3 h-3" />
                    <span>Update Phase & Progress</span>
                  </button>
                </div>

                {/* Rework Alert Banner if flagged */}
                {isRework && task.qcHistory.length > 0 && (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-semibold">
                        Manager QC Rework Feedback from {task.qcHistory[0].performedBy}:
                      </strong>
                      <p className="mt-0.5 text-[11px] leading-relaxed">
                        &ldquo;{task.qcHistory[0].remarks}&rdquo;
                      </p>
                    </div>
                  </div>
                )}

                {/* Task Details & Required Schema */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50/70 dark:bg-zinc-900/50 border border-border text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Input Seed File:</span>
                    <div className="flex items-center gap-1.5 font-mono text-slate-700 dark:text-zinc-300 mt-0.5 truncate">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{task.inputFileName}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[11px] block">Scraped Output File:</span>
                    {task.outputFileName ? (
                      <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold block mt-0.5 truncate">
                        {task.outputFileName} ({task.outputFileSize || 'Ready'})
                      </span>
                    ) : (
                      <span className="text-slate-400 italic block mt-0.5">Not uploaded yet</span>
                    )}
                  </div>

                  <div>
                    <span className="text-slate-400 text-[11px] block">
                      Required Columns ({task.requiredColumns.length}):
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {task.requiredColumns.slice(0, 4).map((col) => (
                        <span
                          key={col}
                          className="px-1.5 py-0.2 rounded bg-white dark:bg-zinc-800 border border-border text-[9px] font-mono text-slate-600 dark:text-zinc-400"
                        >
                          {col}
                        </span>
                      ))}
                      {task.requiredColumns.length > 4 && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          +{task.requiredColumns.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Scraper Actions Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-border/50">
                  <div className="w-full sm:w-64">
                    <TaskProgress progress={task.progress} size="sm" />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {/* Inspect Data Analytics Modal Trigger */}
                    <button
                      onClick={() => setInspectedTaskId(task.id)}
                      className="px-3 py-2 rounded-lg border border-border bg-slate-50 dark:bg-zinc-800/80 hover:bg-slate-100 dark:hover:bg-zinc-700 text-xs font-semibold text-slate-700 dark:text-zinc-200 flex items-center gap-1.5 transition-colors shadow-subtle"
                      title="Inspect SKU Analytics, Completeness and Records"
                    >
                      <Database className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>Data Analytics</span>
                    </button>

                    {/* Reassign to Peer Scraper Button */}
                    <button
                      onClick={() => {
                        setActiveReassignTask(task);
                        setReassignTargetScraper(
                          peerScrapers.find((p) => p.name !== task.primaryAssignee)?.name || 'Sneha Patel'
                        );
                      }}
                      className="px-3 py-2 rounded-lg border border-border hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-300 flex items-center gap-1.5 transition-colors"
                      title="Reassign to another engineer in Core Scraping Pod"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-slate-500" />
                      <span>Reassign to Peer</span>
                    </button>

                    {task.status !== 'completed' && (
                      <button
                        onClick={() => {
                          setActiveUploadTask(task);
                          handleSimulateFileSelect(task);
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all"
                      >
                        <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>
                          {task.outputFileName ? 'Re-upload Scraped File' : 'Upload Scraped File'}
                        </span>
                      </button>
                    )}

                    {task.outputFileName && task.status !== 'awaiting_manager_qc' && (
                      <button
                        onClick={() => submitTaskForQC(task.id)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        <span>Submit for Manager Approval</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setSelectedTaskIdForQC(task.id);
                        setCurrentView('manager-qc');
                      }}
                      className="px-3 py-2 rounded-lg border border-border hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-300"
                    >
                      View QC Audit
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center rounded-2xl border border-dashed border-border text-xs text-slate-400">
            No active tasks found in this tab.
          </div>
        )}
      </div>

      {/* REASSIGN TO PEER SCRAPER MODAL */}
      {activeReassignTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                  Reassign Task to Peer Scraping Engineer
                </h3>
              </div>
              <button
                onClick={() => setActiveReassignTask(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Reassign <strong className="font-mono text-slate-800 dark:text-zinc-200">{activeReassignTask.id}</strong> to a colleague in the Core Scraping Pod to balance workload.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Select Peer Scraping Engineer:
              </label>
              <select
                value={reassignTargetScraper}
                onChange={(e) => setReassignTargetScraper(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-card text-xs text-slate-900 dark:text-zinc-100 outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {peerScrapers.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name} ({p.designation}) — {p.workloadCapacity}% Load
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Reason / Handoff Remarks:
              </label>
              <textarea
                rows={2}
                value={reassignReason}
                onChange={(e) => setReassignReason(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-card text-xs text-slate-900 dark:text-zinc-100 outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                onClick={() => setActiveReassignTask(null)}
                className="px-4 py-2 rounded-lg border border-border text-xs font-semibold text-slate-600 dark:text-zinc-400"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteReassign}
                className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirm Reassignment</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPDATE PROGRESS & PHASE MODAL */}
      {activeProgressTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                  Update Task Progress & Phase
                </h3>
              </div>
              <button
                onClick={() => setActiveProgressTask(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700 dark:text-zinc-300">Completion Progress:</span>
                <span className="font-mono text-indigo-600 font-bold">{newProgressVal}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={newProgressVal}
                onChange={(e) => setNewProgressVal(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Current Execution Phase:
              </label>
              <select
                value={newExecutionState}
                onChange={(e) => setNewExecutionState(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-card text-xs text-slate-900 dark:text-zinc-100 outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Analyzing DOM & Selectors">Analyzing DOM & Selectors</option>
                <option value="Developing Python / Playwright Scripts">Developing Python / Playwright Scripts</option>
                <option value="Bypassing Cloudflare / Akamai Protections">Bypassing Cloudflare / Akamai Protections</option>
                <option value="Harvesting Catalog via Proxy Pool">Harvesting Catalog via Proxy Pool</option>
                <option value="Normalizing Attributes & JSON Specs">Normalizing Attributes & JSON Specs</option>
                <option value="Schema Pre-Flight Passed (Ready for Approval)">Schema Pre-Flight Passed (Ready for Approval)</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                onClick={() => setActiveProgressTask(null)}
                className="px-4 py-2 rounded-lg border border-border text-xs font-semibold text-slate-600 dark:text-zinc-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProgress}
                className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all"
              >
                Save Progress
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD & SCHEMA PRE-FLIGHT MODAL */}
      {activeUploadTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl rounded-2xl border border-border bg-card shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-indigo-600">
                  {activeUploadTask.id}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                  Upload Scraped Dataset File
                </h3>
              </div>
              <button
                onClick={() => setActiveUploadTask(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Dropped File Preview */}
            {uploadedFile ? (
              <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-zinc-100 font-mono">
                        {uploadedFile.name}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {uploadedFile.size} • {uploadedFile.rows.toLocaleString()} records parsed
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    File Ready
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-xl border-2 border-dashed border-border text-center space-y-2">
                <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Drop your extracted .xlsx or .csv output here
                </p>
                <p className="text-[11px] text-slate-400">
                  The system will inspect header rows against the mandatory project schema.
                </p>
              </div>
            )}

            {/* SCHEMA PRE-FLIGHT DIFF TABLE */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-zinc-300">
                  Automated Schema Pre-Flight Validation
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Comparing file headers vs task specification
                </span>
              </div>

              <div className="border border-border rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-zinc-900 text-[10px] font-bold text-slate-500 uppercase border-b border-border">
                    <tr>
                      <th className="p-2.5">Required Attribute</th>
                      <th className="p-2.5">Detected In File</th>
                      <th className="p-2.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border font-mono text-[11px]">
                    {activeUploadTask.requiredColumns.map((col) => {
                      const isFound = detectedColumns.some(
                        (d) => d.toLowerCase().replace(/[^a-z0-9]/g, '') === col.toLowerCase().replace(/[^a-z0-9]/g, '')
                      );

                      return (
                        <tr key={col} className={isFound ? 'bg-card' : 'bg-rose-50/30 dark:bg-rose-950/20'}>
                          <td className="p-2.5 font-semibold text-slate-800 dark:text-zinc-200">
                            {col}
                          </td>
                          <td className="p-2.5 text-slate-500">
                            {isFound ? (
                              <span className="text-emerald-600 font-bold">✓ Matches Header</span>
                            ) : (
                              <span className="text-rose-500 font-bold">✗ Header Missing</span>
                            )}
                          </td>
                          <td className="p-2.5 text-right">
                            {isFound ? (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold">
                                Pass
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 text-[10px] font-bold">
                                Defect
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <button
                onClick={() => setActiveUploadTask(null)}
                className="px-4 py-2 rounded-lg border border-border text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmUpload}
                disabled={!uploadedFile}
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Validate & Submit Directly for Manager Approval</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
