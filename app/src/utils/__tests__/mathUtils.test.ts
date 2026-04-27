import { describe, it, expect } from 'vitest';
import { percentageToMidi, mapRange } from '../mathUtils';

describe('mathUtils', () => {
  describe('percentageToMidi', () => {
    it('should scale 0% to 0', () => {
      expect(percentageToMidi(0)).toBe(0);
    });

    it('should scale 100% to 127', () => {
      expect(percentageToMidi(100)).toBe(127);
    });

    it('should scale 50% to roughly 64', () => {
      expect(percentageToMidi(50)).toBe(64);
    });

    it('should clamp values below 0 to 0', () => {
      expect(percentageToMidi(-50)).toBe(0);
    });

    it('should clamp values above 100 to 127', () => {
      expect(percentageToMidi(150)).toBe(127);
    });
  });

  describe('mapRange', () => {
    it('should linearly map a value from one range to another', () => {
      // Mapping pitch bend (-32 to 32) -> 0 to 127
      expect(mapRange(0, -32, 32, 0, 127)).toBe(64); 
      expect(mapRange(-32, -32, 32, 0, 127)).toBe(0);
      expect(mapRange(32, -32, 32, 0, 127)).toBe(127);
    });

    it('should clamp bounded outputs', () => {
      expect(mapRange(-50, -32, 32, 0, 127)).toBe(0);
      expect(mapRange(100, -32, 32, 0, 127)).toBe(127);
    });
  });
});
