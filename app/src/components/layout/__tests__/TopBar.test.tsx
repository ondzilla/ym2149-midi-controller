import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TopBar } from '../TopBar';
import { midiService } from '../../../services/midiService';

vi.mock('../../../services/midiService', () => ({
  midiService: {
    sendCC: vi.fn(),
  }
}));

describe('TopBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear console.error to keep test output clean if expected
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should render the TopBar', () => {
    render(<TopBar onOpenSettings={vi.fn()} />);
    expect(screen.getByText('YM2149_SYNTH_CORE')).toBeInTheDocument();
  });

  it('should call onOpenSettings when settings button is clicked', async () => {
    const mockOnOpenSettings = vi.fn();
    render(<TopBar onOpenSettings={mockOnOpenSettings} />);
    const settingsBtn = screen.getByRole('button', { name: /settings/i });

    await userEvent.click(settingsBtn);

    expect(mockOnOpenSettings).toHaveBeenCalledTimes(1);
  });

  it('should send CC 123 to all 16 channels when panic button is clicked', async () => {
    render(<TopBar onOpenSettings={vi.fn()} />);
    const panicBtn = screen.getByRole('button', { name: /all notes off \(panic\)/i });

    await userEvent.click(panicBtn);

    expect(midiService.sendCC).toHaveBeenCalledTimes(16);

    for (let i = 1; i <= 16; i++) {
      expect(midiService.sendCC).toHaveBeenCalledWith(i, 123, 0);
    }
  });

  it('should catch errors when sending MIDI fails', async () => {
    // Mock sendCC to throw an error
    vi.mocked(midiService.sendCC).mockImplementation(() => {
      throw new Error('MIDI Error');
    });

    render(<TopBar onOpenSettings={vi.fn()} />);
    const panicBtn = screen.getByRole('button', { name: /all notes off \(panic\)/i });

    await userEvent.click(panicBtn);

    expect(console.error).toHaveBeenCalledWith('Failed to send Panic (All Notes Off) message:', expect.any(Error));
  });
});
