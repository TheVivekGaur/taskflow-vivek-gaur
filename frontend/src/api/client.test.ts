import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from './client';

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('apiClient', () => {
  it('has correct base configuration', () => {
    expect(apiClient.defaults.headers['Content-Type']).toBe('application/json');
  });

  it('attaches token from localStorage to requests', async () => {
    localStorage.setItem('taskflow_token', 'test-jwt-token');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const interceptors = apiClient.interceptors.request as any;
    const handlers = interceptors.handlers;
    const fulfilled = handlers[0]?.fulfilled;

    if (fulfilled) {
      const config = { headers: {} as Record<string, string> };
      const result = await fulfilled(config);
      expect(result.headers.Authorization).toBe('Bearer test-jwt-token');
    }
  });

  it('does not attach token when not in localStorage', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const interceptors = apiClient.interceptors.request as any;
    const handlers = interceptors.handlers;
    const fulfilled = handlers[0]?.fulfilled;

    if (fulfilled) {
      const config = { headers: {} as Record<string, string> };
      const result = await fulfilled(config);
      expect(result.headers.Authorization).toBeUndefined();
    }
  });

  it('clears storage on 401 response', async () => {
    localStorage.setItem('taskflow_token', 'tok');
    localStorage.setItem('taskflow_user', '{}');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const interceptors = apiClient.interceptors.response as any;
    const handlers = interceptors.handlers;
    const rejected = handlers[0]?.rejected;

    if (rejected) {
      const originalLocation = window.location;
      Object.defineProperty(window, 'location', {
        value: { ...originalLocation, pathname: '/projects', href: '' },
        writable: true,
      });

      try {
        await rejected({ response: { status: 401 } });
      } catch {
        // Expected rejection
      }

      expect(localStorage.getItem('taskflow_token')).toBeNull();
      expect(localStorage.getItem('taskflow_user')).toBeNull();

      Object.defineProperty(window, 'location', { value: originalLocation, writable: true });
    }
  });
});
