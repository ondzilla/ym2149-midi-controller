import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { XYPad } from '../XYPad';
import { midiService } from '../../services/midiService';

// Mock midiService
vi.mock('../../services/midiService', () => ({
  midiService: {
    sendCC: vi.fn(),
  },
}));

// Mock presetManager to avoid actual localStorage interactions
vi.mock('../../services/presetManager', () => ({
  presetManager: {
    getValue: vi.fn(),
    setValue: vi.fn(),
    subscribe: vi.fn(() => () => {}),
  },
}));

describe('XYPad Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Set default element client bounds
    Element.prototype.getBoundingClientRect = vi.fn(() => {
      return {
        width: 100,
        height: 100,
        top: 0,
        left: 0,
        bottom: 100,
        right: 100,
        x: 0,
        y: 0,
        toJSON: () => {},
      };
    });
  });

  it('renders correctly with default ARIA attributes', () => {
    render(<XYPad />);
    const pad = screen.getByRole('slider');
    expect(pad).toBeInTheDocument();
    expect(pad).toHaveAttribute('aria-label', 'XY Expression Pad');
    expect(pad).toHaveAttribute('aria-valuemin', '0');
    expect(pad).toHaveAttribute('aria-valuemax', '100');
  });

  it('updates state and sends MIDI on pointer drag', () => {
    render(<XYPad />);
    const pad = screen.getByRole('slider');

    // Simulate setPointerCapture and hasPointerCapture existing on Element
    pad.setPointerCapture = vi.fn();
    pad.releasePointerCapture = vi.fn();
    pad.hasPointerCapture = vi.fn().mockReturnValue(true);

    // Pointer down at center
    fireEvent.pointerDown(pad, { pointerId: 1, clientX: 50, clientY: 50, buttons: 1 });

    // Check initial MIDI sends from the usePatchState default setup - wait, usePatchState initially syncs if an update is pushed, but the drag directly triggers setDetune/setVibratoDepth.

    // Now move pointer to top right (X=100, Y=0)
    // Map: X=1.0 -> Detune=127, Y=0.0 -> VibratoDepth=100 (since 1 - 0 = 1)
    fireEvent.pointerMove(pad, { pointerId: 1, clientX: 100, clientY: 0, buttons: 1 });

    expect(midiService.sendCC).toHaveBeenCalledWith(1, 1, 127); // detune
    expect(midiService.sendCC).toHaveBeenCalledWith(1, 3, 127); // vibrato depth percentageToMidi(100) -> 127

    // Move pointer to bottom left (X=0, Y=100)
    // Map: X=0.0 -> Detune=0, Y=1.0 -> VibratoDepth=0 (since 1 - 1 = 0)
    fireEvent.pointerMove(pad, { pointerId: 1, clientX: 0, clientY: 100, buttons: 1 });

    expect(midiService.sendCC).toHaveBeenCalledWith(1, 1, 0); // detune
    expect(midiService.sendCC).toHaveBeenCalledWith(1, 3, 0); // vibrato depth percentageToMidi(0) -> 0

    fireEvent.pointerUp(pad, { pointerId: 1 });
  });

  it('handles keyboard navigation', () => {
    render(<XYPad />);
    const pad = screen.getByRole('slider');

    // Initial default: detune=64, vibratoDepth=40
    fireEvent.keyDown(pad, { key: 'ArrowUp' });
    expect(midiService.sendCC).toHaveBeenCalledWith(1, 3, Math.round((41 / 100) * 127)); // 41% mapped to CC

    fireEvent.keyDown(pad, { key: 'ArrowRight' });
    expect(midiService.sendCC).toHaveBeenCalledWith(1, 1, 65); // detune 64 -> 65

    fireEvent.keyDown(pad, { key: 'ArrowDown' });
    expect(midiService.sendCC).toHaveBeenCalledWith(1, 3, Math.round((40 / 100) * 127)); // 41 -> 40

    fireEvent.keyDown(pad, { key: 'ArrowLeft' });
    expect(midiService.sendCC).toHaveBeenCalledWith(1, 1, 64); // detune 65 -> 64
  });
});
