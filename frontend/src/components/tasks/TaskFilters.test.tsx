import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TaskFilters from './TaskFilters';

const defaultProps = {
  statusFilter: 'all' as const,
  priorityFilter: 'all' as const,
  searchQuery: '',
  onStatusChange: vi.fn(),
  onPriorityChange: vi.fn(),
  onSearchChange: vi.fn(),
};

function renderFilters(overrides = {}) {
  return render(<TaskFilters {...defaultProps} {...overrides} />);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('TaskFilters', () => {
  it('renders search, status, and priority fields', () => {
    renderFilters();
    expect(screen.getByPlaceholderText(/search tasks/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
  });

  it('calls onSearchChange when typing', async () => {
    renderFilters();
    await userEvent.type(screen.getByPlaceholderText(/search tasks/i), 'bug');
    expect(defaultProps.onSearchChange).toHaveBeenCalled();
  });

  it('shows active filter chip when filters are applied', () => {
    renderFilters({ statusFilter: 'todo' });
    expect(screen.getByText('1 active')).toBeInTheDocument();
  });

  it('shows count of 2 when both filters active', () => {
    renderFilters({ statusFilter: 'todo', priorityFilter: 'high' });
    expect(screen.getByText('2 active')).toBeInTheDocument();
  });

  it('clears filters when chip delete is clicked', async () => {
    renderFilters({ statusFilter: 'todo' });
    const chip = screen.getByText('1 active').closest('.MuiChip-root');
    const deleteIcon = chip?.querySelector('.MuiChip-deleteIcon');
    if (deleteIcon) {
      await userEvent.click(deleteIcon);
      expect(defaultProps.onStatusChange).toHaveBeenCalledWith('all');
      expect(defaultProps.onPriorityChange).toHaveBeenCalledWith('all');
    }
  });

  it('does not show active chip when no filters applied', () => {
    renderFilters();
    expect(screen.queryByText(/active/)).not.toBeInTheDocument();
  });
});
