import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { presetManager } from '../presetManager';

describe('PresetManager', () => {
  let localStorageMock: Record<string, string> = {};

  beforeEach(() => {
    // Reset singleton state internally by wiping localStorage
    localStorageMock = {};
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key: string) => localStorageMock[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        localStorageMock[key] = value;
      }),
      clear: vi.fn(() => {
        localStorageMock = {};
      }),
    });

    // Clear out preset manager internal state
    const currentKeys = ['attack', 'decay', 'detune', 'pitchBend'];
    currentKeys.forEach(k => presetManager.setValue(k, undefined));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should store and retrieve current values', () => {
    presetManager.setValue('testKey', 'testValue');
    expect(presetManager.getValue('testKey')).toBe('testValue');
  });

  it('should save preset to localStorage', () => {
    presetManager.setValue('attack', '42');
    presetManager.savePreset('test_preset');

    const storedData = JSON.parse(localStorageMock['ym2149_presets']);
    expect(storedData['test_preset']).toBeDefined();
    expect(storedData['test_preset'].attack).toBe('42');
  });

  it('should notify subscribers when a preset is loaded', () => {
    // Setup mock data in localStorage
    localStorageMock['ym2149_presets'] = JSON.stringify({
      'loaded_preset': { attack: '99', decay: '11' }
    });

    const listener = vi.fn();
    const unsubscribe = presetManager.subscribe(listener);

    presetManager.loadPreset('loaded_preset');

    expect(listener).toHaveBeenCalled();
    expect(presetManager.getValue('attack')).toBe('99');
    expect(presetManager.getValue('decay')).toBe('11');

    unsubscribe();
  });

  it('should return empty list when no presets exist', () => {
    expect(presetManager.getPresetNames()).toEqual([]);
  });

  it('should return list of preset names', () => {
    localStorageMock['ym2149_presets'] = JSON.stringify({
      'preset1': { attack: '1' },
      'preset2': { attack: '2' }
    });

    expect(presetManager.getPresetNames()).toEqual(['preset1', 'preset2']);
  });
});
