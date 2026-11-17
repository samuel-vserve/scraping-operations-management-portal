export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus =
  | 'pending_assignment'
  | 'in_progress'
  | 'awaiting_manager_qc'
  | 'rework_required'
  | 'production_pending'
  | 'completed'
  | 'rejected';

export type UserRole =
  | 'manager'
  | 'production_lead'
  | 'production_user'
  | 'production'
  | 'scraper'
  | 'guest';

export interface QCHistoryEntry {
  id: string;
  action: 'approved' | 'rework_requested' | 'rejected' | 'reassigned' | 'submitted';
  performedBy: string;
  role: string;
  timestamp: string;
  remarks: string;
  failingMetrics?: string[];
}

export interface ProductionHistoryEntry {
  id: string;
  action: 'validated' | 'rejected' | 'in_review';
  performedBy: string;
  timestamp: string;
  remarks: string;
}

export interface Task {
  id: string;
  projectId: string;
  projectName: string;
  website: string;
  client: string;
  title: string;
  description: string;
  assignedTeam: string;
  assignedEmployees: string[];
  primaryAssignee: string;
  productionTeam?: string;
  productionUser?: string;
  createdBy?: string;
  createdByRole?: string;
  gdriveFolderUrl?: string;
  gdriveFileUrl?: string;
  internalExecutionState?: string;
  skuCount: number;
  completedSkus: number;
  progress: number;
  priority: TaskPriority;
  status: TaskStatus;
  deadline: string;
  createdAt: string;
  inputFileName: string;
  inputFileSize: string;
  outputFileName?: string;
  outputFileSize?: string;
  scrapingRequirements: string[];
  requiredColumns: string[];
  qcHistory: QCHistoryEntry[];
  productionHistory?: ProductionHistoryEntry[];
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatar: string;
  role: string;
  team: string; // primary team
  assignedTeams?: string[]; // multiple teams/pods handled by this user
  designation: string;
  activeTasksCount: number;
  workloadCapacity: number; // percentage 0-100
  completedTasks: number;
  qcApprovalRate: number; // percentage e.g. 96.5
  availability: 'available' | 'busy' | 'on_leave';
}

export interface Team {
  id: string;
  name: string;
  teamType?: 'scraping' | 'production' | 'operations';
  leader: string;
  leaderAvatar: string;
  members: string[]; // employee ids or names
  activeTasks: number;
  completedTasks: number;
  pendingTasks: number;
  completionRate: number;
  productivity: number; // index e.g. 94.2
  websitesManaged: string[];
  description?: string;
}

export interface ActivityLogItem {
  id: string;
  timestamp: string;
  relativeTime: string;
  category: 'qc_approval' | 'file_upload' | 'assignment' | 'rework' | 'system';
  actor: string;
  actorRole: string;
  avatar?: string;
  action: string;
  taskRef?: string;
  ip?: string;
}

export interface ProjectContributor {
  name: string;
  avatar: string;
  role: string;
  team: string;
  tasksCompleted: number;
  skusDelivered: number;
}

export interface ProjectHistoryEvent {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  type: 'milestone' | 'qc' | 'assignment' | 'delivery';
}

export interface Project {
  id: string;
  name: string;
  client: string;
  website: string;
  totalTasks: number;
  completedTasks: number;
  activeSkus: number;
  status: 'active' | 'in_review' | 'completed' | 'on_hold';
  teamLead: string;
  deadline: string;
  health: 'healthy' | 'at_risk' | 'delayed';
  contributors?: ProjectContributor[];
  history?: ProjectHistoryEvent[];
  gdriveUrl?: string;
  description?: string;
}

