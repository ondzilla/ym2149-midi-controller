# 💡 Bulb [Experimental]: Audio-Reactive Modulator

## The Concept: "Audio-Reactive Modulator"

The idea is to use the user's microphone to capture real-time audio and use its amplitude (volume) to modulate MIDI CC values. This allows users to create rhythmic or dynamic modulations by beatboxing, tapping, or singing into their microphone, adding a hands-free, organic performance layer to the YM2149F.

## Hardware Parity Check

*   **CC 1 (Detune):** Explicitly supported by ARDUINO-YM2149F firmware. Maps well to amplitude to create audio-reactive pitch wavering or detune effects.
*   **CC 3 (Vibrato Amount):** Explicitly supported by ARDUINO-YM2149F firmware. Maps well to amplitude to create audio-reactive vibrato depth.
*   **No new DSP features:** We are strictly sending standard 7-bit MIDI CC messages (0-127) to existing, supported parameters based on audio amplitude.

## Feasibility Study

This feature utilizes the native Web Audio API and `getUserMedia` (WebRTC).
1.  **Audio Capture:** `navigator.mediaDevices.getUserMedia({ audio: true })` captures the microphone stream.
2.  **Audio Context & Analysis:** An `AudioContext` is created, and the stream is routed to an `AnalyserNode`.
3.  **Amplitude Detection:** `requestAnimationFrame` continuously reads the time-domain data from the `AnalyserNode` to calculate the root mean square (RMS) amplitude or peak volume.
4.  **No Heavy Libraries:** This technique relies entirely on built-in browser APIs, avoiding heavy libraries like TensorFlow.js or Tone.js, keeping the UI prototype lightweight and performant.
5.  **Data Mapping:** The detected amplitude is scaled to a standard 0-127 range and directly feeds into `midiService.sendCC()`.

## Prototype Scope (Under 100 lines)

A single React component (`AudioReactiveModulator`) that:
- Requests microphone permission and initializes the `AudioContext` and `AnalyserNode`.
- Uses a `requestAnimationFrame` loop to calculate the average amplitude from the audio stream.
- Maps the amplitude to a user-selected MIDI CC (e.g., Detune CC 1 or Vibrato Depth CC 3).
- Uses `midiService.sendCC()` to transmit the mapped value to the selected `globalChannel`.
- Includes a simple visualizer (e.g., a scaling bar or circle) to show the current audio input level.
- Cleans up the audio context and media tracks on unmount.
