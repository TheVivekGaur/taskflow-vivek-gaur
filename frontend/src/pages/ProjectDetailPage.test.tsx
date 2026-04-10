import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../api/projects.api', () => ({
  projectsApi: {
    getById: vi.fn(),
  },
}));

vi.mock('../api/tasks.api', () => ({
  tasksApi: {
    getByProject: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

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

import { projectsApi } from '../api/projects.api';
import { useTaskStore } from '../store/useTaskStore';
import ProjectDetailPage from './ProjectDetailPage';

const mockedProjectsApi = vi.mocked(projectsApi);

const mockProject = {
  id: 'p1',
  name: 'Test Project',
  description: 'A test project',
  owner_id: 'u1',
  created_at: '2026-04-01T00:00:00Z',
  tasks: [
    {
      id: 't1', title: 'Task One', description: 'desc', status: 'todo' as const,
      priority: 'high' as const, assignee_id: 'u1', due_date: '2026-04-15', project_id: 'p1', created_at: '2026-04-01',
    },
  ],
};

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/projects/p1']}>
      <Routes>
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  useTaskStore.setState({ tasks: [], loading: false, error: null });
});

describe('ProjectDetailPage', () => {
  it('shows loader then renders project', async () => {
    mockedProjectsApi.getById.mockResolvedValue(mockProject);
    renderPage();
    expect(screen.getByText('Loading project...')).toBeInTheDocument();
    expect(await screen.findByText('A test project')).toBeInTheDocument();
    const headings = screen.getAllByText('Test Project');
    expect(headings.length).toBeGreaterThanOrEqual(1);
  });

  it('shows error state on fetch failure', async () => {
    mockedProjectsApi.getById.mockRejectedValue(new Error('fail'));
    renderPage();
    expect(await screen.findByText('Failed to load project')).toBeInTheDocument();
  });

  it('shows 404 error for missing project', async () => {
    mockedProjectsApi.getById.mockRejectedValue({ response: { status: 404 } });
    renderPage();
    expect(await screen.findByText('Project not found')).toBeInTheDocument();
  });

  it('shows 403 error for forbidden project', async () => {
    mockedProjectsApi.getById.mockRejectedValue({ response: { status: 403 } });
    renderPage();
    expect(await screen.findByText("You don't have access to this project")).toBeInTheDocument();
  });

  it('renders kanban columns after loading', async () => {
    mockedProjectsApi.getById.mockResolvedValue(mockProject);
    renderPage();
    await screen.findByText('A test project');
    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('renders Add Task button', async () => {
    mockedProjectsApi.getById.mockResolvedValue(mockProject);
    renderPage();
    await screen.findByText('A test project');
    expect(screen.getByRole('button', { name: /add task/i })).toBeInTheDocument();
  });

  it('opens task modal when Add Task is clicked', async () => {
    mockedProjectsApi.getById.mockResolvedValue(mockProject);
    renderPage();
    await screen.findByText('A test project');
    await userEvent.click(screen.getByRole('button', { name: /add task/i }));
    expect(screen.getByText('Create New Task')).toBeInTheDocument();
  });

  it('renders breadcrumbs', async () => {
    mockedProjectsApi.getById.mockResolvedValue(mockProject);
    renderPage();
    await screen.findByText('A test project');
    expect(screen.getByText('Projects')).toBeInTheDocument();
  });
});
