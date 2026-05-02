# 💡 Idea Proposal: LocalStorage Preset Manager UI

## 🎯 The Vision
Implement a "Preset Manager" UI that allows users to save, load, and manage their synthesizer parameter patches directly from their browser using `localStorage`.

## 🧠 Why It Matters
While the YM2149 chip itself only holds its current register state and the Arduino firmware can store hardcoded presets in PROGMEM (Banks A & B), giving the user the ability to design and save custom patches on the fly greatly enhances the software controller's utility. A robust preset manager turns this from a simple control surface into a capable sound design tool.

## 🎛️ Hardware Check
This feature operates at the software layer and respects all YM2149 constraints.
When a preset is loaded, the existing `usePatchState` hooks and the `PresetManager` class will iterate over the saved parameters and dispatch their corresponding MIDI CC messages (such as CC 1 for Detune, CC 11/12 for Envelope, etc.) across the active MIDI channel. This accurately reflects the "hardware reality" by ensuring the YM2149 registers are fully updated to match the newly loaded software preset.

## 🛠️ Proposed Implementation
The foundation for this feature already exists in `app/src/services/presetManager.ts` and `app/src/hooks/usePatchState.ts`.
We will build a new UI component, likely placed in the `ConnectionPanel` or a dedicated section, featuring:
1. A dropdown to select previously saved presets from `localStorage`.
2. A "Load" button that triggers `presetManager.loadPreset()`.
3. A "Save As" button and input field that calls `presetManager.savePreset(name)`.

As a prototype, a disabled "PATCH_MEMORY (WIP)" section has been scaffolded in the `ConnectionPanel.tsx` to demonstrate where this functionality will live.
