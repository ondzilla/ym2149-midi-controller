# 💡 Bulb [Experimental]: Wii Remote HID Controller

## Summary
The "Wii Remote HID Controller" is an experimental feature that utilizes the WebHID API (`navigator.hid`) to connect directly to a classic Nintendo Wii Remote from the browser. It maps the Wiimote's internal accelerometer data and physical buttons directly into a continuous stream of vintage sound parameters for the ARDUINO-YM2149F.

This brings a highly tactile, physical controller experience to the desktop, allowing the user to "conduct" or tilt the vintage synth parameters in 3D space.

## How it works
The feature leverages the modern browser's WebHID API to request access to the paired Bluetooth HID device (the Wii Remote).

### Possible Mappings:
* **Tilt X / Y / Z (Accelerometer):** Mapped dynamically to CC 1 (Detune), CC 3 (Vibrato Amount), and CC 4 (Vibrato Speed). We wrap and scale the raw G-force bytes to fit the 0-127 MIDI range.
* **D-Pad / A / B Buttons:** Can trigger specific standard MIDI `Note On`/`Note Off` messages (e.g., hitting the A button triggers a kick drum on CH 10, B triggers a snare).
* **Home Button:** Acts as a MIDI "Panic" button, sending `All Notes Off` (CC 123).

## Feasibility Study
* **Technology**: This relies on the native `navigator.hid` API to access raw byte reports from the Wiimote.
* **Dependencies**: While the goal is zero-dependencies, parsing the complex raw HID byte reports from the Wii Remote (to extract accelerometer data correctly) is notoriously tricky. As an exception to the strict no-dependencies rule, a strictly vetted, lightweight parsing library (like a small Wiimote-HID utility) used solely for translating the raw byte stream into readable sensor data is permissible.
* **Hardware Parity**: Perfect. The incoming 3D motion and button presses are translated strictly into standard MIDI messages (Note On/Off and supported CCs) for the ARDUINO-YM2149F. No un-supported DSP features are added.
* **Desktop Context**: Connecting to HID peripherals is primarily a desktop browser interaction.

## Next Steps
- Create a connection UI utilizing `navigator.hid.requestDevice({ filters: [{ vendorId: 0x057e }] })`.
- Parse the input reports via `device.addEventListener('inputreport', ...)`.
- Implement a math utility to smooth and map the accelerometer readings into safe 0-127 7-bit MIDI CC values.
