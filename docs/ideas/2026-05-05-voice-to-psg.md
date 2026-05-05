# 💡 Bulb [Experimental]: Voice-to-PSG

## Summary
"Voice-to-PSG" is an experimental feature that uses voice commands to trigger specific actions on the YM2149F, acting as a hands-free controller. The primary goal is to map spoken words to standard MIDI operations supported by the firmware.

## How it works
The feature leverages the modern browser's Web Speech API (`SpeechRecognition`) to continuously listen for specific keywords. When a match is found, the app converts the keyword into a specific MIDI command and dispatches it via `midiService`.

### Possible Voice Commands:
* **"Panic" / "Stop"**: Sends `All Notes Off` (MIDI CC 123) across all channels.
* **"Kick" / "Snare" / "Hi-Hat" / "Yap" / "Bass"**: Sends corresponding `Note On` messages mapped strictly to the CH 10 Drum Map (e.g., Note 64 for Kick, Note 63 for Snare).
* **"Preset One" / "Preset Two"**: Automatically loads stored UI presets and syncs them to hardware.

## Feasibility Study
* **Technology**: This relies entirely on the native `window.SpeechRecognition` (or `webkitSpeechRecognition`) API.
* **Dependencies**: None. It does not require heavy machine-learning libraries like TensorFlow.js or MediaPipe.
* **Hardware Parity**: Perfect. It translates audio input directly into strict MIDI messages (Note On/Off and CC) supported by the ARDUINO-YM2149F. No new DSP parameters are hallucinated.
* **Limitations**: `SpeechRecognition` requires user permission and only works over a secure context (HTTPS/localhost). It may have latency, making it better suited for broader commands (panic, preset switching) or experimental performances rather than tight rhythmic playing.

## Next Steps
- Implement a `VoiceController` component with a toggle button to start/stop listening.
- Map transcripts to a dictionary of predefined commands that interface with `midiService`.
- Ensure appropriate visual feedback (e.g., "Listening...", "Command recognized: Kick") in the UI to compensate for latency.
