import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Award,
  CheckCircle2,
  Clock,
  Briefcase,
  TrendingUp,
  UserCheck,
  Search,
  Filter,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Terminal,
  Factory,
  Edit2,
  X,
  Check,
  Zap,
} from 'lucide-react';
import { Team, Employee } from '../../types';

export const TeamsView: React.FC = () => {
  const { teams, employees, tasks, updateUserTeam } = useApp();

  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'scraping' | 'production'>('all');

  // Edit user team assignment modal
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [targetTeam, setTargetTeam] = useState<string>('Lawson Production Team');

  // 1 Core Scraping Team
  const scrapingTeam = teams.find((t) => t.teamType === 'scraping' || t.name.includes('Scraping')) || teams[0];

  // Multiple Production Teams
  const productionTeams = teams.filter((t) => t.teamType === 'production' || !t.name.includes('Scraping'));

  const filteredEmployees = employees.filter((emp) => {
    const matchSearch =
      emp.name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
      emp.team.toLowerCase().includes(employeeSearch.toLowerCase()) ||
      emp.designation.toLowerCase().includes(employeeSearch.toLowerCase());

    const isScraper = emp.team === 'Core Scraping Engineering Pod' || emp.role.toLowerCase().includes('scraping');
    const matchRole =
      roleFilter === 'all' ? true : roleFilter === 'scraping' ? isScraper : !isScraper;

    const matchTeam = !selectedTeam || emp.team === selectedTeam.name;

    return matchSearch && matchRole && matchTeam;
  });

  const handleSaveTeamAssignment = () => {
    if (!editingEmployee) return;
    updateUserTeam(editingEmployee.id, targetTeam);
    setEditingEmployee(null);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5 rounded-2xl border border-border bg-card shadow-subtle">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                Team Governance & Workforce Allocation
              </h1>
              <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200">
                1 Scraping Pod • 4 Production Pods
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Single unified <strong>Scraping Engineering Pod</strong> handles extraction; multiple <strong>Production Teams</strong> manage client catalogs, stats, and deliverables.
            </p>
          </div>
        </div>

        {selectedTeam && (
          <button
            onClick={() => setSelectedTeam(null)}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            ← View All Teams
          </button>
        )}
      </div>

      {/* SECTION 1: THE CORE SCRAPING ENGINEERING POD (1 DEDICATED TEAM) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
              <Terminal className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
              Scraping Engineering Pod (1 Central Team)
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold border border-emerald-200">
              Extraction Engine
            </span>
          </div>

          <span className="text-xs text-slate-500">
            Lead: <strong>{scrapingTeam.leader}</strong> • {scrapingTeam.members.length} Engineers
          </span>
        </div>

        <div className="p-5 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/50 bg-gradient-to-r from-emerald-50/50 via-card to-card shadow-subtle space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                  {scrapingTeam.name}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-mono font-bold">
                  {scrapingTeam.productivity}% Efficiency
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-2xl">
                Dedicated technical extraction team responsible for DOM parsing, anti-bot mitigation (Cloudflare/Akamai), proxy pool rotation, and automated Schema Pre-Flight Diff uploads.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="text-center p-2.5 rounded-xl border border-border bg-card min-w-[85px]">
                <p className="text-[10px] text-slate-400 uppercase font-bold">Active</p>
                <p className="text-lg font-mono font-bold text-slate-900 dark:text-zinc-100">{scrapingTeam.activeTasks}</p>
              </div>
              <div className="text-center p-2.5 rounded-xl border border-border bg-card min-w-[85px]">
                <p className="text-[10px] text-slate-400 uppercase font-bold">Completed</p>
                <p className="text-lg font-mono font-bold text-emerald-600">{scrapingTeam.completedTasks}</p>
              </div>
              <div className="text-center p-2.5 rounded-xl border border-border bg-card min-w-[85px]">
                <p className="text-[10px] text-slate-400 uppercase font-bold">Velocity</p>
                <p className="text-lg font-mono font-bold text-indigo-600">{scrapingTeam.completionRate}%</p>
              </div>
            </div>
          </div>

          {/* Members of Scraping Pod */}
          <div className="pt-3 border-t border-border/60">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Pod Scraping Engineers:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {employees
                .filter((e) => e.team === 'Core Scraping Engineering Pod')
                .map((emp) => (
                  <div
                    key={emp.id}
                    className="p-3 rounded-xl border border-border bg-card/80 flex items-center justify-between gap-2 shadow-xs"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <img src={emp.avatar} alt={emp.name} className="w-8 h-8 rounded-full object-cover ring-1 ring-emerald-500/50" />
                      <div className="truncate">
                        <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate block">
                          {emp.name}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate block">
                          {emp.designation}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-[10px] font-mono font-bold ${
                        emp.workloadCapacity >= 85 ? 'text-rose-600' : 'text-emerald-600'
                      }`}>
                        {emp.workloadCapacity}% Load
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: MULTIPLE PRODUCTION TEAMS */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600">
              <Factory className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
              Production Teams ({productionTeams.length} Account Pods)
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold border border-blue-200">
              Client & Catalog Handoff
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {productionTeams.map((team) => {
            const isSelected = selectedTeam?.id === team.id;
            const teamMembers = employees.filter((e) => e.team === team.name);

            return (
              <div
                key={team.id}
                onClick={() => setSelectedTeam(isSelected ? null : team)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/30 dark:bg-blue-950/20 shadow-md ring-2 ring-blue-500/20'
                    : 'border-border bg-card hover:border-slate-300 dark:hover:border-zinc-700 shadow-subtle hover:shadow-premium'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                        {team.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                        <img
                          src={team.leaderAvatar}
                          alt={team.leader}
                          className="w-4 h-4 rounded-full object-cover"
                        />
                        <span className="truncate">Lead: {team.leader}</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-[10px] font-mono font-bold border border-blue-200">
                      {team.productivity}% Prod
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs py-2 border-y border-border/60 font-mono mb-3">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Active</span>
                      <span className="font-bold text-slate-800 dark:text-zinc-200">{team.activeTasks}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Done</span>
                      <span className="font-bold text-emerald-600">{team.completedTasks}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Pending</span>
                      <span className="font-bold text-amber-600">{team.pendingTasks}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-slate-400 block">Members:</span>
                    <div className="flex items-center gap-1">
                      {teamMembers.map((m) => (
                        <span
                          key={m.id}
                          className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 truncate"
                        >
                          {m.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-blue-600 dark:text-blue-400 font-semibold">
                  <span>{isSelected ? 'Viewing Pod Members' : 'Filter by Pod'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: EMPLOYEE DIRECTORY & TEAM ASSIGNMENT */}
      <div className="p-6 rounded-2xl border border-border bg-card shadow-subtle space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
              Workforce Directory & Capacity ({filteredEmployees.length} Personnel)
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Inspect developer workload capacity bars, QC approval track records, and reassign users to Production Teams.
            </p>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 border border-border rounded-lg px-2.5 py-1.5 bg-slate-50 dark:bg-zinc-900">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search engineer, team, role..."
                value={employeeSearch}
                onChange={(e) => setEmployeeSearch(e.target.value)}
                className="bg-transparent text-xs text-slate-800 dark:text-zinc-200 outline-none w-36 sm:w-48"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-lg border border-border bg-card text-xs text-slate-700 dark:text-zinc-300 outline-none"
            >
              <option value="all">All Roles</option>
              <option value="scraping">Scraping Engineers (Core Pod)</option>
              <option value="production">Production Specialists</option>
            </select>
          </div>
        </div>

        {/* Employee Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((emp) => {
            const isScraper = emp.team === 'Core Scraping Engineering Pod';

            return (
              <div
                key={emp.id}
                className="p-4 rounded-xl border border-border bg-card hover:border-slate-300 dark:hover:border-zinc-700 transition-all space-y-3 relative group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={emp.avatar}
                      alt={emp.name}
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-border"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                        <span>{emp.name}</span>
                        {isScraper && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-mono font-bold">
                            Scraper
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate max-w-[180px]">
                        {emp.designation}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setEditingEmployee(emp);
                      setTargetTeam(emp.team);
                    }}
                    className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                    title="Change Team Assignment"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1.5 text-xs font-mono pt-2 border-t border-border">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Assigned Pod:</span>
                    <span className="font-semibold text-slate-800 dark:text-zinc-200 truncate max-w-[170px]">
                      {emp.team}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Completed Tasks:</span>
                    <span className="font-semibold text-slate-800 dark:text-zinc-200">
                      {emp.completedTasks}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">QC Approval Rate:</span>
                    <span className="font-semibold text-emerald-600">
                      {emp.qcApprovalRate}%
                    </span>
                  </div>
                </div>

                {/* Workload Capacity Bar */}
                <div className="pt-2 border-t border-border">
                  <div className="flex justify-between text-[11px] mb-1 font-mono">
                    <span className="text-slate-500">Workload Capacity:</span>
                    <span
                      className={`font-bold ${
                        emp.workloadCapacity >= 85
                          ? 'text-rose-600'
                          : emp.workloadCapacity >= 70
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {emp.workloadCapacity}% ({emp.activeTasksCount} active)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        emp.workloadCapacity >= 85
                          ? 'bg-rose-500'
                          : emp.workloadCapacity >= 70
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${emp.workloadCapacity}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* USER TEAM ASSIGNMENT MODAL */}
      {editingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                  Assign User to Team / Pod
                </h3>
              </div>
              <button
                onClick={() => setEditingEmployee(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Reassign <strong className="text-slate-900 dark:text-zinc-100">{editingEmployee.name}</strong> to a specific Production Team or the Core Scraping Engineering Pod.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Select Destination Team:
              </label>
              <select
                value={targetTeam}
                onChange={(e) => setTargetTeam(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-card text-xs text-slate-900 dark:text-zinc-100 outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.name} ({t.teamType === 'scraping' ? 'Scraping Pod' : 'Production Pod'})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                onClick={() => setEditingEmployee(null)}
                className="px-4 py-2 rounded-lg border border-border text-xs font-semibold text-slate-600 dark:text-zinc-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTeamAssignment}
                className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Assignment</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
