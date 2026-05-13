import React, { useEffect, useRef } from 'react';
import { midiService } from '../services/midiService';
import { usePatchState } from '../hooks/usePatchState';

const KEY_TO_NOTE_MAP: Record<string, number> = {
  // Bottom row (White keys)
  'KeyA': 60, // C4
  'KeyS': 62, // D4
  'KeyD': 64, // E4
  'KeyF': 65, // F4
  'KeyG': 67, // G4
  'KeyH': 69, // A4
  'KeyJ': 71, // B4
  'KeyK': 72, // C5
  'KeyL': 74, // D5
  'Semicolon': 76, // E5
  'Quote': 77, // F5

  // Top row (Black keys)
  'KeyW': 61, // C#4
  'KeyE': 63, // D#4
  'KeyT': 66, // F#4
  'KeyY': 68, // G#4
  'KeyU': 70, // A#4
  'KeyO': 73, // C#5
  'KeyP': 75, // D#5
};

export const QwertyKeyboard: React.FC = () => {
  const [globalChannel] = usePatchState('globalChannel', '1');
  const activeKeys = useRef<Set<string>>(new Set());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input, textarea, or select
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.tagName === 'SELECT'
      ) {
        return;
      }

      // Prevent default behavior for mapped keys (e.g. scrolling, shortcuts) if desired
      // But actually maybe just let it be, or prevent if it's mapped.
      if (Object.prototype.hasOwnProperty.call(KEY_TO_NOTE_MAP, e.code)) {
        if (!activeKeys.current.has(e.code)) {
          activeKeys.current.add(e.code);
          const note = KEY_TO_NOTE_MAP[e.code];
          try {
            midiService.sendNoteOn(Number(globalChannel), note, 127);
          } catch (err) {
            console.warn('MIDI error', err);
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (Object.prototype.hasOwnProperty.call(KEY_TO_NOTE_MAP, e.code)) {
        if (activeKeys.current.has(e.code)) {
          activeKeys.current.delete(e.code);
          const note = KEY_TO_NOTE_MAP[e.code];
          try {
            midiService.sendNoteOff(Number(globalChannel), note);
          } catch (err) {
            console.warn('MIDI error', err);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const keysToClear = activeKeys.current;

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);

      // On unmount, make sure to turn off any currently active notes to prevent stuck notes
      keysToClear.forEach(code => {
        const note = KEY_TO_NOTE_MAP[code];
        try {
          midiService.sendNoteOff(Number(globalChannel), note);
        } catch (err) {
          console.warn('MIDI error', err);
        }
      });
      keysToClear.clear();
    };
  }, [globalChannel]);

  return null; // Headless component
};
