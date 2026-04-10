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
import { projectsApi } from './projects.api';

const mockedClient = vi.mocked(apiClient);

beforeEach(() => {
  vi.clearAllMocks();
});

const mockProject = {
  id: 'p1',
  name: 'Test Project',
  description: 'desc',
  owner_id: 'u1',
  created_at: '2026-01-01',
};

describe('projectsApi', () => {
  it('getAll fetches projects', async () => {
    mockedClient.get.mockResolvedValue({ data: { projects: [mockProject] } });
    const result = await projectsApi.getAll();
    expect(mockedClient.get).toHaveBeenCalledWith('/projects');
    expect(result).toEqual([mockProject]);
  });

  it('getById fetches single project', async () => {
    const detail = { ...mockProject, tasks: [] };
    mockedClient.get.mockResolvedValue({ data: detail });
    const result = await projectsApi.getById('p1');
    expect(mockedClient.get).toHaveBeenCalledWith('/projects/p1');
    expect(result).toEqual(detail);
  });

  it('create sends POST', async () => {
    mockedClient.post.mockResolvedValue({ data: mockProject });
    const result = await projectsApi.create({ name: 'Test Project', description: 'desc' });
    expect(mockedClient.post).toHaveBeenCalledWith('/projects', { name: 'Test Project', description: 'desc' });
    expect(result).toEqual(mockProject);
  });

  it('update sends PATCH', async () => {
    const updated = { ...mockProject, name: 'Updated' };
    mockedClient.patch.mockResolvedValue({ data: updated });
    const result = await projectsApi.update('p1', { name: 'Updated' });
    expect(mockedClient.patch).toHaveBeenCalledWith('/projects/p1', { name: 'Updated' });
    expect(result).toEqual(updated);
  });

  it('delete sends DELETE', async () => {
    mockedClient.delete.mockResolvedValue({});
    await projectsApi.delete('p1');
    expect(mockedClient.delete).toHaveBeenCalledWith('/projects/p1');
  });

  it('getAll propagates errors', async () => {
    mockedClient.get.mockRejectedValue(new Error('Server error'));
    await expect(projectsApi.getAll()).rejects.toThrow('Server error');
  });
});
