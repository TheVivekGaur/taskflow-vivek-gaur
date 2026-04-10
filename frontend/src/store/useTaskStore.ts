import { create } from 'zustand';
import { tasksApi } from '../api/tasks.api';
import type { Task, CreateTaskPayload, UpdateTaskPayload } from '../types';

interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  fetchTasks: (projectId: string) => Promise<void>;
  addTask: (projectId: string, payload: CreateTaskPayload) => Promise<void>;
  updateTask: (taskId: string, payload: UpdateTaskPayload) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  setTasks: (tasks: Task[]) => void;
  clearError: () => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,

  fetchTasks: async (projectId: string) => {
    set({ loading: true, error: null });
    try {
      const tasks = await tasksApi.getByProject(projectId);
      set({ tasks, loading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch tasks';
      set({ error: message, loading: false });
    }
  },

  addTask: async (projectId: string, payload: CreateTaskPayload) => {
    set({ error: null });
    try {
      const newTask = await tasksApi.create(projectId, payload);
      set({ tasks: [...get().tasks, newTask] });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create task';
      set({ error: message });
      throw err;
    }
  },

  // Optimistic update with rollback
  updateTask: async (taskId: string, payload: UpdateTaskPayload) => {
    const previousTasks = [...get().tasks];
    
    // Optimistic update
    set({
      tasks: get().tasks.map((t) => (t.id === taskId ? { ...t, ...payload } : t)),
      error: null,
    });

    try {
      const updated = await tasksApi.update(taskId, payload);
      set({
        tasks: get().tasks.map((t) => (t.id === taskId ? updated : t)),
      });
    } catch (err: unknown) {
      // Rollback on failure
      const message = err instanceof Error ? err.message : 'Failed to update task';
      set({ tasks: previousTasks, error: message });
      throw err;
    }
  },

  // Optimistic delete with rollback
  deleteTask: async (taskId: string) => {
    const previousTasks = [...get().tasks];
    
    // Optimistic removal
    set({
      tasks: get().tasks.filter((t) => t.id !== taskId),
      error: null,
    });

    try {
      await tasksApi.delete(taskId);
    } catch (err: unknown) {
      // Rollback on failure
      const message = err instanceof Error ? err.message : 'Failed to delete task';
      set({ tasks: previousTasks, error: message });
      throw err;
    }
  },

  setTasks: (tasks: Task[]) => set({ tasks }),
  clearError: () => set({ error: null }),
}));
