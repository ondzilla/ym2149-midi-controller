import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MidiPaint } from '../MidiPaint';



// Mock canvas API
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4) })),
  putImageData: vi.fn(),
  createImageData: vi.fn(),
  setTransform: vi.fn(),
  drawImage: vi.fn(),
  save: vi.fn(),
  fillText: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  stroke: vi.fn(),
  translate: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  measureText: vi.fn(() => ({ width: 0 })),
  transform: vi.fn(),
  rect: vi.fn(),
  clip: vi.fn(),
})) as any;

// Add missing pointer capture methods to jsdom
HTMLElement.prototype.setPointerCapture = vi.fn();
HTMLElement.prototype.releasePointerCapture = vi.fn();

vi.mock('../../services/midiService', () => ({
  midiService: {
    sendNoteOn: vi.fn(),
    sendNoteOff: vi.fn(),
  }
}));

vi.mock('../../services/transportService', () => ({
  transportService: {
    isPlaying: true,
    bpm: 120,
    subscribe: vi.fn(() => () => {}),
  }
}));

describe('MidiPaint Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<MidiPaint />);
    expect(screen.queryByText(/MIDI_PAINT \[EXPERIMENTAL\]/) || screen.queryByText(/MIDI_PAINT \[SYNCED\]/)).toBeInTheDocument();
    expect(screen.getByText(/DRAW STROKES TO GENERATE MIDI NOTES/i)).toBeInTheDocument();
  });

  it('handles pointer events for drawing', () => {
    render(<MidiPaint />);
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    expect(canvas).toBeInTheDocument();

    fireEvent.pointerDown(canvas, { clientX: 10, clientY: 10 });
    fireEvent.pointerMove(canvas, { clientX: 20, clientY: 20 });
    fireEvent.pointerUp(canvas, { clientX: 20, clientY: 20 });

    expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalled();
  });

  it('clears canvas when Clear button is clicked', () => {
    render(<MidiPaint />);
    const clearButton = screen.getByText('Clear');
    fireEvent.click(clearButton);
    expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalled();
  });
});
