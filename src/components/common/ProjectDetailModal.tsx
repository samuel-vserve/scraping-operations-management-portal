import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  FolderKanban,
  ExternalLink,
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Cloud,
  FileSpreadsheet,
  Download,
  Terminal,
  Factory,
  ChevronRight,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface ProjectDetailModalProps {
  projectId: string | null;
  onClose: () => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({ projectId, onClose }) => {
  const { projects, tasks, setInspectedTaskId } = useApp();

  const project = projects.find((p) => p.id === projectId);

  if (!project) return null;

  const projectTasks = tasks.filter((t) => t.projectId === project.id);
  const percentCompleted = Math.round((project.completedTasks / Math.max(1, project.totalTasks)) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-4xl bg-card rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up">
        {/* Modal Top Header */}
        <div className="p-5 border-b border-border flex items-start justify-between gap-4 bg-slate-50/50 dark:bg-zinc-900/50">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                {project.id}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                  project.health === 'healthy'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200'
                }`}
              >
                {project.health} Health
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Client: {project.client}
              </span>
            </div>

            <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100">
              {project.name}
            </h2>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-zinc-400">
              <a
                href={`https://${project.website}`}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>{project.website}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <span>•</span>
              <span>Project Lead: <strong>{project.teamLead}</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                <Cloud className="w-3.5 h-3.5" />
                Google Drive Storage Active
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

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Progress & Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl border border-border bg-card shadow-subtle">
              <span className="text-[11px] text-slate-400 font-medium">Overall Progress</span>
              <div className="text-xl font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-1">
                {percentCompleted}%
              </div>
              <span className="text-[10px] text-slate-400">
                {project.completedTasks} / {project.totalTasks} Tasks Done
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-border bg-card shadow-subtle">
              <span className="text-[11px] text-slate-400 font-medium">Active Harvest SKUs</span>
              <div className="text-xl font-bold font-mono text-slate-900 dark:text-zinc-100 mt-1">
                {project.activeSkus.toLocaleString()}
              </div>
              <span className="text-[10px] text-emerald-600 font-semibold">Under Ingestion</span>
            </div>

            <div className="p-3.5 rounded-xl border border-border bg-card shadow-subtle">
              <span className="text-[11px] text-slate-400 font-medium">Contributing Staff</span>
              <div className="text-xl font-bold font-mono text-slate-900 dark:text-zinc-100 mt-1">
                {project.contributors?.length || 4} Operators
              </div>
              <span className="text-[10px] text-slate-400">Scraping & Production</span>
            </div>

            <div className="p-3.5 rounded-xl border border-border bg-card shadow-subtle">
              <span className="text-[11px] text-slate-400 font-medium">Target Milestone</span>
              <div className="text-sm font-bold font-mono text-slate-900 dark:text-zinc-100 mt-1">
                {project.deadline}
              </div>
              <span className="text-[10px] text-slate-400">Final Client Delivery</span>
            </div>
          </div>

          {/* SECTION 1: WORKED USER HISTORY */}
          <div className="p-5 rounded-xl border border-border bg-card shadow-subtle space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
                  Worked User History & Contributor Scorecards
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                {project.contributors?.length || 4} Team Members Contributed
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(project.contributors || []).map((contrib, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-border bg-slate-50/50 dark:bg-zinc-900/50 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={contrib.avatar}
                      alt={contrib.name}
                      className="w-10 h-10 rounded-full object-cover border border-border"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                        {contrib.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-zinc-400">{contrib.role}</p>
                      <p className="text-[10px] text-indigo-600 font-medium">{contrib.team}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-mono font-bold text-slate-900 dark:text-zinc-100">
                      {contrib.skusDelivered.toLocaleString()} SKUs
                    </div>
                    <div className="text-[10px] text-emerald-600 font-semibold">
                      {contrib.tasksCompleted} Tasks Done
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 2: TASKS UNDER THIS PROJECT */}
          <div className="rounded-xl border border-border bg-card shadow-subtle overflow-hidden space-y-3 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
                  Project Tasks & Scraping Workflows ({projectTasks.length})
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">
                Click any task row to view Data Analytics
              </span>
            </div>

            <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
              {projectTasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => {
                    setInspectedTaskId(t.id);
                  }}
                  className="p-3 hover:bg-slate-50 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {t.id}
                    </span>
                    <span className="font-medium text-slate-900 dark:text-zinc-100 truncate">
                      {t.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono text-slate-500">
                      {t.skuCount.toLocaleString()} SKUs
                    </span>
                    <StatusBadge status={t.status} />
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 3: PROJECT AUDIT & MILESTONE TIMELINE */}
          <div className="p-4 rounded-xl border border-border bg-card shadow-subtle space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
                Milestone History & Quality Decisions
              </h3>
            </div>

            <div className="space-y-2">
              {(project.history || []).map((h) => (
                <div
                  key={h.id}
                  className="p-3 rounded-lg border border-border bg-slate-50/50 dark:bg-zinc-900/50 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-zinc-100">{h.actor}</span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                        {h.type}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-zinc-400">{h.action}</p>
                  </div>
                  <span className="font-mono text-[11px] text-slate-400 whitespace-nowrap">
                    {h.timestamp}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Bottom Bar */}
        <div className="p-4 border-t border-border bg-slate-50/70 dark:bg-zinc-900/60 flex items-center justify-between">
          <a
            href={project.gdriveUrl || 'https://drive.google.com'}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-semibold text-slate-700 dark:text-zinc-300 shadow-sm"
          >
            <Cloud className="w-3.5 h-3.5 text-emerald-600" />
            Open Project Google Drive Folder
          </a>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold shadow-sm"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
