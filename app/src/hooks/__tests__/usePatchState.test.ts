import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { Mock } from 'vitest';
import { usePatchState } from '../usePatchState';
import { presetManager } from '../../services/presetManager';

// Mock presetManager
vi.mock('../../services/presetManager', () => ({
  presetManager: {
    getValue: vi.fn(),
    setValue: vi.fn(),
    subscribe: vi.fn(),
  },
}));

describe('usePatchState', () => {
  const TEST_KEY = 'testKey';
  const INITIAL_VALUE = 'initial';

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementation for subscribe
    (presetManager.subscribe as Mock).mockReturnValue(vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with initialValue if no preset exists', () => {
    (presetManager.getValue as Mock).mockReturnValue(undefined);

    const { result } = renderHook(() => usePatchState<string>(TEST_KEY, INITIAL_VALUE));

    expect(result.current[0]).toBe(INITIAL_VALUE);
    expect(presetManager.getValue).toHaveBeenCalledWith(TEST_KEY);
    expect(presetManager.setValue).toHaveBeenCalledWith(TEST_KEY, INITIAL_VALUE);
  });

  it('should initialize with stored value if it exists', () => {
    const storedValue = 'storedValue';
    (presetManager.getValue as Mock).mockReturnValue(storedValue);

    const { result } = renderHook(() => usePatchState<string>(TEST_KEY, INITIAL_VALUE));

    expect(result.current[0]).toBe(storedValue);
    expect(presetManager.getValue).toHaveBeenCalledWith(TEST_KEY);
    expect(presetManager.setValue).not.toHaveBeenCalled();
  });

  it('should update state, call presetManager, and trigger onSync when setter is called', () => {
    (presetManager.getValue as Mock).mockReturnValue(undefined);
    const onSync = vi.fn();
    const newValue = 'newValue';

    const { result } = renderHook(() => usePatchState<string>(TEST_KEY, INITIAL_VALUE, onSync));

    act(() => {
      result.current[1](newValue);
    });

    expect(result.current[0]).toBe(newValue);
    expect(presetManager.setValue).toHaveBeenCalledWith(TEST_KEY, newValue);
    expect(onSync).toHaveBeenCalledWith(newValue);
  });

  it('should update state and call onSync when presetManager notifies of a change', () => {
    (presetManager.getValue as Mock).mockReturnValue(undefined);
    const onSync = vi.fn();
    let notifyCallback: ((state: Record<string, unknown>) => void) | null = null;

    (presetManager.subscribe as Mock).mockImplementation((cb: (state: Record<string, unknown>) => void) => {
      notifyCallback = cb;
      return vi.fn();
    });

    const { result } = renderHook(() => usePatchState<string>(TEST_KEY, INITIAL_VALUE, onSync));

    const updatedState = { [TEST_KEY]: 'updatedFromPreset' };

    act(() => {
      if (notifyCallback) {
        notifyCallback(updatedState);
      }
    });

    expect(result.current[0]).toBe('updatedFromPreset');
    expect(onSync).toHaveBeenCalledWith('updatedFromPreset');
  });

  it('should clean up subscription on unmount', () => {
    (presetManager.getValue as Mock).mockReturnValue(undefined);
    const unsubscribeMock = vi.fn();
    (presetManager.subscribe as Mock).mockReturnValue(unsubscribeMock);

    const { unmount } = renderHook(() => usePatchState<string>(TEST_KEY, INITIAL_VALUE));

    unmount();

    expect(unsubscribeMock).toHaveBeenCalled();
  });
});
