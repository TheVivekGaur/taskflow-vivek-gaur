import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import EmptyState from './EmptyState';

describe('EmptyState Component', () => {
  it('renders default title and message', () => {
    render(<EmptyState />);
    expect(screen.getByText('Nothing here yet')).toBeInTheDocument();
    expect(screen.getByText('Get started by creating your first item.')).toBeInTheDocument();
  });

  it('renders custom title and message', () => {
    render(<EmptyState title="No tasks" message="Create a task to begin" />);
    expect(screen.getByText('No tasks')).toBeInTheDocument();
    expect(screen.getByText('Create a task to begin')).toBeInTheDocument();
  });

  it('renders action button and fires callback', async () => {
    const onAction = vi.fn();
    render(<EmptyState actionLabel="Add Item" onAction={onAction} />);
    const button = screen.getByRole('button', { name: 'Add Item' });
    await userEvent.click(button);
    expect(onAction).toHaveBeenCalledOnce();
  });

  it('does not render button when actionLabel is missing', () => {
    render(<EmptyState onAction={() => {}} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
