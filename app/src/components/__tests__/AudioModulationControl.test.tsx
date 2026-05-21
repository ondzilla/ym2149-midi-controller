import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { VibratoLFO } from '../SynthControls';

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserver;

describe('AudioModulationControl inside VibratoLFO', () => {
  const mockGetUserMedia = vi.fn();
  const mockGetTracks = vi.fn();
  const mockStop = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockGetTracks.mockReturnValue([{ stop: mockStop }]);
    mockGetUserMedia.mockResolvedValue({
      getTracks: mockGetTracks
    });

    Object.defineProperty(global.navigator, 'mediaDevices', {
      value: {
        getUserMedia: mockGetUserMedia
      },
      configurable: true
    });

    // Mock AudioContext
    class MockAudioContext {
      state = 'running';
      createMediaStreamSource = vi.fn().mockReturnValue({ connect: vi.fn() });
      createAnalyser = vi.fn().mockReturnValue({
        fftSize: 256,
        frequencyBinCount: 128,
        connect: vi.fn(),
        getByteTimeDomainData: vi.fn((array) => {
          // Fill with dummy data
          for(let i=0; i<array.length; i++) array[i] = 128;
        })
      });
      close = vi.fn().mockResolvedValue(undefined);
    }

    window.AudioContext = MockAudioContext as unknown as typeof window.AudioContext;
  });

  afterEach(() => {
    // Clean up
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('renders the AUDIO_MOD toggle button', () => {
    render(<VibratoLFO />);
    expect(screen.getByLabelText('AUDIO_MOD')).toBeInTheDocument();
  });

  it('calls getUserMedia when toggled on', async () => {
    const user = userEvent.setup();
    render(<VibratoLFO />);

    const toggleButton = screen.getByRole('button', { name: /Toggle Audio Modulation/i });
    expect(toggleButton).toHaveAttribute('aria-pressed', 'false');

    await act(async () => {
      await user.click(toggleButton);
    });

    expect(toggleButton).toHaveAttribute('aria-pressed', 'true');
    expect(mockGetUserMedia).toHaveBeenCalledWith({ audio: true });
  });
});
