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

export interface UpdateProjectDto extends Partial<CreateProjectDto> { }

export const projectService = {
  async getProjects(): Promise<Project[]> {
    const response = await apiClient.get<{ data: Project[] }>('/projects');
    // The API returns { success: boolean, data: Project[] }
    return response.data || [];
  },

  async getProjectById(projectId: string): Promise<Project> {
    const response = await apiClient.get<{ data: Project }>(`/projects/${projectId}`);
    return response.data;
  },

  async createProject(data: CreateProjectDto): Promise<Project> {
    const response = await apiClient.post<CreateProjectDto, { data: Project }>('/projects', data);
    return response.data;
  },

  async updateProject(projectId: string, updates: UpdateProjectDto): Promise<Project> {
    const response = await apiClient.put<UpdateProjectDto, { data: Project }>(
      `/projects/${projectId}`, 
      updates
    );
    return response.data;
  },

  async deleteProject(projectId: string): Promise<{ success: boolean }> {
    await apiClient.delete<{ success: boolean }>(`/projects/${projectId}`);
    return { success: true };
  },
};
