import { renderHook } from '@testing-library/react';
import {
  useAnalyticsData,
  useFilteredTasks,
  useFilterOptions,
  useAnalyticsPerformance
} from '../useAnalyticsData';
import type { Task, DashboardFilters } from '@/lib/analytics/types';

// Mock the analytics calculations module
jest.mock('@/lib/analytics', () => ({
  filterTasks: jest.fn((tasks) => tasks),
  calculateTaskCompletion: jest.fn(() => []),
  calculateTimeAnalytics: jest.fn(() => []),
  calculateProjectProgress: jest.fn(() => []),
  calculateProductivityMetrics: jest.fn(() => ({
    totalTasks: 0,
    completedTasks: 0,
    completionRate: 0,
    avgCompletionTime: 0,
    taskVelocity: 0,
    productivityScore: 0,
    mostProductiveDay: 'N/A',
    estimationAccuracy: 0
  })),
  calculateTrends: jest.fn(() => [])
}));

const mockTasks: Task[] = [
  {
    taskId: 'TASK-001',
    taskType: 'Development',
    description: 'Test task 1',
    totalHours: 8,
    approvedHours: 6,
    project: 'Project Alpha',
    month: 'January',
    status: 'done',
    completed: true
  },
  {
    taskId: 'TASK-002',
    taskType: 'Testing',
    description: 'Test task 2',
    totalHours: 4,
    approvedHours: 5,
    project: 'Project Beta',
    month: 'February',
    status: 'in-progress',
    completed: false
  }
];

const defaultFilters: DashboardFilters = {
  dateRange: '30d',
  projects: [],
  taskTypes: [],
  statuses: []
};

