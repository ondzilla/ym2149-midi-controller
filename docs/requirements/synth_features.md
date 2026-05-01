# Synth Features and Presets Requirements

The YM2149F Arduino synth exposes the following hardware features and presets:

## Core Features
- **3 Voice Polyphonic**: Three voice channels can play simultaneously.
- **Velocity**: Velocity sensitivity is implemented for MIDI Channels 1-4.
- **Vibrato**: Vibrato rate and depth control.
- **Pitch Bend**: Supported on all channels except Channel 10.
- **Arpeggiator**: Rate, octave shift, and 16 unique chord patterns.
- **4-bit Samples**: Five drum samples available on Channel 10.

## MIDI Channels & Presets
The app needs to allow users to select channels representing presets:
- **Channels 1-9, 11-14**: Melodic presets. There are 2 banks (Bank A and Bank B), giving 28 possible presets.
  - Users switch banks via CC9.
- **Channel 10**: Drum Samples. Note Sample Map:
  - `C3` (MIDI 60): Dog Yap
  - `C#3` (MIDI 61): Bass Thing
  - `D3` (MIDI 62): Hi-Hat
  - `D#3` (MIDI 63): Snare
  - `E3` (MIDI 64): Kick Drum
