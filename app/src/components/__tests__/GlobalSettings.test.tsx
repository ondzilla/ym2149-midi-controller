import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { GlobalSettings } from '../GlobalSettings';
import { midiService } from '../../services/midiService';

// Mock the midiService so we can intercept calls
vi.mock('../../services/midiService', () => ({
  midiService: {
    sendCC: vi.fn(),
  }
}));

describe('GlobalSettings', () => {
  it('should render the global settings section', () => {
    render(<GlobalSettings />);
    expect(screen.getByRole('heading', { name: /global settings/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /toggle gamepad/i })).toBeInTheDocument();
  });

  it('should send CC 9 when Bank B is selected', async () => {
    render(<GlobalSettings />);
    // Assuming there's a button or switch for Bank
    const bankToggle = screen.getByRole('button', { name: /bank/i });

    await userEvent.click(bankToggle);

    // Assert that midiService was called with Channel 1, CC 9, Value 127
    expect(midiService.sendCC).toHaveBeenCalledWith(1, 9, 127);
  });

  it('should send CC 10 when Polyphony is toggled', async () => {
    render(<GlobalSettings />);
    const polyphonyToggle = screen.getByRole('button', { name: /polyphony/i });

    await userEvent.click(polyphonyToggle);

    expect(midiService.sendCC).toHaveBeenCalledWith(1, 10, 127);
  });

  it('should send CC 4 when Velocity Sensitivity is toggled', async () => {
    render(<GlobalSettings />);
    const velocityToggle = screen.getByRole('button', { name: /velocity/i });

    await userEvent.click(velocityToggle);

    expect(midiService.sendCC).toHaveBeenCalledWith(1, 4, 127);
  });
});
