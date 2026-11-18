import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Task,
  Employee,
  Team,
  Project,
  ScrapedRecord,
  NotificationItem,
  EmailLog,
  ImportExportLog,
  ActivityLogItem,
  UserRole,
  TaskStatus,
  QCHistoryEntry,
  getEmployeeAssociatedTeams,
  isTaskAssociatedWithEmployee,
} from '../types';
import {
  initialTasks,
  initialEmployees,
  initialTeams,
  initialProjects,
  sampleDatasetRecords,
  initialNotifications,
  initialEmailLogs,
  initialImportExportLogs,
  initialActivityLogs,
} from '../data/initialData';

interface AppContextType {
  // Authentication & Session
  isAuthenticated: boolean;
  login: (email: string, password?: string) => boolean;
  logout: () => void;

  // Navigation & Role
  currentView: string;
  setCurrentView: (view: string) => void;
  currentUserRole: UserRole;
  setCurrentUserRole: (role: UserRole) => void;
  currentEmployee: Employee;
  currentWorkspace: string;
  setCurrentWorkspace: (workspace: string) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  toggleDarkMode: () => void;
  
  // Quick Task Creation / QC Selection
  selectedTaskIdForQC: string | null;
  setSelectedTaskIdForQC: (taskId: string | null) => void;
  inspectedTaskId: string | null;
  setInspectedTaskId: (taskId: string | null) => void;
  inspectedProjectId: string | null;
  setInspectedProjectId: (projectId: string | null) => void;
  isCreateTaskModalOpen: boolean;
  setIsCreateTaskModalOpen: (open: boolean) => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;

  // Data Collections
  tasks: Task[];
  employees: Employee[];
  teams: Team[];
  projects: Project[];
  datasetRecords: ScrapedRecord[];
  notifications: NotificationItem[];
  emailLogs: EmailLog[];
  importExportLogs: ImportExportLog[];
  activityLogs: ActivityLogItem[];

