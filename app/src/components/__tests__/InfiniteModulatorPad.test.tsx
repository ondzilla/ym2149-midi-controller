import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InfiniteModulatorPad } from '../InfiniteModulatorPad';
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

describe('InfiniteModulatorPad Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock document.exitPointerLock
    document.exitPointerLock = vi.fn();
  });

  it('renders correctly with default ARIA attributes', () => {
    render(<InfiniteModulatorPad />);
    const pad = screen.getByRole('button');
    expect(pad).toBeInTheDocument();
    expect(pad).toHaveAttribute('aria-label', 'Infinite Modulator Pad');
    expect(pad).toHaveAttribute('aria-pressed', 'false');
  });

  it('requests pointer lock on click when unlocked', () => {
    render(<InfiniteModulatorPad />);
    const pad = screen.getByRole('button');
    pad.requestPointerLock = vi.fn();

    fireEvent.click(pad);

    expect(pad.requestPointerLock).toHaveBeenCalled();
  });

  it('exits pointer lock on click when locked', () => {
    render(<InfiniteModulatorPad />);
    const pad = screen.getByRole('button');

    // Simulate lock
    Object.defineProperty(document, 'pointerLockElement', {
      writable: true,
      value: pad,
    });
    fireEvent(document, new Event('pointerlockchange'));

    // Component is now locked. Clicking should exit lock.
    fireEvent.click(pad);

    expect(document.exitPointerLock).toHaveBeenCalled();
  });

  it('accumulates mousemove deltas and sends MIDI when locked', () => {
    render(<InfiniteModulatorPad />);
    const pad = screen.getByRole('button');

    // Simulate lock
    Object.defineProperty(document, 'pointerLockElement', {
      writable: true,
      value: pad,
    });
    fireEvent(document, new Event('pointerlockchange'));

    // Dispatch mousemove on document
    fireEvent(document, new MouseEvent('mousemove', {
      movementX: 10,
      movementY: -20, // Negative Y means moving up, which increases vibrato depth
    }));

    // sensitivity is 0.5.
    // Detune (X): 64 + (10 * 0.5) = 69
    // Vibrato Depth (Y): 40 - (-20 * 0.5) = 50. Depth 50% maps to MIDI value 64.

    expect(midiService.sendCC).toHaveBeenCalledWith(1, 1, 69); // detune
    expect(midiService.sendCC).toHaveBeenCalledWith(1, 3, 64); // vibrato depth
  });

  it('wraps accumulated values correctly', () => {
    render(<InfiniteModulatorPad />);
    const pad = screen.getByRole('button');

    // Simulate lock
    Object.defineProperty(document, 'pointerLockElement', {
      writable: true,
      value: pad,
    });
    fireEvent(document, new Event('pointerlockchange'));

    // Move extremely far to the right and up to test wrapping
    fireEvent(document, new MouseEvent('mousemove', {
      movementX: 1000, // +500 to detune (64 + 500 = 564. 564 % 128 = 52)
      movementY: -1000, // +500 to vibrato depth (40 + 500 = 540. 540 % 101 = 35)
    }));

    // Expect wrapped MIDI CCs
    expect(midiService.sendCC).toHaveBeenCalledWith(1, 1, 52);
    // vibrato depth percentage 35 maps to CC value: Math.round(35 / 100 * 127) = 44
    expect(midiService.sendCC).toHaveBeenCalledWith(1, 3, 44);
  });
});
