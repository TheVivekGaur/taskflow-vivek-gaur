import apiClient from './client';
import type { Project, ProjectsResponse, ProjectDetailResponse, CreateProjectPayload, UpdateProjectPayload } from '../types';

export const projectsApi = {
  getAll: async (): Promise<Project[]> => {
    const { data } = await apiClient.get<ProjectsResponse>('/projects');
    return data.projects;
  },

  getById: async (id: string): Promise<ProjectDetailResponse> => {
    const { data } = await apiClient.get<ProjectDetailResponse>(`/projects/${id}`);
    return data;
  },

  create: async (payload: CreateProjectPayload): Promise<Project> => {
    const { data } = await apiClient.post<Project>('/projects', payload);
    return data;
  },

  update: async (id: string, payload: UpdateProjectPayload): Promise<Project> => {
    const { data } = await apiClient.patch<Project>(`/projects/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/projects/${id}`);
  },
};
