// Analytics data types and interfaces

export interface Task {
  taskId: string;
  taskType: string;
  description: string;
  totalHours: number;
  approvedHours: number;
  project: string;
  month: string;
  note?: string;
  status: 'todo' | 'in-progress' | 'done';
  completed: boolean;
}

export interface TaskCompletionData {
  date: string;
  completed: number;
  pending: number;
  total: number;
  completionRate: number;
}

export interface TimeAnalyticsData {
  project: string;
  taskType: string;
  estimatedHours: number;
  actualHours: number;
  accuracy: number;
  variance: number;
}

export interface ProjectProgressData {
  project: string;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  completionPercentage: number;
  avgCompletionTime: number;
  overdueTasks: number;
}

export interface ProductivityMetrics {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  avgCompletionTime: number; // in days
  taskVelocity: number; // tasks per week
  productivityScore: number; // 0-100 scale
  mostProductiveDay: string;
  estimationAccuracy: number;
}

export interface TrendData {
  period: string;
  value: number;
  change: number; // percentage change from previous period
  trend: 'up' | 'down' | 'neutral';
}

export interface DashboardFilters {
  dateRange: '7d' | '30d' | '90d' | '1y' | 'custom';
  projects: string[];
  taskTypes: string[];
  statuses: ('todo' | 'in-progress' | 'done')[];
  customDateRange?: {
    start: Date;
    end: Date;
  };
}

export interface AnalyticsData {
  taskCompletion: TaskCompletionData[];
  timeAnalytics: TimeAnalyticsData[];
  projectProgress: ProjectProgressData[];
  productivityMetrics: ProductivityMetrics;
  trends: {
    completion: TrendData[];
    productivity: TrendData[];
  };
}

export interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  icon: string;
  description: string;
}

export interface ExportOptions {
  format: 'pdf' | 'csv' | 'png';
  includeCharts: boolean;
  dateRange: string;
  filters: DashboardFilters;
}

export interface DateRange {
  label: string;
  value: string;
  days: number;
}