import { apiClient } from '../api/client';

export interface Integration {
  url: string;
  email?: string;
  apiToken?: string;
  apiKey?: string;
  projectKey?: string;
  projectId?: string;
  syncEnabled: boolean;
}

export interface ProjectIntegrations {
  jira?: Integration;
  redmine?: Integration;
}

export type IntegrationType = 'jira' | 'redmine';

/**
 * Get integrations for a project
 */
export async function getProjectIntegrations(projectId: string): Promise<ProjectIntegrations> {
  try {
    const response = await apiClient.get(`/api/projects/${projectId}/integrations`);
    return response.data;
  } catch (error) {
    console.error('Failed to get project integrations:', error);
    throw new Error('Failed to load project integrations');
  }
}

/**
 * Update integrations for a project
 */
export async function updateProjectIntegrations(
  projectId: string, 
  integrations: ProjectIntegrations
): Promise<ProjectIntegrations> {
  try {
    const response = await apiClient.put(`/api/projects/${projectId}/integrations`, integrations);
    return response.data;
  } catch (error) {
    console.error('Failed to update project integrations:', error);
    throw new Error('Failed to update project integrations');
  }
}

/**
 * Test integration connection
 */
export async function testConnection(
  service: IntegrationType, 
  config: Integration
): Promise<boolean> {
  try {
    const response = await apiClient.post('/api/integrations/test', {
      service,
      config
    });
    return response.data.success;
  } catch (error) {
    console.error('Failed to test integration connection:', error);
    return false;
  }
}

// Export as default object for compatibility
const integrationService = {
  getProjectIntegrations,
  updateProjectIntegrations,
  testConnection,
};

export default integrationService; 