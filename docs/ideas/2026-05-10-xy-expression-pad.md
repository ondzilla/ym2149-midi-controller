# 💡 Bulb [Standard]: XY Expression Pad

## The Concept: "XY Expression Pad"

The idea is to introduce an interactive 2D "XY Pad" component that allows users to modulate two synthesizer parameters simultaneously with a single touch or mouse drag.

Currently, modulating two parameters (like Detune and Vibrato Depth) requires manipulating two separate vertical sliders, which is nearly impossible to do smoothly with a mouse. The XY Pad provides a much more tactile and expressive way to "play" the synthesizer parameters in real-time, akin to the modulation matrix on high-end hardware or Korg Kaoss pads.

## Hardware Parity Check

*   **X-Axis (e.g., Detune):** Explicitly supported by ARDUINO-YM2149F firmware via CC 1.
*   **Y-Axis (e.g., Vibrato Depth):** Explicitly supported by ARDUINO-YM2149F firmware via CC 3.
*   **No new DSP features:** We are strictly sending standard 7-bit MIDI CC messages (0-127) for existing, supported parameters based on the pointer coordinates within the XY pad area.

## Implementation Notes

This feature focuses purely on UX/UI improvements for the web application.

1.  **UI Component:** Build an `<XYPad>` React component using a standard `<div>` with `onPointerDown`, `onPointerMove`, and `onPointerUp` event handlers.
2.  **Interaction:** The user clicks and drags a "puck" inside a square area. The pointer capture API (`setPointerCapture`) should be used to ensure continuous tracking even if the cursor leaves the element bounds during a drag.
3.  **Data Mapping:**
    *   Map the puck's X coordinate percentage (0-100%) to a 0-127 MIDI CC value (e.g., CC 1 Detune).
    *   Map the puck's Y coordinate percentage (0-100%) to a 0-127 MIDI CC value (e.g., CC 3 Vibrato Depth).
4.  **Accessibility:** Include `role="slider"`, `aria-label`, `aria-valuemin`, `aria-valuemax`, and `aria-valuenow` (for X and Y). To ensure it remains accessible, keyboard navigation (Arrow keys) should move the puck.
5.  **Integration:** The component will use our `usePatchState` hook to read the current values (for initial render and preset loading) and dispatch `midiService.sendCC()` when the puck position changes.
