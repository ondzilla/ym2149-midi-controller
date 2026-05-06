import React, { useState, useEffect, useRef } from 'react';
import { midiService } from '../services/midiService';
import { presetManager } from '../services/presetManager';

// Type definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: {
      new (): SpeechRecognition;
    };
    webkitSpeechRecognition?: {
      new (): SpeechRecognition;
    };
  }
}

export const VoiceController: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [lastTranscript, setLastTranscript] = useState('');
  const [lastCommand, setLastCommand] = useState('');
  const [isSupported] = useState(() => {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  });
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isListeningRef = useRef(isListening);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    const triggerNote = (note: number, channel: number = 10) => {
      try {
        midiService.sendNoteOn(channel, note, 127);
        setTimeout(() => {
          try {
            midiService.sendNoteOff(channel, note, 0);
          } catch (e) {
            console.error('Failed to send Note Off via VoiceController', e);
          }
        }, 100);
      } catch (e) {
        console.error('Failed to send Note On via VoiceController', e);
      }
    };

    const handleCommand = (transcript: string) => {
      let matchedCommand = '';

      try {
        if (transcript.includes('panic') || transcript.includes('stop')) {
          midiService.sendAllNotesOff();
          matchedCommand = 'Panic / All Notes Off';
        } else if (transcript.includes('kick')) {
          triggerNote(64);
          matchedCommand = 'Kick Drum (CH 10)';
        } else if (transcript.includes('snare')) {
          triggerNote(63);
          matchedCommand = 'Snare (CH 10)';
        } else if (transcript.includes('hi-hat') || transcript.includes('hi hat') || transcript.includes('hihat')) {
          triggerNote(62);
          matchedCommand = 'Hi-Hat (CH 10)';
        } else if (transcript.includes('bass')) {
          triggerNote(61);
          matchedCommand = 'Bass Thing (CH 10)';
        } else if (transcript.includes('yap')) {
          triggerNote(60);
          matchedCommand = 'Dog Yap (CH 10)';
        } else if (transcript.includes('preset one')) {
          presetManager.loadPreset('Preset One');
          matchedCommand = 'Loaded Preset One';
        } else if (transcript.includes('preset two')) {
          presetManager.loadPreset('Preset Two');
          matchedCommand = 'Loaded Preset Two';
        }

        if (matchedCommand) {
          setLastCommand(matchedCommand);
          // Clear command feedback after 3 seconds
          setTimeout(() => setLastCommand(''), 3000);
        }
      } catch (e) {
        console.error('Failed to execute voice command', e);
      }
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const results = event.results;
      const latestResult = results[results.length - 1];
      const transcript = latestResult[0].transcript.trim().toLowerCase();

      setLastTranscript(transcript);
      handleCommand(transcript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.warn('Speech Recognition error', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      // Auto-restart if we're supposed to be listening
      if (isListeningRef.current) {
        try {
          recognition.start();
        } catch (e) {
          console.warn('Failed to restart speech recognition', e);
          setIsListening(false);
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        // Prevent zombie listeners from restarting recognition after unmount
        recognitionRef.current.onend = null;
        isListeningRef.current = false;
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Update recognition active state when isListening changes
  useEffect(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    if (isListening) {
      try {
        recognition.start();
      } catch (e) {
        console.warn('Failed to start speech recognition', e);
      }
    } else {
      recognition.stop();
    }
  }, [isListening]);

  const toggleListening = () => {
    setIsListening(prev => !prev);
  };

  if (!isSupported) {
    return (
      <div className="fixed bottom-4 right-4 bg-surface-container-high border border-outline p-4 shadow-lg z-50 pointer-events-none">
        <p className="font-headline text-[10px] text-error">VOICE_CTRL: NOT_SUPPORTED</p>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-surface-container-high border border-[#32152f] p-4 shadow-lg z-50 w-64">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-headline text-xs tracking-widest text-tertiary">VOICE_CTRL</h3>
        <button
          onClick={toggleListening}
          className={`material-symbols-outlined rounded p-1 transition-colors ${
            isListening ? 'text-error animate-pulse shadow-[0_0_8px_var(--error)]' : 'text-primary opacity-60 hover:opacity-100'
          }`}
          aria-label={isListening ? 'Stop listening' : 'Start listening'}
          title={isListening ? 'Stop listening' : 'Start listening'}
        >
          {isListening ? 'mic' : 'mic_off'}
        </button>
      </div>

      <div className="space-y-2">
        <div className="bg-black/40 p-2 border border-surface-container-highest">
          <p className="font-headline text-[9px] text-tertiary opacity-60">TRANSCRIPT</p>
          <p className="font-body text-xs truncate text-on-surface" title={lastTranscript}>
            {lastTranscript || 'Waiting...'}
          </p>
        </div>

        <div className="bg-black/40 p-2 border border-surface-container-highest">
          <p className="font-headline text-[9px] text-tertiary opacity-60">COMMAND</p>
          <p className="font-body text-xs truncate text-[#8eff71] h-4">
            {lastCommand}
          </p>
        </div>
      </div>
    </div>
  );
};
