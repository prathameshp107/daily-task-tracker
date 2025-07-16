// Analytics library exports
export * from './types';
export * from './calculations';

// Re-export commonly used functions
export {
  filterTasks,
  calculateTaskCompletion,
  calculateTimeAnalytics,
  calculateProjectProgress,
  calculateProductivityMetrics,
  calculateTrends
} from './calculations';

// Date range options for filters
export const DATE_RANGE_OPTIONS = [
  { label: 'Last 7 days', value: '7d', days: 7 },
  { label: 'Last 30 days', value: '30d', days: 30 },
  { label: 'Last 90 days', value: '90d', days: 90 },
  { label: 'Last year', value: '1y', days: 365 },
  { label: 'Custom range', value: 'custom', days: 0 }
];

// Default filter state
export const DEFAULT_FILTERS: DashboardFilters = {
  dateRange: '30d',
  projects: [],
  taskTypes: [],
  statuses: []
};