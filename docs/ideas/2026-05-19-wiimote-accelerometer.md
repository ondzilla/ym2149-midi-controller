# 💡 Bulb [Experimental]: Wiimote Accelerometer Integration

## The Concept

The "Wiimote Accelerometer Modulator" bridges legacy gaming hardware with the vintage YM2149F synthesizer. While the app typically strictly avoids heavy external dependencies, we can make an exception for highly vetted, lightweight libraries when they unlock access to iconic hardware.

By utilizing the modern WebHID API alongside a vetted parser library (like `wiimote.js` or a similar lightweight byte-parser), we can connect a classic Nintendo Wii Remote via Bluetooth. This allows the user to use the Wiimote's internal 3-axis accelerometer to physically conduct the synthesizer, mapping tilt and motion directly to sound parameters.

## Hardware Parity Check

*   **Standard Control Mapping:** Raw accelerometer data (G-forces along X, Y, and Z axes) is noisy. The application will use simple exponential moving average (EMA) smoothing on the incoming data before mapping the specific axes to the standard 7-bit MIDI CC range (0-127).
*   **Target Parameters:** The smoothed, continuous motion data maps perfectly to expressive parameters:
    *   **CC 1 (Detune):** Tilt the Wiimote left/right (Roll) to bend the pitch slightly, like a physical pitch wheel.
    *   **CC 3 (Vibrato Amount):** Tilt the Wiimote up/down (Pitch) to increase the depth of the vibrato.
*   **No new DSP features:** We strictly generate standard MIDI CC messages for existing, firmware-supported parameters.

## Feasibility Study

This feature relies on the **WebHID API** (`navigator.hid`) and a vetted parsing dependency.

1.  **Device Connection:**
    *   `navigator.hid.requestDevice({ filters: [{ vendorId: 0x057e, productId: 0x0306 }] })` (standard Wiimote identifiers) prompts the user to pair their connected Wiimote.
2.  **Data Stream & Parsing (The Vetted Dependency):**
    *   Once connected, the WebHID API provides raw input reports (byte arrays). Because Nintendo's HID protocol is complex and undocumented, writing a custom parser from scratch is error-prone.
    *   We will introduce a strictly vetted, lightweight, open-source library (e.g., a modern ES module port of `wiimote.js`) specifically to handle the byte-parsing of the HID reports into usable accelerometer objects (`{x, y, z}`).
3.  **Data Processing:**
    *   The app takes the parsed `{x, y, z}` data, applies EMA smoothing, and calculates the final MIDI values.
4.  **Desktop Suitability:**
    *   The user waves the Wiimote while the desktop app handles the WebHID connection and MIDI routing, maintaining the application's desktop-centric constraints.

## Implementation Notes

1.  **UI Component:** Add a `<WiimoteModulator>` panel within the "Experimental Lab".
2.  **Connection Flow:** Include a "Pair Wiimote" button that triggers the browser's native HID pairing dialog.
3.  **Configuration:** Include dropdowns to map specific physical axes (Roll, Pitch) to target YM2149F parameters (e.g., Roll -> Detune, Pitch -> Vibrato Amount).
4.  **Dependency Vetting:** The implementation phase must include a strict audit of the chosen parsing library to ensure it adds negligible bundle weight and has no external sub-dependencies.
