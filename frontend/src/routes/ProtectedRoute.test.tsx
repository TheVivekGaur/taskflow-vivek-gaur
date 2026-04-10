import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

let mockAuth = { isAuthenticated: true, isLoading: false };

vi.mock('../context/AuthContext', () => ({
  useAuth: () => mockAuth,
}));

import ProtectedRoute from './ProtectedRoute';

function renderRoute() {
  return render(
    <MemoryRouter>
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    </MemoryRouter>
  );
}

beforeEach(() => {
  mockAuth = { isAuthenticated: true, isLoading: false };
});

describe('ProtectedRoute', () => {
  it('renders children when authenticated', () => {
    renderRoute();
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('shows loader when loading', () => {
    mockAuth = { isAuthenticated: false, isLoading: true };
    renderRoute();
    expect(screen.getByText('Checking authentication...')).toBeInTheDocument();
  });

  it('redirects to login when not authenticated', () => {
    mockAuth = { isAuthenticated: false, isLoading: false };
    renderRoute();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});