  // Operational Actions
  approveManagerQC: (taskId: string, remarks: string) => void;
  requestReworkQC: (taskId: string, remarks: string, failingMetrics?: string[]) => void;
  reScrapingRequest: (taskId: string, remarks: string, failingMetrics?: string[]) => void;
  rejectQC: (taskId: string, remarks: string) => void;
  approveProduction: (taskId: string, remarks: string) => void;
  rejectProduction: (taskId: string, remarks: string) => void;
  assignTask: (taskData: Partial<Task> & { team?: string; employees?: string[]; primary?: string }) => void;
  reassignTaskScraper: (taskId: string, newScraperName: string, reason?: string) => void;
  updateTaskInternalProgress: (taskId: string, progress: number, internalExecutionState?: string) => void;
  updateUserTeam: (employeeId: string, newTeamName: string) => void;
  updateUserTeams: (employeeId: string, assignedTeams: string[], role?: string) => void;
  addEmployee: (employeeData: Partial<Employee>) => void;
  deleteEmployee: (employeeId: string) => void;
  addTeam: (teamData: {
    name: string;
    teamType: 'production' | 'scraping' | 'operations';
    leader?: string;
    leaderAvatar?: string;
    members?: string[];
    websitesManaged?: string[];
    description?: string;
  }) => void;
  updateTeam: (teamId: string, updates: Partial<Team>) => void;
  deleteTeam: (teamId: string) => void;
  assignTeamMembers: (teamId: string, memberIds: string[]) => void;
  addActivityLog: (log: {
    category: 'qc_approval' | 'file_upload' | 'assignment' | 'rework' | 'system';
    actor: string;
    actorRole: string;
    avatar?: string;
    action: string;
    taskRef?: string;
  }) => void;
  resetToLiveEmptyState: () => void;
  defaultScrapingAssignee: string;
  setDefaultScrapingAssignee: (name: string) => void;
  uploadScrapedFile: (taskId: string, fileName: string, fileSize: string, skuCount: number) => void;
  submitTaskForQC: (taskId: string) => void;
  downloadScrapedFile: (taskId: string) => void;
  bulkAssignTasks: (taskIds: string[], teamName: string, employees: string[]) => void;
  bulkUpdateStatus: (taskIds: string[], status: TaskStatus) => void;
  addNewTask: (task: Task) => void;
  retryEmail: (emailId: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  importNewDataset: (file: { name: string; size: string; type: 'xlsx' | 'csv' | 'json' | 'zip'; recordsCount: number }) => void;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_PREFIX = 'vserve_scraping_portal_prod_live_v2_';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation & Preferences
  const [currentView, setCurrentView] = useState<string>('overview');
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('manager');
  const [currentWorkspace, setCurrentWorkspace] = useState<string>('Lawson Industrial');
  
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}dark_mode`);
    return saved ? JSON.parse(saved) : false;
  });

  const [selectedTaskIdForQC, setSelectedTaskIdForQC] = useState<string | null>('TSK-1048');
  const [inspectedTaskId, setInspectedTaskId] = useState<string | null>(null);
  const [inspectedProjectId, setInspectedProjectId] = useState<string | null>(null);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [defaultScrapingAssignee, setDefaultScrapingAssignee] = useState<string>('Karthik R');

  // Authentication & Active Session State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}auth_status`);
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [activeUserEmail, setActiveUserEmail] = useState<string>(() => {
    return localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}active_email`) || 'samuel.p@vservetech.com';
  });

  // Entities state with localStorage fallback
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}tasks`);
    return saved ? JSON.parse(saved) : initialTasks;
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}employees`);
    return saved ? JSON.parse(saved) : initialEmployees;
  });

  const [teams, setTeams] = useState<Team[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}teams`);
    return saved ? JSON.parse(saved) : initialTeams;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}activity_logs`);
    return saved ? JSON.parse(saved) : initialActivityLogs;
  });

  // Dynamically resolve logged-in employee profile
  const currentEmployee = useMemo<Employee>(() => {
    const byEmail = employees.find(
      (e) => e.email.toLowerCase() === activeUserEmail.toLowerCase() || e.name.toLowerCase() === activeUserEmail.toLowerCase()
    );
    if (byEmail) return byEmail;

    if (currentUserRole === 'manager') {
      return employees.find((e) => e.name === 'Samuel P' || e.id === 'emp-1') || employees[0];
    }
    if (currentUserRole === 'production_lead' || currentUserRole === 'production') {
      return employees.find((e) => e.name === 'Priya Nair' || e.id === 'emp-2') || employees[1];
    }
    if (currentUserRole === 'production_user') {
      return employees.find((e) => e.name === 'Divya Murugan' || e.id === 'emp-4') || employees[3];
    }
    if (currentUserRole === 'scraper') {
      return employees.find((e) => e.name === 'Karthik R' || e.id === 'emp-3') || employees[2];
    }
    return {
      id: 'emp-guest',
      name: 'Mark Stevens',
      email: 'mark.stevens@client.com',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
      role: 'Guest User',
      team: '',
      assignedTeams: [],
      designation: 'Client Requestor',
      activeTasksCount: 0,
      workloadCapacity: 0,
      completedTasks: 0,
      qcApprovalRate: 0,
      availability: 'available',
    };
  }, [activeUserEmail, currentUserRole, employees]);

  const [projects] = useState<Project[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}projects`);
    return saved ? JSON.parse(saved) : initialProjects;
  });

  const [datasetRecords, setDatasetRecords] = useState<ScrapedRecord[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}records`);
    return saved ? JSON.parse(saved) : sampleDatasetRecords;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}notifications`);
    return saved ? JSON.parse(saved) : initialNotifications;
  });

  const [emailLogs, setEmailLogs] = useState<EmailLog[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}emails`);
    return saved ? JSON.parse(saved) : initialEmailLogs;
  });

  const [importExportLogs, setImportExportLogs] = useState<ImportExportLog[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}import_export`);
    return saved ? JSON.parse(saved) : initialImportExportLogs;
  });

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}dark_mode`, JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}tasks`, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}employees`, JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}teams`, JSON.stringify(teams));
  }, [teams]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}activity_logs`, JSON.stringify(activityLogs));
  }, [activityLogs]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}auth_status`, JSON.stringify(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}active_email`, activeUserEmail);
  }, [activeUserEmail]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}notifications`, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}emails`, JSON.stringify(emailLogs));
  }, [emailLogs]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}import_export`, JSON.stringify(importExportLogs));
  }, [importExportLogs]);

  // Operations
  const approveManagerQC = (taskId: string, remarks: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const newEntry = {
            id: `qc-${Date.now()}`,
            action: 'approved' as const,
            performedBy: 'Samuel P',
            role: 'Operations Manager',
            timestamp: new Date().toLocaleString(),
            remarks: remarks || 'Manager QC approval granted. Ready for production stage.',
          };
          return {
            ...t,
            status: 'production_pending',
            progress: 100,
            qcHistory: [newEntry, ...t.qcHistory],
          };
        }
        return t;
      })
    );

    // Add notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Manager QC Approved',
      message: `${taskId} has been approved and moved to Production Validation.`,
      category: 'qc_update',
      timestamp: 'Just now',
      read: false,
      actionUrl: 'production-qc',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    // Dispatch email notification
    const newEmail: EmailLog = {
      id: `eml-${Date.now()}`,
      recipient: 'priya.nair@vservetech.com',
      recipientName: 'Priya Nair (Production Lead)',
      subject: `Production Handover: ${taskId} Approved by Manager QC`,
      taskRef: taskId,
      status: 'delivered',
      sentAt: new Date().toLocaleTimeString(),
      deliveryTime: '0.7s',
    };
    setEmailLogs((prev) => [newEmail, ...prev]);
  };

  const uploadScrapedFile = (taskId: string, fileName: string, fileSize: string, skuCount: number) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            outputFileName: fileName,
            outputFileSize: fileSize,
            completedSkus: skuCount,
            progress: 100,
          };
        }
        return t;
      })
    );

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Scraped File Uploaded',
      message: `File "${fileName}" uploaded for ${taskId} (${skuCount.toLocaleString()} SKUs).`,
      category: 'import_export',
      timestamp: 'Just now',
      read: false,
      actionUrl: 'my-tasks',
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const submitTaskForQC = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const newEntry = {
            id: `qc-${Date.now()}`,
            action: 'submitted' as const,
            performedBy: t.primaryAssignee || 'Scraping Engineer',
            role: 'Scraping Specialist',
            timestamp: new Date().toLocaleString(),
            remarks: `Dataset extracted and uploaded (${t.outputFileName || 'output.xlsx'}). Ready for Manager and Production QC inspection.`,
          };
          return {
            ...t,
            status: 'awaiting_manager_qc' as const,
            progress: 100,
            qcHistory: [newEntry, ...t.qcHistory],
          };
        }
        return t;
      })
    );

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Task Submitted for QC',
      message: `${taskId} has been submitted by scraper and is now in Manager QC queue.`,
      category: 'qc_update',
      timestamp: 'Just now',
      read: false,
      actionUrl: 'manager-qc',
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const downloadScrapedFile = (taskId: string) => {
    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask) return;

    // Generate dummy downloadable file content
    const fileName = targetTask.outputFileName || `${taskId}_Extracted_Dataset.csv`;
    const csvContent =
      'SKU_ID,MPN,Title,Category,Price,Stock_Status,Image_URLs,Specs_JSON\n' +
      `SKU-48291,MPN-8812,"${targetTask.title}",Power Transmission,$48.50,In Stock,https://cdn.example.com/img1.jpg,"{""Bore"":""25mm""}"\n` +
      `SKU-48292,MPN-8813,"${targetTask.title} Heavy Duty",Industrial,$54.00,In Stock,https://cdn.example.com/img2.jpg,"{""Bore"":""30mm""}"\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Scraped Dataset Downloaded',
      message: `Production lead downloaded "${fileName}" for ${taskId}.`,
      category: 'production_update',
      timestamp: 'Just now',
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const requestReworkQC = (taskId: string, remarks: string, failingMetrics?: string[]) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const newEntry = {
            id: `qc-${Date.now()}`,
            action: 'rework_requested' as const,
            performedBy: 'Samuel P',
            role: 'Operations Manager',
            timestamp: new Date().toLocaleString(),
            remarks: remarks || 'Rework requested. Resolve flagged missing attributes and re-submit.',
            failingMetrics,
          };
          return {
            ...t,
            status: 'rework_required',
            qcHistory: [newEntry, ...t.qcHistory],
          };
        }
        return t;
      })
    );

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'QC Rework Required',
      message: `${taskId} marked as Rework Required. See QC remarks for details.`,
      category: 'qc_update',
      timestamp: 'Just now',
      read: false,
      actionUrl: 'rework-queue',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    const targetTask = tasks.find((t) => t.id === taskId);
    const assigneeEmail = targetTask?.primaryAssignee
      ? employees.find((e) => e.name === targetTask.primaryAssignee)?.email || 'karthik.r@vservetech.com'
      : 'karthik.r@vservetech.com';

    const newEmail: EmailLog = {
      id: `eml-${Date.now()}`,
      recipient: assigneeEmail,
      recipientName: targetTask?.primaryAssignee || 'Assigned Scraper',
      subject: `Urgent: Rework Requested on ${taskId}`,
      taskRef: taskId,
      status: 'delivered',
      sentAt: new Date().toLocaleTimeString(),
      deliveryTime: '0.9s',
    };
    setEmailLogs((prev) => [newEmail, ...prev]);
  };

  const reScrapingRequest = (taskId: string, remarks: string, failingMetrics?: string[]) => {
    const operatorName = currentEmployee.name || (currentUserRole === 'production_user' ? 'Divya Murugan' : 'Priya Nair');
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const newEntry: QCHistoryEntry = {
          id: `qc-${Date.now()}`,
          action: 'rework_requested',
          performedBy: operatorName,
          role: currentUserRole === 'production_user' ? 'Production User' : 'Production Lead',
          timestamp: new Date().toLocaleString(),
          remarks: remarks || 'Re-scraping requested: missing required fields or data validation failure.',
          failingMetrics: failingMetrics || ['Missing specifications', 'Schema drift'],
        };
        return {
          ...t,
          status: 'rework_required',
          qcHistory: [newEntry, ...t.qcHistory],
        };
      })
    );

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `Re-Scraping Requested: ${taskId}`,
      message: remarks || 'Production team requested re-scraping due to validation errors.',
      category: 'qc_update',
      timestamp: 'Just now',
      read: false,
      actionUrl: 'rework-queue',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    const targetTask = tasks.find((t) => t.id === taskId);
    const assigneeEmail = targetTask?.primaryAssignee
      ? employees.find((e) => e.name === targetTask.primaryAssignee)?.email || 'karthik.r@vservetech.com'
      : 'karthik.r@vservetech.com';

    const newEmail: EmailLog = {
      id: `eml-${Date.now()}`,
      recipient: assigneeEmail,
      recipientName: targetTask?.primaryAssignee || 'Assigned Scraper',
      subject: `Re-Scraping Request: ${taskId}`,
      taskRef: taskId,
      status: 'delivered',
      sentAt: new Date().toLocaleTimeString(),
      deliveryTime: '0.8s',
    };
    setEmailLogs((prev) => [newEmail, ...prev]);
  };

  const rejectQC = (taskId: string, remarks: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const newEntry = {
            id: `qc-${Date.now()}`,
            action: 'rejected' as const,
            performedBy: 'Samuel P',
            role: 'Operations Manager',
            timestamp: new Date().toLocaleString(),
            remarks: remarks || 'Task output rejected due to critical data integrity failure.',
          };
          return {
            ...t,
            status: 'rejected',
            qcHistory: [newEntry, ...t.qcHistory],
          };
        }
        return t;
      })
    );
  };

  const approveProduction = (taskId: string, remarks: string) => {
    const operatorName = currentEmployee.name || (currentUserRole === 'production_user' ? 'Divya Murugan' : 'Priya Nair');
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const newProdEntry = {
            id: `prod-${Date.now()}`,
            action: 'validated' as const,
            performedBy: operatorName,
            timestamp: new Date().toLocaleString(),
            remarks: remarks || 'Production validation successful. Dataset uploaded to Google Drive bucket.',
          };
          return {
            ...t,
            status: 'completed',
            progress: 100,
            productionHistory: [newProdEntry, ...(t.productionHistory || [])],
          };
        }
        return t;
      })
    );

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Production Completed & Synced',
      message: `${taskId} validated by ${operatorName} and synchronized to Google Drive client deliverables.`,
      category: 'production_update',
      timestamp: 'Just now',
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    // Add export log to Drive
    const targetTask = tasks.find((t) => t.id === taskId);
    const newLog: ImportExportLog = {
      id: `ie-${Date.now()}`,
      type: 'export',
      fileName: targetTask?.outputFileName || `${taskId}_Final_Delivery.xlsx`,
      fileType: 'xlsx',
      recordsCount: targetTask?.skuCount || 10000,
      size: targetTask?.outputFileSize || '16.2 MB',
      status: 'completed',
      gdriveSyncStatus: 'synced',
      uploadedBy: operatorName,
      timestamp: 'Just now',
    };
    setImportExportLogs((prev) => [newLog, ...prev]);
  };

  const rejectProduction = (taskId: string, remarks: string) => {
    const operatorName = currentEmployee.name || (currentUserRole === 'production_user' ? 'Divya Murugan' : 'Priya Nair');
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const newProdEntry = {
            id: `prod-${Date.now()}`,
            action: 'rejected' as const,
            performedBy: operatorName,
            timestamp: new Date().toLocaleString(),
            remarks: remarks || 'Rejected by Production QA. Returns to Rework Queue.',
          };
          return {
            ...t,
            status: 'rework_required',
            productionHistory: [newProdEntry, ...(t.productionHistory || [])],
          };
        }
        return t;
      })
    );
  };

  const assignTask = (data: Partial<Task> & { team?: string; employees?: string[]; primary?: string; productionTeam?: string; productionUser?: string; createdBy?: string; createdByRole?: string }) => {
    const newTaskId = data.id || `TSK-${Math.floor(1000 + Math.random() * 9000)}`;
    const effectivePrimary = data.primary || defaultScrapingAssignee || 'Karthik R';
    const effectiveTeam = data.team || 'Core Scraping Engineering Pod';
    const effectiveEmployees = data.employees && data.employees.length > 0 ? data.employees : [effectivePrimary];
    const isPending = !data.primary && defaultScrapingAssignee === 'unassigned';
    const defaultProdTeam = currentEmployee.team || 'Lawson Production Team';
    const defaultProdUser = currentEmployee.name || 'Priya Nair';

    const newTask: Task = {
      id: newTaskId,
      projectId: data.projectId || 'proj-1',
      projectName: data.projectName || 'Grainger US Catalog Refresh',
      website: data.website || 'grainger.com',
      client: data.client || 'Industrial Supplies Co.',
      title: data.title || 'Extracted Product Catalog Scrape',
      description: data.description || 'Targeted attribute extraction and specification parsing.',
      assignedTeam: effectiveTeam,
      assignedEmployees: isPending ? [] : effectiveEmployees,
      primaryAssignee: isPending ? '' : effectivePrimary,
      productionTeam: data.productionTeam || defaultProdTeam,
      productionUser: data.productionUser || defaultProdUser,
      createdBy: data.createdBy || currentEmployee.name,
      createdByRole: data.createdByRole || (currentUserRole === 'production_user' ? 'Production User' : currentUserRole === 'scraper' ? 'Scraping Engineer' : 'Operations Manager'),
      internalExecutionState: isPending ? 'Pending Assignment (Awaiting Triage)' : 'Assigned to Scraping Engineer',
      skuCount: data.skuCount || 5000,
      completedSkus: 0,
      progress: 0,
      priority: data.priority || 'medium',
      status: isPending ? 'pending_assignment' : 'in_progress',
      deadline: data.deadline || '2026-11-29',
      createdAt: new Date().toISOString().split('T')[0],
      inputFileName: data.inputFileName || 'Input_SKU_Feed.xlsx',
      inputFileSize: data.inputFileSize || '3.2 MB',
      scrapingRequirements: data.scrapingRequirements || [
        'Extract high-res image URLs.',
        'Parse technical attributes table.',
        'Capture MPN and stock availability.',
      ],
      requiredColumns: data.requiredColumns || ['SKU_ID', 'MPN', 'Title', 'Price', 'Images', 'Specs_JSON'],
      qcHistory: [],
    };

    setTasks((prev) => [newTask, ...prev]);

    // Recalibrate employee workload if assigned
    if (!isPending) {
      setEmployees((prev) =>
        prev.map((emp) => {
          if (effectiveEmployees.includes(emp.name)) {
            const newCount = emp.activeTasksCount + 1;
            const newCap = Math.min(100, emp.workloadCapacity + 15);
            return {
              ...emp,
              activeTasksCount: newCount,
              workloadCapacity: newCap,
              availability: newCap >= 90 ? 'busy' : 'available',
            };
          }
          return emp;
        })
      );
    }

    // Trigger notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: isPending ? 'Task Request Submitted' : 'New Task Assigned',
      message: isPending
        ? `${newTaskId} requested by Production (${data.productionTeam || 'Production'}). Awaiting manager assignment.`
        : `${newTaskId} assigned to ${effectivePrimary} (${effectiveTeam}).`,
      category: 'task_assignment',
      timestamp: 'Just now',
      read: false,
      actionUrl: isPending ? 'all-tasks' : 'my-tasks',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    // Trigger email log
    const assignee = employees.find((e) => e.name === effectivePrimary);
    const newEmail: EmailLog = {
      id: `eml-${Date.now()}`,
      recipient: assignee?.email || 'karthik.r@vservetech.com',
      recipientName: effectivePrimary,
      subject: `Task Notification: ${newTaskId} - ${newTask.title}`,
      taskRef: newTaskId,
      status: 'delivered',
      sentAt: new Date().toLocaleTimeString(),
      deliveryTime: '0.8s',
    };
    setEmailLogs((prev) => [newEmail, ...prev]);
  };

  const reassignTaskScraper = (taskId: string, newScraperName: string, reason?: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const oldScraper = t.primaryAssignee || 'Unassigned';
          const newEntry: QCHistoryEntry = {
            id: `reassign-${Date.now()}`,
            action: 'reassigned',
            performedBy: currentUserRole === 'manager' ? 'Samuel P' : oldScraper,
            role: currentUserRole === 'manager' ? 'Operations Manager' : 'Scraping Engineer',
            timestamp: new Date().toLocaleString(),
            remarks: reason || `Task reassigned from ${oldScraper} to ${newScraperName}.`,
          };
          return {
            ...t,
            primaryAssignee: newScraperName,
            assignedEmployees: [newScraperName],
            status: t.status === 'pending_assignment' ? 'in_progress' : t.status,
            internalExecutionState: `Reassigned to ${newScraperName}`,
            qcHistory: [newEntry, ...t.qcHistory],
          };
        }
        return t;
      })
    );

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Task Reassigned',
      message: `${taskId} reassigned to ${newScraperName}.`,
      category: 'task_assignment',
      timestamp: 'Just now',
      read: false,
      actionUrl: 'my-tasks',
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const updateTaskInternalProgress = (taskId: string, progress: number, internalExecutionState?: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const clamped = Math.min(100, Math.max(0, progress));
          return {
            ...t,
            progress: clamped,
            completedSkus: Math.round((t.skuCount * clamped) / 100),
            internalExecutionState: internalExecutionState || t.internalExecutionState,
          };
        }
        return t;
      })
    );
  };

  const updateUserTeam = (employeeId: string, newTeamName: string) => {
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id === employeeId || emp.name === employeeId) {
          const currentAssigned = emp.assignedTeams || [emp.team];
          const updatedAssigned = currentAssigned.includes(newTeamName)
            ? currentAssigned
            : [...currentAssigned, newTeamName];
          return { ...emp, team: newTeamName, assignedTeams: updatedAssigned };
        }
        return emp;
      })
    );
  };

  const updateUserTeams = (employeeId: string, assignedTeams: string[], role?: string) => {
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id === employeeId || emp.name === employeeId) {
          const primary = assignedTeams.length > 0 ? assignedTeams[0] : emp.team;
          return {
            ...emp,
            team: primary,
            assignedTeams: assignedTeams.length > 0 ? assignedTeams : [primary],
            ...(role ? { role } : {}),
          };
        }
        return emp;
      })
    );
  };

  const addEmployee = (empData: Partial<Employee>) => {
    const teamsList = empData.assignedTeams && empData.assignedTeams.length > 0
      ? empData.assignedTeams
      : [empData.team || 'Lawson Production Team'];

    const newEmp: Employee = {
      id: `emp-${Date.now()}`,
      name: empData.name || 'New Operator',
      email: empData.email || 'operator@vservetech.com',
      avatar: empData.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80`,
      role: empData.role || 'Production User',
      team: teamsList[0],
      assignedTeams: teamsList,
      designation: empData.designation || 'Operations Specialist',
      activeTasksCount: 0,
      workloadCapacity: 0,
      completedTasks: 0,
      qcApprovalRate: 100,
      availability: 'available',
    };
    setEmployees((prev) => [...prev, newEmp]);

    // Synchronize team memberships
    setTeams((prev) =>
      prev.map((t) => {
        if (teamsList.includes(t.name) && !t.members.includes(newEmp.id) && !t.members.includes(newEmp.name)) {
          return { ...t, members: [...t.members, newEmp.id] };
        }
        return t;
      })
    );

    addActivityLog({
      category: 'system',
      actor: currentEmployee.name,
      actorRole: currentEmployee.role,
      action: `Created new operator account: "${newEmp.name}" (${newEmp.email}) with role ${newEmp.role}.`,
    });
  };

  const deleteEmployee = (employeeId: string) => {
    const emp = employees.find((e) => e.id === employeeId || e.name === employeeId);
    if (!emp) return;
    setEmployees((prev) => prev.filter((e) => e.id !== emp.id && e.name !== emp.name));
    setTeams((prev) =>
      prev.map((t) => ({
        ...t,
        members: t.members.filter((m) => m !== emp.id && m !== emp.name),
      }))
    );
    addActivityLog({
      category: 'system',
      actor: currentEmployee.name,
      actorRole: currentEmployee.role,
      action: `Removed operator account: ${emp.name} (${emp.email}).`,
    });
  };

  const addTeam = (teamData: {
    name: string;
    teamType: 'production' | 'scraping' | 'operations';
    leader?: string;
    leaderAvatar?: string;
    members?: string[];
    websitesManaged?: string[];
    description?: string;
  }) => {
    const leaderName = teamData.leader || 'Unassigned Leader';
    const leaderEmp = employees.find((e) => e.name === leaderName);
    const newTeam: Team = {
      id: `team-${Date.now()}`,
      name: teamData.name,
      teamType: teamData.teamType,
      leader: leaderName,
      leaderAvatar:
        teamData.leaderAvatar ||
        (leaderEmp ? leaderEmp.avatar : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'),
      members: teamData.members || (leaderEmp ? [leaderEmp.id] : []),
      activeTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
      completionRate: 100,
      productivity: 100,
      websitesManaged: teamData.websitesManaged || [],
      description: teamData.description,
    };

    setTeams((prev) => [...prev, newTeam]);

    // Also update assignedTeams for members assigned to this team
    if (teamData.members && teamData.members.length > 0) {
      setEmployees((prev) =>
        prev.map((emp) => {
          if (teamData.members?.includes(emp.id) || teamData.members?.includes(emp.name)) {
            const current = emp.assignedTeams || [emp.team];
            if (!current.includes(teamData.name)) {
              return { ...emp, assignedTeams: [...current, teamData.name] };
            }
          }
          return emp;
        })
      );
    }

    addActivityLog({
      category: 'system',
      actor: currentEmployee.name,
      actorRole: currentEmployee.role,
      action: `Created new ${teamData.teamType} pod: "${teamData.name}" led by ${leaderName}.`,
    });
  };

  const updateTeam = (teamId: string, updates: Partial<Team>) => {
    setTeams((prev) =>
      prev.map((t) => (t.id === teamId ? { ...t, ...updates } : t))
    );
  };

  const deleteTeam = (teamId: string) => {
    const teamToDelete = teams.find((t) => t.id === teamId);
    if (!teamToDelete) return;
    setTeams((prev) => prev.filter((t) => t.id !== teamId));
    setEmployees((prev) =>
      prev.map((emp) => ({
        ...emp,
        assignedTeams: (emp.assignedTeams || [emp.team]).filter((name) => name !== teamToDelete.name),
      }))
    );
    addActivityLog({
      category: 'system',
      actor: currentEmployee.name,
      actorRole: currentEmployee.role,
      action: `Decommissioned team pod: "${teamToDelete.name}".`,
    });
  };

  const assignTeamMembers = (teamId: string, memberIds: string[]) => {
    const targetTeam = teams.find((t) => t.id === teamId);
    if (!targetTeam) return;

    setTeams((prev) =>
      prev.map((t) => (t.id === teamId ? { ...t, members: memberIds } : t))
    );

    // Synchronize employees assignedTeams
    setEmployees((prev) =>
      prev.map((emp) => {
        const isMember = memberIds.includes(emp.id) || memberIds.includes(emp.name);
        const currentAssigned = emp.assignedTeams || [emp.team];
        if (isMember && !currentAssigned.includes(targetTeam.name)) {
          return { ...emp, assignedTeams: [...currentAssigned, targetTeam.name] };
        }
        if (!isMember && currentAssigned.includes(targetTeam.name)) {
          const filtered = currentAssigned.filter((tName) => tName !== targetTeam.name);
          return { ...emp, assignedTeams: filtered.length > 0 ? filtered : [filtered[0] || 'Unassigned'] };
        }
        return emp;
      })
    );

    addActivityLog({
      category: 'assignment',
      actor: currentEmployee.name,
      actorRole: currentEmployee.role,
      action: `Updated personnel rosters for pod "${targetTeam.name}" (${memberIds.length} members assigned).`,
    });
  };

  const addActivityLog = (log: {
    category: 'qc_approval' | 'file_upload' | 'assignment' | 'rework' | 'system';
    actor: string;
    actorRole: string;
    avatar?: string;
    action: string;
    taskRef?: string;
  }) => {
    const newEntry: ActivityLogItem = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      relativeTime: 'Just now',
      category: log.category,
      actor: log.actor,
      actorRole: log.actorRole,
      avatar:
        log.avatar ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      action: log.action,
      taskRef: log.taskRef,
    };
    setActivityLogs((prev) => [newEntry, ...prev.slice(0, 99)]);
  };

  const login = (email: string, password?: string): boolean => {
    const trimmedEmail = email.trim().toLowerCase();
    const emp = employees.find(
      (e) =>
        e.email.toLowerCase() === trimmedEmail ||
        e.name.toLowerCase() === trimmedEmail
    );
    if (emp) {
      if (emp.password && password && emp.password !== password) {
        return false;
      }
      setActiveUserEmail(emp.email);
      let mappedRole: UserRole = 'manager';
      const r = emp.role.toLowerCase();
      if (r.includes('manager') || r.includes('admin') || r.includes('lead & qa')) mappedRole = 'manager';
      else if (r.includes('production lead')) mappedRole = 'production_lead';
      else if (r.includes('production')) mappedRole = 'production_user';
      else if (r.includes('scraping') || r.includes('scraper') || r.includes('extraction')) mappedRole = 'scraper';
      else if (r.includes('guest')) mappedRole = 'guest';

      setCurrentUserRole(mappedRole);
      setIsAuthenticated(true);
      addActivityLog({
        category: 'system',
        actor: emp.name,
        actorRole: emp.role,
        avatar: emp.avatar,
        action: `Operator authenticated: ${emp.name} (${emp.email}) signed into live console session.`,
      });
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const resetToLiveEmptyState = () => {
    setTasks([]);
    setDatasetRecords([]);
    setEmailLogs([]);
    setImportExportLogs([]);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY_PREFIX}tasks`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY_PREFIX}records`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY_PREFIX}email_logs`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY_PREFIX}ie_logs`);
    setActivityLogs([
      {
        id: `act-live-${Date.now()}`,
        timestamp: new Date().toLocaleString(),
        relativeTime: 'Live Active',
        category: 'system',
        actor: currentEmployee.name,
        actorRole: currentEmployee.role,
        action: 'System cleared to Live Production State. Workspace cache purged.',
      },
    ]);
  };

  const bulkAssignTasks = (taskIds: string[], teamName: string, selectedEmployees: string[]) => {
    const primary = selectedEmployees[0] || '';
    setTasks((prev) =>
      prev.map((t) => {
        if (taskIds.includes(t.id)) {
          return {
            ...t,
            assignedTeam: teamName,
            assignedEmployees: selectedEmployees,
            primaryAssignee: primary,
            status: t.status === 'pending_assignment' ? 'in_progress' : t.status,
          };
        }
        return t;
      })
    );

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Bulk Assignment Complete',
      message: `${taskIds.length} tasks assigned to ${teamName}.`,
      category: 'task_assignment',
      timestamp: 'Just now',
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const bulkUpdateStatus = (taskIds: string[], status: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (taskIds.includes(t.id)) {
          return {
            ...t,
            status,
          };
        }
        return t;
      })
    );
  };

  const addNewTask = (task: Task) => {
    setTasks((prev) => [task, ...prev]);
  };

  const retryEmail = (emailId: string) => {
    setEmailLogs((prev) =>
      prev.map((eml) => {
        if (eml.id === emailId) {
          return {
            ...eml,
            status: 'delivered',
            deliveryTime: '1.2s',
          };
        }
        return eml;
      })
    );
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const importNewDataset = (file: { name: string; size: string; type: 'xlsx' | 'csv' | 'json' | 'zip'; recordsCount: number }) => {
    const newLog: ImportExportLog = {
      id: `ie-${Date.now()}`,
      type: 'import',
      fileName: file.name,
      fileType: file.type,
      recordsCount: file.recordsCount,
      size: file.size,
      status: 'completed',
      gdriveSyncStatus: 'synced',
      uploadedBy: 'Samuel P',
      timestamp: 'Just now',
    };
    setImportExportLogs((prev) => [newLog, ...prev]);

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Dataset Imported & Verified',
      message: `File "${file.name}" with ${file.recordsCount.toLocaleString()} records imported successfully.`,
      category: 'import_export',
      timestamp: 'Just now',
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const resetAllData = () => {
    setTasks(initialTasks);
    setEmployees(initialEmployees);
    setTeams(initialTeams);
    setDatasetRecords(sampleDatasetRecords);
    setNotifications(initialNotifications);
    setEmailLogs(initialEmailLogs);
    setImportExportLogs(initialImportExportLogs);
    localStorage.clear();
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        currentView,
        setCurrentView,
        currentUserRole,
        setCurrentUserRole,
        currentEmployee,
        currentWorkspace,
        setCurrentWorkspace,
        darkMode,
        setDarkMode,
        toggleDarkMode,
        selectedTaskIdForQC,
        setSelectedTaskIdForQC,
        inspectedTaskId,
        setInspectedTaskId,
        inspectedProjectId,
        setInspectedProjectId,
        isCreateTaskModalOpen,
        setIsCreateTaskModalOpen,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        tasks,
        employees,
        teams,
        projects,
        datasetRecords,
        notifications,
        emailLogs,
        importExportLogs,
        activityLogs,
        addActivityLog,
        approveManagerQC,
        requestReworkQC,
        reScrapingRequest,
        rejectQC,
        approveProduction,
        rejectProduction,
        assignTask,
        reassignTaskScraper,
        updateTaskInternalProgress,
        updateUserTeam,
        updateUserTeams,
        addEmployee,
        deleteEmployee,
        addTeam,
        updateTeam,
        deleteTeam,
        assignTeamMembers,
        resetToLiveEmptyState,
        defaultScrapingAssignee,
        setDefaultScrapingAssignee,
        uploadScrapedFile,
        submitTaskForQC,
        downloadScrapedFile,
        bulkAssignTasks,
        bulkUpdateStatus,
        addNewTask,
        retryEmail,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        importNewDataset,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
