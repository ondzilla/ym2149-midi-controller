# 💡 Bulb [Experimental]: Multi-Touch Canvas XY Pad

## The Concept: "Canvas XY Pad"

The idea is to introduce a 2D control surface (an XY pad) using the HTML5 Canvas API and multi-touch events. This allows users to simultaneously modulate two independent MIDI parameters with a single finger swipe, or control up to four parameters using two fingers.

## Hardware Parity Check

*   **X-Axis (CC 1 - Detune):** Supported by ARDUINO-YM2149F firmware.
*   **Y-Axis (CC 3 - Vibrato Amount):** Supported by ARDUINO-YM2149F firmware.
*   **No new DSP features:** We are strictly sending standard 7-bit MIDI CC messages (0-127).

## Feasibility Study

This relies on the native `<canvas>` and `PointerEvent` APIs.
1.  **Rendering:** A `requestAnimationFrame` loop draws crosshairs or glowing orbs at the current pointer coordinates on a `<canvas>`.
2.  **Interaction:** We use `onPointerDown`, `onPointerMove`, and `onPointerUp` to track touch/mouse positions.
3.  **Data Mapping:** The X/Y coordinates are normalized to percentages and scaled to the 0-127 MIDI CC range before being sent via `midiService.sendCC()`.
4.  **No Heavy Libraries:** Entirely dependency-free, ensuring high performance.

## Prototype Scope (Under 100 lines)

A React component (`CanvasXYPad`) that:
- Renders an interactive `<canvas>` element.
- Listens for Pointer Events and maps the X coordinate to Detune (CC 1) and the Y coordinate to Vibrato Amount (CC 3).
- Visually updates a tracking indicator in the canvas to show current values.
