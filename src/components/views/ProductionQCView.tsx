import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Factory,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  Clock,
  Cloud,
  ExternalLink,
  RotateCcw,
  AlertTriangle,
  History,
  Check,
  Download,
  BarChart3,
  Plus,
  Eye,
  X,
  FileCheck,
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { Task } from '../../types';
import confetti from 'canvas-confetti';

export const ProductionQCView: React.FC = () => {
  const {
    tasks,
    currentUserRole,
    approveProduction,
    rejectProduction,
    downloadScrapedFile,
    setIsCreateTaskModalOpen,
    setCurrentView,
    setSelectedTaskIdForQC,
    setInspectedTaskId,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'awaiting' | 'in_validation' | 'approved' | 'rejected' | 'completed'>('awaiting');
  const [selectedTaskForAction, setSelectedTaskForAction] = useState<string | null>(null);
  const [productionRemarks, setProductionRemarks] = useState<string>('');
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>('all');

  // Filter tasks based on role and team
  const scopedTasks = tasks.filter((t) => {
    if (currentUserRole === 'production_user') {
      const isMine =
        t.productionUser === 'Divya Murugan' ||
        t.createdBy === 'Divya Murugan' ||
        t.id === 'TSK-1048' ||
        t.id === 'TSK-1049';
      if (!isMine) return false;
    }
    if (selectedTeamFilter !== 'all' && t.productionTeam !== selectedTeamFilter) {
      return false;
    }
    return true;
  });

  // Map tasks to tabs
  const awaitingTasks = scopedTasks.filter((t) => t.status === 'production_pending');
  const inValidationTasks = scopedTasks.filter((t) => t.status === 'in_progress' && t.progress > 75);
  const approvedTasks = scopedTasks.filter((t) => t.status === 'completed');
  const rejectedTasks = scopedTasks.filter((t) => t.status === 'rejected' || t.status === 'rework_required');
  const allCompleted = scopedTasks.filter((t) => t.status === 'completed');

  const getTabTasks = () => {
    switch (activeTab) {
      case 'awaiting':
        return awaitingTasks;
      case 'in_validation':
        return inValidationTasks;
      case 'approved':
        return approvedTasks;
      case 'rejected':
        return rejectedTasks;
      case 'completed':
        return allCompleted;
    }
  };

  const activeTaskList = getTabTasks();

  const handleApprove = (taskId: string) => {
    approveProduction(taskId, productionRemarks || 'Production validation passed. Schema validated against client deliverable rules.');
    try {
      confetti({ particleCount: 75, spread: 60, origin: { y: 0.6 } });
    } catch {
      // ignore
    }
    setSelectedTaskForAction(null);
    setProductionRemarks('');
  };

  const handleReject = (taskId: string) => {
    rejectProduction(taskId, productionRemarks || 'Production QA flagged broken image URLs. Returned to rework queue.');
    setSelectedTaskForAction(null);
    setProductionRemarks('');
  };

  return (
    <div className="space-y-5 pb-12 animate-fade-in">
      {/* Top Banner with "Request Scraping Task" action */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5 rounded-2xl border border-border bg-card shadow-subtle">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900">
            <Factory className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-zinc-100">
              Production Operations & Client Deliverables
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Request extraction tasks, download completed scraped files, inspect data quality statistics, and certify client packages.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {currentUserRole !== 'production_user' && (
            <select
              value={selectedTeamFilter}
              onChange={(e) => setSelectedTeamFilter(e.target.value)}
              className="text-xs font-semibold px-2.5 py-2 rounded-lg border border-border bg-card text-slate-700 dark:text-zinc-300"
            >
              <option value="all">All Production Teams</option>
              <option value="Lawson Production Team">Lawson Production Team</option>
              <option value="Surya Production Team">Surya Production Team</option>
              <option value="DTS Automation Team">DTS Automation Team</option>
              <option value="Altius Enterprise Team">Altius Enterprise Team</option>
            </select>
          )}

          <button
            onClick={() => setIsCreateTaskModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Request Scraping Task</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border space-x-6 text-xs font-semibold text-slate-500">
        {[
          { id: 'awaiting', label: 'Awaiting Validation', count: awaitingTasks.length },
          { id: 'in_validation', label: 'In Validation', count: inValidationTasks.length },
          { id: 'approved', label: 'Approved Deliverables', count: approvedTasks.length },
          { id: 'rejected', label: 'Rejected / Rework', count: rejectedTasks.length },
          { id: 'completed', label: 'Completed Archive', count: allCompleted.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 pb-3 relative transition-colors ${
              activeTab === tab.id
                ? 'text-indigo-600 dark:text-indigo-400 font-bold border-b-2 border-indigo-600 dark:border-indigo-400'
                : 'hover:text-slate-900 dark:hover:text-zinc-200'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeTab === tab.id
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300'
                  : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Main List of Production Tasks */}
      <div className="space-y-4">
        {activeTaskList.length > 0 ? (
          activeTaskList.map((task) => (
            <div
              key={task.id}
              className="p-5 rounded-2xl border border-border bg-card shadow-subtle space-y-4 hover:border-slate-300 dark:hover:border-zinc-700 transition-colors"
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
                    Project: <strong className="text-slate-700 dark:text-zinc-300">{task.projectName}</strong> ({task.website}) • Client:{' '}
                    {task.client} • Assigned Pod: <span className="font-semibold">{task.assignedTeam}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono text-xs font-semibold px-2 py-1 rounded bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                    {task.skuCount.toLocaleString()} SKUs
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Due: {task.deadline}
                  </span>
                </div>
              </div>

              {/* Data Completeness & Schema Specs */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-50/70 dark:bg-zinc-900/50 border border-border text-xs">
                <div>
                  <span className="text-slate-400 text-[11px] block">Extracted Output:</span>
                  <div className="flex items-center gap-1.5 font-mono text-slate-700 dark:text-zinc-300 mt-0.5 truncate">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{task.outputFileName || `${task.id}_extract.xlsx`}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 text-[11px] block">Manager QC Sign-off:</span>
                  <span className="text-emerald-600 font-semibold block mt-0.5">
                    ✓ Verified by Samuel P
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 text-[11px] block">Field Completeness:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-zinc-200 block mt-0.5">
                    99.4% (Passed Invariant)
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 text-[11px] block">Google Drive Sync:</span>
                  <span className="inline-flex items-center gap-1 text-slate-600 dark:text-zinc-400 mt-0.5">
                    <Cloud className="w-3.5 h-3.5 text-blue-500" />
                    {task.status === 'completed' ? 'Synced to Client Drive' : 'Ready for Sync'}
                  </span>
                </div>
              </div>

              {/* Production Team Operational Hand-off Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  {/* Download Scraped File Button */}
                  <button
                    onClick={() => downloadScrapedFile(task.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-xs font-semibold text-slate-700 dark:text-zinc-200 transition-colors shadow-subtle"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>Download Scraped File</span>
                  </button>

                  {/* View Scraped Data Stats Button */}
                  <button
                    onClick={() => setInspectedTaskId(task.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-xs font-semibold text-slate-700 dark:text-zinc-200 transition-colors shadow-subtle"
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    <span>View Scraped Data Analytics & Records</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedTaskIdForQC(task.id);
                      setCurrentView('manager-qc');
                    }}
                    className="text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline inline-flex items-center gap-1 ml-1"
                  >
                    <span>Full QC Center</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

                {task.status === 'production_pending' ? (
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => setSelectedTaskForAction(task.id)}
                      className="px-3 py-1.5 rounded-lg border border-border hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-300"
                    >
                      Add Remarks
                    </button>
                    <button
                      onClick={() => handleReject(task.id)}
                      className="px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900 text-rose-600 hover:bg-rose-50 text-xs font-semibold"
                    >
                      Reject to Rework
                    </button>
                    <button
                      onClick={() => handleApprove(task.id)}
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Certify & Upload to Drive</span>
                    </button>
                  </div>
                ) : (
                  <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Production Certification Complete
                  </span>
                )}
              </div>

              {/* Remarks Drawer if active */}
              {selectedTaskForAction === task.id && (
                <div className="p-3 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-border space-y-2 text-xs animate-fade-in">
                  <label className="font-semibold text-slate-700 dark:text-zinc-300 block">
                    Production Validation Notes & Client Column Schema Checks:
                  </label>
                  <textarea
                    rows={2}
                    value={productionRemarks}
                    onChange={(e) => setProductionRemarks(e.target.value)}
                    placeholder="Enter production sign-off remarks, client taxonomy notes, or rework directives..."
                    className="w-full p-2 rounded-lg border border-border bg-card text-xs text-slate-800 dark:text-zinc-200 outline-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setSelectedTaskForAction(null)}
                      className="px-3 py-1 text-xs text-slate-400"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => handleApprove(task.id)}
                      className="px-3 py-1 rounded bg-emerald-600 text-white text-xs font-semibold"
                    >
                      Submit Approval & Sync
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="p-12 text-center rounded-2xl border border-dashed border-border text-xs text-slate-400">
            No tasks currently under {activeTab.replace('_', ' ')}.
          </div>
        )}
      </div>
    </div>
  );
};
