import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ListTodo,
  Search,
  Filter,
  Plus,
  Download,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  FileSpreadsheet,
  Users,
  ShieldCheck,
  Factory,
  X,
  MoreVertical,
  Check,
  UserPlus,
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { TaskProgress } from '../common/TaskProgress';
import { Task, TaskPriority, TaskStatus } from '../../types';

export const AllTasksView: React.FC = () => {
  const {
    tasks,
    currentUserRole,
    setIsCreateTaskModalOpen,
    setSelectedTaskIdForQC,
    setInspectedTaskId,
    setCurrentView,
    downloadScrapedFile,
    bulkAssignTasks,
    bulkUpdateStatus,
    employees,
    teams,
    reassignTaskScraper,
  } = useApp();

  // Search, Filters & Tabs
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'in_progress' | 'awaiting_qc' | 'rework' | 'production_ready' | 'completed'>('all');
  const [selectedProdTeam, setSelectedProdTeam] = useState<string>('all');
  const [selectedScraper, setSelectedScraper] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'deadline' | 'skuCount' | 'progress' | 'id'>('deadline');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Row selection & bulk actions
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [bulkScraperModal, setBulkScraperModal] = useState<boolean>(false);
  const [targetBulkScraper, setTargetBulkScraper] = useState<string>('Karthik R');

  // Drawer detail view
  const [inspectedTask, setInspectedTask] = useState<Task | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 8;

  // Filter logic
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Tab filter
      if (activeTab === 'pending' && task.status !== 'pending_assignment') return false;
      if (activeTab === 'in_progress' && task.status !== 'in_progress') return false;
      if (activeTab === 'awaiting_qc' && task.status !== 'awaiting_manager_qc') return false;
      if (activeTab === 'rework' && task.status !== 'rework_required') return false;
      if (activeTab === 'production_ready' && task.status !== 'production_pending') return false;
      if (activeTab === 'completed' && task.status !== 'completed') return false;

      // Production team filter
      if (selectedProdTeam !== 'all' && task.productionTeam !== selectedProdTeam) return false;

      // Scraper filter
      if (selectedScraper !== 'all' && task.primaryAssignee !== selectedScraper) return false;

      // Priority filter
      if (selectedPriority !== 'all' && task.priority !== selectedPriority) return false;

      // Role isolation: Production Users only view & manage their created/assigned tasks
      if (currentUserRole === 'production_user') {
        const isMine =
          task.productionUser === 'Divya Murugan' ||
          task.createdBy === 'Divya Murugan' ||
          task.id === 'TSK-1048' ||
          task.id === 'TSK-1049';
        if (!isMine) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = task.id.toLowerCase().includes(q);
        const matchTitle = task.title.toLowerCase().includes(q);
        const matchProject = task.projectName.toLowerCase().includes(q);
        const matchClient = task.client.toLowerCase().includes(q);
        const matchWebsite = task.website.toLowerCase().includes(q);
        const matchAssignee = task.primaryAssignee.toLowerCase().includes(q);
        if (!matchId && !matchTitle && !matchProject && !matchClient && !matchWebsite && !matchAssignee) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'deadline') comparison = a.deadline.localeCompare(b.deadline);
      if (sortBy === 'skuCount') comparison = a.skuCount - b.skuCount;
      if (sortBy === 'progress') comparison = a.progress - b.progress;
      if (sortBy === 'id') comparison = a.id.localeCompare(b.id);
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [tasks, activeTab, selectedProdTeam, selectedScraper, selectedPriority, searchQuery, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredTasks.length / pageSize) || 1;
  const paginatedTasks = filteredTasks.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSelectAll = () => {
    if (selectedTaskIds.length === paginatedTasks.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(paginatedTasks.map((t) => t.id));
    }
  };

  const toggleSelectTask = (taskId: string) => {
    if (selectedTaskIds.includes(taskId)) {
      setSelectedTaskIds(selectedTaskIds.filter((id) => id !== taskId));
    } else {
      setSelectedTaskIds([...selectedTaskIds, taskId]);
    }
  };

  const handleExportSelectedCSV = () => {
    const exportData = tasks.filter((t) => selectedTaskIds.length === 0 || selectedTaskIds.includes(t.id));
    const csvRows = [
      'Task_ID,Project,Website,Client,Production_Team,Primary_Scraper,SKU_Count,Progress,Priority,Status,Deadline',
      ...exportData.map(
        (t) =>
          `"${t.id}","${t.projectName}","${t.website}","${t.client}","${t.productionTeam || 'Production'}","${
            t.primaryAssignee || 'Unassigned'
          }",${t.skuCount},${t.progress}%,"${t.priority}","${t.status}","${t.deadline}"`
      ),
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Vserve_Tasks_Export_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExecuteBulkAssign = () => {
    if (selectedTaskIds.length === 0) return;
    bulkAssignTasks(selectedTaskIds, 'Core Scraping Engineering Pod', [targetBulkScraper]);
    setSelectedTaskIds([]);
    setBulkScraperModal(false);
  };

  const scrapingEngineers = employees.filter(
    (e) => e.team === 'Core Scraping Engineering Pod' || e.role.toLowerCase().includes('scraping')
  );

  const productionTeams = teams.filter((t) => t.teamType === 'production' || !t.name.includes('Scraping'));

  return (
    <div className="space-y-5 pb-12 animate-fade-in">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5 rounded-2xl border border-border bg-card shadow-subtle">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
            <ListTodo className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                All Scraping Tasks Registry
              </h1>
              <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-semibold border border-border">
                {tasks.length} Total Registered
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              High-density task grid across all Production Pods, assigned scraping developers, status gates, and deadlines.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleExportSelectedCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-border bg-card hover:bg-slate-50 dark:hover:bg-zinc-900 text-xs font-semibold text-slate-700 dark:text-zinc-300 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsCreateTaskModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Task Request</span>
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-border space-x-6 text-xs font-semibold text-slate-500 overflow-x-auto">
        {[
          { id: 'all', label: 'All Tasks', count: tasks.length },
          { id: 'pending', label: 'Pending Assignment', count: tasks.filter((t) => t.status === 'pending_assignment').length },
          { id: 'in_progress', label: 'In Extraction', count: tasks.filter((t) => t.status === 'in_progress').length },
          { id: 'awaiting_qc', label: 'Awaiting Manager QC', count: tasks.filter((t) => t.status === 'awaiting_manager_qc').length },
          { id: 'rework', label: 'Rework Required', count: tasks.filter((t) => t.status === 'rework_required').length },
          { id: 'production_ready', label: 'Production Ready', count: tasks.filter((t) => t.status === 'production_pending').length },
          { id: 'completed', label: 'Completed Archive', count: tasks.filter((t) => t.status === 'completed').length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as typeof activeTab);
              setCurrentPage(1);
            }}
            className={`flex items-center gap-1.5 pb-3 relative transition-colors shrink-0 ${
              activeTab === tab.id
                ? 'text-indigo-600 dark:text-indigo-400 font-bold border-b-2 border-indigo-600 dark:border-indigo-400'
                : 'hover:text-slate-900 dark:hover:text-zinc-200'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeTab === tab.id
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-500'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-xl border border-border bg-card shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="flex items-center gap-2 border border-border rounded-lg px-2.5 py-1.5 bg-slate-50 dark:bg-zinc-900 min-w-[240px] flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search task ID, title, domain, client, or assignee..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-transparent text-xs text-slate-800 dark:text-zinc-200 outline-none w-full"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Production Team Filter */}
          <select
            value={selectedProdTeam}
            onChange={(e) => {
              setSelectedProdTeam(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 rounded-lg border border-border bg-card text-slate-700 dark:text-zinc-300 outline-none font-medium"
          >
            <option value="all">All Production Pods</option>
            {productionTeams.map((pt) => (
              <option key={pt.id} value={pt.name}>
                {pt.name}
              </option>
            ))}
          </select>

          {/* Scraping Assignee Filter */}
          <select
            value={selectedScraper}
            onChange={(e) => {
              setSelectedScraper(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 rounded-lg border border-border bg-card text-slate-700 dark:text-zinc-300 outline-none font-medium"
          >
            <option value="all">All Scraping Assignees</option>
            {scrapingEngineers.map((se) => (
              <option key={se.id} value={se.name}>
                {se.name} (Core Pod)
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => {
              setSelectedPriority(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 rounded-lg border border-border bg-card text-slate-700 dark:text-zinc-300 outline-none font-medium"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-lg border border-border bg-card text-slate-700 dark:text-zinc-300 outline-none font-medium"
          >
            <option value="deadline">Sort by Deadline</option>
            <option value="skuCount">Sort by SKU Volume</option>
            <option value="progress">Sort by Progress</option>
            <option value="id">Sort by Task ID</option>
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-1.5 rounded-lg border border-border hover:bg-slate-50 dark:hover:bg-zinc-900 text-slate-600 dark:text-zinc-400"
            title="Toggle sort direction"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bulk Action Banner (shows when rows selected) */}
      {selectedTaskIds.length > 0 && (
        <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between text-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="font-bold text-indigo-900 dark:text-indigo-200">
              {selectedTaskIds.length} task{selectedTaskIds.length > 1 ? 's' : ''} selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setBulkScraperModal(true)}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1 shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Bulk Assign Scraper</span>
            </button>

            <button
              onClick={handleExportSelectedCSV}
              className="px-3 py-1.5 rounded-lg border border-indigo-300 bg-white dark:bg-zinc-900 text-indigo-700 dark:text-indigo-300 font-semibold flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Selected</span>
            </button>

            <button
              onClick={() => setSelectedTaskIds([])}
              className="px-2 py-1.5 rounded-lg text-slate-500 hover:text-slate-700 text-xs"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Master Data Grid Table */}
      <div className="border border-border rounded-2xl bg-card overflow-hidden shadow-subtle">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50/80 dark:bg-zinc-900/80 border-b border-border text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="p-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedTaskIds.length === paginatedTasks.length && paginatedTasks.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                <th className="p-3.5">Task & Project</th>
                <th className="p-3.5">Domain</th>
                <th className="p-3.5">Production Pod</th>
                <th className="p-3.5">Scraping Assignee</th>
                <th className="p-3.5 text-right">Target SKUs</th>
                <th className="p-3.5 w-36">Progress</th>
                <th className="p-3.5">Priority</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Deadline</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedTasks.length > 0 ? (
                paginatedTasks.map((task) => {
                  const isSelected = selectedTaskIds.includes(task.id);

                  return (
                    <tr
                      key={task.id}
                      className={`hover:bg-slate-50/60 dark:hover:bg-zinc-900/40 transition-colors cursor-pointer ${
                        isSelected ? 'bg-indigo-50/30 dark:bg-indigo-950/20' : ''
                      }`}
                      onClick={() => setInspectedTaskId(task.id)}
                    >
                      <td className="p-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectTask(task.id)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5 font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                          <span>{task.id}</span>
                        </div>
                        <span className="font-semibold text-slate-900 dark:text-zinc-100 block truncate max-w-[200px]">
                          {task.title}
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate max-w-[200px]">
                          {task.projectName} ({task.client})
                        </span>
                      </td>

                      <td className="p-3.5 font-mono text-slate-700 dark:text-zinc-300">
                        <a
                          href={`https://${task.website}`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="hover:text-indigo-600 hover:underline flex items-center gap-1"
                        >
                          <span>{task.website}</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                      </td>

                      <td className="p-3.5 text-slate-700 dark:text-zinc-300 font-medium">
                        <span className="truncate block max-w-[140px]">{task.productionTeam || 'Lawson Production'}</span>
                        <span className="text-[10px] text-slate-400 block">Req: {task.productionUser || 'Priya Nair'}</span>
                      </td>

                      <td className="p-3.5">
                        {task.primaryAssignee ? (
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="font-medium text-slate-900 dark:text-zinc-100">
                              {task.primaryAssignee}
                            </span>
                          </div>
                        ) : (
                          <span className="text-amber-600 italic font-mono text-[11px]">
                            Pending Triage
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {task.assignedTeam || 'Core Scraping Pod'}
                        </span>
                      </td>

                      <td className="p-3.5 text-right font-mono font-bold text-slate-800 dark:text-zinc-200">
                        {task.skuCount.toLocaleString()}
                      </td>

                      <td className="p-3.5">
                        <TaskProgress progress={task.progress} size="sm" />
                        <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                          {task.completedSkus.toLocaleString()} / {task.skuCount.toLocaleString()}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <PriorityBadge priority={task.priority} />
                      </td>

                      <td className="p-3.5">
                        <StatusBadge status={task.status} size="sm" />
                      </td>

                      <td className="p-3.5 font-mono text-slate-600 dark:text-zinc-400">
                        {task.deadline}
                      </td>

                      <td className="p-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          {task.status === 'awaiting_manager_qc' && (
                            <button
                              onClick={() => {
                                setSelectedTaskIdForQC(task.id);
                                setCurrentView('manager-qc');
                              }}
                              className="px-2 py-1 rounded bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-semibold text-[10px]"
                            >
                              QC Audit
                            </button>
                          )}
                          {task.outputFileName && (
                            <button
                              onClick={() => downloadScrapedFile(task.id)}
                              className="p-1 rounded text-slate-400 hover:text-emerald-600 hover:bg-slate-100"
                              title="Download Scraped Output File"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => setInspectedTaskId(task.id)}
                            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                            title="Inspect Details"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={11} className="p-12 text-center text-slate-400">
                    No tasks match the active filters or search terms.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-border flex items-center justify-between text-xs text-slate-500 bg-slate-50/50 dark:bg-zinc-900/50">
          <span>
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, filteredTasks.length)} of {filteredTasks.length} tasks
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 rounded border border-border bg-card disabled:opacity-40"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`w-7 h-7 rounded text-xs font-semibold ${
                  currentPage === p
                    ? 'bg-indigo-600 text-white'
                    : 'border border-border bg-card text-slate-700 dark:text-zinc-300'
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 rounded border border-border bg-card disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* SLIDE-OVER TASK INSPECTOR DRAWER */}
      {inspectedTask && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg h-full bg-card border-l border-border shadow-2xl p-6 overflow-y-auto space-y-5 animate-slide-left">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400">
                  {inspectedTask.id}
                </span>
                <StatusBadge status={inspectedTask.status} size="sm" />
                <PriorityBadge priority={inspectedTask.priority} />
              </div>
              <button
                onClick={() => setInspectedTask(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                {inspectedTask.title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                {inspectedTask.description}
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
              {inspectedTask.status === 'awaiting_manager_qc' && (
                <button
                  onClick={() => {
                    setSelectedTaskIdForQC(inspectedTask.id);
                    setCurrentView('manager-qc');
                  }}
                  className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Open Manager Approval Workspace</span>
                </button>
              )}

              {inspectedTask.outputFileName && (
                <button
                  onClick={() => downloadScrapedFile(inspectedTask.id)}
                  className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Deliverable (.xlsx)</span>
                </button>
              )}
            </div>

            {/* Metadata Table */}
            <div className="p-3.5 rounded-xl border border-border bg-slate-50/50 dark:bg-zinc-900/50 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Target Domain:</span>
                <span className="font-semibold text-slate-800 dark:text-zinc-200">{inspectedTask.website}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Client:</span>
                <span className="font-semibold text-slate-800 dark:text-zinc-200">{inspectedTask.client}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Production Pod:</span>
                <span className="font-semibold text-slate-800 dark:text-zinc-200">
                  {inspectedTask.productionTeam || 'Lawson Production'} ({inspectedTask.productionUser || 'Priya Nair'})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Scraping Assignee:</span>
                <span className="font-semibold text-emerald-600">
                  {inspectedTask.primaryAssignee || 'Pending Triage'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Target SKUs:</span>
                <span className="font-semibold text-slate-800 dark:text-zinc-200">
                  {inspectedTask.skuCount.toLocaleString()} SKUs
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Input Seed File:</span>
                <span className="font-semibold text-slate-800 dark:text-zinc-200 truncate max-w-[200px]">
                  {inspectedTask.inputFileName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Output Scraped File:</span>
                <span className="font-semibold text-indigo-600 truncate max-w-[200px]">
                  {inspectedTask.outputFileName || 'Not uploaded yet'}
                </span>
              </div>
            </div>

            {/* Enforced Columns */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Mandatory Schema Columns ({inspectedTask.requiredColumns.length}):
              </span>
              <div className="flex flex-wrap gap-1">
                {inspectedTask.requiredColumns.map((col) => (
                  <span
                    key={col}
                    className="px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 border border-border text-[10px] font-mono text-slate-700 dark:text-zinc-300"
                  >
                    {col}
                  </span>
                ))}
              </div>
            </div>

            {/* Audit & QC History */}
            {inspectedTask.qcHistory.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-border">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Audit & Approval Timeline ({inspectedTask.qcHistory.length}):
                </span>
                <div className="space-y-2">
                  {inspectedTask.qcHistory.map((hist) => (
                    <div
                      key={hist.id}
                      className="p-3 rounded-lg border border-border bg-card text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-900 dark:text-zinc-100">
                          {hist.performedBy} ({hist.role})
                        </span>
                        <span className="text-slate-400 font-mono text-[10px]">{hist.timestamp}</span>
                      </div>
                      <p className="text-slate-600 dark:text-zinc-300 text-[11px] leading-relaxed">
                        &ldquo;{hist.remarks}&rdquo;
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* BULK ASSIGN MODAL */}
      {bulkScraperModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card shadow-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
              Bulk Assign {selectedTaskIds.length} Tasks
            </h3>
            <p className="text-xs text-slate-500">
              Select the scraping engineer in Core Scraping Engineering Pod to assign these tasks to.
            </p>

            <select
              value={targetBulkScraper}
              onChange={(e) => setTargetBulkScraper(e.target.value)}
              className="w-full p-2 rounded-lg border border-border bg-card text-xs text-slate-900 dark:text-zinc-100 outline-none"
            >
              {scrapingEngineers.map((se) => (
                <option key={se.id} value={se.name}>
                  {se.name} ({se.workloadCapacity}% capacity)
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button
                onClick={() => setBulkScraperModal(false)}
                className="px-3 py-1.5 rounded-lg border border-border text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteBulkAssign}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
              >
                Assign Tasks
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
