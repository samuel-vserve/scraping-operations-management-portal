import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  CheckSquare,
  ListTodo,
  FolderKanban,
  Users,
  UserCheck,
  UserPlus,
  ShieldCheck,
  Factory,
  RefreshCw,
  BarChart3,
  UploadCloud,
  DownloadCloud,
  Database,
  Cloud,
  LineChart,
  FileSpreadsheet,
  FileText,
  Activity,
  Bell,
  Mail,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Sparkles,
  GitBranch,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    currentUserRole,
    notifications,
    tasks,
  } = useApp();

  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  // Counts for badges
  const awaitingQCCount = tasks.filter((t) => t.status === 'awaiting_manager_qc').length;
  const reworkCount = tasks.filter((t) => t.status === 'rework_required').length;
  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  interface NavItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | string;
    badgeColor?: string;
    roles?: string[];
  }

  interface NavSection {
    title: string;
    items: NavItem[];
  }

  const sections: NavSection[] = [
    {
      title: 'OPERATIONS',
      items: [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard, roles: ['manager', 'production_lead', 'production'] },
        { id: 'my-tasks', label: 'My Tasks', icon: CheckSquare, badge: 3, roles: ['scraper'] },
        {
          id: 'all-tasks',
          label: currentUserRole === 'production_user' ? 'My Created Tasks' : 'All Tasks',
          icon: ListTodo,
          badge: tasks.length,
          roles: ['manager', 'production_lead', 'production_user', 'production', 'scraper'],
        },
        { id: 'projects', label: 'Projects', icon: FolderKanban, roles: ['manager', 'production_lead', 'production'] },
        { id: 'teams', label: 'Teams & Pods', icon: Users, roles: ['manager', 'production_lead', 'production'] },
        { id: 'team-members', label: 'Team Members', icon: UserCheck, roles: ['manager', 'production_lead', 'production'] },
        { id: 'guest-portal', label: 'Guest Portal', icon: UserPlus, roles: ['guest'] },
      ],
    },
    {
      title: 'QUALITY & PRODUCTION',
      items: [
        {
          id: 'manager-qc',
          label: 'Manager Approval',
          icon: ShieldCheck,
          badge: awaitingQCCount > 0 ? awaitingQCCount : undefined,
          badgeColor: 'bg-indigo-500 text-white',
          roles: ['manager'],
        },
        {
          id: 'production-qc',
          label: 'Production Deliverables',
          icon: Factory,
          roles: ['manager', 'production_lead', 'production_user', 'production'],
        },
        {
          id: 'rework-queue',
          label: 'Rework Queue',
          icon: RefreshCw,
          badge: reworkCount > 0 ? reworkCount : undefined,
          badgeColor: 'bg-amber-500 text-white',
          roles: ['manager', 'production_lead', 'production_user', 'production', 'scraper'],
        },
      ],
    },
    {
      title: 'REPORTS',
      items: [
        { id: 'performance', label: 'Performance Analytics', icon: LineChart, roles: ['manager', 'production_lead', 'production'] },
        { id: 'team-reports', label: 'Team Reports', icon: FileSpreadsheet, roles: ['manager', 'production_lead', 'production'] },
        { id: 'employee-reports', label: 'Employee Reports', icon: FileText, roles: ['manager'] },
        { id: 'activity-logs', label: 'Activity Logs', icon: Activity, roles: ['manager', 'production_lead', 'production'] },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        {
          id: 'notifications',
          label: 'Notifications',
          icon: Bell,
          badge: unreadNotifCount > 0 ? unreadNotifCount : undefined,
          badgeColor: 'bg-rose-500 text-white',
          roles: ['manager', 'production_lead', 'production_user', 'production', 'scraper', 'guest'],
        },
        { id: 'email-history', label: 'Email History', icon: Mail, roles: ['manager'] },
        { id: 'settings', label: 'Settings', icon: Settings, roles: ['manager', 'production_lead', 'production', 'scraper'] },
        { id: 'user-management', label: 'User Management', icon: UserCheck, roles: ['manager'] },
      ],
    },
  ];

  // If Guest User role, simplify menu to only relevant views
  const isGuest = currentUserRole === 'guest';

  return (
    <aside
      className={`relative flex flex-col border-r border-border bg-card transition-all duration-300 ease-in-out select-none z-30 ${
        isCollapsed ? 'w-[70px]' : 'w-[260px]'
      } h-screen shrink-0`}
    >
      {/* Top Header: Logo & Title */}
      <div className="flex items-center justify-between px-3.5 py-4 border-b border-border min-h-[64px]">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 text-white shrink-0 shadow-sm shadow-indigo-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold tracking-tight text-slate-900 dark:text-zinc-100 truncate">
                Vserve Scraping
              </span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 truncate">
                Operations Portal
              </span>
            </div>
          )}
        </div>

        {/* Collapse toggle button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {isGuest ? (
          <div className="space-y-1">
            <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
              Guest Portal
            </div>
            <button
              onClick={() => setCurrentView('guest-portal')}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                currentView === 'guest-portal'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              <UserPlus className="w-4 h-4 shrink-0" />
              <span>Client Task Workspace</span>
            </button>
            <button
              onClick={() => setCurrentView('dataset-explorer')}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                currentView === 'dataset-explorer'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Database className="w-4 h-4 shrink-0" />
              <span>Dataset Deliverables</span>
            </button>
          </div>
        ) : (
          sections.map((section) => {
            // Filter items by role
            const visibleItems = section.items.filter(
              (item) => !item.roles || item.roles.includes(currentUserRole)
            );

            if (visibleItems.length === 0) return null;

            return (
              <div key={section.title} className="space-y-0.5">
                {!isCollapsed && (
                  <div className="px-2.5 py-1 text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                    {section.title}
                  </div>
                )}
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => setCurrentView(item.id)}
                      title={isCollapsed ? item.label : undefined}
                      className={`group relative w-full flex items-center rounded-lg text-xs font-medium transition-all duration-150 ${
                        isCollapsed
                          ? 'justify-center p-2.5'
                          : 'justify-between px-2.5 py-2'
                      } ${
                        isActive
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold'
                          : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-100/80 dark:hover:bg-zinc-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            isActive
                              ? 'text-indigo-600 dark:text-indigo-400'
                              : 'text-slate-400 dark:text-zinc-500 group-hover:text-slate-700 dark:group-hover:text-zinc-300'
                          }`}
                        />
                        {!isCollapsed && <span className="truncate">{item.label}</span>}
                      </div>

                      {/* Active indicator bar on left */}
                      {isActive && (
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-indigo-600 dark:bg-indigo-500 rounded-r" />
                      )}

                      {!isCollapsed && item.badge !== undefined && (
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-medium ${
                            item.badgeColor ||
                            'bg-slate-200/80 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}

                      {/* Dot badge when collapsed */}
                      {isCollapsed && item.badge !== undefined && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-card" />
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })
        )}
      </div>

      {/* Role Indicator Footer */}
      <div className="p-3 border-t border-border mt-auto">
        {!isCollapsed ? (
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-border">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <div className="truncate text-xs">
                <span className="font-semibold capitalize text-slate-800 dark:text-zinc-200">
                  {currentUserRole === 'guest'
                    ? 'Client Guest'
                    : currentUserRole === 'production'
                    ? 'Production QC'
                    : currentUserRole === 'scraper'
                    ? 'Scraping Dev'
                    : 'Manager'}
                </span>
                <span className="text-[10px] text-slate-400 block truncate">
                  {currentUserRole === 'manager' ? 'Full Access' : 'Scoped View'}
                </span>
              </div>
            </div>
            <button
              onClick={() => setCurrentView('settings')}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
              title="Settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <div
              className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-slate-100 dark:ring-zinc-800"
              title={`Role: ${currentUserRole}`}
            />
          </div>
        )}
      </div>
    </aside>
  );
};
