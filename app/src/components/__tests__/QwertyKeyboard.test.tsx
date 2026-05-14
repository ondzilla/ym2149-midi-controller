import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QwertyKeyboard } from '../QwertyKeyboard';
import { midiService } from '../../services/midiService';

// Mock the MIDI service
vi.mock('../../services/midiService', () => ({
  midiService: {
    sendNoteOn: vi.fn(),
    sendNoteOff: vi.fn(),
  },
}));

// Mock the patch state hook
vi.mock('../../hooks/usePatchState', () => ({
  usePatchState: vi.fn((_key: string, defaultValue: unknown) => [defaultValue, vi.fn()]),
}));

describe('QwertyKeyboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing and returns null', () => {
    const { container } = render(<QwertyKeyboard />);
    expect(container.firstChild).toBeNull();
  });

  it('sends Note On when a mapped key is pressed', () => {
    render(<QwertyKeyboard />);

    const event = new KeyboardEvent('keydown', { code: 'KeyA' });
    window.dispatchEvent(event);

    expect(midiService.sendNoteOn).toHaveBeenCalledWith(1, 60, 100);
  });

  it('sends Note Off when a mapped key is released', () => {
    render(<QwertyKeyboard />);

    // First press the key so it registers
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyA' }));

    const event = new KeyboardEvent('keyup', { code: 'KeyA' });
    window.dispatchEvent(event);

    expect(midiService.sendNoteOff).toHaveBeenCalledWith(1, 60, 0);
  });

  it('does not send repeated Note On events when a key is held down', () => {
    render(<QwertyKeyboard />);

    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyA' }));
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyA' }));
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyA' }));

    expect(midiService.sendNoteOn).toHaveBeenCalledTimes(1);
  });

  it('ignores key presses if an input element is focused', () => {
    render(<QwertyKeyboard />);

    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    const event = new KeyboardEvent('keydown', { code: 'KeyA' });
    // Manually set target for jsdom
    Object.defineProperty(event, 'target', { value: input, enumerable: true });

    window.dispatchEvent(event);

    expect(midiService.sendNoteOn).not.toHaveBeenCalled();
    document.body.removeChild(input);
  });
});
