# 💡 Bulb [Experimental]: BLE Heart Rate Modulator

## Overview
The "BLE Heart Rate Modulator" is an experimental concept that bridges human physiological data with vintage sound synthesis. By leveraging the Web Bluetooth API, we can connect directly to consumer heart rate monitors (like chest straps or smartwatches) and use the continuous stream of BPM (Beats Per Minute) data to modulate hardware parameters on the ARDUINO-YM2149F.

Imagine an installation where the performer's actual heart rate controls the vibrato speed (CC 4) or arpeggiator tempo, creating an intimate, biometric performance surface that requires zero physical touch.

## How it Works
1.  **Connection:** The user clicks a "Connect Biometrics" button.
2.  **Web Bluetooth:** The browser prompts the user to select a nearby BLE device advertising the standard Heart Rate Service (`0x180D`).
3.  **Data Stream:** The application subscribes to the Heart Rate Measurement characteristic (`0x2A37`), receiving asynchronous updates whenever the sensor detects a heartbeat or calculates a new BPM.
4.  **MIDI Mapping:** The raw BPM value (typically ranging from 40 to 200) is normalized and scaled to standard 7-bit MIDI CC values (0-127).
5.  **Output:** The mapped CC data is streamed via Web MIDI to the YM2149F, dynamically modulating parameters like Vibrato Speed (CC 4) or Detune (CC 1) based on the user's physiological state.

## Target Hardware Parameters (YM2149F Parity)
The YM2149F firmware natively supports the following CCs, making them ideal targets for this continuous data stream:
*   **CC 4 (Vibrato Speed):** Faster heart rate directly translates to faster vibrato oscillation.
*   **CC 3 (Vibrato Depth):** Heart rate intensity modulates the depth of the effect.
*   **CC 1 (Detune):** As heart rate increases, the tuning becomes increasingly unstable and chaotic.

## Feasibility Study

### Required Web API: `navigator.bluetooth` (Web Bluetooth API)
The Web Bluetooth API is natively supported in Chromium-based desktop browsers (Chrome, Edge, Opera) without any external libraries or dependencies.

### Technical Approach
1.  **Request Device:**
    ```javascript
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ services: ['heart_rate'] }]
    });
    ```
2.  **Connect & Subscribe:**
    ```javascript
    const server = await device.gatt.connect();
    const service = await server.getPrimaryService('heart_rate');
    const characteristic = await service.getCharacteristic('heart_rate_measurement');
    await characteristic.startNotifications();
    characteristic.addEventListener('characteristicvaluechanged', handleHeartRateMeasurement);
    ```
3.  **Parse Data (Zero Dependencies):**
    The standard GATT specification for Heart Rate Measurement dictates how to parse the `DataView` payload. We do not need external libraries to parse this lightweight byte buffer.
    ```javascript
    function handleHeartRateMeasurement(event) {
      const value = event.target.value;
      const flags = value.getUint8(0);
      const rate16Bits = flags & 0x1;
      const heartRate = rate16Bits ? value.getUint16(1, true) : value.getUint8(1);

      // Map BPM (e.g., 60-180) to MIDI CC (0-127)
      const mappedCC = mapRange(heartRate, 60, 180, 0, 127);
      sendMidiCC(4, mappedCC); // Send to YM2149F Vibrato Speed
    }
    ```

### Pros
*   **Zero Dependencies:** Relies entirely on native browser APIs and standard BLE GATT specifications.
*   **Continuous Stream:** Provides a high-resolution, continuous stream of data unlike discrete events.
*   **Desktop Friendly:** Fits perfectly within the constraints of a desktop application; the user does not need to move the computer, only themselves.

### Cons / Limitations
*   **Browser Support:** Primarily limited to Chromium-based browsers on desktop (Chrome, Edge). Firefox and Safari have limited or no support.
*   **User Friction:** Requires the user to own a compatible BLE heart rate monitor and pair it via the browser prompt.
