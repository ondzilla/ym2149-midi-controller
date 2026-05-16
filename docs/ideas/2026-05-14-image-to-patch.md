# 💡 Bulb [Experimental]: Image-to-Patch Modulator

## The Concept: "Image-to-Patch Modulator"

The "Image-to-Patch Modulator" allows users to drag and drop any image file (like a photo, drawing, or texture) into the browser to instantly generate a unique synthesizer patch. By analyzing the image's average color values (Red, Green, Blue) and overall brightness, we can translate visual aesthetics into sonic parameters.

This fits perfectly with the "Experimental Lab" philosophy, transforming visual inspiration into concrete vintage hardware settings without requiring complex UI interactions.

## Hardware Parity Check

We map the extracted image data to the hardcoded MIDI CC parameters supported by the ARDUINO-YM2149F firmware:
*   **Red Channel (0-255):** Scaled and mapped to **CC 1 (Detune)** to add warmth or dissonance based on the amount of red.
*   **Green Channel (0-255):** Scaled and mapped to **CC 3 (Vibrato Amount)** to control the depth of modulation.
*   **Blue Channel (0-255):** Scaled and mapped to **CC 4 (Vibrato Speed)** to dictate how fast the modulation occurs.
*   **Brightness/Luminance:** Can be mapped to the Arpeggiator pattern (CC 6) or overall volume envelope characteristics.

No new DSP features or firmware modifications are required. The web app simply translates pixels into standard 7-bit MIDI CC messages (0-127).

## Feasibility Study

This feature relies entirely on native, lightweight Web APIs, avoiding heavy machine learning dependencies:
1.  **HTML Drag and Drop API:** To accept image files (`.jpg`, `.png`) dropped onto the browser window.
2.  **FileReader API:** To load the dropped file as a Data URL.
3.  **HTML5 `<canvas>` API:**
    *   The image is drawn to an off-screen `<canvas>`.
    *   `CanvasRenderingContext2D.getImageData()` is used to read the raw pixel data.
    *   A simple loop calculates the average R, G, and B values across the image.
4.  **Math & Mapping:** The resulting averages (0-255) are mapped to the 0-127 MIDI CC range using existing `mathUtils` and sent via `midiService.sendCC()`.
