import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTaskStore } from './useTaskStore';
import type { Task } from '../types';

const mockTask: Task = {
  id: 't1',
  title: 'Test Task',
  description: 'desc',
  status: 'todo',
  priority: 'medium',
  assignee_id: 'u1',
  due_date: '2025-01-01',
  project_id: 'p1',
  created_at: '2025-01-01',
};

vi.mock('../api/tasks.api', () => ({
  tasksApi: {
    getByProject: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

import { tasksApi } from '../api/tasks.api';
const mockedApi = vi.mocked(tasksApi);

beforeEach(() => {
  useTaskStore.setState({ tasks: [], loading: false, error: null });
  vi.clearAllMocks();
});

describe('useTaskStore', () => {
  it('fetchTasks populates tasks', async () => {
    mockedApi.getByProject.mockResolvedValue([mockTask]);
    await useTaskStore.getState().fetchTasks('p1');
    expect(useTaskStore.getState().tasks).toEqual([mockTask]);
    expect(useTaskStore.getState().loading).toBe(false);
  });

  it('fetchTasks sets error on failure', async () => {
    mockedApi.getByProject.mockRejectedValue(new Error('Network error'));
    await useTaskStore.getState().fetchTasks('p1');
    expect(useTaskStore.getState().error).toBe('Network error');
    expect(useTaskStore.getState().tasks).toEqual([]);
  });

  it('addTask appends to tasks', async () => {
    mockedApi.create.mockResolvedValue(mockTask);
    await useTaskStore.getState().addTask('p1', { title: 'Test Task' });
    expect(useTaskStore.getState().tasks).toHaveLength(1);
    expect(useTaskStore.getState().tasks[0].id).toBe('t1');
  });

  it('updateTask applies optimistic update', async () => {
    useTaskStore.setState({ tasks: [mockTask] });
    mockedApi.update.mockResolvedValue({ ...mockTask, status: 'done' });

    await useTaskStore.getState().updateTask('t1', { status: 'done' });
    expect(useTaskStore.getState().tasks[0].status).toBe('done');
  });

  it('updateTask rolls back on failure', async () => {
    useTaskStore.setState({ tasks: [mockTask] });
    mockedApi.update.mockRejectedValue(new Error('Server error'));

    await expect(useTaskStore.getState().updateTask('t1', { status: 'done' })).rejects.toThrow();
    expect(useTaskStore.getState().tasks[0].status).toBe('todo');
    expect(useTaskStore.getState().error).toBe('Server error');
  });

  it('deleteTask removes task optimistically', async () => {
    useTaskStore.setState({ tasks: [mockTask] });
    mockedApi.delete.mockResolvedValue(undefined);

    await useTaskStore.getState().deleteTask('t1');
    expect(useTaskStore.getState().tasks).toHaveLength(0);
  });

  it('deleteTask rolls back on failure', async () => {
    useTaskStore.setState({ tasks: [mockTask] });
    mockedApi.delete.mockRejectedValue(new Error('Delete failed'));

    await expect(useTaskStore.getState().deleteTask('t1')).rejects.toThrow();
    expect(useTaskStore.getState().tasks).toHaveLength(1);
    expect(useTaskStore.getState().error).toBe('Delete failed');
  });

  it('setTasks directly sets tasks', () => {
    useTaskStore.getState().setTasks([mockTask]);
    expect(useTaskStore.getState().tasks).toEqual([mockTask]);
  });

  it('clearError resets error', () => {
    useTaskStore.setState({ error: 'some error' });
    useTaskStore.getState().clearError();
    expect(useTaskStore.getState().error).toBeNull();
  });
});
