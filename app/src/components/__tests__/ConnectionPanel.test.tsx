import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ConnectionPanel } from '../ConnectionPanel';

describe('ConnectionPanel', () => {
  it('should render the connection header', () => {
    render(<ConnectionPanel />);
    expect(screen.getByRole('heading', { name: /connection/i })).toBeInTheDocument();
  });



  it('should render device selection dropdowns', () => {
    render(<ConnectionPanel />);
    // Should render two selects (Input and Output)
    const dropdowns = screen.getAllByRole('combobox');
    expect(dropdowns).toHaveLength(2);
  });
});
