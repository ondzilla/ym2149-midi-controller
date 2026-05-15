import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MidiPaint } from '../MidiPaint';

// Mock matchMedia and other DOM APIs not present in jsdom
beforeEach(() => {
  vi.stubGlobal('requestAnimationFrame', vi.fn((cb) => setTimeout(cb, 0)));
  vi.stubGlobal('cancelAnimationFrame', vi.fn(clearTimeout));

  // Mock canvas methods
  HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
    fillStyle: '',
    shadowColor: '',
    shadowBlur: 0,
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    strokeStyle: '',
    lineWidth: 0,
    lineCap: '',
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    clearRect: vi.fn(),
    getImageData: vi.fn().mockReturnValue({
      data: new Uint8ClampedArray(4) // Mock minimal image data
    })
  } as unknown as CanvasRenderingContext2D);

  Element.prototype.getBoundingClientRect = vi.fn().mockReturnValue({
    width: 512, height: 128, top: 0, left: 0, bottom: 0, right: 0, x: 0, y: 0, toJSON: () => {}
  });

  HTMLElement.prototype.setPointerCapture = vi.fn();
  HTMLElement.prototype.releasePointerCapture = vi.fn();
});

describe('MidiPaint Component', () => {
  it('renders correctly', () => {
    render(<MidiPaint />);
    expect(screen.getByText('MIDI_PAINT [EXPERIMENTAL]')).toBeInTheDocument();
    expect(screen.getByText(/DRAW STROKES TO GENERATE MIDI NOTES/i)).toBeInTheDocument();
  });

  it('can toggle playback', () => {
    render(<MidiPaint />);
    const toggleButton = screen.getByLabelText('Stop Playback'); // Initially playing

    fireEvent.click(toggleButton);
    expect(screen.getByLabelText('Start Playback')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Start Playback'));
    expect(screen.getByLabelText('Stop Playback')).toBeInTheDocument();
  });

  it('handles pointer events for drawing', () => {
    render(<MidiPaint />);
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    expect(canvas).toBeInTheDocument();

    // Simulate drawing
    fireEvent.pointerDown(canvas, { clientX: 10, clientY: 10, pointerId: 1 });
    fireEvent.pointerMove(canvas, { clientX: 20, clientY: 20, pointerId: 1 });
    fireEvent.pointerUp(canvas, { clientX: 20, clientY: 20, pointerId: 1 });

    // Check if drawing functions were called on the mocked context
    const ctx = canvas.getContext('2d');
    expect(ctx?.beginPath).toHaveBeenCalled();
    expect(ctx?.fill).toHaveBeenCalled();
    expect(ctx?.stroke).toHaveBeenCalled();
  });

  it('clears canvas when Clear button is clicked', () => {
    render(<MidiPaint />);
    const clearButton = screen.getByText('Clear');
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');

    fireEvent.click(clearButton);
    expect(ctx?.clearRect).toHaveBeenCalledWith(0, 0, 512, 128);
  });
});
