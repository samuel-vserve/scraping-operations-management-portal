import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Activity,
  Search,
  Filter,
  Download,
  ShieldCheck,
  RotateCcw,
  UploadCloud,
  CheckCircle2,
  Users,
  Clock,
  Sparkles,
  ExternalLink,
  Terminal,
  Factory,
} from 'lucide-react';

export const ActivityLogsView: React.FC = () => {
  const { tasks, setCurrentView, setSelectedTaskIdForQC, activityLogs } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredLogs = (activityLogs || []).filter((log) => {
    const matchSearch =
      log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.taskRef && log.taskRef.toLowerCase().includes(searchQuery.toLowerCase())) ||
      log.actorRole.toLowerCase().includes(searchQuery.toLowerCase());

    const matchCategory =
      selectedCategory === 'all' || log.category === selectedCategory;

    return matchSearch && matchCategory;
  });

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'qc_approval':
        return (
          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 text-[10px] font-bold">
            QC Approved
          </span>
        );
      case 'rework_request':
        return (
          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 text-[10px] font-bold">
            Rework Requested
          </span>
        );
      case 'file_upload':
        return (
          <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 text-[10px] font-bold">
            Scraped Upload
          </span>
        );
      case 'task_assignment':
        return (
          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 text-[10px] font-bold">
            Task Assigned
          </span>
        );
      case 'reassignment':
        return (
          <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 text-[10px] font-bold">
            Reassigned
          </span>
        );
      case 'production_delivery':
        return (
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 text-[10px] font-bold">
            Delivered
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 text-[10px] font-bold">
            System
          </span>
        );
    }
  };

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Timestamp,Category,Actor,Actor Role,Action,Task Ref,IP']
        .concat(
          filteredLogs.map(
            (l) =>
              `"${l.timestamp}","${l.category}","${l.actor}","${l.actorRole}","${l.action.replace(/"/g, '""')}","${l.taskRef}","${l.ip}"`
          )
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Scraping_Operations_Audit_Trail.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5 rounded-2xl border border-border bg-card shadow-subtle">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                System Activity & Audit Trail
              </h1>
              <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200">
                Real-time Ledger
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Chronological, immutable audit log of task creations, scraping uploads, manager approvals, and client deliverables.
            </p>
          </div>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors self-start md:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          Export Audit Trail CSV
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card shadow-subtle flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Total System Events</span>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-zinc-100">1,482</span>
            <p className="text-xs text-emerald-600 mt-1 font-semibold">Active Ledger</p>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-subtle flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Manager Approvals Today</span>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-zinc-100">18</span>
            <p className="text-xs text-indigo-600 mt-1 font-semibold">100% On Time</p>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-subtle flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Scraping Ingestions Today</span>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-zinc-100">34</span>
            <p className="text-xs text-emerald-600 mt-1 font-semibold">412k SKUs Captured</p>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-subtle flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Security & Integrity Alert</span>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-emerald-600">0 Flags</span>
            <p className="text-xs text-slate-400 mt-1">All Nodes Verified</p>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-2xl border border-border bg-card shadow-subtle overflow-hidden">
        {/* Table Search & Filter Bar */}
        <div className="p-4 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search audit trail by actor, task, or action..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-border bg-slate-50 dark:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-border bg-card text-slate-700 dark:text-zinc-300"
            >
              <option value="all">All Event Categories</option>
              <option value="qc_approval">QC Approvals</option>
              <option value="rework_request">Rework Requests</option>
              <option value="file_upload">Scraped Uploads</option>
              <option value="task_assignment">Task Assignments</option>
              <option value="reassignment">Reassignments</option>
              <option value="production_delivery">Production Deliveries</option>
              <option value="ingestion">System Ingestion</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-zinc-900/60 border-b border-border text-slate-500 dark:text-zinc-400 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Event Type</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action Summary</th>
                <th className="py-3 px-4">Task Ref</th>
                <th className="py-3 px-4 text-right">Origin IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="font-mono text-slate-900 dark:text-zinc-100">{log.relativeTime}</div>
                    <div className="text-[10px] text-slate-400">{log.timestamp}</div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {getCategoryBadge(log.category)}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <img
                        src={log.avatar}
                        alt={log.actor}
                        className="w-6 h-6 rounded-full object-cover border border-border"
                      />
                      <div>
                        <div className="font-bold text-slate-900 dark:text-zinc-100">{log.actor}</div>
                        <div className="text-[10px] text-slate-400">{log.actorRole}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-zinc-300 max-w-md">
                    {log.action}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {log.taskRef ? (
                      <button
                        onClick={() => {
                          if (log.taskRef && log.taskRef.startsWith('TSK-')) {
                            setSelectedTaskIdForQC(log.taskRef);
                            setCurrentView('manager-qc');
                          }
                        }}
                        className="font-mono font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        {log.taskRef}
                        {log.taskRef.startsWith('TSK-') && <ExternalLink className="w-3 h-3" />}
                      </button>
                    ) : (
                      <span className="font-mono text-slate-400">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-[11px] text-slate-400 whitespace-nowrap">
                    {log.ip}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