export interface ScrapedRecord {
  id: string;
  skuId: string;
  mpn: string;
  title: string;
  category: string;
  price: string;
  stockStatus: 'In Stock' | 'Backorder' | 'Out of Stock';
  productUrl: string;
  imageUrl: string;
  documentUrl?: string;
  description: string;
  bulletPoints: string[];
  specifications: Record<string, string>;
  hasDuplicates: boolean;
  missingFields: string[];
  status: 'valid' | 'missing_fields' | 'duplicate';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category:
    | 'task_assignment'
    | 'qc_update'
    | 'production_update'
    | 'deadline'
    | 'import_export'
    | 'gdrive'
    | 'system';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export interface EmailLog {
  id: string;
  recipient: string;
  recipientName: string;
  subject: string;
  taskRef: string;
  status: 'delivered' | 'bounced' | 'retrying' | 'sent';
  sentAt: string;
  deliveryTime: string;
}

export interface ImportExportLog {
  id: string;
  type: 'import' | 'export';
  fileName: string;
  fileType: 'xlsx' | 'csv' | 'json' | 'zip';
  recordsCount: number;
  size: string;
  status: 'completed' | 'processing' | 'failed';
  gdriveSyncStatus: 'synced' | 'pending' | 'syncing';
  uploadedBy: string;
  timestamp: string;
}

/**
 * Extracts all unique teams associated with an employee (primary team + assignedTeams).
 */
export const getEmployeeAssociatedTeams = (employee?: Employee | null): string[] => {
  if (!employee) return [];
  const teams = new Set<string>();
  if (employee.team && employee.team.trim()) teams.add(employee.team.trim());
  if (employee.assignedTeams && Array.isArray(employee.assignedTeams)) {
    employee.assignedTeams.forEach((t) => {
      if (t && t.trim()) teams.add(t.trim());
    });
  }
  return Array.from(teams);
};

/**
 * Checks whether a task belongs to or is associated with the current employee based on their role and associated teams.
 */
export const isTaskAssociatedWithEmployee = (
  task: Task,
  employee: Employee | null | undefined,
  role: UserRole
): boolean => {
  if (role === 'manager') return true;
  if (!employee) return true;

  const associatedTeams = getEmployeeAssociatedTeams(employee);

  const teamMatches = (teamA?: string, teamB?: string) => {
    if (!teamA || !teamB) return false;
    const a = teamA.toLowerCase().trim();
    const b = teamB.toLowerCase().trim();
    return a === b || a.includes(b) || b.includes(a);
  };

  if (role === 'production_user' || role === 'production_lead' || role === 'production') {
    // 1. Created by this employee
    if (task.createdBy && task.createdBy.toLowerCase() === employee.name.toLowerCase()) return true;
    // 2. Production user matches
    if (task.productionUser && task.productionUser.toLowerCase() === employee.name.toLowerCase()) return true;
    // 3. Task productionTeam matches any of employee's associated teams
    if (task.productionTeam && associatedTeams.some((t) => teamMatches(t, task.productionTeam))) {
      return true;
    }
    // 4. In case assignedTeam matches their production team (never match scraping engineering pod)
    if (
      task.assignedTeam &&
      !task.assignedTeam.toLowerCase().includes('scraping') &&
      !task.assignedTeam.toLowerCase().includes('core') &&
      associatedTeams.some((t) => teamMatches(t, task.assignedTeam))
    ) {
      return true;
    }
    return false;
  }

  if (role === 'scraper') {
    // 1. Directly assigned to this scraper
    if (task.primaryAssignee && task.primaryAssignee.toLowerCase() === employee.name.toLowerCase()) return true;
    if (task.assignedEmployees && task.assignedEmployees.some((e) => e.toLowerCase() === employee.name.toLowerCase())) {
      return true;
    }
    // 2. Task's assignedTeam matches any of scraper's associated scraping teams
    if (task.assignedTeam && associatedTeams.some((t) => teamMatches(t, task.assignedTeam))) {
      return true;
    }
    // 3. If scraping pod tasks are in triage/pending_assignment
    if (associatedTeams.some((t) => t.includes('Scraping') || t.includes('Core')) &&
        (!task.assignedTeam || task.assignedTeam.includes('Scraping') || task.assignedTeam.includes('Core'))) {
      return true;
    }
    return false;
  }

  return true;
};
