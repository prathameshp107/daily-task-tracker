// Analytics calculation utilities
import { format, subDays, startOfDay, endOfDay, differenceInDays, parseISO, isValid } from 'date-fns';
import type { 
  Task, 
  TaskCompletionData, 
  TimeAnalyticsData, 
  ProjectProgressData, 
  ProductivityMetrics,
  DashboardFilters,
  TrendData 
} from './types';

/**
 * Filter tasks based on dashboard filters
 */
export function filterTasks(tasks: Task[], filters: DashboardFilters): Task[] {
  return tasks.filter(task => {
    // Date range filtering (using month field as proxy for task date)
    const taskDate = getTaskDate(task);
    if (!isWithinDateRange(taskDate, filters.dateRange, filters.customDateRange)) {
      return false;
    }

    // Project filtering
    if (filters.projects.length > 0 && !filters.projects.includes(task.project)) {
      return false;
    }

    // Task type filtering
    if (filters.taskTypes.length > 0 && !filters.taskTypes.includes(task.taskType)) {
      return false;
    }

    // Status filtering
    if (filters.statuses.length > 0 && !filters.statuses.includes(task.status)) {
      return false;
    }

    return true;
  });
}

/**
 * Calculate task completion data over time
 */
export function calculateTaskCompletion(tasks: Task[], dateRange: string = '30d'): TaskCompletionData[] {
  const days = getDaysFromRange(dateRange);
  const endDate = new Date();
  const startDate = subDays(endDate, days);
  
  const completionData: TaskCompletionData[] = [];
  
  for (let i = 0; i <= days; i++) {
    const currentDate = subDays(endDate, days - i);
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    
    // Filter tasks up to current date
    const tasksUpToDate = tasks.filter(task => {
      const taskDate = getTaskDate(task);
      return taskDate <= currentDate;
    });
    
    const completed = tasksUpToDate.filter(task => task.status === 'done').length;
    const total = tasksUpToDate.length;
    const pending = total - completed;
    
    completionData.push({
      date: dateStr,
      completed,
      pending,
      total,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    });
  }
  
  return completionData;
}

/**
 * Calculate time analytics data
 */
export function calculateTimeAnalytics(tasks: Task[]): TimeAnalyticsData[] {
  const projectMap = new Map<string, {
    estimatedHours: number;
    actualHours: number;
    taskCount: number;
    taskType: string;
  }>();

  tasks.forEach(task => {
    const key = `${task.project}-${task.taskType}`;
    const existing = projectMap.get(key) || {
      estimatedHours: 0,
      actualHours: 0,
      taskCount: 0,
      taskType: task.taskType
    };

    existing.estimatedHours += task.approvedHours;
    existing.actualHours += task.totalHours;
    existing.taskCount += 1;
    
    projectMap.set(key, existing);
  });

  return Array.from(projectMap.entries()).map(([key, data]) => {
    const [project] = key.split('-');
    const accuracy = data.estimatedHours > 0 
      ? Math.round((1 - Math.abs(data.actualHours - data.estimatedHours) / data.estimatedHours) * 100)
      : 0;
    
    return {
      project,
      taskType: data.taskType,
      estimatedHours: Math.round(data.estimatedHours * 10) / 10,
      actualHours: Math.round(data.actualHours * 10) / 10,
      accuracy: Math.max(0, accuracy),
      variance: Math.round((data.actualHours - data.estimatedHours) * 10) / 10
    };
  });
}

/**
 * Calculate project progress data
 */
