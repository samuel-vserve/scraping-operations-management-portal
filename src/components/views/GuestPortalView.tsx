import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  UserPlus,
  Download,
  Upload,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  CheckSquare,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { PriorityBadge } from '../common/PriorityBadge';
import { StatusBadge } from '../common/StatusBadge';
import confetti from 'canvas-confetti';

export const GuestPortalView: React.FC = () => {
  const { tasks, setIsCreateTaskModalOpen } = useApp();

  // Guest client tasks (e.g. for Lawson partner / Industrial Supplies)
  const clientTasks = tasks.filter((t) => t.client.toLowerCase().includes('supplies') || t.client.toLowerCase().includes('commercial') || t.client.toLowerCase().includes('precision'));

  const [selectedTask, setSelectedTask] = useState(clientTasks[0] || tasks[0]);
  const [guestProgress, setGuestProgress] = useState<number>(selectedTask?.progress || 80);
  const [outputFileName, setOutputFileName] = useState<string>('Client_Validated_Extract_v2.xlsx');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const handleSubmitTask = () => {
    setIsSubmitted(true);
    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch {}
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-fade-in">
      {/* Client Welcome Banner */}
      <div className="p-6 rounded-2xl border border-border bg-card shadow-subtle flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-zinc-100">
              Client Portal — Deliverables & Progress
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
              External Partner
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Welcome, Mark Stevens (Guest Requestor). Submit new scraping requests with seed files and track the live execution status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateTaskModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all"
          >
            <span>+ Request New Scraping Task</span>
          </button>
        </div>
      </div>

      {/* Main Guest Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Left Column: Assigned Tasks List */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
            Your Contracted Tasks ({clientTasks.length})
          </h2>

          <div className="space-y-2">
            {clientTasks.map((task) => {
              const isSelected = selectedTask.id === task.id;

              return (
                <div
                  key={task.id}
                  onClick={() => {
                    setSelectedTask(task);
                    setGuestProgress(task.progress);
                    setIsSubmitted(false);
                  }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/30 ring-1 ring-indigo-500'
                      : 'border-border bg-card hover:border-slate-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {task.id}
                    </span>
                    <StatusBadge status={task.status} size="sm" />
                  </div>
                  <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 line-clamp-1">
                    {task.title}
                  </h3>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 font-mono">
                    <span>{task.skuCount.toLocaleString()} SKUs</span>
                    <span>Due: {task.deadline}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center & Right Columns: Task Workspace */}
        <div className="md:col-span-2 space-y-4">
          <div className="p-6 rounded-2xl border border-border bg-card shadow-subtle space-y-5">
            {/* Task Info & Deadline */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-border">
              <div>
                <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {selectedTask.id}
                </span>
                <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                  {selectedTask.title}
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Target: {selectedTask.website} • Project: {selectedTask.projectName}
                </p>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-slate-400 block">Deadline Countdown</span>
                <span className="text-xs font-mono font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-900">
                  {selectedTask.deadline} (In 3 Days)
                </span>
              </div>
            </div>

            {/* Input File Download */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                    Input Seed Feed: {selectedTask.inputFileName}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {selectedTask.inputFileSize} • {selectedTask.skuCount.toLocaleString()} Source Records
                  </div>
                </div>
              </div>

              <button
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-300 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Input</span>
              </button>
            </div>

            {/* Task Requirements */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
                Contracted Extraction Requirements
              </h3>
              <div className="space-y-1.5 text-xs text-slate-600 dark:text-zinc-400">
                {selectedTask.scrapingRequirements.map((req, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckSquare className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress Update Slider */}
            <div className="space-y-2 pt-3 border-t border-border">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-slate-700 dark:text-zinc-300">
                  Update Completion Progress:
                </label>
                <span className="font-mono font-bold text-indigo-600 text-sm">
                  {guestProgress}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={guestProgress}
                onChange={(e) => setGuestProgress(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            {/* Output File Upload Area */}
            <div className="p-4 rounded-xl border border-dashed border-border bg-slate-50/50 dark:bg-zinc-900/50 text-center space-y-2">
              <Upload className="w-6 h-6 text-slate-400 mx-auto" />
              <div>
                <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                  Upload Completed Deliverable (.xlsx / .csv)
                </p>
                <p className="text-[11px] text-slate-400">
                  Selected file: <span className="font-mono text-indigo-600">{outputFileName}</span>
                </p>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex items-center justify-between">
              {isSubmitted ? (
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Deliverable Submitted to Vserve Operations for QC!</span>
                </div>
              ) : (
                <div className="text-xs text-slate-400">
                  Status: Ready for submission
                </div>
              )}

              <button
                onClick={handleSubmitTask}
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all"
              >
                Submit Deliverable
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
