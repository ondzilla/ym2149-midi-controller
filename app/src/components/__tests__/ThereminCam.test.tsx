import { render, screen, act } from '@testing-library/react';
import { ThereminCam } from '../ThereminCam';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('ThereminCam', () => {
  let mockGetUserMedia: ReturnType<typeof vi.fn>;
  let cancelAnimationFrameSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    mockGetUserMedia = vi.fn().mockResolvedValue({
      getTracks: () => [{ stop: vi.fn() }]
    });

    Object.defineProperty(global.navigator, 'mediaDevices', {
      value: {
        getUserMedia: mockGetUserMedia,
      },
      writable: true,
    });

    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      return setTimeout(cb, 16) as unknown as number;
    });

    cancelAnimationFrameSpy = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
      clearTimeout(id as unknown as NodeJS.Timeout);
    });

    // Mock HTMLMediaElement functions
    window.HTMLMediaElement.prototype.play = vi.fn();

    // Mock canvas getContext
    window.HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      drawImage: vi.fn(),
      getImageData: vi.fn(() => ({
        data: new Uint8ClampedArray(4 * 320 * 240),
        width: 320,
        height: 240,
        colorSpace: 'srgb',
      })),
    })) as unknown as typeof window.HTMLCanvasElement.prototype.getContext;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders and attempts to access the camera', async () => {
    render(<ThereminCam />);

    expect(screen.getByText('Theremin Cam')).toBeInTheDocument();
    expect(screen.getByText('INITIALIZING...')).toBeInTheDocument();

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(mockGetUserMedia).toHaveBeenCalledWith({ video: { width: 320, height: 240 } });
  });

  it('cleans up stream tracks and animation frame on unmount', async () => {
    const mockStop = vi.fn();
    mockGetUserMedia.mockResolvedValueOnce({
      getTracks: () => [{ stop: mockStop }]
    });

    const { unmount } = render(<ThereminCam />);

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    unmount();

    expect(mockStop).toHaveBeenCalled();
    expect(cancelAnimationFrameSpy).toHaveBeenCalled();
  });

  it('displays error if camera access fails', async () => {
    mockGetUserMedia.mockRejectedValueOnce(new Error('Permission denied'));

    render(<ThereminCam />);

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(screen.getByText('Permission denied')).toBeInTheDocument();
  });
});
