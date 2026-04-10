import apiClient from './client';
import type { AuthResponse } from '../types';

export const authApi = {
  register: async (name: string, email: string, password: string): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/register', { name, email, password });
    return data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', { email, password });
    return data;
  },
};
