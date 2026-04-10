import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TaskModal from './TaskModal';
import type { Task } from '../../types';

const mockTask: Task = {
  id: 't1',
  title: 'Existing Task',
  description: 'A description',
  status: 'in_progress',
  priority: 'high',
  assignee_id: 'u1',
  due_date: '2026-04-15',
  project_id: 'p1',
  created_at: '2026-04-01',
};

const defaultProps = {
  open: true,
  onClose: vi.fn(),
  onSubmit: vi.fn(),
};

function renderModal(overrides = {}) {
  return render(<TaskModal {...defaultProps} {...overrides} />);
}

beforeEach(() => {
  vi.clearAllMocks();
  defaultProps.onSubmit.mockResolvedValue(undefined);
});

describe('TaskModal', () => {
  it('renders create mode by default', () => {
    renderModal();
    expect(screen.getByText('Create New Task')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create task/i })).toBeInTheDocument();
  });

  it('renders edit mode when task is provided', () => {
    renderModal({ task: mockTask });
    expect(screen.getByText('Edit Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing Task')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
  });

  it('shows error when title is empty', async () => {
    renderModal();
    await userEvent.click(screen.getByRole('button', { name: /create task/i }));
    expect(screen.getByText('Task title is required')).toBeInTheDocument();
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  it('submits create payload', async () => {
    renderModal();
    await userEvent.type(screen.getByLabelText(/title/i), 'New Task');
    await userEvent.type(screen.getByLabelText(/description/i), 'Details');
    await userEvent.click(screen.getByRole('button', { name: /create task/i }));
    expect(defaultProps.onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'New Task', description: 'Details', priority: 'medium' })
    );
  });

  it('calls onClose when cancel is clicked', async () => {
    renderModal();
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('shows error on submit failure', async () => {
    defaultProps.onSubmit.mockRejectedValue(new Error('fail'));
    renderModal();
    await userEvent.type(screen.getByLabelText(/title/i), 'Task');
    await userEvent.click(screen.getByRole('button', { name: /create task/i }));
    expect(await screen.findByText('Failed to save task')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    renderModal({ open: false });
    expect(screen.queryByText('Create New Task')).not.toBeInTheDocument();
  });
});
