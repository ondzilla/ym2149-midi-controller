import React, { useEffect, useRef } from 'react';
import { presetManager } from '../services/presetManager';
import { midiService } from '../services/midiService';

const DRUM_CHANNEL = 10;
const DEADZONE = 0.1;

const DRUM_MAPPING: Record<number, number> = {
  0: 64, // Button A (Cross): Kick
  2: 63, // Button X (Square): Snare
  3: 62, // Button Y (Triangle): Hi-Hat
  1: 60, // Button B (Circle): Dog Yap
  13: 61, // D-Pad Down: Bass Thing
};

const DRUM_MAPPING_ENTRIES = Object.entries(DRUM_MAPPING).map(([k, v]) => [Number(k), v] as const);

const processAxis = (
  axisIndex: number,
  cc: number,
  axes: readonly number[],
  prevState: { axes: number[] },
  globalChannel: number
) => {
  const rawValue = axes[axisIndex] || 0;
  let scaledValue = 0;

  if (Math.abs(rawValue) > DEADZONE) {
    // Map -1..1 to 0..127
    scaledValue = Math.floor(((rawValue + 1) / 2) * 127);
  } else {
    scaledValue = 64; // Center
  }

  if (scaledValue !== prevState.axes[axisIndex]) {
    try { midiService.sendCC(globalChannel, cc, scaledValue); } catch (e) { console.warn(e); }
    prevState.axes[axisIndex] = scaledValue;
  }
};

export const GamepadController: React.FC = () => {
  const requestRef = useRef<number>(0);
  const prevStateRef = useRef<{
    buttons: boolean[];
    axes: number[];
  }>({ buttons: [], axes: [] });

  useEffect(() => {
    const loop = () => {
      const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
      let activeGamepad: Gamepad | null = null;

      for (const gp of gamepads) {
        if (gp && gp.connected) {
          activeGamepad = gp;
          break;
        }
      }

      if (activeGamepad) {
        const globalChannel = Number(presetManager.getValue('globalChannel') || 1);
        const { buttons, axes } = activeGamepad;
        const prevState = prevStateRef.current;

        // Process Drum Buttons (Channel 10)
        for (let i = 0; i < DRUM_MAPPING_ENTRIES.length; i++) {
          const [btnIndex, note] = DRUM_MAPPING_ENTRIES[i];
          const isPressed = buttons[btnIndex]?.pressed || false;
          const wasPressed = prevState.buttons[btnIndex] || false;

          if (isPressed && !wasPressed) {
            try { midiService.sendNoteOn(DRUM_CHANNEL, note, 127); } catch (e) { console.warn(e); }
          } else if (!isPressed && wasPressed) {
            try { midiService.sendNoteOff(DRUM_CHANNEL, note); } catch (e) { console.warn(e); }
          }
        }

        // Process Continuous Controls (Axes)
        processAxis(1, 12, axes, prevState, globalChannel); // Left Stick Y: Env Attack
        processAxis(0, 11, axes, prevState, globalChannel); // Left Stick X: Env Decay
        processAxis(3, 2, axes, prevState, globalChannel);  // Right Stick Y: Vibrato Rate
        processAxis(2, 3, axes, prevState, globalChannel);  // Right Stick X: Vibrato Depth

        // Process Triggers (CC 5)
        const lt = buttons[6]?.value || 0;
        const rt = buttons[7]?.value || 0;
        const triggerMax = Math.max(lt, rt);
        const triggerScaled = Math.floor(triggerMax * 127);
        if (triggerScaled !== prevState.axes[6]) { // Use index 6 for CC 5 state
          try { midiService.sendCC(globalChannel, 5, triggerScaled); } catch (e) { console.warn(e); }
          prevState.axes[6] = triggerScaled;
        }

        // Process Bumpers (CC 8)
        const lb = buttons[4]?.pressed || false;
        const rb = buttons[5]?.pressed || false;
        const bumperActive = lb || rb;
        if (bumperActive !== (prevState.buttons[4] || prevState.buttons[5])) {
          const val = bumperActive ? 127 : 0;
          try { midiService.sendCC(globalChannel, 8, val); } catch (e) { console.warn(e); }
        }

        // Start Button (Panic)
        const startPressed = buttons[9]?.pressed || false;
        if (startPressed && !prevState.buttons[9]) {
          try { midiService.sendAllNotesOff(); } catch (e) { console.warn(e); }
        }

        // Update previous state
        for (let i = 0; i < buttons.length; i++) {
          prevState.buttons[i] = buttons[i].pressed;
        }
      }

      requestRef.current = requestAnimationFrame(loop);
    };

    requestRef.current = requestAnimationFrame(loop);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  return null; // Invisible component
};
