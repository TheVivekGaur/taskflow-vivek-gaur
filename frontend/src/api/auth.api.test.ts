import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./client', () => ({
  default: {
    post: vi.fn(),
  },
}));

import apiClient from './client';
import { authApi } from './auth.api';

const mockedClient = vi.mocked(apiClient);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('authApi', () => {
  it('login sends POST to /auth/login', async () => {
    const response = { token: 'jwt', user: { id: '1', name: 'Test', email: 'test@test.com' } };
    mockedClient.post.mockResolvedValue({ data: response });

    const result = await authApi.login('test@test.com', 'pass');
    expect(mockedClient.post).toHaveBeenCalledWith('/auth/login', { email: 'test@test.com', password: 'pass' });
    expect(result).toEqual(response);
  });

  it('register sends POST to /auth/register', async () => {
    const response = { token: 'jwt', user: { id: '2', name: 'New', email: 'new@test.com' } };
    mockedClient.post.mockResolvedValue({ data: response });

    const result = await authApi.register('New', 'new@test.com', 'pass123');
    expect(mockedClient.post).toHaveBeenCalledWith('/auth/register', {
      name: 'New',
      email: 'new@test.com',
      password: 'pass123',
    });
    expect(result).toEqual(response);
  });

  it('login propagates errors', async () => {
    mockedClient.post.mockRejectedValue(new Error('Network error'));
    await expect(authApi.login('a@b.com', 'x')).rejects.toThrow('Network error');
  });
});
