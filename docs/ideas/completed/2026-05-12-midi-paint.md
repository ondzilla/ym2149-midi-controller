# 💡 Bulb [Experimental]: MIDI Paint

## The Concept: "MIDI Paint"

The idea is to introduce a highly experimental "MIDI Paint" component that allows users to literally "draw" their sequences and modulations using the HTML5 `<canvas>` API, which is then "played" by a sweeping scanline.

Users click and drag to paint strokes on a digital canvas. A visual "playhead" or scanline continually sweeps across the X-axis of the canvas at a set tempo. As the scanline intersects with painted pixels, it reads their data and translates them into MIDI notes:
*   The **Y-axis position** of the pixel determines the pitch (Note Number).
*   The **brightness/alpha** of the pixel determines the note's amplitude/velocity.
*   The **horizontal length** of the painted stroke determines the note's length (duration until Note Off).

This turns the web browser into an expressive, freeform sequencer, letting users craft unique, organic soundscapes visually.

## Hardware Parity Check

*   **Pitch (Y-Axis):** Explicitly supported by ARDUINO-YM2149F firmware via standard Note On messages.
*   **Amplitude (Brightness):** Explicitly supported via Note On velocity.
*   **Note Length (Stroke Width):** Supported via sequential Note On and Note Off messages.
*   **No new DSP features:** We are strictly sending standard Note On/Off messages for existing, supported parameters.

## Feasibility Study

This feature leverages standard modern Web APIs, avoiding any heavy external libraries (like TensorFlow.js or MediaPipe):

1.  **Canvas API (`HTMLCanvasElement`):** Used to capture mouse/touch events (`onPointerDown`, `onPointerMove`, `onPointerUp`) and draw visual feedback (the "paint strokes").
2.  **Pixel Analysis (`getImageData`):** A `requestAnimationFrame` loop drives the scanline. As the scanline moves, `ctx.getImageData()` is used to read the pixel data (RGBA) at the current X-coordinate column.
3.  **Data Mapping:** The Y-coordinates of non-transparent pixels in the column are mapped to a chosen musical scale (e.g., 0-127 MIDI notes). The alpha channel (A in RGBA) is scaled to a 7-bit MIDI velocity value (0-127) for Note On.
4.  **Performance:** Reading a 1-pixel-wide vertical slice of the canvas using `getImageData` is extremely fast and suitable for real-time 60fps audio processing.

## Implementation Notes

This feature pushes the boundaries of the "Experimental Lab" while strictly adhering to hardware limitations.

1.  **UI Component:** Build a `<MidiPaint>` React component rendering a `<canvas>` for drawing and an overlay for the scanline.
2.  **Interaction:** Use Pointer Events with `setPointerCapture` to track continuous drawing gestures.
3.  **Integration:** The component will use our `midiService.sendNoteOn()` and `midiService.sendNoteOff()` to dispatch real-time MIDI changes based on the scanline's analysis.
4.  **Visuals:** Render glowing, neon-like strokes to match the cyberpunk aesthetic of the existing UI.
