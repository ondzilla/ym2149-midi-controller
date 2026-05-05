## 2026-04-30 - MIDI Panic Button Necessity
Learning: For hardware setups with limited polyphony (like the 3-channel YM2149) or complex experimental routing, lost `Note Off` messages are a common failure mode that creates "hung notes" and ruins the performance experience.
Action: Implemented an "All Notes Off" panic button (CC 123) and will prioritize fallback state management features when designing for limited-voice hardware.

## 2026-05-01 - GlobalSettings MIDI Channel Routing Limitations
Learning: The `GlobalSettings` component manages a global `channel` state, but individual feature components like `Arpeggiator`, `VibratoLFO`, and `SynthControls` hardcode the active channel to `1` (e.g., `const channel = 1;` or `const activeChannel = 1;`). This codebase-specific limitation means the global MIDI channel selector does not actually route most control changes.
Action: Future features should either respect a unified global context for the active MIDI channel or be explicitly documented to only operate on channel 1 until the architecture is refactored.

## 2026-05-02 - Explicit Hardware Connection Feedback
Learning: Explicit visual confirmation of a hardware connection is essential for the UX of web-based MIDI controllers. Abstract or hidden status indicators leave users unsure if sound issues are due to physical cables or software routing.
Action: Implemented a visible "CONNECTED"/"DISCONNECTED" badge in the ConnectionPanel, mapped dynamically to `midiService.outputDevice`, to ensure users are confident in their connection status.

## 2026-05-04 - Fixed Hardware CC Mapping & UI Focus
Learning: The ARDUINO-YM2149F firmware uses a very specific, hardcoded set of 12 MIDI CC parameters. Modifying the data structures beyond this requires C++ firmware updates. Therefore, most immediate product value can be achieved by significantly upgrading the web UI tactile experience rather than hallucinating new DSP parameters.
Action: Shift focus towards UX/UI component improvements (e.g., replacing vertical sliders with realistic rotary knobs or adding visualizers) to make the web app feel more like controlling a physical synthesizer.

## 2026-05-04 - Gamepad API for MIDI Control
Learning: The modern Gamepad API (`navigator.getGamepads()`) requires a polling loop (`requestAnimationFrame`) rather than event listeners for reading continuous values (like analog sticks) and button presses. It is uniquely well-suited for experimental hardware control because analog stick values (-1.0 to 1.0) can be scaled easily to 7-bit MIDI CC values (0-127).
Action: I proposed a feature that leverages this polling loop to map physical game controllers to the YM2149 synth parameters, making sure to explicitly map the action buttons to the exact Channel 10 Drum Map.

## 2026-05-05 - Desktop Application Constraints for Experimentalism
Learning: The user explicitly provided feedback rejecting an experimental feature based on mobile device sensors (like accelerometer/gyroscope). Since the application requires physical connection to the synthesizer hardware via MIDI, it functions primarily as a desktop application.
Action: Going forward, I will avoid proposing any features that rely on moving the primary device or using on-device mobile sensors. I will focus experimental ideas on desktop-friendly interactions, such as Webcams, external controllers, or advanced UI data mapping.
