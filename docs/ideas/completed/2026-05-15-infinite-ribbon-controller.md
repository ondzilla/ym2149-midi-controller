# Idea: Infinite Ribbon Controller

## Concept
A web-based "Infinite Ribbon Controller" that turns the user's mouse into an unbounded performance surface for the vintage ARDUINO-YM2149F. Traditional sliders and XY pads hit the edge of the screen, breaking continuous gestures. By capturing the mouse pointer, we can create infinite, continuous relative motion, allowing for endless continuous sweeps, and expressive modulations that feel entirely disconnected from typical UI constraints.

## Feasibility Study
This feature relies on the native HTML5 **Pointer Lock API** (`Element.requestPointerLock()`).
- **How it works:** When activated, the cursor is hidden, and the browser stops tracking its absolute screen position. Instead, it provides raw, continuous `movementX` and `movementY` deltas on `mousemove` events.
- **Why it fits:** It's lightweight, requires zero external libraries, and is natively supported in all modern desktop browsers. It perfectly solves the "screen edge" problem for continuous MIDI control.
- **Data flow:** The unbounded `movementX` and `movementY` deltas can be accumulated and mapped or wrapped to generate continuous 0-127 CC streams.

## Hardware Truth (Parity)
The YM2149F only supports specific CCs and standard Note On/Off messages.
- **Control X:** Map accumulated horizontal delta motion to **CC 1 (Detune)**, continuously wrapping from 0 to 127, acting like an endless rotating knob.
- **Control Y:** Map accumulated vertical delta motion to **CC 3 (Vibrato Depth)** to control the intensity of the effect based on the vertical gesture size.
- Note: This does not introduce any non-standard MIDI messages or hallucinated values. All generated data respects the hardcoded CC mappings of the ARDUINO-YM2149F firmware.
