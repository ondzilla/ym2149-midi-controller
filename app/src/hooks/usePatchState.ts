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

  // Subscribe to preset manager changes (for when a preset is loaded)
  useEffect(() => {
    const unsubscribe = presetManager.subscribe((state) => {
      if (key in state) {
        const newValue = state[key] as T;
        setValue(newValue);
        if (onSyncRef.current) {
          onSyncRef.current(newValue);
        }
      }
    });
    return unsubscribe;
  }, [key]);

  // Wrapped setter to update both React state and PresetManager state
  const setPatchState = useCallback((newValue: T) => {
    setValue(newValue);
    presetManager.setValue(key, newValue);
    if (onSyncRef.current) {
      onSyncRef.current(newValue);
    }
  }, [key]);

  return [value, setPatchState];
}
