# 💡 Bulb [Experimental]: Gamepad API Integration

## Concept
Use the modern browser `Gamepad API` to allow users to "play" the YM2149F synth using standard game controllers (like Xbox or PlayStation controllers). This brings a physical, tactile dimension to the web interface without requiring a dedicated MIDI keyboard.

## Track
Experimental

## Feasibility Study
- **Web API Required**: `Gamepad API` (`navigator.getGamepads()`, `gamepadconnected`, `gamepaddisconnected` events).
- **Polling Loop**: Requires a `requestAnimationFrame` polling loop to continuously read analog stick and button states since the Gamepad API doesn't push state changes via events (only connection status).
- **Support**: Excellent support in all modern browsers.

## Implementation Details

### Hardware Mapping (ARDUINO-YM2149F Parity)
The gamepad inputs will be mapped to standard supported CCs and Note numbers to ensure full hardware compatibility.

1.  **D-Pad / Action Buttons (Drum Pads)**: Map to Channel 10 Drum Map.
    - Button A (Cross): Kick Drum (Note 64)
    - Button X (Square): Snare (Note 63)
    - Button Y (Triangle): Hi-Hat (Note 62)
    - Button B (Circle): Dog Yap (Note 60)
    - D-Pad Down: Bass Thing (Note 61)
2.  **Analog Sticks (Continuous Control)**: Map standard axes to YM2149 parameters.
    - Left Stick Y-Axis: Filter Cutoff / Envelope Attack (CC 12)
    - Left Stick X-Axis: Envelope Decay (CC 11)
    - Right Stick Y-Axis: Vibrato Rate (CC 2)
    - Right Stick X-Axis: Vibrato Depth (CC 3)
3.  **Triggers / Bumpers**:
    - Left/Right Triggers: Arpeggiator Rate (CC 5)
    - Left/Right Bumpers: Arpeggiator Octave (CC 8)
4.  **Start/Select (Options/Share)**:
    - Start Button: Panic Button / All Notes Off (CC 123)

### UX/UI Considerations
- Needs a small "Gamepad Connected" indicator in the `TopBar` or `ConnectionPanel`.
- A toggle switch to enable/disable Gamepad control (to prevent accidental input if a controller is sitting upside down on a desk).
- Values must be scaled appropriately (e.g., -1.0 to 1.0 stick axis converted to 0-127 MIDI range, accounting for deadzones).

## Prototype Scope (Under 100 lines)
A `GamepadController` React component that attaches to `window` gamepad events, manages a `requestAnimationFrame` loop, and calls `midiService.sendCC()` and `midiService.sendNoteOn()`/`sendNoteOff()` based on gamepad state. It reads the current `globalChannel` from `usePatchState` for CCs, and hardcodes Channel 10 for the drum buttons. No new dependencies required.
