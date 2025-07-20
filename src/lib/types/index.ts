// Common types shared between frontend and backend

export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  _id: string;
  id: string;
  title: string;
  description: string;
  projectId: string;
  project: string;
  status: 'pending' | 'in-progress' | 'completed' | 'approved' | 'rejected';
  type: string;
  totalHours: number;
  approvedHours: number;
  month: string;
  note?: string;
  dueDate?: Date | string;
  estimatedHours?: number;
  actualHours?: number;
  labels?: string[];
  priority?: 'low' | 'medium' | 'high';
  assigneeId?: string;
  reporterId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  completed: boolean;
  assignedTo?: string;
}

export interface Project {
  _id: string;
  name: string;
  description?: string;
  status: 'active' | 'on-hold' | 'completed' | 'archived';
  color: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  createdBy: string;
  members: string[];
}

// For backward compatibility with existing components
export interface LegacyTask {
  taskId: string;
  taskType: string;
  description: string;
  totalHours: number;
  approvedHours: number;
  project: string;
  month: string;
  note?: string;
  status: TaskStatus;
  completed: boolean;
}

// Type guards
export function isLegacyTask(task: any): task is LegacyTask {
  return 'taskId' in task && 'taskType' in task;
}

export function isTask(task: any): task is Task {
  return '_id' in task && 'title' in task && 'projectId' in task;
}

// Utility functions to convert between task formats
export function toLegacyTask(task: Task): LegacyTask {
  return {
    taskId: task._id,
    taskType: task.labels?.[0] || 'Task',
    description: task.description,
    totalHours: task.estimatedHours,
    approvedHours: task.actualHours,
    project: task.projectName,
    month: new Date(task.dueDate).toLocaleString('default', { month: 'long' }),
    note: task.description,
    status: task.status,
    completed: task.completed
  };
}

export function fromLegacyTask(legacyTask: LegacyTask, projectId: string, userId: string): Omit<Task, '_id' | 'createdAt' | 'updatedAt'> {
  return {
    title: legacyTask.description,
    description: legacyTask.note || legacyTask.description,
    projectId,
    projectName: legacyTask.project,
    status: legacyTask.status,
    priority: 'medium', // Default priority
    estimatedHours: legacyTask.totalHours,
    actualHours: legacyTask.approvedHours,
    dueDate: new Date().toISOString(), // Default to current date
    createdBy: userId,
    completed: legacyTask.completed,
    labels: [legacyTask.taskType]
  };
}
