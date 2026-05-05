import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VisualEnvelopeEditor } from '../VisualEnvelopeEditor';
import { midiService } from '../../services/midiService';

vi.mock('../../services/midiService', () => ({
  midiService: {
    sendCC: vi.fn(),
  }
}));

describe('VisualEnvelopeEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the visual envelope editor', () => {
    render(<VisualEnvelopeEditor activeChannel={1} />);
    expect(screen.getByLabelText(/attack/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/decay/i)).toBeInTheDocument();
  });

  it('should map Attack value correctly and send CC 12', () => {
    render(<VisualEnvelopeEditor activeChannel={1} />);
    const attackSlider = screen.getByLabelText(/attack/i);

    fireEvent.change(attackSlider, { target: { value: '50' } });

    // mathUtils.percentageToMidi(50) -> 64
    expect(midiService.sendCC).toHaveBeenCalledWith(1, 12, 64);
  });

  it('should map Decay value correctly and send CC 11', () => {
    render(<VisualEnvelopeEditor activeChannel={1} />);
    const decaySlider = screen.getByLabelText(/decay/i);

    fireEvent.change(decaySlider, { target: { value: '100' } });

    // mathUtils.percentageToMidi(100) -> 127
    expect(midiService.sendCC).toHaveBeenCalledWith(1, 11, 127);
  });
});
