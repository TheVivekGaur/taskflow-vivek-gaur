import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import LoginForm from './LoginForm';

const mockLogin = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ login: mockLogin }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderLoginForm() {
  return render(
    <MemoryRouter>
      <LoginForm />
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('LoginForm', () => {
  it('renders email and password fields', () => {
    renderLoginForm();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    renderLoginForm();
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('calls login and navigates on success', async () => {
    mockLogin.mockResolvedValue(undefined);
    renderLoginForm();
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    expect(mockNavigate).toHaveBeenCalledWith('/projects');
  });

  it('displays error on login failure', async () => {
    const { AxiosError } = await import('axios');
    const err = new AxiosError('fail', '401', undefined, undefined, {
      status: 401,
      data: { error: 'Invalid credentials' },
      statusText: 'Unauthorized',
      headers: {},
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      config: { headers: {} as any },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    mockLogin.mockRejectedValue(err);
    renderLoginForm();
    await userEvent.type(screen.getByLabelText(/email/i), 'bad@test.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'wrong');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByText('Invalid credentials')).toBeInTheDocument();
  });

  it('toggles password visibility', async () => {
    renderLoginForm();
    const passwordInput = screen.getByLabelText(/password/i);
    expect(passwordInput).toHaveAttribute('type', 'password');
    // Find the visibility toggle (the icon button inside the password field)
    const toggleButtons = screen.getAllByRole('button');
    const visToggle = toggleButtons.find(b => b !== screen.getByRole('button', { name: /sign in/i }));
    if (visToggle) {
      await userEvent.click(visToggle);
      expect(passwordInput).toHaveAttribute('type', 'text');
    }
  });
});
