## 2024-05-01 - MIDI Panic Button Necessity
Learning: For hardware setups with limited polyphony (like the 3-channel YM2149) or complex experimental routing, lost `Note Off` messages are a common failure mode that creates "hung notes" and ruins the performance experience.
Action: Implemented an "All Notes Off" panic button (CC 123) and will prioritize fallback state management features when designing for limited-voice hardware.
