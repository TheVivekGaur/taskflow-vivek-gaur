import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../api/projects.api', () => ({
  projectsApi: {
    getAll: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  },
}));

import { projectsApi } from '../api/projects.api';
import ProjectsPage from './ProjectsPage';

const mockedApi = vi.mocked(projectsApi);

const mockProjects = [
  { id: 'p1', name: 'Project One', description: 'First', owner_id: 'u1', created_at: '2026-04-01T00:00:00Z' },
  { id: 'p2', name: 'Project Two', description: 'Second', owner_id: 'u1', created_at: '2026-04-02T00:00:00Z' },
];

function renderPage() {
  return render(
    <MemoryRouter>
      <ProjectsPage />
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ProjectsPage', () => {
  it('shows loader then renders projects', async () => {
    mockedApi.getAll.mockResolvedValue(mockProjects);
    renderPage();
    expect(screen.getByText('Loading projects...')).toBeInTheDocument();
    expect(await screen.findByText('Project One')).toBeInTheDocument();
    expect(screen.getByText('Project Two')).toBeInTheDocument();
    expect(screen.getByText('2 projects')).toBeInTheDocument();
  });

  it('shows error state on fetch failure', async () => {
    mockedApi.getAll.mockRejectedValue(new Error('fail'));
    renderPage();
    expect(await screen.findByText('Failed to load projects')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('shows empty state when no projects', async () => {
    mockedApi.getAll.mockResolvedValue([]);
    renderPage();
    expect(await screen.findByText('No projects yet')).toBeInTheDocument();
  });

  it('retries on error state button click', async () => {
    mockedApi.getAll.mockRejectedValueOnce(new Error('fail')).mockResolvedValueOnce(mockProjects);
    renderPage();
    await screen.findByText('Failed to load projects');
    await userEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(await screen.findByText('Project One')).toBeInTheDocument();
  });

  it('deletes project optimistically', async () => {
    mockedApi.getAll.mockResolvedValue(mockProjects);
    mockedApi.delete.mockResolvedValue(undefined);
    renderPage();
    await screen.findByText('Project One');

    const deleteButtons = screen.getAllByRole('button', { name: /delete project/i });
    await userEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText('Project One')).not.toBeInTheDocument();
    });
    expect(mockedApi.delete).toHaveBeenCalledWith('p1');
  });
});
