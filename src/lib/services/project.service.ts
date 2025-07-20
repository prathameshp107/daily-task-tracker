import { apiClient } from '@/lib/api/client';
import { Project } from '@/lib/types';

export interface CreateProjectDto {
  name: string;
  description?: string;
  color?: string;
  startDate?: string;
  endDate?: string;
  client?: string;
}

export interface UpdateProjectDto extends Partial<CreateProjectDto> {}

export const projectService = {
  async getProjects(): Promise<Project[]> {
    const response = await apiClient.get('/projects');
    // Return only the array, not the whole response object
    return response.data.data || [];
  },

  async getProjectById(projectId: string): Promise<Project> {
    const response = await apiClient.get(`/projects/${projectId}`);
    return response.data;
  },

  async createProject(data: CreateProjectDto): Promise<Project> {
    const response = await apiClient.post('/projects', data);
    return response.data;
  },

  async updateProject(projectId: string, updates: UpdateProjectDto): Promise<Project> {
    const response = await apiClient.put(`/projects/${projectId}`, updates);
    return response.data;
  },

  async deleteProject(projectId: string): Promise<{ success: boolean }> {
    await apiClient.delete(`/projects/${projectId}`);
    return { success: true };
  },
};
