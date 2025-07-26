import { Integration } from './integration.service';

export interface RedmineProject {
  id: number;
  name: string;
  identifier: string;
  description?: string;
  status?: number;
  created_on?: string;
  updated_on?: string;
}

export interface RedmineIssue {
  id: number;
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
  subject: string;
  description?: string;
  start_date?: string;
  due_date?: string;
  done_ratio: number;
  estimated_hours?: number;
  created_on: string;
  updated_on: string;
  closed_on?: string;
}

interface RedmineListResponse<T> {
  [key: string]: unknown;
  total_count: number;
  offset: number;
  limit: number;
  [key: `_${string}`]: unknown;
}

interface RedmineProjectResponse extends RedmineListResponse<RedmineProject> {
  projects: RedmineProject[];
}

interface RedmineJournalDetail {
  property: string;
  name: string;
  old_value?: any;
  new_value?: any;
}

interface RedmineJournal {
  id: number;
  user: {
    id: number;
    name: string;
  };
  notes: string;
  created_on: string;
  private_notes: boolean;
  details?: RedmineJournalDetail[];
}

export interface RedmineIssueWithJournals extends RedmineIssue {
  journals?: RedmineJournal[];
}

interface RedmineIssueResponse extends RedmineListResponse<RedmineIssue> {
  issues: RedmineIssue[];
}

interface RedmineStatus {
  id: number;
  name: string;
  is_closed: boolean;
  is_default: boolean;
  position: number;
  default_done_ratio?: number;
}

interface RedmineStatusResponse {
  issue_statuses: RedmineStatus[];
}

interface RedmineIssueDetailResponse {
  issue: RedmineIssueWithJournals;
}

interface IssueStatus {
  id: number;
  name: string;
}

interface JournalDetail {
  property: string;
  name: string;
  old_value?: string;
  new_value?: string;
}

interface Journal {
  id: number;
  user: { id: number; name: string };
  created_on: string;
  details: JournalDetail[];
}

interface Issue {
  id: number;
  subject: string;
  journals: Journal[];
  // ... other fields
}

type RedmineResponse<T> = T extends RedmineProject 
  ? RedmineProjectResponse 
  : T extends RedmineIssue 
    ? RedmineIssueResponse 
    : never;

/**
 * Service for interacting with the Redmine API
 */
