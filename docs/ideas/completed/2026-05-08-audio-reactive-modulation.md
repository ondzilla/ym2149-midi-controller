# 💡 Idea Proposal: Audio-Reactive Modulation

## 🎯 The Vision
Leverage the Web Audio API to create an "Audio-Reactive Modulation" feature. By accessing a user's microphone (or an external line-in), we can analyze the incoming audio's amplitude (volume envelope) and map it in real-time to specific YM2149F hardware parameters. This allows external acoustic instruments or voice to control the synthesizer's behavior.

## 🧠 Why It Matters
This bridges the gap between digital web interfaces and organic sound generation. Instead of relying solely on physical inputs (like mice, touch, or gamepads), performers could use their voice or another instrument to dynamically alter the YM2149F's output. For example, louder microphone inputs could trigger heavier Vibrato Amount or positive Detune, allowing for highly expressive and unique live performances that blend standard MIDI with organic acoustic input.

## 🎛️ Hardware Validation
This feature will output standard CC values mapping precisely to what the ARDUINO-YM2149F firmware already supports. We will map the smoothed audio amplitude to:
- **CC 1:** Detune (+-64)
- **CC 3:** Vibrato Amount

This ensures complete hardware parity with no firmware modifications necessary.

## 🛠️ Proposed Implementation
1. **Microphone Access:** Use `navigator.mediaDevices.getUserMedia({ audio: true })`.
2. **Audio Analysis:** Create an `AudioContext` and an `AnalyserNode` to extract the frequency data or overall amplitude level of the microphone input.
3. **Parameter Mapping:** Calculate a normalized "RMS" (Root Mean Square) volume level and scale it to the standard MIDI CC 0-127 range.
4. **Performance Optimization:** Use `requestAnimationFrame` for a continuous polling loop, ensuring we batch and send MIDI CC messages via `midiService.sendCC` without overwhelming the hardware.
5. **UI Component:** Add a new "Audio Mod" toggle switch in the `<SynthControls>` or `<VibratoLFO>` section to activate/deactivate the feature, complete with a small visualizer showing the incoming audio level.

## 🔬 Feasibility Study
This is highly feasible using entirely native Web APIs without needing heavy external dependencies or machine learning libraries like TensorFlow.js.
- **`getUserMedia`**: Natively supported across all modern browsers for capturing audio.
- **`Web Audio API`**: The `AnalyserNode` provides high-performance, real-time access to audio time-domain data (waveforms). Processing an array of ~256 samples to find the RMS volume takes less than 1 millisecond, easily running within a 60fps `requestAnimationFrame` loop.
- **MIDI Bottleneck**: The primary limitation is the serial speed of the Arduino connection. We must apply smoothing (like a simple low-pass filter on the calculated amplitude) and potentially throttle the CC output to prevent flooding the MIDI buffer.
