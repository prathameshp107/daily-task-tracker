import { apiClient } from '@/lib/api/client';

export interface ProductivityMetrics {
  totalHours: number;
  approvedHours: number;
  pendingApprovalHours: number;
  taskCounts: {
    pending: number;
    inProgress: number;
    completed: number;
    approved: number;
  };
  projectSummaries: Array<{
    projectId: string;
    projectName: string;
    totalHours: number;
    taskCount: number;
  }>;
}

export interface TrendDataPoint {
  period: string; // Date or period identifier
  totalHours: number;
  approvedHours: number;
  taskCount: number;
  completionRate: number;
}

export interface TrendFilters {
  range?: 'day' | 'week' | 'month' | 'year';
  startDate?: string;
  endDate?: string;
  projectId?: string;
}

export interface ExportOptions {
  format: 'json' | 'csv' | 'xlsx';
  startDate?: string;
  endDate?: string;
  projectId?: string;
  includeTasks?: boolean;
  includeProjects?: boolean;
}

export const analyticsService = {
  /**
   * Get productivity overview metrics
   */
  async getProductivityOverview(
    filters: { startDate?: string; endDate?: string; projectId?: string } = {}
  ): Promise<ProductivityMetrics> {
    try {
      const params = new URLSearchParams();
      
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.projectId) params.append('projectId', filters.projectId);
      
      return await apiClient.get<ProductivityMetrics>(
        `/analytics/overview?${params.toString()}`
      );
    } catch (error) {
      console.error('Failed to fetch productivity overview:', error);
      throw error;
    }
  },

  /**
   * Get productivity trends over time
   */
  async getProductivityTrends(
    filters: TrendFilters = {}
  ): Promise<{ data: TrendDataPoint[]; range: string }> {
    try {
      const params = new URLSearchParams();
      
      if (filters.range) params.append('range', filters.range);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.projectId) params.append('projectId', filters.projectId);
      
      return await apiClient.get<{ data: TrendDataPoint[]; range: string }>(
        `/analytics/trends?${params.toString()}`
      );
    } catch (error) {
      console.error('Failed to fetch productivity trends:', error);
      throw error;
    }
  },

  /**
   * Export analytics data
   */
  async exportData(
    options: ExportOptions
  ): Promise<Blob | string> {
    try {
      const params = new URLSearchParams();
      
      params.append('format', options.format);
      if (options.startDate) params.append('startDate', options.startDate);
      if (options.endDate) params.append('endDate', options.endDate);
      if (options.projectId) params.append('projectId', options.projectId);
      if (options.includeTasks !== undefined) params.append('includeTasks', String(options.includeTasks));
      if (options.includeProjects !== undefined) params.append('includeProjects', String(options.includeProjects));
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || '/api'}/analytics/export?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to export data');
      }

      if (options.format === 'json') {
        return await response.json();
      } else {
        return await response.blob();
      }
    } catch (error) {
      console.error('Failed to export analytics data:', error);
      throw error;
    }
  },
};
