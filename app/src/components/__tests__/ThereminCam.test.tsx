import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThereminCam } from '../ThereminCam';

// Mock dependencies
vi.mock('../../services/midiService', () => ({
  midiService: {
    sendCC: vi.fn(),
  },
}));

vi.mock('../../services/presetManager', () => ({
  presetManager: {
    getValue: vi.fn().mockReturnValue('1'),
  },
}));

describe('ThereminCam', () => {
  const originalMediaDevices = navigator.mediaDevices;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock mediaDevices
    Object.defineProperty(navigator, 'mediaDevices', {
      value: {
        getUserMedia: vi.fn().mockResolvedValue({
          getTracks: () => [{ stop: vi.fn() }],
        }),
      },
      configurable: true,
    });

    // Mock canvas context
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      drawImage: vi.fn(),
      getImageData: vi.fn().mockReturnValue({
        data: new Uint8ClampedArray(64 * 48 * 4).fill(0), // Mock pixel data
      }),
    }) as unknown as typeof HTMLCanvasElement.prototype.getContext;
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'mediaDevices', {
      value: originalMediaDevices,
      configurable: true,
    });
  });

  it('renders "NOT_SUPPORTED" when mediaDevices are unavailable', () => {
    Object.defineProperty(navigator, 'mediaDevices', {
      value: undefined,
      configurable: true,
    });

    render(<ThereminCam />);
    expect(screen.getByText('THEREMIN_CAM: NOT_SUPPORTED')).toBeInTheDocument();
  });

  it('renders the component and toggles listening state', async () => {
    render(<ThereminCam />);

    const title = screen.getByText('THEREMIN_CAM');
    expect(title).toBeInTheDocument();

    const toggleButton = screen.getByRole('button', { name: /Start Theremin Cam/i });
    expect(toggleButton).toBeInTheDocument();

    fireEvent.click(toggleButton);

    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
      video: { width: 64, height: 48 },
    });
  });
});
