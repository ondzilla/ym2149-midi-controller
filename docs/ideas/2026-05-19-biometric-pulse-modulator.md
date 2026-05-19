# 💡 Bulb [Experimental]: Biometric Pulse Modulator

## The Concept

The "Biometric Pulse Modulator" bridges the gap between the human body and the vintage YM2149F synthesizer by leveraging real-time physiological data. By utilizing the modern Web Bluetooth API, the application can securely connect to standard BLE (Bluetooth Low Energy) heart rate monitors (like a smartwatch or chest strap).

This allows the user's resting, active, or changing heart rate (BPM) to serve as a continuous, organic control stream, mapping physical exertion or relaxation directly to synthesis parameters. It transforms the performer's body into a dynamic, generative MIDI controller.

## Hardware Parity Check

*   **Standard Control Mapping:** The incoming BPM data (typically ranging from 40 to 200+ BPM) will be mathematically scaled and normalized to the standard 7-bit MIDI CC range (0-127).
*   **Target Parameters:** The biometric data is perfectly suited for time-based hardware features, specifically mapping to:
    *   **CC 5 (Arpeggiation Rate):** To link the arpeggio speed to the user's pulse.
    *   **CC 2 (Vibrato Rate):** To increase the "nervousness" of the vibrato as the heart rate rises.
*   **No new DSP features:** We strictly generate standard MIDI CC messages for existing, firmware-supported parameters.

## Feasibility Study

This feature relies on the **Web Bluetooth API** (`navigator.bluetooth`), which provides a secure, dependency-free method to interact with BLE devices directly from the browser:

1.  **Device Connection:**
    *   `navigator.bluetooth.requestDevice({ filters: [{ services: ['heart_rate'] }] })` prompts the user to select their BLE heart rate monitor.
2.  **Data Stream:**
    *   Once connected, the app connects to the GATT server, retrieves the Heart Rate Measurement characteristic, and adds an event listener for `characteristicvaluechanged`.
3.  **Data Parsing & Processing:**
    *   The event handler reads the `DataView`, extracts the 8-bit or 16-bit BPM value according to the BLE Heart Rate Profile specification, and calculates a smoothed moving average to prevent jitter.
4.  **Desktop Suitability:**
    *   The Web Bluetooth API is well-supported on desktop environments (Chrome, Edge) and perfectly aligns with the app's requirement to remain a desktop-centric interface.

## Implementation Notes

1.  **UI Component:** Introduce a `<BiometricModulator>` panel within the "Experimental Lab" section. It should feature a "Connect Heart Rate Monitor" button.
2.  **Visual Feedback:** Display the current BPM with a pulsing visual indicator (e.g., a beating heart icon) and show the scaled MIDI CC value (0-127) being transmitted.
3.  **Parameter Routing:** Provide a dropdown to select the target parameter (Arpeggiation Rate, Vibrato Rate, etc.).
4.  **Graceful Degradation:** Include clear UI states for "Bluetooth Not Supported," "Connecting," and "Device Disconnected," as Web Bluetooth requires HTTPS or localhost and user interaction to initiate.
