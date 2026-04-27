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

  it('should map Attack slider percentage to MIDI value and send CC 12', () => {
    // TDD Expectation: slider should map 0-100 to 0-127 via mathUtils and emit CC12
    render(<SynthControls />);
    const attackSlider = screen.getByLabelText(/attack/i);

    // Simulate user sliding to 50%
    fireEvent.change(attackSlider, { target: { value: '50' } });

    // mathUtils.percentageToMidi(50) -> 64
    expect(midiService.sendCC).toHaveBeenCalledWith(1, 12, 64);
  });

  it('should send CC 11 for Decay', () => {
    render(<SynthControls />);
    const decaySlider = screen.getByLabelText(/decay/i);
    fireEvent.change(decaySlider, { target: { value: '100' } });

    expect(midiService.sendCC).toHaveBeenCalledWith(1, 11, 127);
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
