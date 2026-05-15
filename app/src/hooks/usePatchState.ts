import { useState, useEffect, useCallback, useRef } from 'react';
import { presetManager } from '../services/presetManager';

export function usePatchState<T>(
  key: string,
  initialValue: T,
  onSync?: (value: T) => void
): [T, (value: T) => void] {
  const onSyncRef = useRef(onSync);

  useEffect(() => {
    onSyncRef.current = onSync;
  }, [onSync]);

  // Initialize from preset manager if it exists, otherwise use initialValue
  const [value, setValue] = useState<T>(() => {
    const storedValue = presetManager.getValue(key);
    if (storedValue !== undefined) {
      return storedValue as T;
    }
    presetManager.setValue(key, initialValue);
    return initialValue;
  });

  const valueRef = useRef(value);

  // Keep the ref in sync with the current value
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  // Subscribe to preset manager changes (for when a preset is loaded)
  useEffect(() => {
    const unsubscribe = presetManager.subscribe((state, changedKey) => {
      // If a specific key changed and it's not our key, ignore it
      if (changedKey !== undefined && changedKey !== key) {
        return;
      }

      if (key in state) {
        const newValue = state[key] as T;
        // Only react to changes coming from external preset loads,
        // to avoid infinite loops and re-triggering MIDI commands.
        if (newValue !== valueRef.current) {
          valueRef.current = newValue;
          setValue(newValue);
          if (onSyncRef.current) {
            onSyncRef.current(newValue);
          }
        }
      }
    });
    return unsubscribe;
  }, [key]);

  // Wrapped setter to update both React state and PresetManager state
  const setPatchState = useCallback((newValue: T) => {
    // Only update if the value has actually changed, to avoid redundant syncs
    if (newValue !== valueRef.current) {
      valueRef.current = newValue; // Update ref immediately to prevent the subscription from reacting
      setValue(newValue);
      presetManager.setValue(key, newValue);
      if (onSyncRef.current) {
        onSyncRef.current(newValue);
      }
    }
  }, [key]);

  return [value, setPatchState];
}
