import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FolderKanban,
  ListTodo,
  Clock,
  PlayCircle,
  ShieldAlert,
  RotateCcw,
  Factory,
  CheckCircle2,
  Download,
  Plus,
  UserPlus,
  Search,
  Filter,
  ArrowUpDown,
  MoreVertical,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Check,
} from 'lucide-react';
import { StatCard } from '../common/StatCard';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { TaskProgress } from '../common/TaskProgress';
import { Task, TaskStatus, TaskPriority, getEmployeeAssociatedTeams, isTaskAssociatedWithEmployee } from '../../types';
import confetti from 'canvas-confetti';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export const ManagerDashboardView: React.FC = () => {
  const {
    tasks,
    teams,
    projects,
    setCurrentView,
    setSelectedTaskIdForQC,
    setInspectedTaskId,
    setIsCreateTaskModalOpen,
    bulkUpdateStatus,
    bulkAssignTasks,
    currentUserRole,
    currentEmployee,
    downloadScrapedFile,
    approveProduction,
    reScrapingRequest,
  } = useApp();

  // Multi-team awareness: associated teams for current logged-in user
  const associatedTeams = useMemo(
    () => getEmployeeAssociatedTeams(currentEmployee),
    [currentEmployee]
  );

  // Base tasks scoped strictly to role & associated teams
  const scopedBaseTasks = useMemo(() => {
    return tasks.filter((t) => isTaskAssociatedWithEmployee(t, currentEmployee, currentUserRole));
  }, [tasks, currentEmployee, currentUserRole]);

  // Table State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [teamFilter, setTeamFilter] = useState<string>('all');
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [sortField, setSortField] = useState<keyof Task>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const toggleTeamFilter = (teamName: string) => {
    setSelectedTeams((prev) =>
      prev.includes(teamName) ? prev.filter((t) => t !== teamName) : [...prev, teamName]
    );
    setCurrentPage(1);
  };

  // KPI calculations from scoped data
  const totalProjects = projects.length;
  const activeTasks = scopedBaseTasks.filter((t) => t.status !== 'completed' && t.status !== 'rejected').length;
  const pendingAssignment = scopedBaseTasks.filter((t) => t.status === 'pending_assignment').length;
  const inProgress = scopedBaseTasks.filter((t) => t.status === 'in_progress').length;
  const awaitingQC = scopedBaseTasks.filter((t) => t.status === 'awaiting_manager_qc').length;
  const reworkRequired = scopedBaseTasks.filter((t) => t.status === 'rework_required').length;
  const productionPending = scopedBaseTasks.filter((t) => t.status === 'production_pending').length;
  const completedTasks = scopedBaseTasks.filter((t) => t.status === 'completed').length;

  // Recharts Data
  const weeklyCompletionData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day) => ({
      day,
      completed: 0,
      target: scopedBaseTasks.length > 0 ? Math.ceil(scopedBaseTasks.length / 5) : 0,
    }));
  }, [scopedBaseTasks]);

  const teamProductivityData = useMemo(() => {
    const candidateTeams = teams.filter((t) => {
      if (t.teamType === 'scraping') return false;
      if (currentUserRole === 'production_lead' && associatedTeams.length > 0) {
        return associatedTeams.some(
          (at) =>
            at.toLowerCase().includes(t.name.toLowerCase()) ||
            t.name.toLowerCase().includes(at.toLowerCase())
        );
      }
      return true;
    });

    return candidateTeams.map((t) => {
      const teamTasks = scopedBaseTasks.filter(
        (task) => task.productionTeam === t.name || task.assignedTeam === t.name
      );
      const teamCompleted = teamTasks.filter((task) => task.status === 'completed').length;
      const rate = teamTasks.length > 0 ? Math.round((teamCompleted / teamTasks.length) * 100 * 10) / 10 : 100;
      return {
        team: t.name.replace(' Production Team', '').replace(' Automation Team', '').replace(' Enterprise Team', '').replace(' Team', ''),
        productivity: rate,
        tasks: teamTasks.length,
      };
    });
  }, [teams, scopedBaseTasks, currentUserRole, associatedTeams]);

  const statusDistributionData = useMemo(() => [
    { name: 'In Progress', value: inProgress, color: '#3b82f6' },
    { name: 'Awaiting QC', value: awaitingQC, color: '#6366f1' },
    { name: 'Rework', value: reworkRequired, color: '#f59e0b' },
    { name: 'Production', value: productionPending, color: '#a855f7' },
    { name: 'Completed', value: completedTasks, color: '#10b981' },
  ], [inProgress, awaitingQC, reworkRequired, productionPending, completedTasks]);

  const totalDistribution = useMemo(
    () => statusDistributionData.reduce((acc, curr) => acc + curr.value, 0),
    [statusDistributionData]
  );

  const qcApprovalRateData = useMemo(() => [
    { month: 'Jun', rate: 100 },
    { month: 'Jul', rate: 100 },
    { month: 'Aug', rate: 100 },
    { month: 'Sep', rate: 100 },
    { month: 'Oct', rate: 100 },
    { month: 'Nov', rate: 100 },
  ], []);

  const totalCompletedSkus = useMemo(
    () => scopedBaseTasks.reduce((sum, t) => sum + (t.completedSkus || 0), 0),
    [scopedBaseTasks]
  );

  const dailySkuProcessingData = useMemo(() => {
    const timeSlots = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'];
    return timeSlots.map((time, idx) => ({
      time,
      processed: totalCompletedSkus > 0 ? Math.round((totalCompletedSkus / timeSlots.length) * (idx + 1)) : 0,
      errors: 0,
    }));
  }, [totalCompletedSkus]);

  // Filtering & Sorting
  const filteredTasks = useMemo(() => {
    return scopedBaseTasks.filter((t) => {
      const matchSearch =
        t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.website.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.assignedEmployees.some((e) => e.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchStatus = statusFilter === 'all' || t.status === statusFilter;
      const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter;
      const matchTeam =
        (teamFilter === 'all' || t.assignedTeam === teamFilter || t.productionTeam === teamFilter) &&
        (selectedTeams.length === 0 ||
          selectedTeams.includes(t.assignedTeam) ||
          selectedTeams.includes(t.productionTeam || ''));

      return matchSearch && matchStatus && matchPriority && matchTeam;
    }).sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });
  }, [scopedBaseTasks, searchQuery, statusFilter, priorityFilter, teamFilter, selectedTeams, sortField, sortOrder]);

  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage) || 1;
  const paginatedTasks = filteredTasks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleSelectAll = () => {
    if (selectedTaskIds.length === paginatedTasks.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(paginatedTasks.map((t) => t.id));
    }
  };

  const toggleSelectTask = (id: string) => {
    setSelectedTaskIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleExportSelected = () => {
    const exportedData = tasks.filter((t) => selectedTaskIds.includes(t.id));
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(exportedData, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `Vserve_Tasks_Export_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* 1. Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 rounded-2xl bg-card border border-border shadow-subtle">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
              {currentUserRole === 'production_user'
                ? 'Good Morning, Divya Murugan'
                : currentUserRole === 'scraper'
                ? 'Good Morning, Karthik R'
                : currentUserRole === 'production_lead'
                ? 'Good Morning, Priya Nair'
                : 'Good Morning, Samuel P'}
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold border border-emerald-200 dark:border-emerald-800">
              {currentUserRole === 'production_user'
                ? 'Production Pod Operations'
                : currentUserRole === 'scraper'
                ? 'Extraction Pod Active'
                : currentUserRole === 'production_lead'
                ? `${associatedTeams[0] || 'Production Pod'} Lead`
                : 'Operations Super Admin'}
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 dark:text-zinc-400">
            {currentUserRole === 'production_user'
              ? 'Real-time overview of your production batches, extraction deliverables, and QC metrics.'
              : currentUserRole === 'scraper'
              ? 'Real-time engineering overview of web extraction pipelines, crawler speed, and assigned tasks.'
              : currentUserRole === 'production_lead'
              ? `Operational overview coordinating tasks and deliverables for ${associatedTeams[0] || 'your production team'}.`
              : "Here's what's happening across all scraping & production operations today."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-slate-50 dark:bg-zinc-900 text-xs font-mono text-slate-600 dark:text-zinc-400">
            <span>Monday, Nov 16, 2026</span>
          </div>

          <button
            onClick={() => setIsCreateTaskModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create Task</span>
          </button>

          <button
            onClick={() => setIsCreateTaskModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-card hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-medium transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Assign Task</span>
          </button>

          <button
            onClick={handleExportSelected}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-card hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* 2. Eight KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <StatCard
          label="Total Projects"
          value={totalProjects}
          trend={totalProjects > 0 ? { value: `${totalProjects} Portfolios`, isPositive: true } : { value: '0 Projects', isPositive: true }}
          icon={FolderKanban}
          iconColor="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-100 dark:border-indigo-900"
          sparklineData={totalProjects > 0 ? [Math.max(1, totalProjects - 2), totalProjects] : [0, 0, 0, 0, 0]}
          onClick={() => setCurrentView('projects')}
        />
        <StatCard
          label="Active Tasks"
          value={activeTasks}
          trend={activeTasks > 0 ? { value: `${activeTasks} Live`, isPositive: true } : { value: '0 Active', isPositive: true }}
          icon={ListTodo}
          iconColor="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border-blue-100 dark:border-blue-900"
          sparklineData={activeTasks > 0 ? [Math.max(0, activeTasks - 2), activeTasks] : [0, 0, 0, 0, 0]}
          onClick={() => setCurrentView('all-tasks')}
        />
        <StatCard
          label="Pending Assignment"
          value={pendingAssignment}
          trend={pendingAssignment > 0 ? { value: `${pendingAssignment} Queued`, isPositive: false } : { value: '0 Queued', isPositive: true }}
          icon={Clock}
          iconColor="text-slate-600 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700"
          sparklineData={pendingAssignment > 0 ? [pendingAssignment, pendingAssignment] : [0, 0, 0, 0, 0]}
          onClick={() => {
            setStatusFilter('pending_assignment');
          }}
        />
        <StatCard
          label="In Progress"
          value={inProgress}
          trend={inProgress > 0 ? { value: `${inProgress} Scraping`, isPositive: true } : { value: '0 Scraping', isPositive: true }}
          icon={PlayCircle}
          iconColor="text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 border-cyan-100 dark:border-cyan-900"
          sparklineData={inProgress > 0 ? [inProgress, inProgress] : [0, 0, 0, 0, 0]}
          onClick={() => {
            setStatusFilter('in_progress');
          }}
        />
        <StatCard
          label="Awaiting Manager QC"
          value={awaitingQC}
          trend={awaitingQC > 0 ? { value: `${awaitingQC} Review`, isPositive: false } : { value: '0 Review', isPositive: true }}
          icon={ShieldAlert}
          iconColor="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-100 dark:border-indigo-900"
          sparklineData={awaitingQC > 0 ? [awaitingQC, awaitingQC] : [0, 0, 0, 0, 0]}
          active={awaitingQC > 0}
          onClick={() => setCurrentView('manager-qc')}
        />
        <StatCard
          label="Rework Required"
          value={reworkRequired}
          trend={reworkRequired > 0 ? { value: `${reworkRequired} Action`, isPositive: false } : { value: '0 Rework', isPositive: true }}
          icon={RotateCcw}
          iconColor="text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-100 dark:border-amber-900"
          sparklineData={reworkRequired > 0 ? [reworkRequired, reworkRequired] : [0, 0, 0, 0, 0]}
          onClick={() => setCurrentView('rework-queue')}
        />
        <StatCard
          label="Production Pending"
          value={productionPending}
          trend={productionPending > 0 ? { value: `${productionPending} Staged`, isPositive: true } : { value: '0 Staged', isPositive: true }}
          icon={Factory}
          iconColor="text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 border-purple-100 dark:border-purple-900"
          sparklineData={productionPending > 0 ? [productionPending, productionPending] : [0, 0, 0, 0, 0]}
          onClick={() => setCurrentView('production-qc')}
        />
        <StatCard
          label="Completed Tasks"
          value={completedTasks}
          trend={completedTasks > 0 ? { value: `${completedTasks} Finished`, isPositive: true } : { value: '0 Completed', isPositive: true }}
          icon={CheckCircle2}
          iconColor="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-100 dark:border-emerald-900"
          sparklineData={completedTasks > 0 ? [Math.max(0, completedTasks - 2), completedTasks] : [0, 0, 0, 0, 0]}
          onClick={() => {
            setStatusFilter('completed');
          }}
        />
      </div>

      {/* 3. Five Interactive Recharts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Weekly Task Completion (Area Chart) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-card border border-border shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                Weekly Task Completion Velocity
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Actual completed scraping tasks vs sprint quota target
              </p>
            </div>
            <span className="text-xs font-mono font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
              {completedTasks > 0 ? `${completedTasks} Completed` : 'Sprint Ready'}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyCompletionData}>
                <defs>
                  <linearGradient id="completionGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="targetGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderRadius: '8px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  name="Completed Tasks"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#completionGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="target"
                  name="Target Quota"
                  stroke="#94a3b8"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  fillOpacity={1}
                  fill="url(#targetGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution (Donut Chart) */}
        <div className="p-5 rounded-2xl bg-card border border-border shadow-subtle flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
              Scraping Status Distribution
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              Proportion of active pipeline states
            </p>
          </div>

          <div className="h-56 w-full flex items-center justify-center my-2">
            {totalDistribution > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      borderRadius: '8px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-4">
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-300 dark:border-zinc-700 flex items-center justify-center mb-2">
                  <ListTodo className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-xs font-semibold text-slate-600 dark:text-zinc-300">Pipeline Idle</p>
                <p className="text-[10px] text-slate-400 mt-0.5">No tasks currently queued in pipeline</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            {statusDistributionData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-500 dark:text-zinc-400 truncate">{item.name}</span>
                <span className="font-mono font-bold text-slate-700 dark:text-zinc-300 ml-auto">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2: Team Productivity, QC Approval, Daily SKU processing */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Team Productivity (Horizontal Bar Chart) */}
        <div className="p-5 rounded-2xl bg-card border border-border shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                Team Productivity Index
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Weekly output rate across scraping pods
              </p>
            </div>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={teamProductivityData} margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis type="number" domain={[70, 100]} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis dataKey="team" type="category" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'Productivity']}
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderRadius: '8px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="productivity" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* QC Approval Rate (Line Chart) */}
        <div className="p-5 rounded-2xl bg-card border border-border shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                QC Approval Rate Trend
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                First-pass verification acceptance percentage
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-600">98.4%</span>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={qcApprovalRateData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis domain={[85, 100]} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'Approval Rate']}
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderRadius: '8px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#10b981' }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily SKU Processing Volume (Area Chart) */}
        <div className="p-5 rounded-2xl bg-card border border-border shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                Daily SKU Extraction Volume
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Accumulated SKUs scraped across live scraper nodes
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-indigo-600">56.8k Today</span>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailySkuProcessingData}>
                <defs>
                  <linearGradient id="skuGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(val: any) => [Number(val).toLocaleString(), 'SKUs']}
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderRadius: '8px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="processed"
                  name="Processed SKUs"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#skuGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. Task Management Overview Table */}
      <div className="rounded-2xl border border-border bg-card shadow-subtle overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-border flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            {/* Search Input */}
            <div className="relative min-w-[240px] flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by ID, title, website, assignee..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-border bg-slate-50 dark:bg-zinc-900 text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-border bg-card text-xs text-slate-700 dark:text-zinc-300 outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="pending_assignment">Pending Assignment</option>
              <option value="in_progress">In Progress</option>
              <option value="awaiting_manager_qc">Awaiting QC</option>
              <option value="rework_required">Rework Required</option>
              <option value="production_pending">Production Pending</option>
              <option value="completed">Completed</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-border bg-card text-xs text-slate-700 dark:text-zinc-300 outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* Team Filter */}
            <select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-border bg-card text-xs text-slate-700 dark:text-zinc-300 outline-none"
            >
              <option value="all">All Teams</option>
              {teams.map((t) => (
                <option key={t.id} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Bulk Actions when selected */}
          {selectedTaskIds.length > 0 && (
            <div className="flex items-center gap-2 p-1 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg border border-indigo-200 dark:border-indigo-900 text-xs">
              <span className="font-semibold px-2 text-indigo-700 dark:text-indigo-300">
                {selectedTaskIds.length} Selected
              </span>
              <button
                onClick={() => bulkUpdateStatus(selectedTaskIds, 'in_progress')}
                className="px-2 py-1 rounded bg-white dark:bg-zinc-800 border border-border hover:bg-slate-50 text-slate-700 dark:text-zinc-300 font-medium"
              >
                Start In Progress
              </button>
              <button
                onClick={() => bulkUpdateStatus(selectedTaskIds, 'completed')}
                className="px-2 py-1 rounded bg-white dark:bg-zinc-800 border border-border hover:bg-slate-50 text-emerald-600 font-medium"
              >
                Mark Complete
              </button>
              <button
                onClick={handleExportSelected}
                className="px-2 py-1 rounded bg-indigo-600 text-white font-medium hover:bg-indigo-700"
              >
                Export Selected
              </button>
            </div>
          )}
        </div>

        {/* Multi-Team Quick Filter Strip */}
        <div className="px-4 py-2.5 bg-slate-50/70 dark:bg-zinc-900/60 border-b border-border flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
              {currentUserRole === 'production_user' || currentUserRole === 'production_lead'
                ? 'Your Associated Pod:'
                : currentUserRole === 'scraper'
                ? 'Active Pod:'
                : 'Multi-Team Selection:'}
            </span>
            <button
              onClick={() => {
                setSelectedTeams([]);
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                selectedTeams.length === 0
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-card border border-border text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              {currentUserRole === 'production_user' || currentUserRole === 'production_lead' ? 'All Team Tasks' : 'All Pods'} ({scopedBaseTasks.length})
            </button>
            {((currentUserRole === 'production_user' || currentUserRole === 'production_lead') && associatedTeams.length > 0
              ? associatedTeams.map((tName) => ({ id: tName, name: tName }))
              : currentUserRole === 'scraper'
              ? [{ id: 'core', name: currentEmployee.team || 'Core Scraping Engineering Pod' }]
              : teams
            ).map((t) => {
              const isSelected = selectedTeams.includes(t.name);
              const teamTaskCount = scopedBaseTasks.filter(
                (task) => task.assignedTeam === t.name || task.productionTeam === t.name
              ).length;

              return (
                <button
                  key={t.id}
                  onClick={() => toggleTeamFilter(t.name)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
                    isSelected
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-950 dark:border-indigo-800 dark:text-indigo-300 shadow-xs'
                      : 'bg-card border-border text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected ? 'bg-indigo-600' : 'bg-slate-400'
                    }`}
                  />
                  <span>{t.name.replace(' Team', '').replace(' Engineering Pod', '')}</span>
                  <span className="font-mono text-[10px] opacity-70">({teamTaskCount})</span>
                  {isSelected && <Check className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />}
                </button>
              );
            })}
          </div>

          {selectedTeams.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500 font-medium">
                {selectedTeams.length} pod{selectedTeams.length > 1 ? 's' : ''} active
              </span>
              <button
                onClick={() => {
                  setSelectedTeams([]);
                  setCurrentPage(1);
                }}
                className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
              >
                Reset Multi-Team
              </button>
            </div>
          )}
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-zinc-400">
            <thead className="bg-slate-50/75 dark:bg-zinc-900/60 border-b border-border text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
              <tr>
                <th className="p-3 w-10">
                  <input
                    type="checkbox"
                    checked={
                      paginatedTasks.length > 0 &&
                      selectedTaskIds.length === paginatedTasks.length
                    }
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                <th
                  onClick={() => {
                    setSortField('id');
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                  className="p-3 cursor-pointer hover:text-slate-900 dark:hover:text-zinc-100"
                >
                  <div className="flex items-center gap-1">
                    <span>Task ID</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="p-3">Project & Website</th>
                <th className="p-3">Assigned Team</th>
                <th className="p-3">Assigned Employees</th>
                <th
                  onClick={() => {
                    setSortField('skuCount');
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                  className="p-3 cursor-pointer hover:text-slate-900 dark:hover:text-zinc-100"
                >
                  <div className="flex items-center gap-1">
                    <span>SKUs</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="p-3 w-32">Progress</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Status</th>
                <th
                  onClick={() => {
                    setSortField('deadline');
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                  className="p-3 cursor-pointer hover:text-slate-900 dark:hover:text-zinc-100"
                >
                  <div className="flex items-center gap-1">
                    <span>Deadline</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedTasks.length > 0 ? (
                paginatedTasks.map((task) => {
                  const isSelected = selectedTaskIds.includes(task.id);

                  return (
                    <tr
                      key={task.id}
                      onClick={() => setInspectedTaskId(task.id)}
                      className={`hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer ${
                        isSelected ? 'bg-indigo-50/20 dark:bg-indigo-950/20' : ''
                      }`}
                    >
                      <td className="p-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectTask(task.id)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>

                      <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {task.id}
                      </td>

                      <td className="p-3">
                        <div className="font-semibold text-slate-900 dark:text-zinc-100 truncate max-w-[200px]">
                          {task.title}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 truncate">
                          <span>{task.projectName}</span>
                          <span>•</span>
                          <span className="font-mono">{task.website}</span>
                        </div>
                      </td>

                      <td className="p-3 font-medium text-slate-700 dark:text-zinc-300">
                        {task.assignedTeam || <span className="text-slate-400 italic">Unassigned</span>}
                      </td>

                      <td className="p-3">
                        <div className="flex items-center gap-1 flex-wrap max-w-[180px]">
                          {task.assignedEmployees.length > 0 ? (
                            task.assignedEmployees.map((emp) => (
                              <span
                                key={emp}
                                className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                  emp === task.primaryAssignee
                                    ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900'
                                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                                }`}
                              >
                                {emp}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-[11px] italic">None</span>
                          )}
                        </div>
                      </td>

                      <td className="p-3 font-mono font-medium text-slate-900 dark:text-zinc-100">
                        {task.skuCount.toLocaleString()}
                      </td>

                      <td className="p-3">
                        <TaskProgress progress={task.progress} size="sm" />
                      </td>

                      <td className="p-3">
                        <PriorityBadge priority={task.priority} />
                      </td>

                      <td className="p-3">
                        <StatusBadge status={task.status} size="sm" />
                      </td>

                      <td className="p-3 font-mono text-[11px]">
                        {task.deadline}
                      </td>

                      <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {currentUserRole === 'production_user' && (
                            <>
                              {task.status === 'production_pending' && (
                                <button
                                  onClick={() => {
                                    approveProduction(task.id, 'Production deliverable validated.');
                                    try {
                                      confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
                                    } catch {}
                                  }}
                                  className="px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold border border-emerald-200 dark:border-emerald-800"
                                  title="Validate and Accept Deliverable"
                                >
                                  Accept
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  reScrapingRequest(task.id, 'Production requested re-scraping via Dashboard review.');
                                }}
                                className="px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[10px] font-semibold border border-amber-200 dark:border-amber-800"
                                title="Request Re-scraping"
                              >
                                Rework
                              </button>
                            </>
                          )}

                          {currentUserRole === 'scraper' && (
                            <button
                              onClick={() => {
                                setInspectedTaskId(task.id);
                              }}
                              className="px-2 py-1 rounded bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-semibold border border-indigo-200 dark:border-indigo-800"
                              title="Manage Extraction Task"
                            >
                              Manage
                            </button>
                          )}

                          {currentUserRole === 'manager' && (
                            <button
                              onClick={() => {
                                setSelectedTaskIdForQC(task.id);
                                setCurrentView('manager-qc');
                              }}
                              className="px-2 py-1 rounded bg-slate-100 dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600 dark:hover:text-indigo-400 text-[11px] font-medium transition-colors"
                              title="Inspect in Manager QC Workspace"
                            >
                              QC Review
                            </button>
                          )}

                          {task.outputFileName && (
                            <button
                              onClick={() => downloadScrapedFile(task.id)}
                              className="p-1 rounded text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-zinc-800"
                              title="Download Scraped Dataset"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => setInspectedTaskId(task.id)}
                            className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800"
                            title="Inspect Details"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={11} className="p-8 text-center text-xs text-slate-400">
                    No scraping tasks match your active filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Counter */}
        <div className="p-4 border-t border-border flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
          <div>
            Showing <span className="font-semibold text-slate-800 dark:text-zinc-200">{paginatedTasks.length}</span> of{' '}
            <span className="font-semibold text-slate-800 dark:text-zinc-200">{filteredTasks.length}</span> tasks
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded border border-border disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-zinc-800"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-xs">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded border border-border disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-zinc-800"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
