import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';

vi.mock('../api/auth.api', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
  },
}));

import { authApi } from '../api/auth.api';
const mockedAuth = vi.mocked(authApi);

function TestConsumer() {
  const { user, isAuthenticated, login, register, logout } = useAuth();
  return (
    <div>
      <span data-testid="auth">{String(isAuthenticated)}</span>
      <span data-testid="user">{user?.name ?? 'none'}</span>
      <button onClick={() => login('test@example.com', 'pass')}>Login</button>
      <button onClick={() => register('Test', 'test@example.com', 'pass')}>Register</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe('AuthContext', () => {
  it('starts unauthenticated', () => {
    render(<AuthProvider><TestConsumer /></AuthProvider>);
    expect(screen.getByTestId('auth').textContent).toBe('false');
    expect(screen.getByTestId('user').textContent).toBe('none');
  });

  it('restores session from localStorage', () => {
    localStorage.setItem('taskflow_token', 'tok123');
    localStorage.setItem('taskflow_user', JSON.stringify({ id: '1', name: 'Alice', email: 'a@b.com' }));
    render(<AuthProvider><TestConsumer /></AuthProvider>);
    expect(screen.getByTestId('auth').textContent).toBe('true');
    expect(screen.getByTestId('user').textContent).toBe('Alice');
  });

  it('login sets user and token', async () => {
    mockedAuth.login.mockResolvedValue({
      token: 'jwt',
      user: { id: '1', name: 'Bob', email: 'bob@test.com' },
    });
    render(<AuthProvider><TestConsumer /></AuthProvider>);
    await act(() => userEvent.click(screen.getByText('Login')));
    expect(screen.getByTestId('auth').textContent).toBe('true');
    expect(screen.getByTestId('user').textContent).toBe('Bob');
    expect(localStorage.getItem('taskflow_token')).toBe('jwt');
  });

  it('register sets user and token', async () => {
    mockedAuth.register.mockResolvedValue({
      token: 'jwt2',
      user: { id: '2', name: 'Test', email: 'test@example.com' },
    });
    render(<AuthProvider><TestConsumer /></AuthProvider>);
    await act(() => userEvent.click(screen.getByText('Register')));
    expect(screen.getByTestId('auth').textContent).toBe('true');
    expect(localStorage.getItem('taskflow_token')).toBe('jwt2');
  });

  it('logout clears state and localStorage', async () => {
    localStorage.setItem('taskflow_token', 'tok');
    localStorage.setItem('taskflow_user', JSON.stringify({ id: '1', name: 'X', email: 'x@x.com' }));
    render(<AuthProvider><TestConsumer /></AuthProvider>);
    await act(() => userEvent.click(screen.getByText('Logout')));
    expect(screen.getByTestId('auth').textContent).toBe('false');
    expect(localStorage.getItem('taskflow_token')).toBeNull();
  });

  it('throws when useAuth is used outside provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow('useAuth must be used within an AuthProvider');
    spy.mockRestore();
  });
});
