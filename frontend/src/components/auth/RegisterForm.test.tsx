import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import RegisterForm from './RegisterForm';

const mockRegister = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ register: mockRegister }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderForm() {
  return render(
    <MemoryRouter>
      <RegisterForm />
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('RegisterForm', () => {
  it('renders name, email, and password fields', () => {
    renderForm();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    renderForm();
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));
    expect(screen.getByText('Name is required')).toBeInTheDocument();
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('shows error for invalid email format', async () => {
    renderForm();
    await userEvent.type(screen.getByLabelText(/full name/i), 'Test');
    await userEvent.type(screen.getByLabelText(/email/i), 'invalid');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));
    expect(screen.getByText('Enter a valid email')).toBeInTheDocument();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('shows error for short password', async () => {
    renderForm();
    await userEvent.type(screen.getByLabelText(/full name/i), 'Test');
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), '123');
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));
    expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
  });

  it('calls register and navigates on success', async () => {
    mockRegister.mockResolvedValue(undefined);
    renderForm();
    await userEvent.type(screen.getByLabelText(/full name/i), 'Test User');
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));
    expect(mockRegister).toHaveBeenCalledWith('Test User', 'test@example.com', 'password123');
    expect(mockNavigate).toHaveBeenCalledWith('/projects');
  });

  it('displays server error on failure', async () => {
    const { AxiosError } = await import('axios');
    const err = new AxiosError('fail', '400', undefined, undefined, {
      status: 400,
      data: { error: 'Email already exists' },
      statusText: 'Bad Request',
      headers: {},
      config: { headers: {} as any },
    } as any);
    mockRegister.mockRejectedValue(err);
    renderForm();
    await userEvent.type(screen.getByLabelText(/full name/i), 'Test');
    await userEvent.type(screen.getByLabelText(/email/i), 'dup@test.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));
    expect(await screen.findByText('Email already exists')).toBeInTheDocument();
  });

  it('toggles password visibility', async () => {
    renderForm();
    const passwordInput = screen.getByLabelText(/password/i);
    expect(passwordInput).toHaveAttribute('type', 'password');
    const toggleButtons = screen.getAllByRole('button');
    const visToggle = toggleButtons.find(
      (b) => b !== screen.getByRole('button', { name: /create account/i })
    );
    if (visToggle) {
      await userEvent.click(visToggle);
      expect(passwordInput).toHaveAttribute('type', 'text');
    }
  });

  it('has link to login page', () => {
    renderForm();
    expect(screen.getByText(/sign in/i)).toHaveAttribute('href', '/login');
  });
});
