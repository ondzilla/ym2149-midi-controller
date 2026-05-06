import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VoiceController } from '../VoiceController';
import { midiService } from '../../services/midiService';
import { presetManager } from '../../services/presetManager';

vi.mock('../../services/midiService', () => ({
  midiService: {
    sendAllNotesOff: vi.fn(),
    sendNoteOn: vi.fn(),
    sendNoteOff: vi.fn(),
  },
}));

vi.mock('../../services/presetManager', () => ({
  presetManager: {
    loadPreset: vi.fn(),
  },
}));

describe('VoiceController', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let originalSpeechRecognition: any;

  beforeEach(() => {
    vi.clearAllMocks();
    originalSpeechRecognition = window.SpeechRecognition;
    // Mock the Web Speech API
    class MockSpeechRecognition {
      continuous = false;
      interimResults = false;
      lang = '';
      start = vi.fn();
      stop = vi.fn();
      abort = vi.fn();
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window.SpeechRecognition = MockSpeechRecognition as any;
  });

  afterEach(() => {
    window.SpeechRecognition = originalSpeechRecognition;
  });

  it('renders not supported message when SpeechRecognition is missing', () => {
    window.SpeechRecognition = undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).webkitSpeechRecognition = undefined;

    render(<VoiceController />);
    expect(screen.getByText('VOICE_CTRL: NOT_SUPPORTED')).toBeInTheDocument();
  });

  it('renders correctly when supported', () => {
    render(<VoiceController />);
    expect(screen.getByText('VOICE_CTRL')).toBeInTheDocument();
    expect(screen.getByText('TRANSCRIPT')).toBeInTheDocument();
    expect(screen.getByText('COMMAND')).toBeInTheDocument();
  });

  it('toggles listening state when mic button is clicked', () => {
    render(<VoiceController />);
    const button = screen.getByRole('button', { name: /start listening/i });

    // Initially not listening
    expect(button).toHaveTextContent('mic_off');

    // Click to start listening
    fireEvent.click(button);
    expect(button).toHaveTextContent('mic');
    expect(button).toHaveAttribute('aria-label', 'Stop listening');

    // Click to stop listening
    fireEvent.click(button);
    expect(button).toHaveTextContent('mic_off');
  });

  it('dispatches Panic command when transcript includes "panic"', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let onResultCallback: any;

    class MockSpeechRecognition {
      start = vi.fn();
      stop = vi.fn();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      set onresult(cb: any) { onResultCallback = cb; }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window.SpeechRecognition = MockSpeechRecognition as any;

    render(<VoiceController />);

    onResultCallback({
      results: [
        [{ transcript: 'panic' }]
      ]
    });

    expect(midiService.sendAllNotesOff).toHaveBeenCalled();
  });

  it('dispatches Kick Drum Note On/Off when transcript includes "kick"', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let onResultCallback: any;
    class MockSpeechRecognition {
      start = vi.fn();
      stop = vi.fn();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      set onresult(cb: any) { onResultCallback = cb; }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window.SpeechRecognition = MockSpeechRecognition as any;

    render(<VoiceController />);
    onResultCallback({
      results: [
        [{ transcript: 'kick' }]
      ]
    });

    expect(midiService.sendNoteOn).toHaveBeenCalledWith(10, 64, 127);
  });

  it('loads preset when transcript includes "preset one"', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let onResultCallback: any;
    class MockSpeechRecognition {
      start = vi.fn();
      stop = vi.fn();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      set onresult(cb: any) { onResultCallback = cb; }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window.SpeechRecognition = MockSpeechRecognition as any;

    render(<VoiceController />);
    onResultCallback({
      results: [
        [{ transcript: 'preset one' }]
      ]
    });

    expect(presetManager.loadPreset).toHaveBeenCalledWith('Preset One');
  });
});
