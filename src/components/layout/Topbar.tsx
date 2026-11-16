import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Plus,
  Bell,
  Sun,
  Moon,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  FileText,
  UserCheck,
  ChevronDown,
  Layers,
} from 'lucide-react';
import { UserRole } from '../../types';

export const Topbar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    currentUserRole,
    setCurrentUserRole,
    currentWorkspace,
    darkMode,
    toggleDarkMode,
    setIsCreateTaskModalOpen,
    setIsCommandPaletteOpen,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);

  const unreadNotifications = notifications.filter((n) => !n.read);

  // Derive breadcrumb text
  const getViewTitle = (view: string) => {
    switch (view) {
      case 'overview':
        return 'Operations Overview';
      case 'my-tasks':
        return 'My Assigned Tasks';
      case 'all-tasks':
        return 'All Scraping Tasks';
      case 'projects':
        return 'Client Projects';
      case 'teams':
        return 'Scraping Teams & Capacity';
      case 'team-members':
        return 'Team Members';
      case 'guest-portal':
        return 'Guest Client Workspace';
      case 'manager-qc':
      case 'manager-approval':
        return 'Manager Approval Workspace';
      case 'production-qc':
      case 'production-deliverables':
        return 'Production Deliverables & Stats';
      case 'rework-queue':
        return 'Rework Queue';
      case 'analytics':
        return 'Scraping Analytics';
      case 'import-export':
        return 'Import Center';
      case 'export-center':
        return 'Export Center';
      case 'dataset-explorer':
        return 'Dataset Explorer';
      case 'gdrive':
        return 'Google Drive Files';
      case 'performance':
        return 'Performance Analytics';
      case 'team-reports':
        return 'Team Productivity Reports';
      case 'employee-reports':
        return 'Employee Reports';
      case 'activity-logs':
        return 'Operational Activity Logs';
      case 'notifications':
        return 'Notification Center';
      case 'email-history':
        return 'Email Delivery History';
      case 'settings':
        return 'System Settings';
      case 'user-management':
        return 'User & Role Management';
      default:
        return 'Dashboard';
    }
  };

  const rolesList: { id: UserRole; name: string; title: string; avatar: string }[] = [
    {
      id: 'manager',
      name: 'Samuel P',
      title: 'Operational Manager (Super Admin)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    },
    {
      id: 'production_lead',
      name: 'Priya Nair',
      title: 'Production Lead (Multi-Team)',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
    },
    {
      id: 'production_user',
      name: 'Divya Murugan',
      title: 'Production User (Task Owner & QC)',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    },
    {
      id: 'scraper',
      name: 'Karthik R',
      title: 'Scraping User (Extraction Pod)',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    },
    {
      id: 'guest',
      name: 'Mark Stevens',
      title: 'Guest User (Requestor Only)',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    },
  ];

  const currentProfile =
    rolesList.find((r) => r.id === currentUserRole) ||
    (currentUserRole === 'production' ? rolesList[1] : rolesList[0]);

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-6 bg-card/90 backdrop-blur-md border-b border-border select-none">
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-zinc-400">
          <span className="flex items-center gap-1 font-semibold text-slate-800 dark:text-zinc-200">
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            Vserve Scraping Ops
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 dark:text-zinc-100 font-semibold">
            {getViewTitle(currentView)}
          </span>
        </div>
      </div>

      {/* Center: Global Search & Command Palette trigger */}
      <div className="hidden md:flex items-center max-w-md w-full mx-6">
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg border border-border bg-slate-50 dark:bg-zinc-900/70 hover:border-slate-300 dark:hover:border-zinc-700 text-xs text-slate-500 dark:text-zinc-400 transition-all shadow-subtle group"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-zinc-300" />
            <span className="truncate">Search tasks, SKUs, teams, files...</span>
          </div>
          <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-[10px] font-mono text-slate-500 dark:text-zinc-400">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2.5">
        {/* Create Task Button */}
        {currentUserRole !== 'guest' && (
          <button
            onClick={() => setIsCreateTaskModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm shadow-indigo-500/25 transition-all hover:shadow"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Create Task</span>
          </button>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg border border-border text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 rounded-lg border border-border text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifications.length > 0 && (
              <span className="absolute top-1 right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 md:w-96 rounded-xl border border-border bg-card shadow-xl p-3 z-50 animate-fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                    Notifications
                  </span>
                  {unreadNotifications.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 text-[10px] font-bold">
                      {unreadNotifications.length} new
                    </span>
                  )}
                </div>
                {unreadNotifications.length > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-border py-1">
                {notifications.slice(0, 5).map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      markNotificationAsRead(n.id);
                      if (n.actionUrl) {
                        setCurrentView(n.actionUrl);
                        setIsNotifOpen(false);
                      }
                    }}
                    className={`p-2.5 text-xs hover:bg-slate-50 dark:hover:bg-zinc-800/60 rounded-lg cursor-pointer transition-colors ${
                      !n.read ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className="p-1 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 shrink-0 mt-0.5">
                        {n.category === 'qc_update' ? (
                          <AlertTriangle className="w-3 h-3 text-amber-500" />
                        ) : n.category === 'production_update' ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <FileText className="w-3 h-3 text-indigo-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900 dark:text-zinc-100 line-clamp-1">
                            {n.title}
                          </span>
                          <span className="text-[10px] text-slate-400 shrink-0 ml-1">
                            {n.timestamp}
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-zinc-400 mt-0.5 line-clamp-2 text-[11px]">
                          {n.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-border text-center">
                <button
                  onClick={() => {
                    setCurrentView('notifications');
                    setIsNotifOpen(false);
                  }}
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                >
                  View all in Notification Center
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-lg border border-border hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors"
          >
            <img
              src={currentProfile.avatar}
              alt={currentProfile.name}
              className="w-7 h-7 rounded-full object-cover ring-1 ring-border"
            />
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 leading-tight">
                {currentProfile.name}
              </span>
              <span className="text-[10px] text-slate-400 leading-tight">
                {currentProfile.title}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl border border-border bg-card shadow-xl p-3 z-50 animate-fade-in">
              <div className="pb-2.5 border-b border-border">
                <p className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                  Interactive Role Switcher
                </p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                  Test the portal as different stakeholders:
                </p>
              </div>

              <div className="py-2 space-y-1">
                {rolesList.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setCurrentUserRole(r.id);
                      setIsProfileOpen(false);
                      if (r.id === 'guest') {
                        setCurrentView('guest-portal');
                      } else {
                        setCurrentView('overview');
                      }
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors text-xs ${
                      currentUserRole === r.id
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-200 dark:border-indigo-900'
                        : 'hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={r.avatar}
                        alt={r.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-medium">{r.name}</div>
                        <div className="text-[10px] text-slate-400">{r.title}</div>
                      </div>
                    </div>
                    {currentUserRole === r.id && (
                      <UserCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    )}
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                <button
                  onClick={() => {
                    setCurrentView('settings');
                    setIsProfileOpen(false);
                  }}
                  className="text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100"
                >
                  Preferences
                </button>
                <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded">
                  Connected
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
