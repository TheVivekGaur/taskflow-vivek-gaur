import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

let mockAuth = { isAuthenticated: true, isLoading: false };

vi.mock('../context/AuthContext', () => ({
  useAuth: () => mockAuth,
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock lazy-loaded pages to avoid Suspense timeout issues in tests
vi.mock('../pages/LoginPage', () => ({
  default: () => <div>LoginPage</div>,
}));
vi.mock('../pages/RegisterPage', () => ({
  default: () => <div>RegisterPage</div>,
}));
vi.mock('../pages/ProjectsPage', () => ({
  default: () => <div>ProjectsPage</div>,
}));
vi.mock('../pages/ProjectDetailPage', () => ({
  default: () => <div>ProjectDetailPage</div>,
}));

import AppRoutes from './AppRoutes';

function renderRoutes(initialRoute = '/') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <AppRoutes />
    </MemoryRouter>
  );
}

beforeEach(() => {
  mockAuth = { isAuthenticated: true, isLoading: false };
});

describe('AppRoutes', () => {
  it('renders login page at /login', async () => {
    mockAuth = { isAuthenticated: false, isLoading: false };
    renderRoutes('/login');
    expect(await screen.findByText('LoginPage')).toBeInTheDocument();
  });

  it('renders register page at /register', async () => {
    mockAuth = { isAuthenticated: false, isLoading: false };
    renderRoutes('/register');
    expect(await screen.findByText('RegisterPage')).toBeInTheDocument();
  });

  it('redirects / to projects for authenticated users', async () => {
    renderRoutes('/');
    expect(await screen.findByText('ProjectsPage')).toBeInTheDocument();
  });

  it('redirects unauthenticated users from /projects to login', async () => {
    mockAuth = { isAuthenticated: false, isLoading: false };
    renderRoutes('/projects');
    expect(await screen.findByText('LoginPage')).toBeInTheDocument();
  });

  it('redirects unknown routes to projects', async () => {
    renderRoutes('/nonexistent');
    expect(await screen.findByText('ProjectsPage')).toBeInTheDocument();
  });
});
