import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Task } from '../../types';

// Mock dnd-kit
vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  DragOverlay: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  closestCorners: vi.fn(),
  KeyboardSensor: vi.fn(),
  PointerSensor: vi.fn(),
  useSensor: vi.fn(),
  useSensors: () => [],
  useDroppable: () => ({ setNodeRef: vi.fn(), isOver: false }),
}));

vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  verticalListSortingStrategy: {},
  sortableKeyboardCoordinates: vi.fn(),
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

import KanbanBoard from './KanbanBoard';

const mockTasks: Task[] = [
  {
    id: 't1', title: 'Todo Task', description: '', status: 'todo',
    priority: 'high', assignee_id: 'u1', due_date: '', project_id: 'p1', created_at: '2026-04-01',
  },
  {
    id: 't2', title: 'In Progress Task', description: '', status: 'in_progress',
    priority: 'medium', assignee_id: 'u1', due_date: '', project_id: 'p1', created_at: '2026-04-01',
  },
  {
    id: 't3', title: 'Done Task', description: '', status: 'done',
    priority: 'low', assignee_id: 'u1', due_date: '', project_id: 'p1', created_at: '2026-04-01',
  },
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe('KanbanBoard', () => {
  it('renders all three columns', () => {
    render(
      <KanbanBoard tasks={mockTasks} onEdit={vi.fn()} onDelete={vi.fn()} onStatusChange={vi.fn()} onAddTask={vi.fn()} />
    );
    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('groups tasks by status', () => {
    render(
      <KanbanBoard tasks={mockTasks} onEdit={vi.fn()} onDelete={vi.fn()} onStatusChange={vi.fn()} onAddTask={vi.fn()} />
    );
    expect(screen.getByText('Todo Task')).toBeInTheDocument();
    expect(screen.getByText('In Progress Task')).toBeInTheDocument();
    expect(screen.getByText('Done Task')).toBeInTheDocument();
  });

  it('renders empty columns when no tasks', () => {
    render(
      <KanbanBoard tasks={[]} onEdit={vi.fn()} onDelete={vi.fn()} onStatusChange={vi.fn()} onAddTask={vi.fn()} />
    );
    const emptyTexts = screen.getAllByText('Drop tasks here');
    expect(emptyTexts).toHaveLength(3);
  });
});
