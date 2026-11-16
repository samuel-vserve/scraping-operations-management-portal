import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { isTaskAssociatedWithEmployee, getEmployeeAssociatedTeams } from '../../types';
import {
  FolderKanban,
  Search,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const ProjectsView: React.FC = () => {
  const { projects, tasks, setCurrentView, setInspectedProjectId, currentUserRole, currentEmployee } = useApp();
  const [search, setSearch] = useState('');
  const [scopeFilter, setScopeFilter] = useState<'all' | 'associated'>(
    currentUserRole === 'production_user' || currentUserRole === 'scraper' ? 'associated' : 'all'
  );

  const associatedTeams = useMemo(
    () => getEmployeeAssociatedTeams(currentEmployee),
    [currentEmployee]
  );

  const myPodProjectsCount = useMemo(() => {
    return projects.filter((proj) => {
      const pTasks = tasks.filter((t) => t.projectId === proj.id);
      return pTasks.some((t) => isTaskAssociatedWithEmployee(t, currentEmployee, currentUserRole));
    }).length;
  }, [projects, tasks, currentEmployee, currentUserRole]);

  const filteredProjects = projects.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.website.toLowerCase().includes(search.toLowerCase()) ||
      p.client.toLowerCase().includes(search.toLowerCase());

    if (!matchSearch) return false;

    if (scopeFilter === 'associated' && (currentUserRole === 'production_user' || currentUserRole === 'scraper')) {
      const pTasks = tasks.filter((t) => t.projectId === p.id);
      const isAssociated = pTasks.some((t) => isTaskAssociatedWithEmployee(t, currentEmployee, currentUserRole));
      if (!isAssociated) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5 rounded-2xl border border-border bg-card shadow-subtle">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
            <FolderKanban className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                Scraping Client Projects & Portfolios
              </h1>
              <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200">
                {filteredProjects.length} Projects
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Manage multi-site scraping accounts, client contracts, and global milestone deliveries.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {(currentUserRole === 'production_user' || currentUserRole === 'scraper') && (
            <div className="flex items-center gap-1 p-1 rounded-lg border border-border bg-slate-50 dark:bg-zinc-900 text-xs font-semibold">
              <button
                onClick={() => setScopeFilter('all')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  scopeFilter === 'all'
                    ? 'bg-card text-slate-900 dark:text-zinc-100 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-zinc-100'
                }`}
              >
                All Projects ({projects.length})
              </button>
              <button
                onClick={() => setScopeFilter('associated')}
                className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                  scopeFilter === 'associated'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-zinc-100'
                }`}
              >
                <span>Associated Projects</span>
                <span className="text-[10px] opacity-80">({myPodProjectsCount})</span>
              </button>
            </div>
          )}

          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-border bg-slate-50 dark:bg-zinc-900 text-xs text-slate-900 dark:text-zinc-100 outline-none"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.map((proj) => {
          const projectTasks = tasks.filter((t) => t.projectId === proj.id);
          const percent = Math.round((proj.completedTasks / proj.totalTasks) * 100);

          return (
            <div
              key={proj.id}
              onClick={() => setInspectedProjectId(proj.id)}
              className="p-5 rounded-2xl border border-border bg-card shadow-subtle hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                      {proj.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                      Client: {proj.client}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                        proj.health === 'healthy'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200'
                      }`}
                    >
                      {proj.health}
                    </span>
                    {projectTasks.some((t) => isTaskAssociatedWithEmployee(t, currentEmployee, currentUserRole)) && (
                      <span className="px-1.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-[9px] font-bold border border-indigo-200 dark:border-indigo-800">
                        Associated Pod
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3 text-xs">
                  <a
                    href={`https://${proj.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                  >
                    <span>{proj.website}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <span className="text-slate-300 dark:text-zinc-700">•</span>
                  <span className="text-slate-500 text-[11px]">Lead: {proj.teamLead}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-border text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Active Target SKUs</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-zinc-100">
                      {proj.activeSkus.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Tasks Completed</span>
                    <span className="font-mono font-bold text-emerald-600">
                      {proj.completedTasks} / {proj.totalTasks}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-1 pt-2 border-t border-border">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Milestone Progress</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-zinc-300">
                    {percent}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-indigo-600"
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <div className="pt-2 flex items-center justify-between text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold group-hover:underline">
                  <span>View Worked User History & Dossier</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
