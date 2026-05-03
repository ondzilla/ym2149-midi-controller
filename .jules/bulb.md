## 2026-04-30 - MIDI Panic Button Necessity
Learning: For hardware setups with limited polyphony (like the 3-channel YM2149) or complex experimental routing, lost `Note Off` messages are a common failure mode that creates "hung notes" and ruins the performance experience.
Action: Implemented an "All Notes Off" panic button (CC 123) and will prioritize fallback state management features when designing for limited-voice hardware.

## 2026-05-01 - GlobalSettings MIDI Channel Routing Limitations
Learning: The `GlobalSettings` component manages a global `channel` state, but individual feature components like `Arpeggiator`, `VibratoLFO`, and `SynthControls` hardcode the active channel to `1` (e.g., `const channel = 1;` or `const activeChannel = 1;`). This codebase-specific limitation means the global MIDI channel selector does not actually route most control changes.
Action: Future features should either respect a unified global context for the active MIDI channel or be explicitly documented to only operate on channel 1 until the architecture is refactored.

## 2026-05-02 - Explicit Hardware Connection Feedback
Learning: Explicit visual confirmation of a hardware connection is essential for the UX of web-based MIDI controllers. Abstract or hidden status indicators leave users unsure if sound issues are due to physical cables or software routing.
Action: Implemented a visible "CONNECTED"/"DISCONNECTED" badge in the ConnectionPanel, mapped dynamically to `midiService.outputDevice`, to ensure users are confident in their connection status.
