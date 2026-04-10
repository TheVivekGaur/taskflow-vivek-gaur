import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';

const mockLogout = vi.fn();
const mockNavigate = vi.fn();
let mockAuth = {
  user: { id: '1', name: 'Test User', email: 'test@example.com' },
  logout: mockLogout,
  isAuthenticated: true,
};

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => mockAuth,
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

import Navbar from './Navbar';

const theme = createTheme();

function renderNavbar(darkMode = false) {
  const onToggle = vi.fn();
  return {
    onToggle,
    ...render(
      <ThemeProvider theme={theme}>
        <MemoryRouter>
          <Navbar darkMode={darkMode} onToggleDarkMode={onToggle} />
        </MemoryRouter>
      </ThemeProvider>
    ),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockAuth = {
    user: { id: '1', name: 'Test User', email: 'test@example.com' },
    logout: mockLogout,
    isAuthenticated: true,
  };
});

describe('Navbar', () => {
  it('renders app name and user info when authenticated', () => {
    renderNavbar();
    expect(screen.getByText('TaskFlow')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('renders nothing when not authenticated', () => {
    mockAuth = { ...mockAuth, isAuthenticated: false };
    const { container } = renderNavbar();
    expect(container.querySelector('.MuiAppBar-root')).not.toBeInTheDocument();
  });

  it('calls onToggleDarkMode when theme toggle is clicked', async () => {
    const { onToggle } = renderNavbar();
    await userEvent.click(screen.getByLabelText(/toggle dark mode/i));
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it('shows user avatar with first letter', () => {
    renderNavbar();
    expect(screen.getByText('T')).toBeInTheDocument();
  });

  it('opens menu and logs out', async () => {
    renderNavbar();
    // Click user button to open menu
    await userEvent.click(screen.getByText('Test User'));
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    await userEvent.click(screen.getByText('Logout'));
    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});
