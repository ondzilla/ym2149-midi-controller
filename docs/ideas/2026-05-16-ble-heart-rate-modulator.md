# BLE Heart Rate Modulator

## Overview
The "BLE Heart Rate Modulator" is an experimental concept that bridges the gap between biometric data and vintage sound synthesis. By using the Web Bluetooth API to connect to standard BLE Heart Rate monitors (like chest straps or smartwatches), we can translate a performer's physical state (heart rate variability and BPM) into continuous MIDI streams to modulate the ARDUINO-YM2149F.

This concept explores how biological feedback can create organic, shifting textures that are impossible to program manually, providing a deeply personal connection to the sound.

## Features
- **Biometric Connection:** Connects directly to BLE heart rate monitors via the browser.
- **Continuous Modulation:** Maps the continuous heart rate (BPM) to supported MIDI CCs.
- **Hardware Parity Mapping:**
  - High heart rate can increase CC 1 (Detune) to create more tension.
  - BPM fluctuations can map to CC 3 (Vibrato Depth/Amount) or CC 4 (Vibrato Speed), making the vibrato pulse in sync with the performer's heart.

## Feasibility Study
This feature is highly feasible as a desktop-centric experimental control surface because:
1. **Web Bluetooth API (`navigator.bluetooth`):** This is a verified, zero-dependency modern Web API supported in Chromium-based desktop browsers. It allows direct connection to BLE peripherals (like heart rate monitors using the standard GATT heart rate profile 0x180D).
2. **Continuous Data Stream:** The API supports subscribing to characteristic value changes, which provides a continuous stream of heart rate measurements that can be easily mapped and scaled to the 0-127 MIDI CC range.
3. **No Heavy Libraries:** Translating the simple byte stream from a BLE heart rate monitor requires minimal parsing logic, adhering to the rule of avoiding heavy external libraries (like TensorFlow.js or MediaPipe).

## User Experience
The user will click a "Connect Heart Monitor" button, which triggers the native browser Bluetooth pairing dialog. Once connected, a UI widget will display the current BPM and allow the user to select which YM2149 parameter (Detune, Vibrato Amount, Vibrato Speed) should be modulated by the heart rate data. The application will handle the scaling (e.g., mapping 60-160 BPM to a 0-127 CC value) and continuously send the generated MIDI CC stream to the hardware.
