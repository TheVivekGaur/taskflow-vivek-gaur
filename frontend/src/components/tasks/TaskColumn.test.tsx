import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Task } from '../../types';

// Mock dnd-kit
vi.mock('@dnd-kit/core', () => ({
  useDroppable: () => ({ setNodeRef: vi.fn(), isOver: false }),
}));

vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  verticalListSortingStrategy: {},
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

import TaskColumn from './TaskColumn';

const mockTasks: Task[] = [
  {
    id: 't1',
    title: 'Task One',
    description: 'desc',
    status: 'todo',
    priority: 'high',
    assignee_id: 'u1',
    due_date: '2026-04-15',
    project_id: 'p1',
    created_at: '2026-04-01',
  },
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe('TaskColumn', () => {
  it('renders column header with label and count', () => {
    render(
      <TaskColumn status="todo" tasks={mockTasks} onEdit={vi.fn()} onDelete={vi.fn()} onAddTask={vi.fn()} />
    );
    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('renders task cards', () => {
    render(
      <TaskColumn status="todo" tasks={mockTasks} onEdit={vi.fn()} onDelete={vi.fn()} onAddTask={vi.fn()} />
    );
    expect(screen.getByText('Task One')).toBeInTheDocument();
  });

  it('shows empty state when no tasks', () => {
    render(
      <TaskColumn status="done" tasks={[]} onEdit={vi.fn()} onDelete={vi.fn()} onAddTask={vi.fn()} />
    );
    expect(screen.getByText('Drop tasks here')).toBeInTheDocument();
  });

  it('shows Add button only for todo column', () => {
    const { rerender } = render(
      <TaskColumn status="todo" tasks={[]} onEdit={vi.fn()} onDelete={vi.fn()} onAddTask={vi.fn()} />
    );
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();

    rerender(
      <TaskColumn status="in_progress" tasks={[]} onEdit={vi.fn()} onDelete={vi.fn()} onAddTask={vi.fn()} />
    );
    expect(screen.queryByRole('button', { name: /add/i })).not.toBeInTheDocument();
  });

  it('calls onAddTask when Add button is clicked', async () => {
    const onAddTask = vi.fn();
    render(
      <TaskColumn status="todo" tasks={[]} onEdit={vi.fn()} onDelete={vi.fn()} onAddTask={onAddTask} />
    );
    await userEvent.click(screen.getByRole('button', { name: /add/i }));
    expect(onAddTask).toHaveBeenCalledOnce();
  });

  it('renders correct labels for each status', () => {
    const { rerender } = render(
      <TaskColumn status="in_progress" tasks={[]} onEdit={vi.fn()} onDelete={vi.fn()} onAddTask={vi.fn()} />
    );
    expect(screen.getByText('In Progress')).toBeInTheDocument();

    rerender(
      <TaskColumn status="done" tasks={[]} onEdit={vi.fn()} onDelete={vi.fn()} onAddTask={vi.fn()} />
    );
    expect(screen.getByText('Done')).toBeInTheDocument();
  });
});
