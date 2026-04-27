import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Arpeggiator } from '../Arpeggiator';
import { midiService } from '../../services/midiService';

vi.mock('../../services/midiService', () => ({
  midiService: {
    sendCC: vi.fn(),
  }
}));

describe('Arpeggiator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the Arpeggiator section', () => {
    render(<Arpeggiator />);
    expect(screen.getByRole('heading', { name: /arpeggiator/i })).toBeInTheDocument();
  });

  it('should trigger CC 5 when Arp Rate changes', () => {
    render(<Arpeggiator />);
    // User maps a slider/knob to rate
    const rateSlider = screen.getByLabelText(/rate/i);
    fireEvent.change(rateSlider, { target: { value: '75' } });

    // mathUtils.percentageToMidi(75) => ~95
    expect(midiService.sendCC).toHaveBeenCalledWith(1, 5, 95);
  });

  it('should trigger CC 8 when Arp Octave changes', () => {
    render(<Arpeggiator />);
    const octaveSelect = screen.getByRole('spinbutton', { name: /octave/i });
    fireEvent.change(octaveSelect, { target: { value: '3' } });
    
    // Expectation depends on user's arbitrary mapping logic, stubbing typical output
    expect(midiService.sendCC).toHaveBeenCalledWith(1, 8, expect.any(Number));
  });

  it('should trigger CC 6 when selecting an Arp Pattern', async () => {
    render(<Arpeggiator />);
    const patternBtn = screen.getByRole('button', { name: /pattern 3/i });
    await userEvent.click(patternBtn);

    expect(midiService.sendCC).toHaveBeenCalledWith(1, 6, 3); // Emitting index 3
  });

  it('should trigger CC 7 when Arp Mode changes', async () => {
    render(<Arpeggiator />);
    const arpModeBtn = screen.getByRole('button', { name: /arp mode/i });
    await userEvent.click(arpModeBtn);

    expect(midiService.sendCC).toHaveBeenCalledWith(1, 7, 127);
  });
});