class RedmineService {
  private baseUrl: string;
  private apiKey: string;
  private requestCache: Map<string, Promise<any>> = new Map();
  private cacheTimeout: number = 5 * 60 * 1000; // 5 minutes cache

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    this.apiKey = apiKey;
  }

  /**
   * Generate a cache key for the request
   */
  private getCacheKey(endpoint: string, params: Record<string, string>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    return `${this.baseUrl}:${endpoint}:${sortedParams}`;
  }

  /**
   * Make an authenticated request to the Redmine API with simple caching
   */
  private async request<T>(
    endpoint: string,
    params: Record<string, string> = {}
  ): Promise<T> {
    const cacheKey = this.getCacheKey(endpoint, params);
    
    // Check if there's already a pending request for this endpoint
    if (this.requestCache.has(cacheKey)) {
      console.log(`🔄 Reusing existing request for: ${endpoint}`);
      return this.requestCache.get(cacheKey)!;
    }

    console.log(`🚀 Making new request for: ${endpoint}`);
    
    // Create the request promise
    const requestPromise = this.makeRequest<T>(endpoint, params);
    
    // Store the promise in cache
    this.requestCache.set(cacheKey, requestPromise);
    
    // Set up cache cleanup after timeout
    setTimeout(() => {
      this.requestCache.delete(cacheKey);
      console.log(`🗑️ Cache expired for: ${endpoint}`);
    }, this.cacheTimeout);
    
    try {
      const result = await requestPromise;
      return result;
    } catch (error) {
      // Remove failed request from cache immediately
      this.requestCache.delete(cacheKey);
      throw error;
    }
  }

  /**
   * Make the actual HTTP request to the Redmine API via proxy
   */
  private async makeRequest<T>(
    endpoint: string,
    params: Record<string, string> = {}
  ): Promise<T> {
    // Use the proxy API to avoid CORS issues
    const response = await fetch('/api/redmine', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: this.baseUrl,
        apiKey: this.apiKey,
        endpoint,
        params,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Redmine API error (${response.status} ${response.statusText}): ` +
        JSON.stringify(errorData)
      );
    }

    return response.json();
  }

  /**
   * Clear the request cache (useful for forced refresh)
   */
  public clearCache(): void {
    console.log('🧹 Clearing Redmine request cache');
    this.requestCache.clear();
  }

  /**
   * Find a Redmine project by name
   */
  async findProject(projectName: string): Promise<RedmineProject | null> {
    try {
      const response = await this.request<RedmineProjectResponse>('projects.json', {
        name: projectName,
      });

      // Find the project by name (case-insensitive)
      const projects = response.projects || [];
      const normalizedProjectName = projectName.toLowerCase().trim();
      
      return (
        projects.find((p) => p.name.toLowerCase() === normalizedProjectName) || null
      );
    } catch (error) {
      console.error('Error finding Redmine project:', error);
      throw new Error('Failed to find Redmine project');
    }
  }

  /**
   * Fetch all issues from Redmine for a specific project by project ID
   */
  async getIssuesByProjectId(
    projectId: string | number,
  ): Promise<RedmineIssue[]> {
    try {
      let allIssues: RedmineIssue[] = [];
      let offset = 0;
      let totalCount = 0;
      let limit = 500;
      
      do {
        const response = await this.request<RedmineIssueResponse>('issues.json', {
          project_id: projectId.toString(),
          offset: offset.toString(),
          status_id: '*', // Include both open and closed issues
          sort: 'updated_on:desc', // Most recently updated first
        });

        if (response.issues && response.issues.length > 0) {
          allIssues = [...allIssues, ...response.issues];
        }

        // Update total count on first request
        if (offset === 0 && response.total_count) {
          totalCount = response.total_count;
        }

        // If we've received all issues or hit the specified limit, stop fetching
        if (!response.issues || response.issues.length === 0 || allIssues.length >= limit) {
          break;
        }

        offset += response.issues.length;
      } while (allIssues.length < totalCount && allIssues.length < limit);

      return allIssues;
    } catch (error) {
      console.error('Error fetching Redmine issues by project ID:', error);
      throw new Error('Failed to fetch issues from Redmine project');
    }
  }

  /**
   * Fetch journal entries (history) for a specific issue
   */
  async getIssueWithJournals(issueId: string | number): Promise<RedmineIssueWithJournals> {
    try {
      const response = await this.request<RedmineIssueDetailResponse>(
        `issues/${issueId}.json`,
        {
          include: 'journals',
        }
      );
      
      return response.issue;
    } catch (error) {
      console.error(`Error fetching journal entries for issue #${issueId}:`, error);
      throw new Error(`Failed to fetch journal entries for issue #${issueId}`);
    }
  }

  /**
   * Fetch all issues assigned to the current user in a specific project with their journal entries
   */
  async getMyIssuesInProjectWithJournals(
    issues: RedmineIssue[],
    batchSize: number = 80,
    delayBetweenBatches: number = 1000
  ): Promise<RedmineIssueWithJournals[]> {
    try {
      const results: RedmineIssueWithJournals[] = [];
      
      // Process issues in batches
      for (let i = 0; i < issues.length; i += batchSize) {
        const batch = issues.slice(i, i + batchSize);
        console.log(`Processing batch ${i / batchSize + 1}/${Math.ceil(issues.length / batchSize)} (${batch.length} issues)`);
        
        // Process current batch
        const batchResults = await Promise.all(
          batch.map(async (issue) => {
            try {
              return await this.getIssueWithJournals(issue.id);
            } catch (error) {
              console.error(`Error fetching journals for issue #${issue.id}:`, error);
              return { ...issue, journals: [] };
            }
          })
        );
        
        // Add non-empty results to our final array
        const validResults = batchResults.filter(issue => (issue.journals?.length ?? 0) > 0);
        results.push(...validResults);
        
        // Add delay between batches if not the last batch
        if (i + batchSize < issues.length && delayBetweenBatches > 0) {
          await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
        }
      }
      
      console.log(`Processed ${issues.length} issues, found ${results.length} with journal entries`);
      return results;
    } catch (error) {
      console.error('Error in getMyIssuesInProjectWithJournals:', error);
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Failed to fetch issues with journal entries from Redmine project'
      );
    }
  }

  /**
   * Filter issues where the specified user has interacted (as author or in journals)
   */
  filterIssuesByUserInteraction(issues: RedmineIssueWithJournals[], userId: number): RedmineIssueWithJournals[] {
    return issues.filter(issue => {
      // Check if the user is the author of the issue
      if (issue.author?.id === userId) {
        return true;
      }

      // Check if the user has any journal entries
      if (issue.journals && issue.journals.length > 0) {
        return issue.journals.some(journal => journal.user?.id === userId);
      }

      return false;
    });
  }

  /**
   * Find a user ID by their username in Redmine
   */
  async findUserIdByUsername(username: string): Promise<number | null> {
    try {
      // First try to get the current user's info (works for non-admin users)
      const currentUser = await this.request<{ user: { login: string; id: number } }>('my/account.json');
      
      // If the requested username matches the current user, return their ID
      if (currentUser?.user?.login.toLowerCase() === username.toLowerCase()) {
        return currentUser.user.id;
      }
      
      // If not the current user, try to find in issues (fallback method)
      // This is less reliable but works without admin access
      const issues = await this.request<{ issues: Array<{ author: { id: number; name: string } }> }>('issues.json', {
        limit: '100',
        sort: 'updated_on:desc'
      });
      
      // Look for the username in recent issues
      const user = issues.issues
        .map(issue => issue.author)
        .find(author => author.name.toLowerCase() === username.toLowerCase());
      
      return user?.id || null;
      
    } catch (error) {
      console.error(`Error finding user ID for username "${username}":`, error);
      return null;
    }
  }

  async getIssuesWithUserInteraction(
    projectName: string,
    userId: number | string, // Accept both number ID or string username
  ): Promise<RedmineIssueWithJournals[]> {
    // If userId is a string (username), try to find the user ID first
    if (typeof userId === 'string') {
      const foundUserId = await this.findUserIdByUsername(userId);
      if (!foundUserId) {
        console.error(`User with username "${userId}" not found`);
        return [];
      }
      userId = foundUserId; // Use the found numeric ID
    }

    try {
      // First, get the project to verify it exists
      const project = await this.findProject(projectName);
      if (!project) {
        return [];
      }

      // Get all issues for the project
      const allIssues = await this.getIssuesByProjectId(project.id);
      
      // Get the issues with their journals
      const issuesWithJournals = await this.getMyIssuesInProjectWithJournals(allIssues);
      
      // Filter issues where the user has interacted
      const filteredIssues = this.filterIssuesByUserInteraction(issuesWithJournals, userId);

      const movedToCodeReviewIssues = this.filterIssuesUserMovedToCodeReview(filteredIssues, userId);

      const movedToFTReviewIssues = this.filterIssuesUserMovedToFTReview(filteredIssues, userId);

      // Combine both arrays and remove duplicates based on issue.id
      const combinedIssuesMap = new Map<number, RedmineIssueWithJournals>();

      [...movedToCodeReviewIssues, ...movedToFTReviewIssues].forEach(issue => {
        combinedIssuesMap.set(issue.id, issue); // Automatically overwrites duplicates
      });

      const combinedIssues = Array.from(combinedIssuesMap.values());

      return combinedIssues;

    } catch (error) {
      console.error('Error in getIssuesWithUserInteraction:', error);
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Failed to fetch issues with user interaction'
      );
    }
  }

  /**
   * Get the ID of a status by its name
   */
  private async getAllIssueStatuses(): Promise<IssueStatus[] | null> {
    try {
      const response = await this.request<{ issue_statuses: IssueStatus[] }>(
        'issue_statuses.json',
        {}
      );
  
      return response.issue_statuses;
    } catch (error) {
      console.error("❌ Error fetching issue statuses:", error);
      return null;
    }
  }

  /**
   * Get the current user's ID
   */
  private async getCurrentUserId(): Promise<number | null> {
    try {
      const userData = await this.request<any>('users/current.json', {});
      return userData.user?.id || null;
    } catch (error) {
      console.error('Error fetching current user ID:', error);
      return null;
    }
  }

  /**
   * Filter issues where the user moved the issue from "Dev" (status_id: 7) to "Code Review" (status_id: 16)
   */
  filterIssuesUserMovedToCodeReview(
    issues: RedmineIssueWithJournals[],
    userId: number
  ): RedmineIssueWithJournals[] {
    const result: RedmineIssueWithJournals[] = [];
    try {
      for (const issue of issues) {
        if (!issue.journals || issue.journals.length === 0) continue;
    
        // Filter only journals by the target user
        const userJournals = issue.journals
          .filter(j => j.user?.id === userId)
          .sort((a, b) => new Date(a.created_on).getTime() - new Date(b.created_on).getTime());
    
        let movedToDev = false;
        let movedToReview = false;
    
        for (const journal of userJournals) {
          for (const detail of journal.details ?? []) {
            if (detail.name === "status_id" && detail.new_value) {
              if (detail.new_value === "7") {
                movedToDev = true;
              } else if (movedToDev && detail.new_value === "16") {
                movedToReview = true;
              }
            }
          }
        }
    
        if (movedToDev && movedToReview) {
          result.push(issue);
        }
      }
    
      return result;
      
    } catch (error) {
      console.error('Error in filterIssuesUserMovedToCodeReview:', error);
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Failed to filter issues where user moved to code review'
      );
    }  
  }

  filterIssuesUserMovedToFTReview(
    issues: RedmineIssueWithJournals[],
    userId: number
  ): RedmineIssueWithJournals[] {
    const result: RedmineIssueWithJournals[] = [];
    try {
      for (const issue of issues) {
        if (!issue.journals || issue.journals.length === 0) continue;
  
        const userJournals = issue.journals
          .filter(j => j.user?.id === userId)
          .sort(
            (a, b) =>
              new Date(a.created_on).getTime() - new Date(b.created_on).getTime()
          );
  
        let movedToInProgress = false;
        let movedToReview = false;
  
        for (const journal of userJournals) {
          for (const detail of journal.details ?? []) {
            if (detail.name === "status_id" && detail.new_value) {
              if (detail.new_value === "2") {
                movedToInProgress = true;
              } else if (movedToInProgress && detail.new_value === "11") {
                movedToReview = true;
              }
            }
          }
        }
  
        if (movedToInProgress && movedToReview) {
          result.push(issue);
        }
      }
    } catch (error) {
      console.error("❌ Error while filtering issues for FT Review:", error);
    }
  
    return result;
  }
}

/**
 * Create a new Redmine service instance
 */
export function createRedmineService(redmineUrl: string, apiKey: string): RedmineService {
  return new RedmineService(redmineUrl, apiKey);
}

export default RedmineService;