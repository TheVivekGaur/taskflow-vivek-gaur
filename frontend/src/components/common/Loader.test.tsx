import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Loader from './Loader';

describe('Loader Component', () => {
  it('renders correctly with default props', () => {
    render(<Loader />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders the custom message', () => {
    const customMessage = "Loading super fast...";
    render(<Loader message={customMessage} />);
    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });
});
