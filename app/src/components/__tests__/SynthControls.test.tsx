import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SynthControls } from '../SynthControls';
import { midiService } from '../../services/midiService';

vi.mock('../../services/midiService', () => ({
  midiService: {
    sendCC: vi.fn(),
    sendPitchBend: vi.fn(),
  }
}));

describe('SynthControls', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the synth controls', () => {
    render(<SynthControls />);
    expect(screen.getByRole('heading', { name: /synth controls/i })).toBeInTheDocument();
  });

  it('should send CC 1 for Detune', () => {
    render(<SynthControls />);
    const detuneSlider = screen.getByLabelText(/detune/i);
    fireEvent.change(detuneSlider, { target: { value: '100' } });

    expect(midiService.sendCC).toHaveBeenCalledWith(1, 1, 100);
  });

  it('should send Pitch Bend', () => {
    render(<SynthControls />);
    const pitchSlider = screen.getByLabelText(/pitch bend/i);
    fireEvent.change(pitchSlider, { target: { value: '10000' } });

    expect(midiService.sendPitchBend).toHaveBeenCalledWith(1, 10000);
  });
});
