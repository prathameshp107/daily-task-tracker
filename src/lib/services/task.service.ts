import { apiClient } from '@/lib/api/client';
import { Task, TaskStatus, TaskPriority } from '@/lib/types';

export interface CreateTaskDto {
  title: string;
  description: string;
  type: string;
  projectId: string;
  projectName: string; // <-- add projectName
  status: string;
  totalHours: number;
  approvedHours: number;
  note?: string;
  month?: string;
  date?: string;
  completed: boolean;
  taskNumber: string; // <-- add this line
}

export interface UpdateTaskDto extends Partial<CreateTaskDto> {}

export interface TaskFilters {
  projectId?: string;
  status?: TaskStatus | string;
  priority?: TaskPriority | string;
  assignedTo?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  taskNumber?: string; // Optional filter for task number
  projectName?: string; // Optional filter for project name
  month?: string; // Optional filter for month
  date?: string; // Optional filter for date
  type?: string; // Optional filter for task type
}

interface PaginatedTasks {
  data: Task[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Task Service - Handles all task-related API calls
 */
export const taskService = {
  /**
   * Get tasks with optional filters and pagination
   */
  async getTasks(filters: TaskFilters = {}): Promise<Task[]> {
    try {
      const params = new URLSearchParams();
      
      // Add filters to query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });

      const response = await apiClient.get(`/tasks?${params.toString()}`);
      // Return only the array, not the whole response object
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  },

  /**
   * Get a single task by ID
   */
  async getTaskById(taskId: string): Promise<Task> {
    try {
      const response = await apiClient.get(`/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching task ${taskId}:`, error);
      throw error;
    }
  },

  /**
   * Create a new task
   */
  async createTask(taskData: CreateTaskDto): Promise<Task> {
    try {
      const response = await apiClient.post('/tasks', taskData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },

  /**
   * Update a task
   */
  async updateTask(
    taskId: string,
    updates: UpdateTaskDto
  ): Promise<Task> {
    try {
      const response = await apiClient.put(`/tasks/${taskId}`, updates);
      return response.data.data;
    } catch (error) {
      console.error(`Error updating task ${taskId}:`, error);
      throw error;
    }
  },

  /**
   * Delete a task
   */
  async deleteTask(taskId: string): Promise<{ success: boolean }> {
    try {
      await apiClient.delete(`/tasks/${taskId}`);
      return { success: true };
    } catch (error) {
      console.error(`Error deleting task ${taskId}:`, error);
      throw error;
    }
  },

  /**
   * Toggle task completion status
   */
  async toggleTaskCompletion(taskId: string, completed: boolean): Promise<Task> {
    try {
      const response = await apiClient.patch(`/tasks/${taskId}/toggle`, { completed });
      return response.data;
    } catch (error) {
      console.error(`Error toggling task ${taskId} completion:`, error);
      throw error;
    }
  },

  /**
   * Get tasks by project ID
   */
  async getTasksByProject(projectId: string, filters: Omit<TaskFilters, 'projectId'> = {}): Promise<Task[]> {
    return this.getTasks({ ...filters, projectId });
  },

  /**
   * Get tasks assigned to a user
   */
  async getTasksByUser(userId: string, filters: Omit<TaskFilters, 'assignedTo'> = {}): Promise<Task[]> {
    return this.getTasks({ ...filters, assignedTo: userId });
  },
};
