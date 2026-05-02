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
