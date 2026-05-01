# 💡 Idea Proposal: Local Storage Preset Manager

## 🎯 The Vision
Implement a "Preset Manager" that saves and loads the current software UI state (slider values, toggles, and patterns) using browser `localStorage`. When a preset is loaded, the application will not only update the UI but also instantly blast the corresponding MIDI CC messages to the YM2149F to sync the hardware state with the software.

## 🧠 Why It Matters
Currently, the ARDUINO-YM2149F firmware supports 28 built-in presets (14 per bank). However, modifying these presets requires diving into the Arduino C++ code and reflashing the device.
By introducing a software-side Preset Manager, users can quickly iterate on sound design, save their custom patches locally in the browser, and recall them instantly without touching the code. This bridges the gap between the static hardware presets and a modern, dynamic synthesizer workflow.

## 🎛️ Hardware Validation
The ARDUINO-YM2149F is heavily reliant on MIDI CC messages for parameter control (e.g., CC1 Detune, CC2 Vibrato Rate, CC11 Decay).
When a user loads a saved preset in the software, the app can iterate through the saved state and rapidly send out the corresponding `midiService.sendCC()` commands. The Arduino firmware is designed to continuously listen for and process these CC updates in its `loop()`, meaning it can handle a burst of parameter updates to establish a new sound state instantly.

## 🛠️ Proposed Implementation
1. **State Serialization:** Create a utility to serialize the current React component states (Attack, Decay, Detune, Arp settings) into a JSON object.
2. **Storage Mechanism:** Use `localStorage` to save these JSON objects with user-defined names.
3. **Recall & Sync:** When a patch is loaded:
   - Update the React state (so the UI reflects the loaded patch).
   - Iterate through the saved parameters and dispatch the corresponding CC messages via `midiService.sendCC()` to sync the hardware.
4. **UI Integration:** Add "SAVE PATCH" and "LOAD PATCH" buttons in the Sidebar layout component.
