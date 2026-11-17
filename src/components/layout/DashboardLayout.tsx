import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { CommandPalette } from './CommandPalette';
import { TaskAssignmentModal } from '../views/TaskAssignmentModal';
import { TaskDetailModal } from '../common/TaskDetailModal';
import { ProjectDetailModal } from '../common/ProjectDetailModal';
import { ManagerDashboardView } from '../views/ManagerDashboardView';
import { MyTasksScraperView } from '../views/MyTasksScraperView';
import { ManagerQCView } from '../views/ManagerQCView';
import { AnalyticsView } from '../views/AnalyticsView';
import { ProductionQCView } from '../views/ProductionQCView';
import { TeamsView } from '../views/TeamsView';
import { ImportExportView } from '../views/ImportExportView';
import { GuestPortalView } from '../views/GuestPortalView';
import { NotificationsView } from '../views/NotificationsView';
import { ProjectsView } from '../views/ProjectsView';
import { SettingsView } from '../views/SettingsView';
import { AllTasksView } from '../views/AllTasksView';
import { PerformanceAnalyticsView } from '../views/PerformanceAnalyticsView';
import { TeamReportsView } from '../views/TeamReportsView';
import { EmployeeReportsView } from '../views/EmployeeReportsView';
import { ActivityLogsView } from '../views/ActivityLogsView';
import { EmailHistoryView } from '../views/EmailHistoryView';
import { GDriveView } from '../views/GDriveView';
import { UserManagementView } from '../views/UserManagementView';
import { LoginView } from '../views/LoginView';

export const DashboardLayout: React.FC = () => {
  const {
    isAuthenticated,
    currentView,
    setCurrentView,
    currentUserRole,
    inspectedTaskId,
    setInspectedTaskId,
    inspectedProjectId,
    setInspectedProjectId,
  } = useApp();

  if (!isAuthenticated) {
    return <LoginView />;
  }

  // Guard: Scraping User and Production User cannot access Teams/Pods or Team Members
  useEffect(() => {
    if (
      (currentUserRole === 'production_user' || currentUserRole === 'scraper') &&
      (currentView === 'teams' || currentView === 'team-members' || currentView === 'my-tasks')
    ) {
      setCurrentView('all-tasks');
    }
  }, [currentUserRole, currentView, setCurrentView]);

  const renderCurrentView = () => {
    switch (currentView) {
      case 'overview':
        return <ManagerDashboardView />;
      case 'tasks':
      case 'all-tasks':
        return <AllTasksView />;
      case 'my-tasks':
        return <MyTasksScraperView />;
      case 'projects':
        return <ProjectsView />;
      case 'teams':
        if (currentUserRole === 'production_user' || currentUserRole === 'scraper' || currentUserRole === 'production') {
          return <AllTasksView />;
        }
        return <TeamsView defaultTab="teams" />;
      case 'team-members':
        if (currentUserRole === 'production_user' || currentUserRole === 'scraper' || currentUserRole === 'production') {
          return <AllTasksView />;
        }
        return <TeamsView defaultTab="members" />;
      case 'guest-portal':
        return <GuestPortalView />;
      case 'manager-qc':
      case 'manager-approval':
        return <ManagerQCView mode="all" />;
      case 'rework':
      case 'rework-queue':
        return <ManagerQCView mode="rework" />;
      case 'deliverables':
      case 'production-qc':
      case 'production-deliverables':
        return <ProductionQCView />;
      case 'analytics':
        return <AnalyticsView mode="analytics" />;
      case 'dataset-explorer':
        return <AnalyticsView mode="explorer" />;
      case 'import-export':
        return <ImportExportView initialTab="import" />;
      case 'export-center':
        return <ImportExportView initialTab="export" />;
      case 'gdrive':
        return <GDriveView />;
      case 'performance':
        return <PerformanceAnalyticsView />;
      case 'team-reports':
        return <TeamReportsView />;
      case 'employee-reports':
        return <EmployeeReportsView />;
      case 'activity-logs':
        return <ActivityLogsView />;
      case 'notifications':
        return <NotificationsView initialTab="notifications" />;
      case 'email-history':
        return <EmailHistoryView />;
      case 'settings':
        return <SettingsView />;
      case 'user-management':
        return <UserManagementView />;
      default:
        return <ManagerDashboardView />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground font-sans">
      {/* Collapsible Modern Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 h-screen min-w-0 overflow-hidden">
        {/* Topbar with Global Search & Role Switcher */}
        <Topbar />

        {/* Scrollable View Canvas */}
        <main className="flex-1 overflow-y-auto px-6 py-6 min-w-0">
          <div className="max-w-[1600px] mx-auto">
            {renderCurrentView()}
          </div>
        </main>
      </div>

      {/* Global Command Palette (Ctrl+K) */}
      <CommandPalette />

      {/* 4-Step Task Assignment Wizard Modal */}
      <TaskAssignmentModal />

      {/* Task Analytics & Data Completeness Inspector Modal */}
      {inspectedTaskId && (
        <TaskDetailModal
          taskId={inspectedTaskId}
          onClose={() => setInspectedTaskId(null)}
        />
      )}

      {/* Project History & Worked User Dossier Modal */}
      {inspectedProjectId && (
        <ProjectDetailModal
          projectId={inspectedProjectId}
          onClose={() => setInspectedProjectId(null)}
        />
      )}
    </div>
  );
};
