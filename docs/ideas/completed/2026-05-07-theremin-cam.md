# 💡 Bulb [Experimental]: The Theremin Cam

## The Concept: "The Theremin Cam"

The idea is to use the user's webcam to track motion and map it to MIDI CC values, effectively turning the YM2149F into an optical theremin. By analyzing pixel changes between video frames, we can detect movement intensity and position without requiring heavy machine learning models.

This allows users to "play" the synth by waving their hands in front of their webcam, adding an expressive, experimental performance layer that bridges physical space and vintage hardware.

## Hardware Parity Check

*   **CC 1 (Detune):** Explicitly supported by ARDUINO-YM2149F firmware. Maps well to X-axis or overall motion intensity to simulate pitch wavering.
*   **CC 3 (Vibrato Amount):** Explicitly supported by ARDUINO-YM2149F firmware. Maps well to Y-axis or sustained motion to simulate classic theremin expression.
*   **No new DSP features:** We are strictly sending standard 7-bit MIDI CC messages (0-127) to existing, supported parameters based on optical motion.

## Feasibility Study

This feature utilizes the native `getUserMedia` (WebRTC) and `<canvas>` APIs.
1.  **Video Capture:** `navigator.mediaDevices.getUserMedia({ video: true })` streams the webcam to an invisible `<video>` element.
2.  **Frame Analysis:** `requestAnimationFrame` continuously draws video frames to a hidden `<canvas>`.
3.  **Motion Detection:** By comparing the `ImageData` of the current frame against the previous frame, we calculate a "motion score" based on pixel difference thresholds.
4.  **No Heavy Libraries:** This frame-differencing technique avoids heavy libraries like TensorFlow.js or MediaPipe, keeping the UI prototype lightweight, performant, and under 100 lines of logic.
5.  **Data Mapping:** The scaled motion score directly feeds into `midiService.sendCC()`.
