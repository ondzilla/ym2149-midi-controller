import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ConnectionPanel } from '../ConnectionPanel';

describe('ConnectionPanel', () => {
  it('should render the connection header', () => {
    render(<ConnectionPanel />);
    expect(screen.getByRole('heading', { name: /connection/i })).toBeInTheDocument();
  });

  it('should display a status indicator', () => {
    // To be implemented: user will add a status element
    render(<ConnectionPanel />);
    // This will naturally fail until implemented (TDD)
    expect(screen.getByTestId('connection-status')).toBeInTheDocument();
  });

  it('should render device selection dropdowns', () => {
    render(<ConnectionPanel />);
    // Should render three selects (Input, Output, and Preset)
    const dropdowns = screen.getAllByRole('combobox');
    expect(dropdowns).toHaveLength(3);
  });
});