export function calculateProjectProgress(tasks: Task[]): ProjectProgressData[] {
  const projectMap = new Map<string, {
    total: number;
    completed: number;
    inProgress: number;
    todo: number;
    totalHours: number;
    completedHours: number;
  }>();

  tasks.forEach(task => {
    const existing = projectMap.get(task.project) || {
      total: 0,
      completed: 0,
      inProgress: 0,
      todo: 0,
      totalHours: 0,
      completedHours: 0
    };

    existing.total += 1;
    existing.totalHours += task.totalHours;
    
    switch (task.status) {
      case 'done':
        existing.completed += 1;
        existing.completedHours += task.totalHours;
        break;
      case 'in-progress':
        existing.inProgress += 1;
        break;
      case 'todo':
        existing.todo += 1;
        break;
    }
    
    projectMap.set(task.project, existing);
  });

  return Array.from(projectMap.entries()).map(([project, data]) => ({
    project,
    totalTasks: data.total,
    completedTasks: data.completed,
    inProgressTasks: data.inProgress,
    todoTasks: data.todo,
    completionPercentage: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
    avgCompletionTime: data.completed > 0 ? Math.round((data.completedHours / data.completed) * 10) / 10 : 0,
    overdueTasks: 0 // Will be calculated based on due dates when available
  }));
}

/**
 * Calculate productivity metrics
 */
export function calculateProductivityMetrics(tasks: Task[]): ProductivityMetrics {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'done').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Calculate average completion time (using hours as proxy)
  const completedTasksData = tasks.filter(task => task.status === 'done');
  const avgCompletionTime = completedTasksData.length > 0
    ? Math.round((completedTasksData.reduce((sum, task) => sum + task.totalHours, 0) / completedTasksData.length) * 10) / 10
    : 0;

  // Calculate task velocity (tasks per week)
  const taskVelocity = Math.round((completedTasks / 4) * 10) / 10; // Assuming 4 weeks of data

  // Calculate productivity score (0-100)
  const productivityScore = Math.round((completionRate * 0.4) + (Math.min(taskVelocity * 10, 40)) + (Math.min(avgCompletionTime > 0 ? 100 / avgCompletionTime : 0, 20)));

  // Find most productive day (mock data for now)
  const mostProductiveDay = 'Tuesday';

  // Calculate estimation accuracy
  const tasksWithEstimates = tasks.filter(task => task.approvedHours > 0);
  const estimationAccuracy = tasksWithEstimates.length > 0
    ? Math.round(tasksWithEstimates.reduce((sum, task) => {
        const accuracy = 1 - Math.abs(task.totalHours - task.approvedHours) / task.approvedHours;
        return sum + Math.max(0, accuracy);
      }, 0) / tasksWithEstimates.length * 100)
    : 0;

  return {
    totalTasks,
    completedTasks,
    completionRate,
    avgCompletionTime,
    taskVelocity,
    productivityScore: Math.min(100, Math.max(0, productivityScore)),
    mostProductiveDay,
    estimationAccuracy
  };
}

/**
 * Calculate trend data
 */
export function calculateTrends(tasks: Task[], metric: 'completion' | 'productivity'): TrendData[] {
  // Mock implementation - in real app, this would compare periods
  const periods = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
  
  return periods.map((period, index) => {
    const value = metric === 'completion' 
      ? Math.round(Math.random() * 100)
      : Math.round(Math.random() * 50 + 50);
    
    const previousValue = index > 0 ? Math.round(Math.random() * 100) : value;
    const change = previousValue > 0 ? Math.round(((value - previousValue) / previousValue) * 100) : 0;
    
    return {
      period,
      value,
      change,
      trend: change > 5 ? 'up' : change < -5 ? 'down' : 'neutral'
    };
  });
}

// Helper functions

function getTaskDate(task: Task): Date {
  // For now, use current date minus random days based on month
  // In real implementation, tasks would have actual date fields
  const monthIndex = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'].indexOf(task.month);
  
  const currentDate = new Date();
  const taskDate = new Date(currentDate.getFullYear(), monthIndex, Math.floor(Math.random() * 28) + 1);
  
  return taskDate;
}

function isWithinDateRange(
  date: Date, 
  range: string, 
  customRange?: { start: Date; end: Date }
): boolean {
  const now = new Date();
  
  if (range === 'custom' && customRange) {
    return date >= customRange.start && date <= customRange.end;
  }
  
  const days = getDaysFromRange(range);
  const startDate = subDays(now, days);
  
  return date >= startDate && date <= now;
}

function getDaysFromRange(range: string): number {
  switch (range) {
    case '7d': return 7;
    case '30d': return 30;
    case '90d': return 90;
    case '1y': return 365;
    default: return 30;
  }
}