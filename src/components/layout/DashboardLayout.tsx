import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { CommandPalette } from './CommandPalette';
import { TaskAssignmentModal } from '../views/TaskAssignmentModal';
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

export const DashboardLayout: React.FC = () => {
  const { currentView } = useApp();

  const renderCurrentView = () => {
    switch (currentView) {
      case 'overview':
      case 'performance':
      case 'team-reports':
        return <ManagerDashboardView />;
      case 'all-tasks':
        return <AllTasksView />;
      case 'my-tasks':
        return <MyTasksScraperView />;
      case 'manager-qc':
      case 'manager-approval':
      case 'rework-queue':
        return <ManagerQCView />;
      case 'analytics':
      case 'dataset-explorer':
        return <AnalyticsView />;
      case 'production-qc':
      case 'production-deliverables':
        return <ProductionQCView />;
      case 'teams':
      case 'team-members':
      case 'employee-reports':
      case 'user-management':
        return <TeamsView />;
      case 'import-export':
      case 'export-center':
      case 'gdrive':
        return <ImportExportView />;
      case 'guest-portal':
        return <GuestPortalView />;
      case 'notifications':
      case 'email-history':
      case 'activity-logs':
        return <NotificationsView />;
      case 'projects':
        return <ProjectsView />;
      case 'settings':
        return <SettingsView />;
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
    </div>
  );
};
