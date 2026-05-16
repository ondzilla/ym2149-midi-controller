import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Sidebar } from '../Sidebar';
import { midiService } from '../../../services/midiService';
import * as usePatchStateModule from '../../../hooks/usePatchState';

// Mock the midiService
vi.mock('../../../services/midiService', () => ({
  midiService: {
    logs: [],
    subscribe: vi.fn((cb) => {
      // return unsubscribe
      return () => {};
    }),
    clearLogs: vi.fn(),
  }
}));

// Mock the usePatchState hook
vi.mock('../../../hooks/usePatchState', () => ({
  usePatchState: vi.fn(),
}));

// Mock presetManager
vi.mock('../../../services/presetManager', () => ({
  presetManager: {
    savePreset: vi.fn(),
    loadPreset: vi.fn(),
    getPresetNames: vi.fn(() => []),
  }
}));

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (usePatchStateModule.usePatchState as any).mockReturnValue([false, vi.fn()]);
    midiService.logs = [];
  });

  it('renders the Sidebar components', () => {
    render(<Sidebar />);
    expect(screen.getByText('ENGINE_v1.0')).toBeInTheDocument();
  });

  it('does not render MIDI Log Viewer when setting is false', () => {
    render(<Sidebar />);
    expect(screen.queryByText('MIDI Log')).not.toBeInTheDocument();
  });

  it('renders MIDI Log Viewer when setting is true', () => {
    (usePatchStateModule.usePatchState as any).mockImplementation((key: string) => {
      if (key === 'showMidiLog') return [true, vi.fn()];
      return [false, vi.fn()];
    });

    midiService.logs = [
      { timestamp: 12345, type: 'CC', channel: 1, data: [10, 127] }
    ];

    render(<Sidebar />);
    expect(screen.getByText('MIDI LOG')).toBeInTheDocument();
    expect(screen.getAllByText(/CC/)[0]).toBeInTheDocument();
  });

  it('clears MIDI logs when Clear button is clicked', async () => {
    (usePatchStateModule.usePatchState as any).mockImplementation((key: string) => {
      if (key === 'showMidiLog') return [true, vi.fn()];
      return [false, vi.fn()];
    });

    render(<Sidebar />);
    const clearBtn = screen.getByRole('button', { name: /clear log/i });
    await userEvent.click(clearBtn);

    expect(midiService.clearLogs).toHaveBeenCalled();
  });
});
