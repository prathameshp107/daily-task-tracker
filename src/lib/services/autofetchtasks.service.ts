import { createRedmineService, RedmineIssueWithJournals } from './redmine.service';
import RedmineServiceManager from './redmine-service-manager';

export interface AutoFetchTask {
  id: number;
  subject: string;
  project: {
    id: number;
    name: string;
  };
  tracker: {
    id: number;
    name: string;
  };
  status: {
    id: number;
    name: string;
    is_closed?: boolean;
  };
  priority: {
    id: number;
    name: string;
  };
  author: {
    id: number;
    name: string;
  };
  assigned_to?: {
    id: number;
    name: string;
  };
  description?: string;
  start_date?: string;
  due_date?: string;
  done_ratio: number;
  estimated_hours?: number;
  spent_hours?: number;
  total_spent_hours?: number;
  custom_fields?: Array<{
    id: number;
    name: string;
    value: string;
  }>;
  created_on: string;
  updated_on: string;
  closed_on?: string;
  journals?: any[];
  notes?: string;
}

/**
 * Service for auto-fetching tasks from Redmine
 * This service provides read-only access to tasks from Redmine API
 */
class AutoFetchTasksService {
  private redmineService: any;
  private redmineUrl: string;
  private apiKey: string;

  constructor(redmineUrl: string, apiKey: string) {
    this.redmineUrl = redmineUrl;
    this.apiKey = apiKey;
    // Use the service manager to get a shared instance
    this.redmineService = RedmineServiceManager.getInstance().getService(redmineUrl, apiKey);
  }

  /**
   * Get all tasks from Redmine for a specific project and user
   * This is the main method for auto-fetching tasks
   */
  async getTasks(projectName: string, userId: number | string): Promise<AutoFetchTask[]> {
    try {
      const issues = await this.redmineService.getIssuesWithUserInteraction(projectName, userId);
      
      // Transform Redmine issues to AutoFetchTask format - pass through all data
      return issues.map((issue: any): AutoFetchTask => ({
        id: issue.id,
        subject: issue.subject,
        project: issue.project,
        tracker: issue.tracker,
        status: issue.status,
        priority: issue.priority,
        author: issue.author,
        assigned_to: issue.assigned_to,
        description: issue.description,
        start_date: issue.start_date,
        due_date: issue.due_date,
        done_ratio: issue.done_ratio,
        estimated_hours: issue.estimated_hours,
        spent_hours: issue.spent_hours,
        total_spent_hours: issue.total_spent_hours,
        custom_fields: issue.custom_fields,
        created_on: issue.created_on,
        updated_on: issue.updated_on,
        closed_on: issue.closed_on,
        journals: issue.journals,
        notes: issue.notes
      }));
    } catch (error) {
      console.error('Error fetching auto-fetch tasks:', error);
      throw new Error('Failed to fetch tasks from Redmine');
    }
  }

  /**
   * Get tasks by project ID
   */
  async getTasksByProjectId(projectId: string | number): Promise<AutoFetchTask[]> {
    try {
      const issues = await this.redmineService.getIssuesByProjectId(projectId);
      
      return issues.map((issue: any): AutoFetchTask => ({
        id: issue.id,
        subject: issue.subject,
        project: issue.project,
        tracker: issue.tracker,
        status: issue.status,
        priority: issue.priority,
        author: issue.author,
        assigned_to: issue.assigned_to,
        description: issue.description,
        start_date: issue.start_date,
        due_date: issue.due_date,
        done_ratio: issue.done_ratio,
        estimated_hours: issue.estimated_hours,
        spent_hours: issue.spent_hours,
        total_spent_hours: issue.total_spent_hours,
        custom_fields: issue.custom_fields,
        created_on: issue.created_on,
        updated_on: issue.updated_on,
        closed_on: issue.closed_on,
        journals: issue.journals,
        notes: issue.notes
      }));
    } catch (error) {
      console.error('Error fetching tasks by project ID:', error);
      throw new Error('Failed to fetch tasks by project ID');
    }
  }

  /**
   * Find project by name
   */
  async findProject(projectName: string) {
    try {
      return await this.redmineService.findProject(projectName);
    } catch (error) {
      console.error('Error finding project:', error);
      throw new Error('Failed to find project');
    }
  }

  /**
   * Find user ID by username
   */
  async findUserIdByUsername(username: string): Promise<number | null> {
    try {
      return await this.redmineService.findUserIdByUsername(username);
    } catch (error) {
      console.error('Error finding user ID:', error);
      return null;
    }
  }

  /**
   * Clear the request cache for forced refresh
   */
  clearCache(): void {
    RedmineServiceManager.getInstance().clearServiceCache(this.redmineUrl, this.apiKey);
  }
}

/**
 * Create a new AutoFetchTasks service instance
 */
export function createAutoFetchTasksService(redmineUrl: string, apiKey: string): AutoFetchTasksService {
  return new AutoFetchTasksService(redmineUrl, apiKey);
}

export default AutoFetchTasksService;