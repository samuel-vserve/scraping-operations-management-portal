import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  Mail,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Cloud,
  FileSpreadsheet,
  RotateCcw,
  Search,
  Filter,
  Check,
  ExternalLink,
} from 'lucide-react';

interface NotificationsViewProps {
  initialTab?: 'notifications' | 'emails';
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({ initialTab = 'notifications' }) => {
  const {
    notifications,
    emailLogs,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    retryEmail,
    setCurrentView,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'notifications' | 'emails'>(initialTab);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchEmail, setSearchEmail] = useState<string>('');

  const categories = [
    { id: 'all', label: 'All Notifications' },
    { id: 'task_assignment', label: 'Task Assignments' },
    { id: 'qc_update', label: 'QC Updates' },
    { id: 'production_update', label: 'Production Updates' },
    { id: 'deadline', label: 'Deadlines' },
    { id: 'import_export', label: 'Import / Export' },
    { id: 'gdrive', label: 'Google Drive' },
    { id: 'system', label: 'System Alerts' },
  ];

  const filteredNotifications = notifications.filter((n) => {
    return selectedCategory === 'all' || n.category === selectedCategory;
  });

  const filteredEmails = emailLogs.filter((eml) => {
    return (
      eml.recipient.toLowerCase().includes(searchEmail.toLowerCase()) ||
      eml.recipientName.toLowerCase().includes(searchEmail.toLowerCase()) ||
      eml.subject.toLowerCase().includes(searchEmail.toLowerCase()) ||
      eml.taskRef.toLowerCase().includes(searchEmail.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5 rounded-2xl border border-border bg-card shadow-subtle">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-zinc-100">
              Notification Center & Communications Audit
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Real-time operational alerts, quality signals, and automated email delivery dispatch history.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'notifications'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'border border-border text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            System Notifications
          </button>
          <button
            onClick={() => setActiveTab('emails')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'emails'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'border border-border text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            Email Dispatch Logs ({emailLogs.length})
          </button>
        </div>
      </div>

      {/* NOTIFICATIONS TAB */}
      {activeTab === 'notifications' && (
        <div className="space-y-4">
          {/* Category Chips Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5 text-xs">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-all ${
                    selectedCategory === cat.id
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold'
                      : 'border-border text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <button
              onClick={markAllNotificationsAsRead}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Mark all as read
            </button>
          </div>

          {/* Notification List */}
          <div className="rounded-2xl border border-border bg-card shadow-subtle divide-y divide-border overflow-hidden">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    markNotificationAsRead(notif.id);
                    if (notif.actionUrl) setCurrentView(notif.actionUrl);
                  }}
                  className={`p-4 flex items-start justify-between gap-4 cursor-pointer hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors ${
                    !notif.read ? 'bg-indigo-50/30 dark:bg-indigo-950/20' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 mt-0.5 shrink-0">
                      {notif.category === 'qc_update' ? (
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                      ) : notif.category === 'production_update' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : notif.category === 'gdrive' ? (
                        <Cloud className="w-4 h-4 text-blue-500" />
                      ) : notif.category === 'deadline' ? (
                        <Clock className="w-4 h-4 text-rose-500" />
                      ) : (
                        <Bell className="w-4 h-4 text-indigo-500" />
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                          {notif.title}
                        </span>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-indigo-600" />
                        )}
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-zinc-800 text-slate-500">
                          {notif.category.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-zinc-400">
                        {notif.message}
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-slate-400 shrink-0">
                    {notif.timestamp}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                No notifications under this category.
              </div>
            )}
          </div>
        </div>
      )}

      {/* EMAIL DISPATCH HISTORY TAB */}
      {activeTab === 'emails' && (
        <div className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by recipient, subject, task reference..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-border bg-slate-50 dark:bg-zinc-900 text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 outline-none"
            />
          </div>

          <div className="rounded-2xl border border-border bg-card shadow-subtle overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-zinc-400">
                <thead className="bg-slate-50/75 dark:bg-zinc-900/60 border-b border-border text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Task Ref</th>
                    <th className="p-3">Recipient</th>
                    <th className="p-3">Subject</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Latency</th>
                    <th className="p-3">Sent Time</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-mono">
                  {filteredEmails.map((eml) => (
                    <tr key={eml.id} className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                      <td className="p-3 font-bold text-indigo-600 dark:text-indigo-400">
                        {eml.taskRef}
                      </td>

                      <td className="p-3 font-sans">
                        <div className="font-semibold text-slate-900 dark:text-zinc-100">
                          {eml.recipientName}
                        </div>
                        <div className="text-[11px] text-slate-400">{eml.recipient}</div>
                      </td>

                      <td className="p-3 font-sans text-slate-800 dark:text-zinc-200 max-w-[280px] truncate">
                        {eml.subject}
                      </td>

                      <td className="p-3 font-sans">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                            eml.status === 'delivered'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : eml.status === 'bounced'
                              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}
                        >
                          {eml.status}
                        </span>
                      </td>

                      <td className="p-3 text-slate-500">{eml.deliveryTime}</td>

                      <td className="p-3 text-slate-400 text-[11px]">{eml.sentAt}</td>

                      <td className="p-3 text-right font-sans">
                        {eml.status === 'bounced' ? (
                          <button
                            onClick={() => retryEmail(eml.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 text-xs font-semibold"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Retry</span>
                          </button>
                        ) : (
                          <span className="text-emerald-600 text-xs">Delivered</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