describe('useAnalyticsData Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console methods to avoid noise in tests
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('useAnalyticsData', () => {
    it('should return analytics data structure', () => {
      const { result } = renderHook(() => 
        useAnalyticsData(mockTasks, defaultFilters)
      );

      expect(result.current).toHaveProperty('taskCompletion');
      expect(result.current).toHaveProperty('timeAnalytics');
      expect(result.current).toHaveProperty('projectProgress');
      expect(result.current).toHaveProperty('productivityMetrics');
      expect(result.current).toHaveProperty('trends');
      expect(result.current.trends).toHaveProperty('completion');
      expect(result.current.trends).toHaveProperty('productivity');
    });

    it('should handle invalid tasks input gracefully', () => {
      const { result } = renderHook(() => 
        useAnalyticsData(null as any, defaultFilters)
      );

      expect(result.current).toBeDefined();
      expect(console.warn).toHaveBeenCalledWith(
        'useAnalyticsData: tasks is not an array, using empty array'
      );
    });

    it('should handle undefined filters gracefully', () => {
      const { result } = renderHook(() => 
        useAnalyticsData(mockTasks, null as any)
      );

      expect(result.current).toBeDefined();
      expect(console.warn).toHaveBeenCalledWith(
        'useAnalyticsData: filters is undefined, using default filters'
      );
    });

    it('should return default structure on calculation error', () => {
      // Mock an error in one of the calculation functions
      const mockError = new Error('Calculation failed');
      require('@/lib/analytics').calculateTaskCompletion.mockImplementation(() => {
        throw mockError;
      });

      const { result } = renderHook(() => 
        useAnalyticsData(mockTasks, defaultFilters)
      );

      expect(result.current).toEqual({
        taskCompletion: [],
        timeAnalytics: [],
        projectProgress: [],
        productivityMetrics: {
          totalTasks: 0,
          completedTasks: 0,
          completionRate: 0,
          avgCompletionTime: 0,
          taskVelocity: 0,
          productivityScore: 0,
          mostProductiveDay: 'N/A',
          estimationAccuracy: 0
        },
        trends: {
          completion: [],
          productivity: []
        }
      });

      expect(console.error).toHaveBeenCalledWith(
        'Error calculating analytics data:',
        mockError
      );
    });

    it('should memoize results when inputs do not change', () => {
      const { result, rerender } = renderHook(
        ({ tasks, filters }) => useAnalyticsData(tasks, filters),
        {
          initialProps: { tasks: mockTasks, filters: defaultFilters }
        }
      );

      const firstResult = result.current;

      // Rerender with same props
      rerender({ tasks: mockTasks, filters: defaultFilters });

      expect(result.current).toBe(firstResult); // Same reference due to memoization
    });
  });

  describe('useFilteredTasks', () => {
    it('should return filtered tasks', () => {
      const { result } = renderHook(() => 
        useFilteredTasks(mockTasks, defaultFilters)
      );

      expect(Array.isArray(result.current)).toBe(true);
      expect(result.current.length).toBe(mockTasks.length);
    });

    it('should handle invalid tasks input', () => {
      const { result } = renderHook(() => 
        useFilteredTasks(null as any, defaultFilters)
      );

      expect(result.current).toEqual([]);
      expect(console.warn).toHaveBeenCalledWith(
        'useFilteredTasks: tasks is not an array, returning empty array'
      );
    });

    it('should handle undefined filters', () => {
      const { result } = renderHook(() => 
        useFilteredTasks(mockTasks, null as any)
      );

      expect(result.current).toBe(mockTasks);
      expect(console.warn).toHaveBeenCalledWith(
        'useFilteredTasks: filters is undefined, returning all tasks'
      );
    });

    it('should handle filtering errors', () => {
      // Mock filterTasks to throw an error
      require('@/lib/analytics').filterTasks.mockImplementation(() => {
        throw new Error('Filter error');
      });

      const { result } = renderHook(() => 
        useFilteredTasks(mockTasks, defaultFilters)
      );

      expect(result.current).toEqual([]);
      expect(console.error).toHaveBeenCalledWith(
        'Error filtering tasks:',
        expect.any(Error)
      );
    });
  });

  describe('useFilterOptions', () => {
    it('should extract unique filter options', () => {
      const { result } = renderHook(() => 
        useFilterOptions(mockTasks)
      );

      expect(result.current).toHaveProperty('projects');
      expect(result.current).toHaveProperty('taskTypes');
      expect(result.current).toHaveProperty('statuses');
      
      expect(result.current.projects).toContain('Project Alpha');
      expect(result.current.projects).toContain('Project Beta');
      expect(result.current.taskTypes).toContain('Development');
      expect(result.current.taskTypes).toContain('Testing');
      expect(result.current.statuses).toContain('done');
      expect(result.current.statuses).toContain('in-progress');
    });

    it('should handle invalid tasks input', () => {
      const { result } = renderHook(() => 
        useFilterOptions(null as any)
      );

      expect(result.current).toEqual({
        projects: [],
        taskTypes: [],
        statuses: []
      });
      expect(console.warn).toHaveBeenCalledWith(
        'useFilterOptions: tasks is not an array, returning empty options'
      );
    });

    it('should filter out invalid tasks', () => {
      const invalidTasks = [
        ...mockTasks,
        null,
        undefined,
        { taskId: 'INVALID' }, // Missing required fields
        { project: '', taskType: '', status: 'done' } // Empty strings
      ] as any;

      const { result } = renderHook(() => 
        useFilterOptions(invalidTasks)
      );

      // Should only include valid tasks
      expect(result.current.projects).toHaveLength(2);
      expect(result.current.taskTypes).toHaveLength(2);
      expect(result.current.statuses).toHaveLength(2);
    });

    it('should sort options alphabetically', () => {
      const { result } = renderHook(() => 
        useFilterOptions(mockTasks)
      );

      const projects = result.current.projects;
      const sortedProjects = [...projects].sort();
      expect(projects).toEqual(sortedProjects);
    });
  });

  describe('useAnalyticsPerformance', () => {
    beforeEach(() => {
      // Mock performance.now()
      jest.spyOn(performance, 'now')
        .mockReturnValueOnce(1000) // Start time
        .mockReturnValueOnce(1050); // End time
    });

    it('should return analytics data and performance metrics', () => {
      const { result } = renderHook(() => 
        useAnalyticsPerformance(mockTasks, defaultFilters)
      );

      expect(result.current).toHaveProperty('analyticsData');
      expect(result.current).toHaveProperty('performanceMetrics');
      
      expect(result.current.performanceMetrics).toHaveProperty('calculationTime');
      expect(result.current.performanceMetrics).toHaveProperty('taskCount');
      expect(result.current.performanceMetrics).toHaveProperty('filteredTaskCount');
      expect(result.current.performanceMetrics).toHaveProperty('timestamp');
    });

    it('should calculate performance metrics correctly', () => {
      const { result } = renderHook(() => 
        useAnalyticsPerformance(mockTasks, defaultFilters)
      );

      const metrics = result.current.performanceMetrics;
      expect(metrics.calculationTime).toBe(50); // 1050 - 1000
      expect(metrics.taskCount).toBe(mockTasks.length);
      expect(typeof metrics.timestamp).toBe('string');
    });
  });
});