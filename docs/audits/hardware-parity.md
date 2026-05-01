# Hardware Parity Audit

## Target: Envelope Generator (SynthControls.tsx)
- Attack CC: 12 (verified against ARDUINO-YM2149F docs)
- Decay CC: 11 (verified against ARDUINO-YM2149F docs)

## Findings
- `attack` initialization in `SynthControls.tsx` `usePatchState` incorrectly mapped to CC 73 instead of CC 12.
- Refactored `usePatchState` initialization for `attack` to send CC 12 in `app/src/components/SynthControls.tsx`.
