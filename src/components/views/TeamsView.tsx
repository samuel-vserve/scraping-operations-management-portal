import React, { useState, useMemo } from 'react';
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
  Plus,
  Trash2,
  UserPlus,
  Layers,
  Building2,
} from 'lucide-react';
import { Team, Employee, getEmployeeAssociatedTeams } from '../../types';

interface TeamsViewProps {
  defaultTab?: 'teams' | 'members';
}

export const TeamsView: React.FC<TeamsViewProps> = ({ defaultTab = 'teams' }) => {
  const {
    teams,
    employees,
    tasks,
    updateUserTeam,
    updateUserTeams,
    addTeam,
    updateTeam,
    deleteTeam,
    assignTeamMembers,
    currentUserRole,
    currentEmployee,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'teams' | 'members'>(defaultTab);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'scraping' | 'production' | 'associated'>('all');
  const [podFilterMode, setPodFilterMode] = useState<'all' | 'my_pods'>('all');

  // Multi-team awareness
  const associatedTeams = useMemo(
    () => getEmployeeAssociatedTeams(currentEmployee),
    [currentEmployee]
  );

  // Edit user team assignment modal (Configure User Team & Role)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [targetTeams, setTargetTeams] = useState<string[]>(['Lawson Production Team']);
  const [targetTeam, setTargetTeam] = useState<string>('Lawson Production Team');
  const [targetRole, setTargetRole] = useState<string>('Production User');

  // Create Team / Pod Modal state
  const [showCreateTeamModal, setShowCreateTeamModal] = useState<boolean>(false);
  const [newTeamName, setNewTeamName] = useState<string>('');
  const [newTeamType, setNewTeamType] = useState<'production' | 'scraping' | 'operations'>('production');
  const [newTeamLeader, setNewTeamLeader] = useState<string>('');
  const [newTeamDescription, setNewTeamDescription] = useState<string>('');
  const [newTeamDomains, setNewTeamDomains] = useState<string>('');
  const [newTeamSelectedMembers, setNewTeamSelectedMembers] = useState<string[]>([]);
  const [createTeamMemberSearch, setCreateTeamMemberSearch] = useState<string>('');

  // Assign Members to Pod Modal state
  const [assigningMembersTeam, setAssigningMembersTeam] = useState<Team | null>(null);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [assignMemberSearch, setAssignMemberSearch] = useState<string>('');

  // 1 Core Scraping Team
  const scrapingTeam = teams.find((t) => t.teamType === 'scraping' || t.name.includes('Scraping')) || teams[0];

  // Multiple Production Teams
  const productionTeams = teams.filter((t) => t.teamType === 'production' || !t.name.includes('Scraping'));

  // Filtered production teams based on podFilterMode
  const displayedProductionTeams = useMemo(() => {
    if (currentUserRole === 'production_lead' && associatedTeams.length > 0) {
      return productionTeams.filter((pt) =>
        associatedTeams.some(
          (at) =>
            at.toLowerCase().includes(pt.name.toLowerCase()) ||
            pt.name.toLowerCase().includes(at.toLowerCase())
        )
      );
    }
    if (podFilterMode === 'my_pods' && associatedTeams.length > 0) {
      return productionTeams.filter((pt) =>
        associatedTeams.some(
          (at) =>
            at.toLowerCase().includes(pt.name.toLowerCase()) ||
            pt.name.toLowerCase().includes(at.toLowerCase())
        )
      );
    }
    return productionTeams;
  }, [productionTeams, podFilterMode, associatedTeams, currentUserRole]);

  const filteredEmployees = employees.filter((emp) => {
    const matchSearch =
      emp.name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
      emp.team.toLowerCase().includes(employeeSearch.toLowerCase()) ||
      (emp.assignedTeams && emp.assignedTeams.some((t) => t.toLowerCase().includes(employeeSearch.toLowerCase()))) ||
      emp.designation.toLowerCase().includes(employeeSearch.toLowerCase());

    const isScraper = emp.team === 'Core Scraping Engineering Pod' || emp.role.toLowerCase().includes('scraping');
    const empTeams = emp.assignedTeams && emp.assignedTeams.length > 0 ? emp.assignedTeams : [emp.team];

    // For Production Lead: strictly only members of their assigned production team(s), never scraping pod
    if (currentUserRole === 'production_lead') {
      const belongsToMyTeam = empTeams.some((t) =>
        associatedTeams.some(
          (at) =>
            at.toLowerCase().includes(t.toLowerCase()) ||
            t.toLowerCase().includes(at.toLowerCase())
        )
      );
      if (!belongsToMyTeam || isScraper) return false;
    }

    const matchRole =
      roleFilter === 'all'
        ? true
        : roleFilter === 'scraping'
        ? isScraper
        : roleFilter === 'production'
        ? !isScraper
        : empTeams.some((t) =>
            associatedTeams.some(
              (at) =>
                at.toLowerCase().includes(t.toLowerCase()) ||
                t.toLowerCase().includes(at.toLowerCase())
            )
          );

    const matchTeam =
      !selectedTeam ||
      empTeams.some(
        (t) =>
          t.toLowerCase().includes(selectedTeam.name.toLowerCase()) ||
          selectedTeam.name.toLowerCase().includes(t.toLowerCase())
      );

    return matchSearch && matchRole && matchTeam;
  });

  const handleSaveTeamAssignment = () => {
    if (!editingEmployee) return;
    const finalTeams = targetTeams.length > 0 ? targetTeams : [targetTeam];
    updateUserTeams(editingEmployee.id, finalTeams, targetRole);
    setEditingEmployee(null);
  };

  const handleCreateTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) {
      alert('Please enter a team name');
      return;
    }
    const leaderEmp = employees.find((emp) => emp.name === newTeamLeader) || employees[0];
    const websites = newTeamDomains
      .split(',')
      .map((d) => d.trim())
      .filter(Boolean);

    addTeam({
      name: newTeamName.trim(),
      teamType: newTeamType,
      leader: leaderEmp.name,
      leaderAvatar: leaderEmp.avatar,
      members: newTeamSelectedMembers.length > 0 ? newTeamSelectedMembers : [leaderEmp.id],
      websitesManaged: websites,
      description: newTeamDescription.trim() || undefined,
    });

    setNewTeamName('');
    setNewTeamDescription('');
    setNewTeamDomains('');
    setNewTeamSelectedMembers([]);
    setShowCreateTeamModal(false);
  };

  const handleAssignMembersSubmit = () => {
    if (!assigningMembersTeam) return;
    assignTeamMembers(assigningMembersTeam.id, selectedMemberIds);
    setAssigningMembersTeam(null);
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
                {currentUserRole === 'production_lead'
                  ? `${associatedTeams[0] || 'Production Pod'} Management`
                  : 'Team Governance & Workforce Allocation'}
              </h1>
              <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200">
                {currentUserRole === 'production_lead'
                  ? `${associatedTeams[0] || '1 Production Pod'}`
                  : `${teams.length} Active Pods & Teams`}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              {currentUserRole === 'production_lead'
                ? `Manage assigned specialists and catalog deliveries for ${associatedTeams[0] || 'your production pod'}.`
                : 'Scraping Engineering Pod handles DOM extraction; Production Teams manage client catalogs, stats, and deliverables.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center p-1 rounded-lg border border-border bg-slate-50 dark:bg-zinc-900 text-xs font-semibold">
            <button
              onClick={() => {
                setActiveTab('teams');
                setSelectedTeam(null);
              }}
              className={`px-3 py-1 rounded-md transition-colors ${
                activeTab === 'teams'
                  ? 'bg-card text-slate-900 dark:text-zinc-100 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              Teams & Pods ({teams.length})
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`px-3 py-1 rounded-md transition-colors ${
                activeTab === 'members'
                  ? 'bg-card text-slate-900 dark:text-zinc-100 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              Team Members ({employees.length})
            </button>
          </div>

          {(currentUserRole === 'manager' || currentUserRole === 'production_lead') && (
            <button
              onClick={() => {
                setNewTeamLeader(employees[0]?.name || '');
                setShowCreateTeamModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Team / Pod</span>
            </button>
          )}

          {selectedTeam && (
            <button
              onClick={() => setSelectedTeam(null)}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline ml-2"
            >
              ← View All Teams
            </button>
          )}
        </div>
      </div>

      {activeTab === 'teams' && (
        <>
          {/* SECTION 1: THE CORE SCRAPING ENGINEERING POD (1 DEDICATED TEAM) - HIDDEN FOR PRODUCTION LEAD */}
          {currentUserRole !== 'production_lead' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
                    <Terminal className="w-4 h-4" />
                  </div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                    Scraping Engineering Pod (Central Team)
                  </h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold border border-emerald-200">
                    Extraction Engine
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500">
                    Lead: <strong>{scrapingTeam.leader}</strong> • {scrapingTeam.members.length} Engineers
                  </span>
                  {(currentUserRole === 'manager' || currentUserRole === 'scraper') && (
                    <button
                      onClick={() => {
                        setAssigningMembersTeam(scrapingTeam);
                        setSelectedMemberIds(scrapingTeam.members || []);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border bg-card hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-semibold text-slate-700 dark:text-zinc-300 shadow-xs transition-colors"
                    >
                      <Users className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Assign Engineers</span>
                    </button>
                  )}
                </div>
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
                      {(currentUserRole === 'scraper' || associatedTeams.some((at) => at.toLowerCase().includes('scraping') || at.toLowerCase().includes('core'))) && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold border border-emerald-300 dark:border-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Your Active Scraping Pod
                        </span>
                      )}
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
                    Pod Scraping Engineers ({scrapingTeam.members.length}):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {employees
                      .filter((e) => scrapingTeam.members.includes(e.id) || scrapingTeam.members.includes(e.name) || e.team === scrapingTeam.name)
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
          )}

          {/* SECTION 2: PRODUCTION TEAMS */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600">
                  <Factory className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                  {currentUserRole === 'production_lead'
                    ? `Your Production Pod (${displayedProductionTeams[0]?.name || 'Assigned Pod'})`
                    : `Production Teams (${productionTeams.length} Account Pods)`}
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold border border-blue-200">
                  Client & Catalog Handoff
                </span>
              </div>

              {currentUserRole !== 'production_lead' && (
                <div className="flex items-center gap-1.5 p-1 rounded-lg border border-border bg-slate-50 dark:bg-zinc-900 text-xs font-semibold">
                  <button
                    onClick={() => setPodFilterMode('all')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      podFilterMode === 'all'
                        ? 'bg-card text-slate-900 dark:text-zinc-100 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-zinc-100'
                    }`}
                  >
                    All Pods ({productionTeams.length})
                  </button>
                  <button
                    onClick={() => setPodFilterMode('my_pods')}
                    className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                      podFilterMode === 'my_pods'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-zinc-100'
                    }`}
                  >
                    <span>My Associated Pods</span>
                    <span className="text-[10px] opacity-80">
                      ({displayedProductionTeams.length})
                    </span>
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {displayedProductionTeams.map((team) => {
                const isSelected = selectedTeam?.id === team.id;
                const isMyPod = associatedTeams.some(
                  (at) =>
                    at.toLowerCase().includes(team.name.toLowerCase()) ||
                    team.name.toLowerCase().includes(at.toLowerCase())
                );
                const teamMembers = employees.filter((e) => {
                  const empTeams = e.assignedTeams && e.assignedTeams.length > 0 ? e.assignedTeams : [e.team];
                  return (
                    team.members.includes(e.id) ||
                    team.members.includes(e.name) ||
                    empTeams.some(
                      (t) =>
                        t.toLowerCase().includes(team.name.toLowerCase()) ||
                        team.name.toLowerCase().includes(t.toLowerCase())
                    )
                  );
                });

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
                        <div className="flex flex-col items-end gap-1">
                          <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-[10px] font-mono font-bold border border-blue-200">
                            {team.productivity}% Prod
                          </span>
                          {isMyPod && (
                            <span className="px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[9px] font-bold border border-emerald-300 dark:border-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              Associated
                            </span>
                          )}
                        </div>
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
                        <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400">
                          <span>Members ({teamMembers.length}):</span>
                        </div>
                        <div className="flex items-center gap-1 flex-wrap">
                          {teamMembers.slice(0, 3).map((m) => (
                            <span
                              key={m.id}
                              className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 truncate"
                            >
                              {m.name}
                            </span>
                          ))}
                          {teamMembers.length > 3 && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-400">
                              +{teamMembers.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAssigningMembersTeam(team);
                          const currentMemberIds = employees
                            .filter((emp) => {
                              const empTeams = emp.assignedTeams && emp.assignedTeams.length > 0 ? emp.assignedTeams : [emp.team];
                              return (
                                team.members.includes(emp.id) ||
                                team.members.includes(emp.name) ||
                                empTeams.some(
                                  (t) =>
                                    t.toLowerCase().includes(team.name.toLowerCase()) ||
                                    team.name.toLowerCase().includes(t.toLowerCase())
                                )
                              );
                            })
                            .map((emp) => emp.id);
                          setSelectedMemberIds(currentMemberIds);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border bg-card hover:bg-slate-100 dark:hover:bg-zinc-800 text-[11px] font-semibold text-slate-700 dark:text-zinc-300 shadow-xs transition-colors"
                      >
                        <Users className="w-3 h-3 text-indigo-600" />
                        <span>Assign Members</span>
                      </button>

                      <div className="flex items-center gap-2">
                        {team.id.startsWith('team-') && currentUserRole === 'manager' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`Are you sure you want to decommission pod "${team.name}"?`)) {
                                deleteTeam(team.id);
                              }
                            }}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors"
                            title="Decommission custom pod"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <span className="text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-0.5">
                          <span>{isSelected ? 'Viewing' : 'Filter'}</span>
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* SECTION 3: EMPLOYEE DIRECTORY & TEAM ASSIGNMENT */}
      <div className="p-6 rounded-2xl border border-border bg-card shadow-subtle space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
              Workforce Directory & Capacity ({filteredEmployees.length} Personnel)
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              {currentUserRole === 'production_lead'
                ? `Showing specialists assigned to ${associatedTeams[0] || 'your production team'}.`
                : 'Scraping Engineers (Extraction Engine) and Production Specialists across all pods.'}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search personnel, role, pod..."
                value={employeeSearch}
                onChange={(e) => setEmployeeSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-border bg-card text-slate-800 dark:text-zinc-200 outline-none focus:ring-1 focus:ring-indigo-500 w-56"
              />
            </div>

            {currentUserRole !== 'production_lead' && (
              <div className="flex items-center gap-1 p-1 rounded-lg border border-border bg-slate-50 dark:bg-zinc-900 text-xs font-semibold">
                <button
                  onClick={() => setRoleFilter('all')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    roleFilter === 'all'
                      ? 'bg-card text-slate-900 dark:text-zinc-100 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-zinc-100'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setRoleFilter('scraping')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    roleFilter === 'scraping'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-zinc-100'
                  }`}
                >
                  Scrapers
                </button>
                <button
                  onClick={() => setRoleFilter('production')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    roleFilter === 'production'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-zinc-100'
                  }`}
                >
                  Production
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((emp) => {
            const isScraper = emp.team === 'Core Scraping Engineering Pod' || emp.role.toLowerCase().includes('scraping');
            const empTeams = emp.assignedTeams && emp.assignedTeams.length > 0 ? emp.assignedTeams : [emp.team];

            return (
              <div
                key={emp.id}
                className="p-4 rounded-xl border border-border bg-card hover:border-slate-300 dark:hover:border-zinc-700 transition-all shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={emp.avatar}
                      alt={emp.name}
                      className="w-10 h-10 rounded-full object-cover border border-border"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                        <span>{emp.name}</span>
                        {emp.role.toLowerCase().includes('lead') && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 font-bold border border-amber-200">
                            Lead
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-slate-400">{emp.email}</p>
                      <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                        {emp.designation}
                      </p>
                    </div>
                  </div>

                  {currentUserRole === 'manager' && (
                    <button
                      onClick={() => {
                        setEditingEmployee(emp);
                        setTargetRole(emp.role);
                        setTargetTeam(empTeams[0] || 'Lawson Production Team');
                        setTargetTeams(empTeams);
                      }}
                      className="p-1.5 rounded-lg border border-border hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 hover:text-indigo-600 transition-colors shadow-xs"
                      title="Configure User Team & Role"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Assigned Pods */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400">
                    <span>Assigned Pods:</span>
                    <span>{empTeams.length} Active</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1">
                    {empTeams.map((t) => (
                      <span
                        key={t}
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                          t.includes('Scraping')
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200'
                            : t.includes('Operations')
                            ? 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-200'
                            : 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200'
                        }`}
                      >
                        {t.replace(' Team', '').replace(' Engineering Pod', '')}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Performance & Active Tasks */}
                <div className="grid grid-cols-2 gap-2 text-[11px] py-2 border-y border-border/60 font-mono">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Active Tasks</span>
                    <span className="font-bold text-slate-900 dark:text-zinc-100">
                      {emp.activeTasksCount}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">QC Score</span>
                    <span className="font-semibold text-emerald-600">
                      {emp.qcApprovalRate}%
                    </span>
                  </div>
                </div>

                {/* Workload Capacity Bar */}
                <div className="pt-1">
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

      {/* CREATE NEW TEAM / POD MODAL */}
      {showCreateTeamModal && (
        <div
          onClick={(e) => e.target === e.currentTarget && setShowCreateTeamModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in"
        >
          <div className="w-full max-w-lg bg-card rounded-2xl border border-border shadow-2xl p-6 space-y-4 animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <Building2 className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                  Create New Operational Team / Pod
                </h3>
              </div>
              <button
                onClick={() => setShowCreateTeamModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTeamSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 block">
                  Team / Pod Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Healthcare Scraping Pod or Retail Production Team"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-slate-50 dark:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-zinc-200"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 block">
                    Pod Functional Type *
                  </label>
                  <select
                    value={newTeamType}
                    onChange={(e) => setNewTeamType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-slate-800 dark:text-zinc-200 outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="production">Production Team (Catalog & Delivery)</option>
                    <option value="scraping">Scraping Pod (Technical Extraction)</option>
                    <option value="operations">Operations Leadership & QA</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 block">
                    Assigned Pod Leader *
                  </label>
                  <select
                    value={newTeamLeader || (employees[0]?.name || '')}
                    onChange={(e) => setNewTeamLeader(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-slate-800 dark:text-zinc-200 outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.name}>
                        {emp.name} ({emp.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 block">
                  Managed Websites / Target Domains
                </label>
                <input
                  type="text"
                  placeholder="e.g. amazon.com, grainger.com, homedepot.com"
                  value={newTeamDomains}
                  onChange={(e) => setNewTeamDomains(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-slate-50 dark:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-zinc-200"
                />
                <p className="text-[10px] text-slate-400 mt-1">Comma-separated list of managed client target domains.</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 block">
                  Pod Description & Scope
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief description of the pod's operational objectives..."
                  value={newTeamDescription}
                  onChange={(e) => setNewTeamDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-slate-50 dark:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-zinc-200"
                />
              </div>

              {/* Initial Member Allocation */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Initial Member Allocation ({newTeamSelectedMembers.length} Selected)
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setNewTeamSelectedMembers(employees.map((e) => e.id))}
                      className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                    >
                      + All Personnel
                    </button>
                    <span className="text-slate-300 dark:text-zinc-600 text-xs">•</span>
                    <button
                      type="button"
                      onClick={() => setNewTeamSelectedMembers([])}
                      className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 font-semibold"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 max-h-40 overflow-y-auto border border-border rounded-xl p-2 bg-card">
                  {employees.map((emp) => {
                    const isChecked = newTeamSelectedMembers.includes(emp.id);
                    return (
                      <label
                        key={emp.id}
                        className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer text-xs transition-colors ${
                          isChecked
                            ? 'bg-indigo-50/40 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 font-medium'
                            : 'border-border/60 hover:bg-slate-50 dark:hover:bg-zinc-800/50 text-slate-700 dark:text-zinc-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setNewTeamSelectedMembers((prev) =>
                                prev.includes(emp.id) ? prev.filter((id) => id !== emp.id) : [...prev, emp.id]
                              );
                            }}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <img src={emp.avatar} alt={emp.name} className="w-5 h-5 rounded-full object-cover" />
                          <span>{emp.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">{emp.designation}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowCreateTeamModal(false)}
                  className="px-3 py-1.5 rounded-xl border border-border text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-sm"
                >
                  Create Pod
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN MEMBERS TO TEAM MODAL */}
      {assigningMembersTeam && (
        <div
          onClick={(e) => e.target === e.currentTarget && setAssigningMembersTeam(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in"
        >
          <div className="w-full max-w-lg bg-card rounded-2xl border border-border shadow-2xl p-6 space-y-4 animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                    Assign Members: {assigningMembersTeam.name}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Manage multi-pod allocation and workforce assignments.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAssigningMembersTeam(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter personnel by name or role..."
                  value={assignMemberSearch}
                  onChange={(e) => setAssignMemberSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-border bg-slate-50 dark:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-zinc-200"
                />
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedMemberIds(employees.map((e) => e.id))}
                  className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                >
                  Select All
                </button>
                <span className="text-slate-300 dark:text-zinc-600 text-xs">•</span>
                <button
                  type="button"
                  onClick={() => setSelectedMemberIds([])}
                  className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 font-semibold"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Checklist of all employees */}
            <div className="space-y-1.5 max-h-64 overflow-y-auto border border-border rounded-xl p-2 bg-card">
              {employees
                .filter(
                  (emp) =>
                    emp.name.toLowerCase().includes(assignMemberSearch.toLowerCase()) ||
                    emp.designation.toLowerCase().includes(assignMemberSearch.toLowerCase()) ||
                    emp.role.toLowerCase().includes(assignMemberSearch.toLowerCase())
                )
                .map((emp) => {
                  const isChecked = selectedMemberIds.includes(emp.id) || selectedMemberIds.includes(emp.name);
                  const empTeams = emp.assignedTeams && emp.assignedTeams.length > 0 ? emp.assignedTeams : [emp.team];

                  return (
                    <label
                      key={emp.id}
                      className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer text-xs transition-colors ${
                        isChecked
                          ? 'bg-indigo-50/40 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 font-medium'
                          : 'border-border/60 hover:bg-slate-50 dark:hover:bg-zinc-800/50 text-slate-700 dark:text-zinc-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            setSelectedMemberIds((prev) =>
                              prev.includes(emp.id) ? prev.filter((id) => id !== emp.id) : [...prev, emp.id]
                            );
                          }}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <img src={emp.avatar} alt={emp.name} className="w-8 h-8 rounded-full object-cover border border-border" />
                        <div>
                          <span className="font-bold block">{emp.name}</span>
                          <span className="text-[10px] text-slate-400 block">{emp.designation}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-mono text-slate-400 block">
                          {empTeams.length} Pods Assigned
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                          emp.workloadCapacity >= 85 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {emp.workloadCapacity}% Load
                        </span>
                      </div>
                    </label>
                  );
                })}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <span className="text-xs text-slate-500">
                <strong>{selectedMemberIds.length}</strong> members assigned to {assigningMembersTeam.name}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAssigningMembersTeam(null)}
                  className="px-3 py-1.5 rounded-xl border border-border text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAssignMembersSubmit}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-sm"
                >
                  Save Team Assignments
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIGURE USER TEAM & ROLE MODAL (MATCHING SCREENSHOT UI!) */}
      {editingEmployee && (
        <div
          onClick={(e) => e.target === e.currentTarget && setEditingEmployee(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/70 backdrop-blur-sm animate-fade-in"
        >
          <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl p-6 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                Configure User Team & Role
              </h3>
              <button
                onClick={() => setEditingEmployee(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Card (Matching User Screenshot!) */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-border">
              <img
                src={editingEmployee.avatar}
                alt={editingEmployee.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-zinc-100">{editingEmployee.name}</p>
                <p className="text-[11px] text-slate-400">{editingEmployee.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* PRIMARY ASSIGNED TEAM / POD (MATCHING SCREENSHOT DROPDOWN) */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 block">
                  Assigned Team / Pod
                </label>
                <select
                  value={targetTeam}
                  onChange={(e) => {
                    const sel = e.target.value;
                    setTargetTeam(sel);
                    if (!targetTeams.includes(sel)) {
                      setTargetTeams([sel, ...targetTeams]);
                    }
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-slate-800 dark:text-zinc-200 outline-none focus:ring-1 focus:ring-indigo-500 shadow-xs"
                >
                  {teams.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* OPERATIONAL ROLE */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 block">
                  Operational Role
                </label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-slate-800 dark:text-zinc-200 outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="Operations Manager">Operations Manager (Super Admin)</option>
                  <option value="Production Lead">Production Lead (Multi-Pod Manager)</option>
                  <option value="Production User">Production User (Task Owner & QC)</option>
                  <option value="Scraping Engineer">Scraping Engineer (Extraction Pod)</option>
                  <option value="Guest User">Guest User (Requestor Only)</option>
                </select>
              </div>

              {/* MULTI-POD SELECTION CHIPS & CHECKBOXES */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Concurrent Pod Allocations ({targetTeams.length} Selected)
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        setTargetTeams(
                          teams.filter((t) => t.teamType !== 'scraping').map((t) => t.name)
                        )
                      }
                      className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                    >
                      + All Production
                    </button>
                    <span className="text-slate-300 dark:text-zinc-600 text-xs">•</span>
                    <button
                      type="button"
                      onClick={() => setTargetTeams([targetTeam])}
                      className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 font-semibold"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                {/* Selected Pods Preview Chips */}
                {targetTeams.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-border mb-2.5">
                    {targetTeams.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                      >
                        <span>{t.replace(' Team', '').replace(' Engineering Pod', '')}</span>
                        {targetTeams.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setTargetTeams((prev) => prev.filter((item) => item !== t))}
                            className="hover:text-rose-500"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                )}

                {/* Checkbox Options List */}
                <div className="space-y-1.5 max-h-44 overflow-y-auto border border-border rounded-xl p-2 bg-card">
                  {teams.map((t) => {
                    const isChecked = targetTeams.includes(t.name);
                    return (
                      <label
                        key={t.id}
                        className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer text-xs transition-colors ${
                          isChecked
                            ? 'bg-indigo-50/40 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 font-medium'
                            : 'border-border/60 hover:bg-slate-50 dark:hover:bg-zinc-800/50 text-slate-700 dark:text-zinc-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() =>
                              setTargetTeams((prev) =>
                                prev.includes(t.name)
                                  ? (prev.length > 1 ? prev.filter((item) => item !== t.name) : prev)
                                  : [...prev, t.name]
                              )
                            }
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="font-semibold">{t.name}</span>
                        </div>
                        <span
                          className={`text-[9px] uppercase font-mono px-1.5 py-0.2 rounded font-bold ${
                            t.teamType === 'scraping'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          }`}
                        >
                          {t.teamType || 'Pod'}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setEditingEmployee(null)}
                className="px-3 py-1.5 rounded-xl border border-border text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveTeamAssignment}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
