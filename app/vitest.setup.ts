import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Global mock for navigator.requestMIDIAccess 
// Since testing frameworks run in a Node/jsdom environment, Web MIDI API is undefined by default.
const mockMIDIAccess = {
  inputs: new Map(),
  outputs: new Map(),
  onstatechange: null,
};

Object.defineProperty(navigator, 'requestMIDIAccess', {
  value: vi.fn().mockResolvedValue(mockMIDIAccess),
  writable: true,
  configurable: true,
});
