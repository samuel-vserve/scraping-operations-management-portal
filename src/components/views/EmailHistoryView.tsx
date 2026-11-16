import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Mail,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Clock,
  Send,
  ExternalLink,
  Sparkles,
  Download,
} from 'lucide-react';

export const EmailHistoryView: React.FC = () => {
  const { emailLogs, retryEmail, setCurrentView, setSelectedTaskIdForQC } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const filteredEmails = emailLogs.filter((eml) => {
    const matchSearch =
      eml.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      eml.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      eml.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      eml.taskRef.toLowerCase().includes(searchQuery.toLowerCase());

    const matchStatus = statusFilter === 'all' || eml.status === statusFilter;

    return matchSearch && matchStatus;
  });

  const handleRetry = (id: string) => {
    setRetryingId(id);
    setTimeout(() => {
      retryEmail(id);
      setRetryingId(null);
    }, 600);
  };

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Recipient,Recipient Name,Subject,Task Ref,Status,Sent At,Delivery Time']
        .concat(
          filteredEmails.map(
            (e) =>
              `"${e.recipient}","${e.recipientName}","${e.subject}","${e.taskRef}","${e.status}","${e.sentAt}","${e.deliveryTime}"`
          )
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Email_Dispatch_History.csv');
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
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                Automated Email Notification Dispatch Registry
              </h1>
              <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200">
                SMTP Gateway Active
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Audit log of transactional notifications sent to Scraping Engineers, Production Leads, and Client Stakeholders.
            </p>
          </div>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors self-start md:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          Export Mail Registry CSV
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card shadow-subtle flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Total Email Dispatches</span>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-zinc-100">1,842</span>
            <p className="text-xs text-emerald-600 mt-1 font-semibold">100% Delivery SLA</p>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-subtle flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Delivery Success Rate</span>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-zinc-100">99.4%</span>
            <p className="text-xs text-emerald-600 mt-1 font-semibold">Mean latency: 0.8s</p>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-subtle flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Queued & Retrying</span>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-amber-600">1</span>
            <p className="text-xs text-slate-400 mt-1">Automatic retry in 5m</p>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-subtle flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Bounced Messages</span>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-zinc-100">1</span>
            <p className="text-xs text-rose-500 mt-1 font-semibold">External recipient quota</p>
          </div>
        </div>
      </div>

      {/* Email Table */}
      <div className="rounded-2xl border border-border bg-card shadow-subtle overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by recipient, subject, or task ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-border bg-slate-50 dark:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-border bg-card text-slate-700 dark:text-zinc-300"
            >
              <option value="all">All Delivery Statuses</option>
              <option value="delivered">Delivered</option>
              <option value="sent">Sent</option>
              <option value="retrying">Retrying</option>
              <option value="bounced">Bounced</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-zinc-900/60 border-b border-border text-slate-500 dark:text-zinc-400 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Recipient</th>
                <th className="py-3 px-4">Subject Line</th>
                <th className="py-3 px-4">Task Ref</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Sent At</th>
                <th className="py-3 px-4">Latency</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredEmails.map((eml) => (
                <tr key={eml.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 dark:text-zinc-100">{eml.recipientName}</div>
                    <div className="text-[11px] font-mono text-slate-400">{eml.recipient}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-zinc-300 font-medium max-w-sm">
                    {eml.subject}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <button
                      onClick={() => {
                        if (eml.taskRef.startsWith('TSK-')) {
                          setSelectedTaskIdForQC(eml.taskRef);
                          setCurrentView('manager-qc');
                        }
                      }}
                      className="font-mono font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      {eml.taskRef}
                      {eml.taskRef.startsWith('TSK-') && <ExternalLink className="w-3 h-3" />}
                    </button>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {eml.status === 'delivered' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        Delivered
                      </span>
                    ) : eml.status === 'retrying' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 text-[10px] font-bold">
                        <Clock className="w-3 h-3" />
                        Retrying
                      </span>
                    ) : eml.status === 'bounced' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 text-[10px] font-bold">
                        <AlertTriangle className="w-3 h-3" />
                        Bounced
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 text-[10px] font-bold">
                        Sent
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600 dark:text-zinc-400 whitespace-nowrap">
                    {eml.sentAt}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                    {eml.deliveryTime}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => handleRetry(eml.id)}
                      disabled={retryingId === eml.id}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-border bg-card hover:bg-slate-100 dark:hover:bg-zinc-800 text-[11px] font-semibold text-slate-700 dark:text-zinc-300 transition-colors"
                    >
                      <RotateCcw className={`w-3 h-3 ${retryingId === eml.id ? 'animate-spin' : ''}`} />
                      {retryingId === eml.id ? 'Sending...' : 'Retry'}
                    </button>
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
