# 💡 Bulb [Experimental]: Image-to-Patch (Synesthesia Drops)

## The Concept: "Image-to-Patch"

The idea is to introduce a generative sound design feature that allows users to translate images into synthesizer patches. By simply dragging and dropping an image (like a photo or a digital painting) onto the application UI, the app analyzes the image's overall color palette and translates it into specific YM2149F hardware settings.

This creates a form of digital synesthesia, where the user can "hear" the vibe of a picture. For example, a dark, moody photo might result in a heavily detuned, slow patch, while a bright, vibrant image might generate a fast, energetic arpeggiation.

## Hardware Parity Check

This feature directly maps extracted data to standard, supported MIDI CC values, requiring no firmware changes:
*   **Red Channel (R):** Mapped to CC 1 (Detune).
*   **Green Channel (G):** Mapped to CC 2 (Vibrato Rate).
*   **Blue Channel (B):** Mapped to CC 3 (Vibrato Amount).
*   *Optional additions: Image brightness could be mapped to CC 11 (Decay), or contrast to CC 4 (Velocity Sensitivity).*
*   **No new DSP features:** We are strictly sending standard 7-bit MIDI CC messages (0-127).

## Feasibility Study

This feature leverages standard modern Web APIs, keeping the footprint light and avoiding heavy external machine learning libraries:

1.  **Drag & Drop API:** Native HTML5 Drag and Drop events (`dragover`, `drop`) on a designated drop zone in the React app handle the initial file transfer.
2.  **FileReader API:** Used to asynchronously read the dropped image file into a data URL (`readAsDataURL`).
3.  **Canvas API (`HTMLCanvasElement`):** The core engine. The data URL is loaded into an `HTMLImageElement` and then drawn onto a hidden `<canvas>` using `ctx.drawImage()`.
4.  **Pixel Analysis (`getImageData`):** We use `ctx.getImageData()` to retrieve the raw RGBA pixel array. By iterating over the array, we can calculate the average RGB values across the entire image (or downsample to a tiny 1x1 canvas for near-instant average calculation).
5.  **Data Mapping:** The 8-bit RGB values (0-255) are easily scaled down to 7-bit MIDI CC values (0-127) and dispatched via `midiService.sendCC()`.

## Implementation Notes

This idea perfectly aligns with the "Experimental Lab" by using the web browser's multimedia capabilities as an unconventional sensor for a vintage sound chip.

1.  **UI Component:** Add an `<ImageDropZone>` overlay or dedicated panel that accepts image files.
2.  **Processing Logic:** Create a utility function `analyzeImageColor(file: File)` that returns the average RGB values via the Canvas API trick.
3.  **Integration:** Upon dropping an image, update the patch state (Detune, Vibrato Rate, Vibrato Depth) and immediately send the MIDI CC burst to sync the hardware.
4.  **Visual Feedback:** Temporarily tint the UI or display the extracted dominant color block to show the user what was analyzed.
