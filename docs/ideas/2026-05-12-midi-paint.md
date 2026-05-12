# 💡 Bulb [Experimental]: MIDI Paint

## The Concept: "MIDI Paint"

The idea is to introduce a highly experimental "MIDI Paint" component that allows users to literally "draw" their modulations using the HTML5 `<canvas>` API.

Instead of just dragging a puck in an XY Pad or moving vertical sliders, users can click and drag to paint strokes on a digital canvas. As the cursor moves, its X and Y coordinates are mapped to CC 1 (Detune) and CC 3 (Vibrato) respectively. This turns the web browser into an expressive, freeform modulation controller, letting users craft unique, organic soundscapes visually.

## Hardware Parity Check

*   **X-Axis (e.g., Detune):** Explicitly supported by ARDUINO-YM2149F firmware via CC 1.
*   **Y-Axis (e.g., Vibrato Depth):** Explicitly supported by ARDUINO-YM2149F firmware via CC 3.
*   **No new DSP features:** We are strictly sending standard 7-bit MIDI CC messages (0-127) for existing, supported parameters.

## Feasibility Study

This feature leverages standard modern Web APIs, avoiding any heavy external libraries (like TensorFlow.js or MediaPipe):

1.  **Canvas API (`HTMLCanvasElement`):** Used to capture mouse/touch events (`onPointerDown`, `onPointerMove`, `onPointerUp`) and draw visual feedback (the "paint strokes").
2.  **Performance:** Drawing simple paths on a 2D canvas context (`CanvasRenderingContext2D`) is highly optimized in modern browsers and can easily run within a `requestAnimationFrame` loop or be driven directly by pointer events.
3.  **Data Mapping:** The pointer coordinates (offsetX, offsetY) within the canvas bounds are mapped to percentages (0-100%) and then scaled to 7-bit MIDI CC values (0-127). The X-axis handles Detune, while the Y-axis handles Vibrato Depth.

## Implementation Notes

This feature pushes the boundaries of the "Experimental Lab" while strictly adhering to hardware limitations.

1.  **UI Component:** Build a `<MidiPaint>` React component rendering an `<canvas>`.
2.  **Interaction:** Use Pointer Events with `setPointerCapture` to track continuous drawing gestures.
3.  **Integration:** The component will use our `midiService.sendCC()` to dispatch real-time MIDI changes based on the draw coordinates.
4.  **Visuals:** Render glowing, neon-like strokes to match the cyberpunk aesthetic of the existing UI.
