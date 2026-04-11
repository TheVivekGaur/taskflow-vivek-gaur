import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CreateProjectDialog from './CreateProjectDialog';

const defaultProps = {
  open: true,
  onClose: vi.fn(),
  onCreate: vi.fn(),
};

function renderDialog(overrides = {}) {
  return render(<CreateProjectDialog {...defaultProps} {...overrides} />);
}

beforeEach(() => {
  vi.clearAllMocks();
  defaultProps.onCreate.mockResolvedValue(undefined);
});

describe('CreateProjectDialog', () => {
  it('renders dialog with title and fields', () => {
    renderDialog();
    expect(screen.getByText('Create New Project')).toBeInTheDocument();
    expect(screen.getByLabelText(/project name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
  });

  it('shows error when name is empty', async () => {
    renderDialog();
    await userEvent.click(screen.getByRole('button', { name: /create project/i }));
    expect(screen.getByText('Project name is required')).toBeInTheDocument();
    expect(defaultProps.onCreate).not.toHaveBeenCalled();
  });

  it('calls onCreate with trimmed values', async () => {
    renderDialog();
    await userEvent.type(screen.getByLabelText(/project name/i), '  My Project  ');
    await userEvent.type(screen.getByLabelText(/description/i), '  A description  ');
    await userEvent.click(screen.getByRole('button', { name: /create project/i }));
    expect(defaultProps.onCreate).toHaveBeenCalledWith('My Project', 'A description');
  });

  it('calls onClose when cancel is clicked', async () => {
    renderDialog();
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('shows error on creation failure', async () => {
    const { AxiosError } = await import('axios');
    const err = new AxiosError('fail', '400', undefined, undefined, {
      status: 400,
      data: { error: 'Duplicate name' },
      statusText: 'Bad Request',
      headers: {},
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      config: { headers: {} as any },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    defaultProps.onCreate.mockRejectedValue(err);
    renderDialog();
    await userEvent.type(screen.getByLabelText(/project name/i), 'Test');
    await userEvent.click(screen.getByRole('button', { name: /create project/i }));
    expect(await screen.findByText('Duplicate name')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    renderDialog({ open: false });
    expect(screen.queryByText('Create New Project')).not.toBeInTheDocument();
  });
});
