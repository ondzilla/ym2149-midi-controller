import React, { useEffect, useRef } from 'react';
import { midiService } from '../services/midiService';
import { usePatchState } from '../hooks/usePatchState';

// Mapping based on a standard QWERTY layout acting as a piano keyboard
// Lower row (Z-M) for lower octave, middle row (A-L) for main octave, top row (Q-P) for higher octave, etc.
// But following the spec exactly: "mapping a row of keys (like A, S, D, F, G, H, J, K, L) to white notes and the row above it (W, E, T, Y, U, O, P) to black notes"

const KEY_TO_NOTE_MAP: Record<string, number> = {
  // Octave 4 (Middle C)
  'KeyA': 60, // C4
  'KeyW': 61, // C#4
  'KeyS': 62, // D4
  'KeyE': 63, // D#4
  'KeyD': 64, // E4
  'KeyF': 65, // F4
  'KeyT': 66, // F#4
  'KeyG': 67, // G4
  'KeyY': 68, // G#4
  'KeyH': 69, // A4
  'KeyU': 70, // A#4
  'KeyJ': 71, // B4
  'KeyK': 72, // C5
  'KeyO': 73, // C#5
  'KeyL': 74, // D5
  'KeyP': 75, // D#5
  'Semicolon': 76, // E5
  'Quote': 77, // F5
};

export const QwertyKeyboard: React.FC = () => {
  const [globalChannelStr] = usePatchState('globalChannel', '1');
  const activeKeys = useRef<Set<string>>(new Set());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      // Ignore modifiers to allow standard shortcuts
      if (e.ctrlKey || e.metaKey || e.altKey) {
        return;
      }

      const note = KEY_TO_NOTE_MAP[e.code];
      if (note !== undefined && !activeKeys.current.has(e.code)) {
        activeKeys.current.add(e.code);
        const channel = Number(globalChannelStr);
        // Default velocity 100 for typing keys
        try {
          midiService.sendNoteOn(channel, note, 100);
        } catch (e) {
          console.warn('MIDI error', e);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const note = KEY_TO_NOTE_MAP[e.code];
      if (note !== undefined && activeKeys.current.has(e.code)) {
        activeKeys.current.delete(e.code);
        const channel = Number(globalChannelStr);
        try {
          midiService.sendNoteOff(channel, note, 0);
        } catch (e) {
          console.warn('MIDI error', e);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const activeKeysRef = activeKeys.current;

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);

      // Cleanup any stuck notes if the component unmounts while holding keys
      if (activeKeysRef.size > 0) {
        const channel = Number(globalChannelStr);
        activeKeysRef.forEach((code) => {
          const note = KEY_TO_NOTE_MAP[code];
          if (note !== undefined) {
             try {
               midiService.sendNoteOff(channel, note, 0);
             } catch (e) {
               console.warn('MIDI error', e);
             }
          }
        });
        activeKeysRef.clear();
      }
    };
  }, [globalChannelStr]);

  // Pure logic component, no UI
  return null;
};
