import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings as SettingsIcon,
  RotateCcw,
  Cloud,
  Shield,
  Key,
  CheckCircle2,
  HardDrive,
  Moon,
  Sun,
  UserCheck,
  Zap,
  Users,
  Check,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    darkMode,
    toggleDarkMode,
    currentUserRole,
    setCurrentUserRole,
    resetAllData,
    resetToLiveEmptyState,
    defaultScrapingAssignee,
    setDefaultScrapingAssignee,
    employees,
    teams,
    updateUserTeam,
    updateUserTeams,
  } = useApp();

  const scrapingEngineers = employees.filter(
    (e) => e.team === 'Core Scraping Engineering Pod' || e.role.toLowerCase().includes('scraping')
  );

  const productionUsers = employees.filter(
    (e) => e.team !== 'Core Scraping Engineering Pod' && e.team !== 'Operations Leadership'
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fade-in">
      <div className="flex items-center gap-3 p-5 rounded-2xl border border-border bg-card shadow-subtle">
        <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
          <SettingsIcon className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-900 dark:text-zinc-100">
            System & Workspace Preferences
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Configure default scraping assignees, assign users to Production Teams, and manage environment parameters.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* TASK ROUTING & DEFAULT SCRAPING USER */}
        <div className="p-5 rounded-2xl border border-border bg-card shadow-subtle space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
              Scraping Task Routing & Default Assignee
            </h3>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-border bg-slate-50/50 dark:bg-zinc-900/50">
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                Default Scraping Engineer for Production Requests
              </p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                When Production Users request a task without picking an engineer, it automatically routes to this lead.
              </p>
            </div>

            <select
              value={defaultScrapingAssignee}
              onChange={(e) => setDefaultScrapingAssignee(e.target.value)}
              className="px-3 py-2 rounded-lg border border-border bg-card text-xs font-semibold text-slate-900 dark:text-zinc-100 outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {scrapingEngineers.map((se) => (
                <option key={se.id} value={se.name}>
                  {se.name} ({se.designation})
                </option>
              ))}
              <option value="unassigned">Leave Unassigned (Manager Triage Required)</option>
            </select>
          </div>
        </div>

        {/* PRODUCTION USER TEAM ASSIGNMENTS */}
        <div className="p-5 rounded-2xl border border-border bg-card shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
                Production Users Team Assignments
              </h3>
            </div>
            <span className="text-[10px] text-slate-400">
              Multiple Production Teams & Personnel
            </span>
          </div>

          <div className="space-y-2">
            {productionUsers.map((user) => (
              <div
                key={user.id}
                className="p-3 rounded-xl border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-zinc-100 block">{user.name}</span>
                    <span className="text-[10px] text-slate-400">{user.email} • {user.designation}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:items-end gap-1.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {teams
                      .filter((t) => t.teamType !== 'scraping')
                      .map((team) => {
                        const teamName = team.name;
                        const isAssigned = (user.assignedTeams && user.assignedTeams.length > 0 ? user.assignedTeams : [user.team]).includes(teamName);
                        return (
                          <button
                            key={team.id}
                            type="button"
                            onClick={() => {
                              const current = user.assignedTeams && user.assignedTeams.length > 0 ? user.assignedTeams : [user.team];
                              const updated = current.includes(teamName)
                                ? (current.length > 1 ? current.filter((t) => t !== teamName) : current)
                                : [...current, teamName];
                              updateUserTeams(user.id, updated, user.role);
                            }}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border transition-all active:scale-95 ${
                              isAssigned
                                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 shadow-xs'
                                : 'bg-card text-slate-400 dark:text-zinc-500 border-border hover:border-slate-300 hover:text-slate-600 dark:hover:text-zinc-300'
                            }`}
                          >
                            {teamName.replace(' Production Team', '').replace(' Automation Team', '').replace(' Enterprise Team', '').replace(' Team', '')}
                          </button>
                        );
                      })}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {(user.assignedTeams && user.assignedTeams.length > 0 ? user.assignedTeams : [user.team]).length} Teams Assigned (Multi-Pod Active)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Appearance & Theme */}
        <div className="p-5 rounded-2xl border border-border bg-card shadow-subtle space-y-3">
          <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
            Appearance & Interface Theme
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                Interface Color Mode
              </p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Switch between high-contrast light theme and sleek dark SaaS mode.
              </p>
            </div>
            <button
              onClick={toggleDarkMode}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-medium"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              <span>{darkMode ? 'Dark Theme' : 'Light Theme'}</span>
            </button>
          </div>
        </div>

        {/* Cloud Credentials & Service Accounts */}
        <div className="p-5 rounded-2xl border border-border bg-card shadow-subtle space-y-3">
          <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
            Cloud Connectors & Storage Buckets
          </h3>

          <div className="space-y-2">
            <div className="p-3 rounded-xl border border-border bg-slate-50 dark:bg-zinc-900 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <Cloud className="w-4 h-4 text-blue-500" />
                <div>
                  <span className="font-semibold text-slate-800 dark:text-zinc-200 block">
                    Google Drive Client Backup Bucket
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    gdrive-python@banded-cable-352904.iam.gserviceaccount.com
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Active
              </span>
            </div>
          </div>
        </div>

        {/* Operational Cache & Local Storage */}
        <div className="p-5 rounded-2xl border border-border bg-card shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
                Workspace Cache & Storage State
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                Manage cached browser operational state and local table filters.
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold border border-emerald-200">
              Live Production
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-border bg-slate-50/50 dark:bg-zinc-900/50">
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                Purge Local Workspace Cache
              </p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Clears cached filters and temporary state without modifying your operational user accounts or pods.
              </p>
            </div>
            <button
              onClick={() => {
                if (window.confirm('Clear local workspace cache and refresh live state?')) {
                  resetToLiveEmptyState();
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 text-xs font-semibold transition-colors shrink-0 shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Purge Cache</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
