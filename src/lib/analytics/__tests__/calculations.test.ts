import {
  filterTasks,
  calculateTaskCompletion,
  calculateTimeAnalytics,
  calculateProjectProgress,
  calculateProductivityMetrics,
  calculateTrends
} from '../calculations';
import type { Task, DashboardFilters } from '../types';

// Mock task data for testing
const mockTasks: Task[] = [
  {
    taskId: 'TASK-001',
    taskType: 'Development',
    description: 'Implement user authentication',
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
    description: 'Write unit tests',
    totalHours: 4,
    approvedHours: 5,
    project: 'Project Alpha',
    month: 'January',
    status: 'in-progress',
    completed: false
  },
  {
    taskId: 'TASK-003',
    taskType: 'Design',
    description: 'Create UI mockups',
    totalHours: 6,
    approvedHours: 4,
    project: 'Project Beta',
    month: 'February',
    status: 'done',
    completed: true
  },
  {
    taskId: 'TASK-004',
    taskType: 'Development',
    description: 'API integration',
    totalHours: 0,
    approvedHours: 8,
    project: 'Project Beta',
    month: 'February',
    status: 'todo',
    completed: false
  }
];

const defaultFilters: DashboardFilters = {
  dateRange: '30d',
  projects: [],
  taskTypes: [],
  statuses: []
};

