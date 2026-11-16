import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  LayoutDashboard,
  ShieldCheck,
  Factory,
  BarChart3,
  Database,
  Plus,
  Users,
  Moon,
  Sun,
  X,
  ArrowRight,
  UploadCloud,
  FileSpreadsheet,
} from 'lucide-react';

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    setCurrentView,
    setIsCreateTaskModalOpen,
    toggleDarkMode,
    darkMode,
    tasks,
    projects,
    setSelectedTaskIdForQC,
  } = useApp();

  const [query, setQuery] = useState('');

  // Global keydown listener for Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(!isCommandPaletteOpen);
      }
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setIsCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setIsCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const quickActions = [
    {
      id: 'act-new-task',
      label: 'Create / Request Scraping Task',
      icon: Plus,
      action: () => {
        setIsCreateTaskModalOpen(true);
        setIsCommandPaletteOpen(false);
      },
    },
    {
      id: 'act-manager-qc',
      label: 'Go to Manager Approval Workspace',
      icon: ShieldCheck,
      action: () => {
        setCurrentView('manager-qc');
        setIsCommandPaletteOpen(false);
      },
    },
    {
      id: 'act-production',
      label: 'Go to Production Deliverables & Stats',
      icon: Factory,
      action: () => {
        setCurrentView('production-qc');
        setIsCommandPaletteOpen(false);
      },
    },
    {
      id: 'act-analytics',
      label: 'Open Data Analytics & Dataset Explorer',
      icon: BarChart3,
      action: () => {
        setCurrentView('analytics');
        setIsCommandPaletteOpen(false);
      },
    },
    {
      id: 'act-import',
      label: 'Import New SKU Dataset (Excel / CSV)',
      icon: UploadCloud,
      action: () => {
        setCurrentView('import-export');
        setIsCommandPaletteOpen(false);
      },
    },
    {
      id: 'act-theme',
      label: `Switch to ${darkMode ? 'Light' : 'Dark'} Mode`,
      icon: darkMode ? Sun : Moon,
      action: () => {
        toggleDarkMode();
        setIsCommandPaletteOpen(false);
      },
    },
  ];

  const filteredActions = quickActions.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase())
  );

  const filteredTasks = tasks.filter(
    (t) =>
      t.id.toLowerCase().includes(query.toLowerCase()) ||
      t.title.toLowerCase().includes(query.toLowerCase()) ||
      t.website.toLowerCase().includes(query.toLowerCase())
  );

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.website.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl rounded-2xl border border-border bg-card shadow-2xl overflow-hidden divide-y divide-border">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 gap-3 bg-card">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Type a command or search tasks, projects, SKUs..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 outline-none"
          />
          <button
            onClick={() => setIsCommandPaletteOpen(false)}
            className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Results */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-3">
          {/* Quick Actions */}
          {filteredActions.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                Quick Actions
              </div>
              <div className="space-y-0.5">
                {filteredActions.map((act) => {
                  const Icon = act.icon;
                  return (
                    <button
                      key={act.id}
                      onClick={act.action}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <span>{act.label}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tasks Matching */}
          {filteredTasks.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                Tasks
              </div>
              <div className="space-y-0.5">
                {filteredTasks.slice(0, 4).map((task) => (
                  <button
                    key={task.id}
                    onClick={() => {
                      setSelectedTaskIdForQC(task.id);
                      setCurrentView('manager-qc');
                      setIsCommandPaletteOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-left text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-zinc-100">
                        <span className="font-mono text-indigo-600 dark:text-indigo-400 mr-2">
                          {task.id}
                        </span>
                        {task.title}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {task.website} • {task.skuCount.toLocaleString()} SKUs • {task.status}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-500">
                      Open QC
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Projects Matching */}
          {filteredProjects.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                Projects
              </div>
              <div className="space-y-0.5">
                {filteredProjects.slice(0, 3).map((proj) => (
                  <button
                    key={proj.id}
                    onClick={() => {
                      setCurrentView('projects');
                      setIsCommandPaletteOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-left text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-zinc-100">
                        {proj.name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {proj.client} • {proj.website}
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {proj.activeSkus.toLocaleString()} SKUs
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredActions.length === 0 &&
            filteredTasks.length === 0 &&
            filteredProjects.length === 0 && (
              <div className="p-6 text-center text-xs text-slate-400">
                No matching actions or records found for &ldquo;{query}&rdquo;
              </div>
            )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-zinc-900/50 flex items-center justify-between text-[11px] text-slate-400">
          <span>Navigate with mouse or keyboard</span>
          <div className="flex items-center gap-1.5 font-mono">
            <span>ESC to close</span>
          </div>
        </div>
      </div>
    </div>
  );
};
