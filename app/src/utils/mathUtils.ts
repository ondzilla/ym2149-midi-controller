/**
 * mathUtils.ts
 * 
 * Utility functions for transforming raw UI ranges (e.g., 0-100% sliders or
 * -36 to +36 steps) into strictly bounded 7-bit MIDI values (0-127).
 */

/**
 * Maps a percentage (0-100) to a standard 7-bit MIDI value (0-127).
 */
export function percentageToMidi(percentage: number): number {
  const clamped = Math.max(0, Math.min(100, percentage));
  return Math.round((clamped / 100) * 127);
}

/**
 * Maps a bounded input range to a bounded output range (e.g., mapping -36/36 to 0/127).
 */
export function mapRange(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
  if (inMax === inMin) return outMin;
  const clampedValue = Math.max(inMin, Math.min(value, inMax));
  return Math.round(((clampedValue - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin);
}
