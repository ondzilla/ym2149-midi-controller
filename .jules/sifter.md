## 2024-05-01 - [Audit Finding] Observation: `attack` state in `SynthControls.tsx` initialized using hallucinated MIDI CC 73 instead of the hardware-supported CC 12. Correction: Updated `usePatchState` initialization for `attack` to use CC 12.

## 2025-05-02 - [Audit Finding] Observation: `Arpeggiator.tsx` contained hallucinated `RESET_GATE` and `GATE_LIGHTS` UI elements. The `GATE_TIME` label did not match the hardware's CC 5 `RATE` spec. Furthermore, `Arpeggiator`, `SynthControls`, and `VibratoLFO` hardcoded the MIDI channel to 1, ignoring the global selection. `VibratoLFO` also included a hallucinated `WAVEFORM_TYPE` display. Correction: Removed dead UI components, renamed `GATE_TIME` to `RATE`, and bound components to use `globalChannel` from `usePatchState`.

## 2026-05-03 - [Audit Finding] Observation: `DrumPads.tsx` hallucinated drum sample note mappings. Boolean `usePatchState` callbacks inverted CC messages. Correction: Mapped pads to notes 60-64. Fixed boolean logic in callbacks to emit `val ? 127 : 0`.

## 2026-05-07 - [Audit Finding] Observation: `Arpeggiator.tsx` mapped Arp Pattern (CC 6) index 0-15 directly to the MIDI value without scaling. Correction: Updated `arpPattern` `usePatchState` callback to use `mapRange` to distribute the 16 patterns across the full 0-127 MIDI CC range as required by the firmware.

## 2026-05-10 - [Audit Finding] Observation: `GlobalSettings.tsx` implemented `globalVelocity` (CC 4) as a boolean toggle (`127` or `0`), which hallucinated a binary restriction on a continuous hardware parameter (0-127). Correction: Replaced the toggle with a `VelocityControl` slider to accurately reflect the 0-127 range supported by the firmware.

## 2026-05-16 - [Audit Finding] Observation: `GlobalSettings.tsx` allowed users to select up to 16 MIDI Channels, which does not accurately reflect the YM2149F hardware capabilities. The YM2149F is a 3-channel sound chip. The UI hallucinated available features that do not map down to the hardware channels appropriately. Correction: Reduced the `CHANNELS` array length to exactly 3, ensuring the interface matches the physical voices of the synth and eliminating the hallucinated dropdown options.
