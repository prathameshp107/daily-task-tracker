/**
 * Service exports for the application
 */

// Authentication
export { authService } from './auth.service';
// Project management
export { projectService } from './project.service';
// Task management
export { taskService } from './task.service';
// Analytics
export { analyticsService } from './analytics.service';
// Leave and working days
export { leaveService } from './leave.service';
// Integrations
export { integrationService } from './integration.service';
// API client
export { apiClient } from '../api/client';
// Export types
export * from './auth.service';
export * from './project.service';
export * from './task.service';
export * from './analytics.service';
export * from './leave.service';
export * from './integration.service';