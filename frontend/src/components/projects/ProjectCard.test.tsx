import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ProjectCard from './ProjectCard';
import type { Project } from '../../types';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockProject: Project = {
  id: 'prj_001',
  name: 'Website Redesign',
  description: 'Q2 project — Complete overhaul',
  owner_id: 'usr_001',
  created_at: '2026-04-01T10:00:00Z',
};

function renderCard(props?: Partial<{ project: Project; onDelete: (id: string) => void }>) {
  const onDelete = props?.onDelete ?? vi.fn();
  return render(
    <MemoryRouter>
      <ProjectCard project={props?.project ?? mockProject} onDelete={onDelete} />
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ProjectCard', () => {
  it('renders project name and description', () => {
    renderCard();
    expect(screen.getByText('Website Redesign')).toBeInTheDocument();
    expect(screen.getByText('Q2 project — Complete overhaul')).toBeInTheDocument();
  });

  it('renders formatted date', () => {
    renderCard();
    expect(screen.getByText('Apr 1, 2026')).toBeInTheDocument();
  });

  it('renders fallback when description is empty', () => {
    renderCard({ project: { ...mockProject, description: '' } });
    expect(screen.getByText('No description provided')).toBeInTheDocument();
  });

  it('navigates to project detail on click', async () => {
    renderCard();
    await userEvent.click(screen.getByText('Website Redesign'));
    expect(mockNavigate).toHaveBeenCalledWith('/projects/prj_001');
  });

  it('calls onDelete with project id', async () => {
    const onDelete = vi.fn();
    renderCard({ onDelete });
    const deleteBtn = screen.getByRole('button', { name: /delete project/i });
    await userEvent.click(deleteBtn);
    expect(onDelete).toHaveBeenCalledWith('prj_001');
  });
});
