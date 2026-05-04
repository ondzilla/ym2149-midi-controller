import { render } from '@testing-library/react';
import { GamepadController } from '../GamepadController';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { presetManager } from '../../services/presetManager';
import { midiService } from '../../services/midiService';

vi.mock('../../services/presetManager', () => ({
  presetManager: {
    getValue: vi.fn(),
  },
}));

vi.mock('../../services/midiService', () => ({
  midiService: {
    sendNoteOn: vi.fn(),
    sendNoteOff: vi.fn(),
    sendCC: vi.fn(),
    sendAllNotesOff: vi.fn(),
  },
}));

describe('GamepadController', () => {
  let mockGamepad: { connected: boolean; buttons: { pressed: boolean; value: number }[]; axes: number[] };
  let requestAnimationFrameSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('navigator', {
      getGamepads: vi.fn(() => [mockGamepad]),
    });

    mockGamepad = {
      connected: true,
      buttons: Array(16).fill({ pressed: false, value: 0 }),
      axes: Array(4).fill(0),
    };

    requestAnimationFrameSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => {
      // Don't call cb to avoid infinite loops in tests, unless we manually trigger it
      return 1;
    });

    vi.mocked(presetManager.getValue).mockReturnValue('1');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('renders null', () => {
    const { container } = render(<GamepadController />);
    expect(container.firstChild).toBeNull();
  });

  it('polls gamepad state and sends note on/off for drum pads', () => {
    // Setup to call the loop exactly once
    requestAnimationFrameSpy.mockImplementationOnce((cb: FrameRequestCallback) => {
      cb(0);
      return 1;
    });

    // Simulate pressing Button A (index 0) -> Note 64
    mockGamepad.buttons[0] = { pressed: true, value: 1 };

    render(<GamepadController />);

    expect(midiService.sendNoteOn).toHaveBeenCalledWith(10, 64, 127);
  });

  it('polls gamepad state and sends CC for continuous axes', () => {
    requestAnimationFrameSpy.mockImplementationOnce((cb: FrameRequestCallback) => {
      cb(0);
      return 1;
    });

    // Simulate left stick Y axis (index 1) full forward -> CC 12 max
    mockGamepad.axes[1] = -1.0; // In standard gamepad API, up is negative, but our mapping says (val+1)/2, so -1 -> 0, 1 -> 127. Wait, let's use 1.0.
    mockGamepad.axes[1] = 1.0;

    render(<GamepadController />);

    expect(midiService.sendCC).toHaveBeenCalledWith(1, 12, 127);
  });
});
