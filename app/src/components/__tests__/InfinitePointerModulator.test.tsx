import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InfinitePointerModulator } from '../InfinitePointerModulator';

// Mock the MIDI service and the patch state hook
vi.mock('../../services/midiService', () => ({
  midiService: {
    sendCC: vi.fn(),
  },
}));

// Mock localStorage to satisfy usePatchState internally
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('InfinitePointerModulator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  it('renders the InfinitePointerModulator component properly', () => {
    render(<InfinitePointerModulator />);
    expect(screen.getByText('Infinite Pointer Modulator')).toBeInTheDocument();
    expect(screen.getByText('Click to Lock Pointer')).toBeInTheDocument();
  });

  it('calls requestPointerLock when the pad is clicked', () => {
    // Mock requestPointerLock on the pad element
    const requestPointerLockMock = vi.fn();
    // Use prototype to catch it since we can't easily query the exact ref without a mock
    window.HTMLElement.prototype.requestPointerLock = requestPointerLockMock;

    render(<InfinitePointerModulator />);

    // Find the pad. It's the element with role="button"
    const pad = screen.getByRole('button', { name: /Infinite Modulator Pad/i });

    // Simulate click
    fireEvent.click(pad);

    expect(requestPointerLockMock).toHaveBeenCalled();
  });
});
