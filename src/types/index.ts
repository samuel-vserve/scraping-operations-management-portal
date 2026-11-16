export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus =
  | 'pending_assignment'
  | 'in_progress'
  | 'awaiting_manager_qc'
  | 'rework_required'
  | 'production_pending'
  | 'completed'
  | 'rejected';

export type UserRole = 'manager' | 'production' | 'scraper' | 'guest';

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
  avatar: string;
  role: string;
  team: string;
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
  teamType?: 'scraping' | 'production';
  leader: string;
  leaderAvatar: string;
  members: string[]; // employee ids or names
  activeTasks: number;
  completedTasks: number;
  pendingTasks: number;
  completionRate: number;
  productivity: number; // index e.g. 94.2
  websitesManaged: string[];
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
