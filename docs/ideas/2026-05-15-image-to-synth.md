# 💡 Bulb [Experimental]: Image-to-Synth

## The Concept: "Image-to-Synth"

The idea is to introduce a highly experimental "Image-to-Synth" component that allows users to drag and drop images onto a designated area, analyzing the image's color data to instantly generate unique synthesizer parameters for the YM2149F.

Users can take an image file from their desktop and drop it into the app. The browser will instantly analyze the average RGB colors of the image. The resulting Red, Green, and Blue values will be mapped to specific MIDI Control Change (CC) parameters, allowing users to "hear" what an image looks like.

For example:
*   **Red Channel** maps to CC 1 (Detune).
*   **Green Channel** maps to CC 3 (Vibrato Depth/Amount).
*   **Blue Channel** maps to CC 4 (Vibrato Speed).

This provides a synesthetic, experimental workflow for generating new sonic textures without manual dial-turning.

## Hardware Parity Check

*   **Detune (Red):** Explicitly supported by ARDUINO-YM2149F firmware via MIDI CC 1.
*   **Vibrato Depth (Green):** Explicitly supported via MIDI CC 3.
*   **Vibrato Speed (Blue):** Explicitly supported via MIDI CC 4.
*   **No new DSP features:** We are strictly sending standard CC messages mapped to existing, supported hardware parameters, keeping the generated values within the 0-127 7-bit MIDI range.

## Feasibility Study

This feature leverages native Web APIs and does not require heavy external libraries for image analysis:

1.  **Drag and Drop API:** Used to capture the dropped file (`ondragover`, `ondrop`).
2.  **FileReader API:** Used to read the file data as a Data URL to be loaded into an `Image` object.
3.  **Canvas API (`HTMLCanvasElement`):** The loaded image is drawn to a hidden, off-screen `<canvas>`.
4.  **Pixel Analysis (`getImageData`):** `ctx.getImageData()` reads the RGBA values of the canvas. We can iterate over the pixel data to calculate the average Red, Green, and Blue values.
5.  **Data Mapping:** The calculated average color values (0-255) are mapped to 7-bit MIDI CC values (0-127) and sent using `midiService.sendCC()`.
6.  **Performance:** Drawing an image to a hidden canvas and averaging its pixels is a very fast synchronous operation in modern browsers, providing near-instant audio feedback.

## Implementation Notes

This feature pushes the boundaries of the "Experimental Lab" while strictly adhering to hardware limitations.

1.  **UI Component:** Build an `<ImageToSynth>` React component that acts as a dropzone.
2.  **Interaction:** Provide visual feedback when a file is dragged over the dropzone. Once dropped, display a thumbnail of the image and the generated CC values.
3.  **Integration:** The component will use our `midiService.sendCC()` to dispatch MIDI changes.
4.  **Robustness:** Ensure the analysis correctly handles non-image files or invalid data by gracefully rejecting them or defaulting to neutral values.
