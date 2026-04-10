import apiClient from './client';
import type { Task, TasksResponse, CreateTaskPayload, UpdateTaskPayload } from '../types';

export const tasksApi = {
  getByProject: async (projectId: string, filters?: { status?: string; assignee?: string }): Promise<Task[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.assignee) params.append('assignee', filters.assignee);
    const query = params.toString();
    const url = `/projects/${projectId}/tasks${query ? `?${query}` : ''}`;
    const { data } = await apiClient.get<TasksResponse>(url);
    return data.tasks;
  },

  create: async (projectId: string, payload: CreateTaskPayload): Promise<Task> => {
    const { data } = await apiClient.post<Task>(`/projects/${projectId}/tasks`, payload);
    return data;
  },

  update: async (taskId: string, payload: UpdateTaskPayload): Promise<Task> => {
    const { data } = await apiClient.patch<Task>(`/tasks/${taskId}`, payload);
    return data;
  },

  delete: async (taskId: string): Promise<void> => {
    await apiClient.delete(`/tasks/${taskId}`);
  },
};
