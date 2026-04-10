import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ErrorState from './ErrorState';

describe('ErrorState Component', () => {
  it('renders default error message', () => {
    render(<ErrorState />);
    expect(screen.getByText('Oops!')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument();
  });

  it('renders custom error message', () => {
    render(<ErrorState message="Network failure" />);
    expect(screen.getByText('Network failure')).toBeInTheDocument();
  });

  it('renders retry button and fires callback', async () => {
    const onRetry = vi.fn();
    render(<ErrorState onRetry={onRetry} />);
    const button = screen.getByRole('button', { name: 'Try Again' });
    await userEvent.click(button);
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('does not render retry button when onRetry is not provided', () => {
    render(<ErrorState />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
