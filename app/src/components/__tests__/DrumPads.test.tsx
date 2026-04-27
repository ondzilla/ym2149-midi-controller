import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { DrumPads } from '../DrumPads';
import { midiService } from '../../services/midiService';

vi.mock('../../services/midiService', () => ({
  midiService: {
    sendNoteOn: vi.fn(),
  }
}));

describe('DrumPads', () => {
  it('should trigger Note C3 on Channel 10 when Kick pad is clicked', async () => {
    render(<DrumPads />);
    
    const kickPad = screen.getByRole('button', { name: /kick/i });
    await userEvent.click(kickPad);

    // Channel 10 (9 index), Note 48 (C3), full velocity
    expect(midiService.sendNoteOn).toHaveBeenCalledWith(9, 48, 127);
  });

  it('should trigger Note D3 on Channel 10 for Snare', async () => {
    render(<DrumPads />);
    
    const snarePad = screen.getByRole('button', { name: /snare/i });
    await userEvent.click(snarePad);

    // Channel 10, Note 50 (D3), full velocity
    expect(midiService.sendNoteOn).toHaveBeenCalledWith(9, 50, 127);
  });
});
