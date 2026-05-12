# 💡 Bulb [Experimental]: Low Battery Detune

## The Concept: "Low Battery Detune"

A background feature that maps the host device's battery level to the YM2149F's Detune parameter. As the laptop or device loses battery power, the synthesizer slowly and organically detunes, creating a physical, hardware-tied degradation effect. It perfectly fits the "Experimental Lab" philosophy of making the web a sensor-rich playground for old chips.

## Hardware Parity Check

*   **Parameter:** Detune (CC 1)
*   **Hardware Truth:** Explicitly supported by the ARDUINO-YM2149F firmware via CC 1 (-64 to +64 range, mapped via 0-127).
*   No new DSP logic or firmware changes are required.

## Feasibility Study

This experimental feature leverages the native `navigator.getBattery()` Web API (Battery Status API).
*   It provides a `BatteryManager` object with a `level` property (0.0 to 1.0).
*   It includes a `levelchange` event listener, meaning we do not need to poll it continuously.
*   The feature is lightweight, dependency-free, and supported in major browsers like Chrome and Edge.

## Implementation Notes

1.  Add an `experimentalBatteryDetune` toggle to `GlobalSettings.tsx`.
2.  Create a custom hook `useBatteryDetune` that initializes `navigator.getBattery()`.
3.  Map the battery `level` (e.g., 100% to 0%) to the CC 1 range (e.g., center 64 to extreme 127 or 0) using our existing `mapRange` math utility.
4.  When the `levelchange` event fires, calculate the new CC value and dispatch it via `midiService.sendCC(activeChannel, 1, value)`.
