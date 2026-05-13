import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { QwertyKeyboard } from '../QwertyKeyboard';
import { midiService } from '../../services/midiService';
import * as patchStateHook from '../../hooks/usePatchState';

// Mock the MIDI service
vi.mock('../../services/midiService', () => ({
  midiService: {
    sendNoteOn: vi.fn(),
    sendNoteOff: vi.fn(),
  },
}));

// Mock the hook
vi.mock('../../hooks/usePatchState', () => ({
  usePatchState: vi.fn(),
}));

describe('QwertyKeyboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Provide a default channel mock implementation
    vi.mocked(patchStateHook.usePatchState).mockReturnValue(['1', vi.fn()]);
  });

  it('renders without crashing (headless)', () => {
    const { container } = render(<QwertyKeyboard />);
    expect(container.firstChild).toBeNull();
  });

  it('sends NoteOn when a mapped key is pressed', () => {
    render(<QwertyKeyboard />);

    // Simulate pressing the 'A' key (Code: KeyA)
    const event = new KeyboardEvent('keydown', { code: 'KeyA' });
    window.dispatchEvent(event);

    expect(midiService.sendNoteOn).toHaveBeenCalledTimes(1);
    expect(midiService.sendNoteOn).toHaveBeenCalledWith(1, 60, 127);
  });

  it('sends NoteOff when a mapped key is released', () => {
    render(<QwertyKeyboard />);

    // Press
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyA' }));
    // Release
    window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyA' }));

    expect(midiService.sendNoteOff).toHaveBeenCalledTimes(1);
    expect(midiService.sendNoteOff).toHaveBeenCalledWith(1, 60);
  });

  it('does not send multiple NoteOn messages when holding down a key (OS repeat)', () => {
    render(<QwertyKeyboard />);

    // Simulate OS key repeat
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyA' }));
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyA' }));
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyA' }));

    expect(midiService.sendNoteOn).toHaveBeenCalledTimes(1);
  });

  it('does not send MIDI if typing in an input element', () => {
    render(
      <div>
        <input data-testid="test-input" />
        <QwertyKeyboard />
      </div>
    );

    // Create an input and focus it
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    // Fire keydown
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyA' }));

    expect(midiService.sendNoteOn).not.toHaveBeenCalled();

    document.body.removeChild(input);
  });

  it('clears all active notes on unmount', () => {
    const { unmount } = render(<QwertyKeyboard />);

    // Press two keys
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyA' }));
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW' }));

    expect(midiService.sendNoteOn).toHaveBeenCalledTimes(2);

    // Unmount the component
    unmount();

    // Should have sent note off for both active keys
    expect(midiService.sendNoteOff).toHaveBeenCalledTimes(2);
    expect(midiService.sendNoteOff).toHaveBeenCalledWith(1, 60);
    expect(midiService.sendNoteOff).toHaveBeenCalledWith(1, 61);
  });
});