describe('Analytics Calculations', () => {
  describe('filterTasks', () => {
    it('should return all tasks when no filters are applied', () => {
      const result = filterTasks(mockTasks, defaultFilters);
      expect(result).toHaveLength(4);
    });

    it('should filter tasks by project', () => {
      const filters: DashboardFilters = {
        ...defaultFilters,
        projects: ['Project Alpha']
      };
      const result = filterTasks(mockTasks, filters);
      expect(result).toHaveLength(2);
      expect(result.every(task => task.project === 'Project Alpha')).toBe(true);
    });

    it('should filter tasks by task type', () => {
      const filters: DashboardFilters = {
        ...defaultFilters,
        taskTypes: ['Development']
      };
      const result = filterTasks(mockTasks, filters);
      expect(result).toHaveLength(2);
      expect(result.every(task => task.taskType === 'Development')).toBe(true);
    });

    it('should filter tasks by status', () => {
      const filters: DashboardFilters = {
        ...defaultFilters,
        statuses: ['done']
      };
      const result = filterTasks(mockTasks, filters);
      expect(result).toHaveLength(2);
      expect(result.every(task => task.status === 'done')).toBe(true);
    });

    it('should handle empty task array', () => {
      const result = filterTasks([], defaultFilters);
      expect(result).toHaveLength(0);
    });
  });

  describe('calculateTaskCompletion', () => {
    it('should calculate task completion data correctly', () => {
      const result = calculateTaskCompletion(mockTasks, '30d');
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      
      // Check data structure
      const firstEntry = result[0];
      expect(firstEntry).toHaveProperty('date');
      expect(firstEntry).toHaveProperty('completed');
      expect(firstEntry).toHaveProperty('pending');
      expect(firstEntry).toHaveProperty('total');
      expect(firstEntry).toHaveProperty('completionRate');
    });

    it('should handle empty task array', () => {
      const result = calculateTaskCompletion([], '30d');
      expect(Array.isArray(result)).toBe(true);
      // Should still return data points with zero values
      expect(result.length).toBeGreaterThan(0);
      expect(result.every(entry => entry.completed === 0 && entry.total === 0)).toBe(true);
    });

    it('should calculate completion rates correctly', () => {
      const completedTasks = mockTasks.filter(task => task.status === 'done');
      const result = calculateTaskCompletion(mockTasks, '7d');
      
      // Last entry should reflect current state
      const lastEntry = result[result.length - 1];
      expect(lastEntry.completed).toBe(completedTasks.length);
      expect(lastEntry.total).toBe(mockTasks.length);
      expect(lastEntry.completionRate).toBe(Math.round((completedTasks.length / mockTasks.length) * 100));
    });
  });

  describe('calculateTimeAnalytics', () => {
    it('should calculate time analytics correctly', () => {
      const result = calculateTimeAnalytics(mockTasks);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      
      // Check data structure
      const firstEntry = result[0];
      expect(firstEntry).toHaveProperty('project');
      expect(firstEntry).toHaveProperty('taskType');
      expect(firstEntry).toHaveProperty('estimatedHours');
      expect(firstEntry).toHaveProperty('actualHours');
      expect(firstEntry).toHaveProperty('accuracy');
      expect(firstEntry).toHaveProperty('variance');
    });

    it('should handle empty task array', () => {
      const result = calculateTimeAnalytics([]);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(0);
    });

    it('should calculate accuracy correctly', () => {
      const singleTask: Task[] = [{
        taskId: 'TEST-001',
        taskType: 'Development',
        description: 'Test task',
        totalHours: 8,
        approvedHours: 10,
        project: 'Test Project',
        month: 'January',
        status: 'done',
        completed: true
      }];
      
      const result = calculateTimeAnalytics(singleTask);
      expect(result).toHaveLength(1);
      
      const entry = result[0];
      expect(entry.estimatedHours).toBe(10);
      expect(entry.actualHours).toBe(8);
      expect(entry.variance).toBe(-2); // actual - estimated
      expect(entry.accuracy).toBeGreaterThan(0);
    });
  });

  describe('calculateProjectProgress', () => {
    it('should calculate project progress correctly', () => {
      const result = calculateProjectProgress(mockTasks);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2); // Two unique projects
      
      // Check data structure
      const firstProject = result[0];
      expect(firstProject).toHaveProperty('project');
      expect(firstProject).toHaveProperty('totalTasks');
      expect(firstProject).toHaveProperty('completedTasks');
      expect(firstProject).toHaveProperty('inProgressTasks');
      expect(firstProject).toHaveProperty('todoTasks');
      expect(firstProject).toHaveProperty('completionPercentage');
      expect(firstProject).toHaveProperty('avgCompletionTime');
      expect(firstProject).toHaveProperty('overdueTasks');
    });

    it('should handle empty task array', () => {
      const result = calculateProjectProgress([]);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(0);
    });

    it('should calculate completion percentages correctly', () => {
      const result = calculateProjectProgress(mockTasks);
      
      // Find Project Alpha (has 1 done, 1 in-progress)
      const projectAlpha = result.find(p => p.project === 'Project Alpha');
      expect(projectAlpha).toBeDefined();
      expect(projectAlpha!.totalTasks).toBe(2);
      expect(projectAlpha!.completedTasks).toBe(1);
      expect(projectAlpha!.completionPercentage).toBe(50);
    });
  });

  describe('calculateProductivityMetrics', () => {
    it('should calculate productivity metrics correctly', () => {
      const result = calculateProductivityMetrics(mockTasks);
      
      expect(result).toHaveProperty('totalTasks');
      expect(result).toHaveProperty('completedTasks');
      expect(result).toHaveProperty('completionRate');
      expect(result).toHaveProperty('avgCompletionTime');
      expect(result).toHaveProperty('taskVelocity');
      expect(result).toHaveProperty('productivityScore');
      expect(result).toHaveProperty('mostProductiveDay');
      expect(result).toHaveProperty('estimationAccuracy');
      
      expect(result.totalTasks).toBe(4);
      expect(result.completedTasks).toBe(2);
      expect(result.completionRate).toBe(50);
    });

    it('should handle empty task array', () => {
      const result = calculateProductivityMetrics([]);
      
      expect(result.totalTasks).toBe(0);
      expect(result.completedTasks).toBe(0);
      expect(result.completionRate).toBe(0);
      expect(result.avgCompletionTime).toBe(0);
      expect(result.taskVelocity).toBe(0);
      expect(result.productivityScore).toBeGreaterThanOrEqual(0);
      expect(result.productivityScore).toBeLessThanOrEqual(100);
    });

    it('should calculate estimation accuracy correctly', () => {
      const result = calculateProductivityMetrics(mockTasks);
      expect(result.estimationAccuracy).toBeGreaterThanOrEqual(0);
      expect(result.estimationAccuracy).toBeLessThanOrEqual(100);
    });
  });

  describe('calculateTrends', () => {
    it('should calculate completion trends', () => {
      const result = calculateTrends(mockTasks, 'completion');
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      
      // Check data structure
      const firstTrend = result[0];
      expect(firstTrend).toHaveProperty('period');
      expect(firstTrend).toHaveProperty('value');
      expect(firstTrend).toHaveProperty('change');
      expect(firstTrend).toHaveProperty('trend');
      expect(['up', 'down', 'neutral']).toContain(firstTrend.trend);
    });

    it('should calculate productivity trends', () => {
      const result = calculateTrends(mockTasks, 'productivity');
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      
      // Check data structure
      const firstTrend = result[0];
      expect(firstTrend).toHaveProperty('period');
      expect(firstTrend).toHaveProperty('value');
      expect(firstTrend).toHaveProperty('change');
      expect(firstTrend).toHaveProperty('trend');
    });

    it('should handle empty task array', () => {
      const result = calculateTrends([], 'completion');
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0); // Should still return trend periods
    });
  });
});