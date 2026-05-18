# 💡 Bulb [Experimental]: Infinite Pointer Modulator

## The Concept

The "Infinite Pointer Modulator" is an experimental desktop-centric feature that transforms the user's mouse into a boundless, continuous 2D control surface for modulating vintage sound parameters.

Standard mouse interactions are constrained by the physical edges of the screen. When dragging a virtual slider or XY pad, the user's movement stops when the cursor hits the screen border, disrupting the flow of modulation.

By leveraging the modern HTML5 Pointer Lock API, we can capture raw, unbounded relative mouse movements (`movementX`, `movementY`). This allows the user to click to "lock" their cursor and then continuously "spin" or drag their mouse indefinitely in any direction to generate a continuous stream of MIDI CC data, acting like an infinite rotary encoder or a boundless XY pad.

## Hardware Parity Check

*   **Continuous Modulation:** The unbounded mouse movements will be mathematically scaled and wrapped to fit within the standard 7-bit MIDI CC range (0-127).
*   **Target Parameters:** The X and Y movements can be mapped to any of the 12 supported ARDUINO-YM2149F MIDI CC parameters, such as CC 1 (Detune), CC 3 (Vibrato Amount), or CC 4 (Vibrato Speed).
*   **No new DSP features:** We are strictly sending standard MIDI CC messages for existing, supported parameters, simply utilizing a novel input method.

## Feasibility Study

This feature relies entirely on standard, lightweight modern Web APIs, ensuring high performance without heavy external dependencies:

1.  **HTML5 Pointer Lock API:**
    *   `Element.requestPointerLock()` allows the application to capture the mouse, hiding the cursor and removing screen boundary constraints.
    *   `document.exitPointerLock()` releases the capture.
2.  **Pointer Events (`mousemove`):**
    *   When the pointer is locked, `mousemove` events provide `movementX` and `movementY` properties, representing the change in position since the last event, regardless of screen bounds.
3.  **Accumulation & Wrapping:**
    *   The application will maintain an internal accumulator for X and Y.
    *   As `movementX` and `movementY` values are received, they are scaled (e.g., divided by a sensitivity factor) and added to the accumulators.
    *   The accumulators are wrapped using modulo math (e.g., `accumulator % 128`) to generate a continuous 0-127 MIDI value.
4.  **Desktop Suitability:** This is a strictly desktop-centric interaction, perfectly aligning with the constraints for experimental features since the application requires a physical MIDI connection.

## Implementation Notes

1.  **UI Component:** Create an `<InfiniteModulatorPad>` component. It should visually indicate when the pointer is locked (e.g., turning into a glowing, boundless grid or crosshair).
2.  **Interaction Flow:**
    *   User clicks the pad to initiate `requestPointerLock()`.
    *   While locked, moving the mouse continuously generates MIDI CC data.
    *   User presses the `Esc` key (standard browser behavior) to exit pointer lock.
3.  **Data Mapping:** Provide UI selectors to map the X-axis and Y-axis to specific supported MIDI CCs.
4.  **Visual Feedback:** Even though the physical cursor is hidden, provide dynamic visual feedback on the screen (like a moving crosshair or pulsating color) that reflects the accumulated X/Y values so the user can "see" their current modulation position.
