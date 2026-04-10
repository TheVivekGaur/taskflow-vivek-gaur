import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Task } from '../../types';

// Mock dnd-kit before importing TaskCard
vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}));

vi.mock('@dnd-kit/utilities', () => ({
  CSS: { Transform: { toString: () => undefined } },
}));

import TaskCard from './TaskCard';

const mockTask: Task = {
  id: 't1',
  title: 'Design homepage',
  description: 'Create wireframes for the new homepage layout.',
  status: 'todo',
  priority: 'high',
  assignee_id: 'u1',
  due_date: '2026-04-15',
  project_id: 'p1',
  created_at: '2026-04-01',
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('TaskCard', () => {
  it('renders task title and description', () => {
    render(<TaskCard task={mockTask} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('Design homepage')).toBeInTheDocument();
    expect(screen.getByText(/Create wireframes/)).toBeInTheDocument();
  });

  it('renders priority chip', () => {
    render(<TaskCard task={mockTask} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('renders due date', () => {
    render(<TaskCard task={mockTask} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('Apr 15')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', async () => {
    const onEdit = vi.fn();
    render(<TaskCard task={mockTask} onEdit={onEdit} onDelete={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: /edit/i }));
    expect(onEdit).toHaveBeenCalledWith(mockTask);
  });

  it('calls onDelete when delete button is clicked', async () => {
    const onDelete = vi.fn();
    render(<TaskCard task={mockTask} onEdit={vi.fn()} onDelete={onDelete} />);
    await userEvent.click(screen.getByRole('button', { name: /delete/i }));
    expect(onDelete).toHaveBeenCalledWith('t1');
  });

  it('does not render description when empty', () => {
    const task = { ...mockTask, description: '' };
    render(<TaskCard task={task} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('Design homepage')).toBeInTheDocument();
    // Only title and meta chips should be present
  });

  it('does not render due date chip when missing', () => {
    const task = { ...mockTask, due_date: '' };
    render(<TaskCard task={task} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.queryByText(/apr/i)).not.toBeInTheDocument();
  });
});
