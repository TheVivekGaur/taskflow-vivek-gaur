import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import apiClient from './client';
import { tasksApi } from './tasks.api';

const mockedClient = vi.mocked(apiClient);

beforeEach(() => {
  vi.clearAllMocks();
});

const mockTask = {
  id: 't1',
  title: 'Test Task',
  description: 'desc',
  status: 'todo',
  priority: 'medium',
  assignee_id: 'u1',
  due_date: '2026-01-01',
  project_id: 'p1',
  created_at: '2026-01-01',
};

describe('tasksApi', () => {
  it('getByProject fetches tasks without filters', async () => {
    mockedClient.get.mockResolvedValue({ data: { tasks: [mockTask] } });
    const result = await tasksApi.getByProject('p1');
    expect(mockedClient.get).toHaveBeenCalledWith('/projects/p1/tasks');
    expect(result).toEqual([mockTask]);
  });

  it('getByProject appends filter params', async () => {
    mockedClient.get.mockResolvedValue({ data: { tasks: [] } });
    await tasksApi.getByProject('p1', { status: 'todo', assignee: 'u1' });
    expect(mockedClient.get).toHaveBeenCalledWith('/projects/p1/tasks?status=todo&assignee=u1');
  });

  it('create sends POST', async () => {
    mockedClient.post.mockResolvedValue({ data: mockTask });
    const result = await tasksApi.create('p1', { title: 'Test Task' });
    expect(mockedClient.post).toHaveBeenCalledWith('/projects/p1/tasks', { title: 'Test Task' });
    expect(result).toEqual(mockTask);
  });

  it('update sends PATCH', async () => {
    const updated = { ...mockTask, status: 'done' };
    mockedClient.patch.mockResolvedValue({ data: updated });
    const result = await tasksApi.update('t1', { status: 'done' });
    expect(mockedClient.patch).toHaveBeenCalledWith('/tasks/t1', { status: 'done' });
    expect(result).toEqual(updated);
  });

  it('delete sends DELETE', async () => {
    mockedClient.delete.mockResolvedValue({});
    await tasksApi.delete('t1');
    expect(mockedClient.delete).toHaveBeenCalledWith('/tasks/t1');
  });

  it('create propagates errors', async () => {
    mockedClient.post.mockRejectedValue(new Error('Failed'));
    await expect(tasksApi.create('p1', { title: 'x' })).rejects.toThrow('Failed');
  });
});
