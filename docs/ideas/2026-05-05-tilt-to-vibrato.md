# 💡 Bulb [Experimental]: Tilt to Vibrato

## The Concept: "Tilt to Vibrato"

The idea is to use a mobile device's built-in accelerometer/gyroscope to control the Vibrato Rate and Vibrato Depth on the YM2149F. By tilting the phone or tablet, the user can physically "wobble" the sound, similar to shaking a physical instrument.

*   **X-axis (Beta/Pitch):** Maps to **MIDI CC 3 (Vibrato Depth)**. Tilting forward/backward increases or decreases the depth of the vibrato.
*   **Y-axis (Gamma/Roll):** Maps to **MIDI CC 2 (Vibrato Rate)**. Tilting left/right changes the speed of the vibrato.

This brings a highly expressive, theremin-like tactile control to the YM2149F without requiring any extra hardware, just the web browser's built-in APIs.

## Hardware Parity Check

*   **CC 2 (Vibrato Rate):** Explicitly supported by ARDUINO-YM2149F firmware.
*   **CC 3 (Vibrato Depth):** Explicitly supported by ARDUINO-YM2149F firmware.
*   **No new DSP features:** We are strictly sending standard 7-bit MIDI CC messages (0-127) to existing, supported parameters.

## Feasibility Study

This feature will rely on the `DeviceOrientationEvent` Web API.

### Web API Details
The `window.addEventListener('deviceorientation', handleOrientation)` API provides access to the physical orientation of the device.

The event object provides three key properties:
*   `alpha`: Rotation around the z-axis (compass direction) - *Not used.*
*   `beta`: Front-to-back tilt in degrees (-180 to 180).
*   `gamma`: Left-to-right tilt in degrees (-90 to 90).

### Data Mapping Logic
We will need to map the degree values to the standard 0-127 MIDI range.

```javascript
// Example Mapping Logic
function handleOrientation(event) {
  // Constrain Beta (Forward/Back) to a usable range, e.g., 0 to 90 degrees
  let beta = Math.max(0, Math.min(90, event.beta));
  // Map 0-90 to 0-127 for CC3 (Vibrato Depth)
  let depthCC = Math.floor((beta / 90) * 127);

  // Constrain Gamma (Left/Right) to a usable range, e.g., -45 to 45 degrees
  let gamma = Math.max(-45, Math.min(45, event.gamma));
  // Map -45 to 45 to 0-127 for CC2 (Vibrato Rate)
  let rateCC = Math.floor(((gamma + 45) / 90) * 127);

  // Send MIDI CCs via our existing MidiService
  midiService.sendCC(activeChannel, 3, depthCC);
  midiService.sendCC(activeChannel, 2, rateCC);
}
```

### Challenges & Considerations
1.  **Permissions:** iOS 13+ requires explicit user interaction (a button click) to request permission to use device orientation sensors (`DeviceOrientationEvent.requestPermission()`). We will need a UI toggle button like "Enable Tilt Control".
2.  **HTTPS Requirement:** The `DeviceOrientationEvent` API is only available in secure contexts (HTTPS).
3.  **Event Throttling:** The orientation event fires extremely rapidly. We should throttle or debounce the MIDI CC sending to prevent flooding the web MIDI queue or overwhelming the hardware chip, potentially utilizing `requestAnimationFrame` for a smooth polling loop similar to how the Gamepad API was implemented.
4.  **Zero-Point Calibration:** Users might hold their devices at different default angles. An advanced implementation might include a "Calibrate Zero Point" button to set the current tilt as the 0 value for both CCs.
