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
  it('should trigger Note E3 on Channel 10 when Kick Drum pad is clicked', async () => {
    render(<DrumPads />);
    
    const kickPad = screen.getByRole('button', { name: /kick drum/i });
    await userEvent.click(kickPad);

    // Channel 10 (9 index), Note 64 (E3), full velocity
    expect(midiService.sendNoteOn).toHaveBeenCalledWith(9, 64, 127);
  });

  it('should trigger Note D#3 on Channel 10 for Snare', async () => {
    render(<DrumPads />);
    
    const snarePad = screen.getByRole('button', { name: /snare/i });
    await userEvent.click(snarePad);

    // Channel 10, Note 63 (D#3), full velocity
    expect(midiService.sendNoteOn).toHaveBeenCalledWith(9, 63, 127);
  });

  it('should trigger Note C3 on Channel 10 for Dog Yap', async () => {
    render(<DrumPads />);

    const dogPad = screen.getByRole('button', { name: /dog yap/i });
    await userEvent.click(dogPad);

    // Channel 10, Note 60 (C3), full velocity
    expect(midiService.sendNoteOn).toHaveBeenCalledWith(9, 60, 127);
  });
});
