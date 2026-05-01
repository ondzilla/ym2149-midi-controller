# Web MIDI Controller User Stories

## Setup & Connectivity
1. **As a user**, I want to connect the web application to my MIDI hardware, **so that** I can send commands directly from my browser.
2. **As a user**, I want to see the connection status visually, **so that** I know when the app is actively communicating with the synth.

## Channel & Preset Selection
3. **As a user**, I want to select a MIDI channel (1-14 for melodic presets), **so that** I can send commands to the correct preset.
4. **As a user**, I want to click a button to toggle between Bank A and Bank B (CC9), **so that** I have access to all 28 available presets.
5. **As a user**, I want to toggle simultaneous polyphonic voice playing (CC10), **so that** I can play richer chords.

## Sound Shaping (Synth Controls)
6. **As a user**, I want to adjust the synth's Attack (CC12) and Decay (CC11) using continuous sliders or knobs, **so that** I can shape the volume envelope of the note.
7. **As a user**, I want to turn a Detune knob (CC1), **so that** I can add a widened or detuned character to the voices.
8. **As a user**, I want to use a Pitch Bend control, **so that** I can pitch up or down smoothly in real-time.
9. **As a user**, I want to adjust the Vibrato Rate (CC2) and Amount (CC3), **so that** I can give the sound an oscillating pitch effect.
10. **As a user**, I want to set Velocity Sensitivity (CC4), **so that** the synth responds more expressively to my MIDI keyboard playing.

## Arpeggiator (Arp)
11. **As a user**, I want to enable the arpeggiator by setting its Rate (CC5), **so that** I can trigger automated chord patters.
12. **As a user**, I want to select one of the 16 unique Arp patterns (CC6), **so that** the automated notes play in the musical order I desire.
13. **As a user**, I want to select the Arp Octave shift (CC8), **so that** the arpeggio plays in the correct register relative to my root note.
14. **As a user**, I want to change the Arp Mode (CC7), **so that** I can decide if it uses its self-voice or the default voice A.

## Drum Triggering (Channel 10)
15. **As a user**, I want to have a 5-pad drum layout mapped to Channel 10 (C3 to E3), **so that** I can manually play the 4-bit Lo-Fi drum samples (Kick, Snare, Hi-Hat, etc.) independently.
