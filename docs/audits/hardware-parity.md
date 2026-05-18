# Hardware Parity Audit

## Target: Envelope Generator (SynthControls.tsx)
- Attack CC: 12 (verified against ARDUINO-YM2149F docs)
- Decay CC: 11 (verified against ARDUINO-YM2149F docs)

## Findings
- `attack` initialization in `SynthControls.tsx` `usePatchState` incorrectly mapped to CC 73 instead of CC 12.
- Refactored `usePatchState` initialization for `attack` to send CC 12 in `app/src/components/SynthControls.tsx`.

## Target: Arpeggiator and Vibrato LFO
- Arpeggiator Rate CC: 5
- Vibrato Rate CC: 2
- Vibrato Depth CC: 3

## Findings (2025-05-02)
- Discovered "Dead UI" in `Arpeggiator.tsx`: A `RESET_GATE` button and a visual `GATE_LIGHTS` grid were hallucinated features not found in hardware spec.
- Incorrect terminology: The arpeggiator's CC 5 control was labeled `GATE_TIME` instead of `RATE`.
- Discovered "Dead UI" in `SynthControls.tsx`: `VibratoLFO` contained a `WAVEFORM_TYPE` display indicating "TRIANGLE_BI", which is a hallucinated feature not controllable via hardware MIDI.
- Hardcoded MIDI Channel Issue: The MIDI `channel` was hardcoded to `1` across `Arpeggiator`, `SynthControls`, and `VibratoLFO`, ignoring the user's `globalChannel` selection from `GlobalSettings`.
- Fixes applied: Removed dead UI components, fixed terminology, and mapped components to respect `globalChannel`.

## Target: Drum Pads, Boolean Sync (2026-05-03)
- Drum Pad mappings verified against hardware spec for CH. 10.
- Boolean CC synchronization verified.

## Findings (2026-05-03)
- `DrumPads.tsx` hallucinated drum sample note mappings (used 48, 50, 52 etc. instead of hardware specs 60-64). Corrected to map exactly: Dog Yap (60), Bass Thing (61), Hi-Hat (62), Snare (63), Kick Drum (64).
- Logic bug found in `usePatchState` callbacks in both `GlobalSettings.tsx` and `Arpeggiator.tsx` where boolean values were inverted (`!val ? 127 : 0`) incorrectly reversing CC messages on external preset loads. Corrected to `val ? 127 : 0`.

## Target: Arpeggiator CC 6 Pattern Scaling
- Arp Pattern CC: 6 (verified against ARDUINO-YM2149F docs)

## Findings (2026-05-07)
- `arpPattern` in `Arpeggiator.tsx` was sending the raw index (0-15) instead of scaling it across the 0-127 MIDI range.
- Fixed by wrapping the callback with `mapRange(val, 0, 15, 0, 127)` to correctly distribute the pattern selection.

## Target: Sidebar Dead Controls & Hallucinated UI Units (2026-05-10)
- Verified active CC output logic in Sidebar, VisualEnvelopeEditor, and VibratoLFO.

## Findings (2026-05-10)
- `Sidebar.tsx` contained fully disconnected, hallucinated navigation items ("Envelopes", "Mixer", "Matrix") that falsely advertised functionality not present.
- `SynthControls.tsx` displayed the `VibratoRate` using a hallucinated `Hz` calculation, falsely implying exact physical frequency mapping rather than the raw CC 0-100 logic.
- `VisualEnvelopeEditor.tsx` displayed Attack and Decay values with a hallucinated `ms` suffix, falsely implying exact physical timescales rather than the generic CC percentage scale.
- Fixed by removing dead UI links and replacing hallucinated units (`ms` and `Hz`) with raw percentage values.

## Target: Velocity Sensitivity (CC 4) in GlobalSettings.tsx
- Velocity Sensitivity CC: 4 (verified against ARDUINO-YM2149F docs: 0 = off, 1-127 Adjust Range where 1 is least sensitive)

## Findings (2026-05-10)
- `GlobalSettings.tsx` implemented Velocity Sensitivity as a boolean toggle, sending either `127` or `0`, which hides the hardware capability to adjust sensitivity across a 1-127 range.
- Refactored `GlobalSettings.tsx` to replace the toggle with a `VelocityControl` slider, correctly sending the continuous 0-127 value for CC 4.
