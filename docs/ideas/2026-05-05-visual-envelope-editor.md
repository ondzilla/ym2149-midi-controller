# 💡 Bulb [Standard]: Visual Envelope Editor

## The Concept: "Visual AD Envelope Editor"

The idea is to replace or supplement the standard linear sliders for "Attack" and "Decay" with an interactive, 2D visual representation of the envelope curve.

Users will see a graphical line representing the volume over time. They can click and drag nodes on this line to visually shape the Attack and Decay phases.

This provides a much more intuitive and "analog synth" feel compared to abstract 0-127 slider numbers, making it easier for users to understand how they are shaping the sound.

## Hardware Parity Check

*   **CC 12 (Attack):** Explicitly supported by ARDUINO-YM2149F firmware.
*   **CC 11 (Decay):** Explicitly supported by ARDUINO-YM2149F firmware.
*   **No new DSP features:** We are strictly sending standard 7-bit MIDI CC messages (0-127) to existing, supported parameters based on the visual node positions.

## Implementation Notes

This feature focuses purely on UX/UI improvements for the web application (desktop environment).

1.  **UI Component:** Build a custom React component using SVG or Canvas to draw the envelope graph.
2.  **Interaction:** Use standard mouse/pointer events for dragging the Attack and Decay nodes.
3.  **Data Mapping:**
    *   The X-axis position of the Attack node maps to CC 12 (Attack Time).
    *   The X-axis position of the Decay node maps to CC 11 (Decay Time).
4.  **Integration:** The component will use our `usePatchState` hook to read the current Attack/Decay values (for initial render and preset loading) and dispatch `midiService.sendCC()` when the nodes are dragged.