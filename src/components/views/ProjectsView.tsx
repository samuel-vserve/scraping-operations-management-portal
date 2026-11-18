import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { isTaskAssociatedWithEmployee, getEmployeeAssociatedTeams, Project } from '../../types';
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
  Plus,
  Edit2,
  Trash2,
  X,
  Building2,
  Globe,
  Calendar,
  User,
  FileText,
  Check,
  AlertCircle,
} from 'lucide-react';

export const ProjectsView: React.FC = () => {
  const {
    projects,
    tasks,
    employees,
    setCurrentView,
    setInspectedProjectId,
    currentUserRole,
    currentEmployee,
    addProject,
    updateProject,
    deleteProject,
  } = useApp();

  const [search, setSearch] = useState('');
  const [scopeFilter, setScopeFilter] = useState<'all' | 'associated'>(
    currentUserRole === 'production_user' || currentUserRole === 'scraper' || currentUserRole === 'production_lead'
      ? 'associated'
      : 'all'
  );
  const [healthFilter, setHealthFilter] = useState<'all' | 'healthy' | 'at_risk' | 'delayed'>('all');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);

  // Create Form State (Streamlined: only Name, Lead, Health, Description, GDrive URL)
  const [newName, setNewName] = useState('');
  const [newTeamLead, setNewTeamLead] = useState('');
  const [newHealth, setNewHealth] = useState<'healthy' | 'at_risk' | 'delayed'>('healthy');
  const [newDescription, setNewDescription] = useState('');
  const [newGdriveUrl, setNewGdriveUrl] = useState('');

  // Edit Form State
  const [editName, setEditName] = useState('');
  const [editTeamLead, setEditTeamLead] = useState('');
  const [editHealth, setEditHealth] = useState<'healthy' | 'at_risk' | 'delayed'>('healthy');
  const [editDescription, setEditDescription] = useState('');
  const [editGdriveUrl, setEditGdriveUrl] = useState('');

  // Keyboard shortcut ESC to close modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowCreateModal(false);
        setEditingProject(null);
        setDeletingProject(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const associatedTeams = useMemo(
    () => getEmployeeAssociatedTeams(currentEmployee),
    [currentEmployee]
  );

  const myPodProjectsCount = useMemo(() => {
    return projects.filter((proj) => {
      const pTasks = tasks.filter((t) => t.projectId === proj.id || t.projectName === proj.name);
      return pTasks.some((t) => isTaskAssociatedWithEmployee(t, currentEmployee, currentUserRole));
    }).length;
  }, [projects, tasks, currentEmployee, currentUserRole]);

  const filteredProjects = projects.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.website && p.website.toLowerCase().includes(search.toLowerCase())) ||
      (p.client && p.client.toLowerCase().includes(search.toLowerCase())) ||
      p.teamLead.toLowerCase().includes(search.toLowerCase());

    if (!matchSearch) return false;

    if (healthFilter !== 'all' && p.health !== healthFilter) {
      return false;
    }

    if (
      currentUserRole === 'production_lead' ||
      (scopeFilter === 'associated' && (currentUserRole === 'production_user' || currentUserRole === 'scraper'))
    ) {
      const pTasks = tasks.filter((t) => t.projectId === p.id || t.projectName === p.name);
      const isAssociated = pTasks.some((t) => isTaskAssociatedWithEmployee(t, currentEmployee, currentUserRole));
      if (!isAssociated) return false;
    }

    return true;
  });

  const handleOpenCreateModal = () => {
    setNewName('');
    setNewTeamLead(currentEmployee.name || employees[0]?.name || 'Samuel P');
    setNewHealth('healthy');
    setNewDescription('');
    setNewGdriveUrl('');
    setShowCreateModal(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    addProject({
      name: newName.trim(),
      client: '',
      website: '',
      teamLead: newTeamLead || currentEmployee.name,
      health: newHealth,
      deadline: 'Ongoing',
      activeSkus: 0,
      description: newDescription.trim() || undefined,
      gdriveUrl: newGdriveUrl.trim() || undefined,
    });

    setShowCreateModal(false);
  };

  const handleOpenEditModal = (proj: Project) => {
    setEditingProject(proj);
    setEditName(proj.name);
    setEditTeamLead(proj.teamLead);
    setEditHealth(proj.health);
    setEditDescription(proj.description || '');
    setEditGdriveUrl(proj.gdriveUrl || '');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject || !editName.trim()) return;

    updateProject(editingProject.id, {
      name: editName.trim(),
      teamLead: editTeamLead,
      health: editHealth,
      description: editDescription.trim() || undefined,
      gdriveUrl: editGdriveUrl.trim() || undefined,
    });

    setEditingProject(null);
  };

  const handleDeleteConfirm = () => {
    if (!deletingProject) return;
    deleteProject(deletingProject.id);
    setDeletingProject(null);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Banner Header */}
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

          {/* Health Filter */}
          <div className="flex items-center gap-1 p-1 rounded-lg border border-border bg-slate-50 dark:bg-zinc-900 text-xs font-semibold">
            <button
              onClick={() => setHealthFilter('all')}
              className={`px-2 py-1 rounded-md transition-colors ${
                healthFilter === 'all'
                  ? 'bg-card text-slate-900 dark:text-zinc-100 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-zinc-100'
              }`}
            >
              All Health
            </button>
            <button
              onClick={() => setHealthFilter('healthy')}
              className={`px-2 py-1 rounded-md transition-colors ${
                healthFilter === 'healthy'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-zinc-100'
              }`}
            >
              Healthy
            </button>
            <button
              onClick={() => setHealthFilter('at_risk')}
              className={`px-2 py-1 rounded-md transition-colors ${
                healthFilter === 'at_risk'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-zinc-100'
              }`}
            >
              At Risk
            </button>
          </div>

          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search projects, domains, leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-border bg-slate-50 dark:bg-zinc-900 text-xs text-slate-900 dark:text-zinc-100 outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {(currentUserRole === 'manager' || currentUserRole === 'production_lead') && (
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Create Project</span>
            </button>
          )}
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((proj) => {
            const projectTasks = tasks.filter((t) => t.projectId === proj.id || t.projectName === proj.name);
            const totalTasks = projectTasks.length > 0 ? projectTasks.length : proj.totalTasks;
            const completedTasks = projectTasks.length > 0
              ? projectTasks.filter((t) => t.status === 'completed').length
              : proj.completedTasks;
            const percent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

            return (
              <div
                key={proj.id}
                onClick={() => setInspectedProjectId(proj.id)}
                className="p-5 rounded-2xl border border-border bg-card shadow-subtle hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between space-y-4 group relative"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="pr-12">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {proj.name}
                      </h3>
                      {proj.client ? (
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                          Client: <strong className="font-semibold text-slate-700 dark:text-zinc-300">{proj.client}</strong>
                        </p>
                      ) : null}
                    </div>

                    {/* Action buttons (Edit & Delete) */}
                    <div className="flex items-center gap-1 absolute top-4 right-4">
                      {(currentUserRole === 'manager' || currentUserRole === 'production_lead') && (
                        <>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditModal(proj);
                            }}
                            className="p-1.5 rounded-lg border border-border bg-card hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-indigo-600 transition-colors shadow-xs"
                            title="Edit Project Portfolio"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingProject(proj);
                            }}
                            className="p-1.5 rounded-lg border border-border bg-card hover:bg-rose-50 dark:hover:bg-rose-950/60 text-slate-400 hover:text-rose-600 transition-colors shadow-xs"
                            title="Delete Project Portfolio"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                        proj.health === 'healthy'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : proj.health === 'at_risk'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                      }`}
                    >
                      {proj.health} Health
                    </span>

                    {projectTasks.some((t) => isTaskAssociatedWithEmployee(t, currentEmployee, currentUserRole)) && (
                      <span className="px-1.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-[9px] font-bold border border-indigo-200 dark:border-indigo-800">
                        Associated Pod
                      </span>
                    )}

                    {proj.deadline && proj.deadline !== 'Ongoing' && (
                      <span className="text-[10px] text-slate-400 font-mono ml-auto">
                        Due: {proj.deadline}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-3 text-xs">
                    {proj.website ? (
                      <>
                        <a
                          href={proj.website.startsWith('http') ? proj.website : `https://${proj.website}`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="font-mono text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                        >
                          <span>{proj.website}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <span className="text-slate-300 dark:text-zinc-700">•</span>
                      </>
                    ) : null}
                    <span className="text-slate-500 text-[11px]">Lead: <strong>{proj.teamLead}</strong></span>
                  </div>

                  {proj.description && (
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-2 mt-2 leading-relaxed">
                      {proj.description}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-2 mt-4 p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-border text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Total Tasks</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-zinc-100">
                        {totalTasks}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Tasks Completed</span>
                      <span className="font-mono font-bold text-emerald-600">
                        {completedTasks} / {totalTasks}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Milestone Progress Bar */}
                <div className="space-y-1.5 pt-2 border-t border-border">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Milestone Progress</span>
                    <span className="font-mono font-bold text-slate-700 dark:text-zinc-300">
                      {percent}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-between text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold group-hover:underline">
                    <span>View Dossier & Contributors</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-card/50 flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400">
            <FolderKanban className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
              No Matching Projects Found
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm">
              No client projects match the current search or filters. Create a new portfolio or adjust search parameters.
            </p>
          </div>
          {(currentUserRole === 'manager' || currentUserRole === 'production_lead') && (
            <button
              onClick={handleOpenCreateModal}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-sm hover:bg-indigo-700 transition-all"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Create New Project</span>
            </button>
          )}
        </div>
      )}

      {/* CREATE NEW PROJECT MODAL (STREAMLINED: NO Client, Website, Deadline, or SKU fields) */}
      {showCreateModal && (
        <div
          onClick={(e) => e.target === e.currentTarget && setShowCreateModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
        >
          <div className="w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl p-6 space-y-4 animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <Building2 className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                  Create New Project
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 block">
                  Project Name *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. USCM or Grainger US Catalog Refresh"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-slate-50 dark:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-zinc-200"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 block">
                    Assigned Project Lead *
                  </label>
                  <select
                    value={newTeamLead}
                    onChange={(e) => setNewTeamLead(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-slate-800 dark:text-zinc-200 outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.name}>
                        {emp.name} ({emp.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 block">
                    Health Status
                  </label>
                  <select
                    value={newHealth}
                    onChange={(e) => setNewHealth(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-slate-800 dark:text-zinc-200 outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                  >
                    <option value="healthy">Healthy (On Schedule)</option>
                    <option value="at_risk">At Risk (Slight Delay)</option>
                    <option value="delayed">Delayed (Action Needed)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 block">
                  Google Drive Folder Storage URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/drive/folders/..."
                  value={newGdriveUrl}
                  onChange={(e) => setNewGdriveUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-slate-50 dark:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-zinc-200 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 block">
                  Project Description & Requirements (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief description of project requirements, guidelines, or operational notes..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-slate-50 dark:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-zinc-200 leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-border hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Create Project</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PROJECT MODAL (STREAMLINED) */}
      {editingProject && (
        <div
          onClick={(e) => e.target === e.currentTarget && setEditingProject(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
        >
          <div className="w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl p-6 space-y-4 animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                    Edit Project
                  </h3>
                  <span className="font-mono text-[10px] text-slate-400">ID: {editingProject.id}</span>
                </div>
              </div>
              <button
                onClick={() => setEditingProject(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 block">
                  Project Name *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-slate-50 dark:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-zinc-200"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 block">
                    Assigned Project Lead *
                  </label>
                  <select
                    value={editTeamLead}
                    onChange={(e) => setEditTeamLead(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-slate-800 dark:text-zinc-200 outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.name}>
                        {emp.name} ({emp.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 block">
                    Health Status
                  </label>
                  <select
                    value={editHealth}
                    onChange={(e) => setEditHealth(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-slate-800 dark:text-zinc-200 outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                  >
                    <option value="healthy">Healthy (On Schedule)</option>
                    <option value="at_risk">At Risk (Slight Delay)</option>
                    <option value="delayed">Delayed (Action Needed)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 block">
                  Google Drive Folder Storage URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/drive/folders/..."
                  value={editGdriveUrl}
                  onChange={(e) => setEditGdriveUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-slate-50 dark:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-zinc-200 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 block">
                  Project Description & Requirements (Optional)
                </label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-slate-50 dark:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-zinc-200 leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-border hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingProject && (
        <div
          onClick={(e) => e.target === e.currentTarget && setDeletingProject(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
        >
          <div className="w-full max-w-md bg-card rounded-2xl border border-rose-200 dark:border-rose-900 shadow-2xl p-6 space-y-4 animate-scale-up">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-full bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                  Delete Project Portfolio?
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  This action permanently removes the project from the portal.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-border space-y-1 text-xs">
              <p className="font-semibold text-slate-800 dark:text-zinc-200">
                {deletingProject.name}
              </p>
              {deletingProject.client ? (
                <p className="text-slate-500 text-[11px]">
                  Client: {deletingProject.client}
                </p>
              ) : null}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingProject(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-border hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Project</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
