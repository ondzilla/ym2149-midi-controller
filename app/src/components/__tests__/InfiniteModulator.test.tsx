import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { InfiniteModulator } from '../InfiniteModulator';
import { midiService } from '../../services/midiService';

// Mock the MIDI service
vi.mock('../../services/midiService', () => ({
  midiService: {
    sendCC: vi.fn(),
  }
}));

describe('InfiniteModulator', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock Pointer Lock API
    Element.prototype.requestPointerLock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(document, 'pointerLockElement', {
      writable: true,
      value: null
    });

    // Mock requestAnimationFrame for synchronous execution
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
      cb(0);
      return 1;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders correctly initially', () => {
    render(<InfiniteModulator />);
    expect(screen.getByText('INFINITE_MODULATOR')).toBeInTheDocument();
    expect(screen.getByText('Click to Lock Pointer')).toBeInTheDocument();
  });

  it('requests pointer lock on click', async () => {
    render(<InfiniteModulator />);
    const pad = screen.getByRole('button', { name: /infinite modulator pad/i });

    await act(async () => {
      fireEvent.mouseDown(pad);
    });

    expect(Element.prototype.requestPointerLock).toHaveBeenCalled();
  });

  it('captures mouse movement and sends MIDI CC when locked', async () => {
    render(<InfiniteModulator />);
    const pad = screen.getByRole('button', { name: /infinite modulator pad/i });

    // Simulate lock
    Object.defineProperty(document, 'pointerLockElement', { value: pad });
    act(() => {
      document.dispatchEvent(new Event('pointerlockchange'));
    });

    // Simulate mouse move right (+X) and up (-Y from browser, mapped to +Y logic)
    act(() => {
      fireEvent.mouseMove(pad, { movementX: 10, movementY: -10 });
    });

    // initial value is 64. sensitivity is 0.5. delta is 5.
    // X goes to 69, Y goes to 69
    expect(midiService.sendCC).toHaveBeenCalledWith(1, 1, 69);
    expect(midiService.sendCC).toHaveBeenCalledWith(1, 3, 69);
  });

  it('wraps values continuously around 0-127', async () => {
    render(<InfiniteModulator />);
    const pad = screen.getByRole('button', { name: /infinite modulator pad/i });

    // Simulate lock
    Object.defineProperty(document, 'pointerLockElement', { value: pad });
    act(() => {
      document.dispatchEvent(new Event('pointerlockchange'));
    });

    // Move past the limit (+200 delta) -> requires +400 movementX
    act(() => {
      fireEvent.mouseMove(pad, { movementX: 400, movementY: 0 });
    });

    // initial 64 + 200 = 264. 264 % 128 = 8.
    expect(midiService.sendCC).toHaveBeenCalledWith(1, 1, 8);
  });

  it('handles negative movement values correctly', async () => {
    render(<InfiniteModulator />);
    const pad = screen.getByRole('button', { name: /infinite modulator pad/i });

    // Simulate lock
    Object.defineProperty(document, 'pointerLockElement', { value: pad });
    act(() => {
      document.dispatchEvent(new Event('pointerlockchange'));
    });

    // Move backwards past zero (-100 delta from 64) -> requires -200 movementX
    act(() => {
      fireEvent.mouseMove(pad, { movementX: -200, movementY: 0 });
    });

    // current 64 - 100 = -36. (-36 % 128 + 128) % 128 = 92.
    expect(midiService.sendCC).toHaveBeenCalledWith(1, 1, 92);
  });

  it('updates visual representation on UI', async () => {
    render(<InfiniteModulator />);
    const pad = screen.getByRole('button', { name: /infinite modulator pad/i });

    Object.defineProperty(document, 'pointerLockElement', { value: pad });
    act(() => {
      document.dispatchEvent(new Event('pointerlockchange'));
    });

    act(() => {
      fireEvent.mouseMove(pad, { movementX: 20, movementY: -20 });
    });

    // 64 + 10 = 74
    expect(screen.getByText('X: 74')).toBeInTheDocument();
    expect(screen.getByText('Y: 74')).toBeInTheDocument();
  });
});
