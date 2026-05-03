# MIDI Connection Status Indicator

## The Vision
In a web-based MIDI controller interface, visual confirmation that the hardware is successfully communicating with the browser is critical. Currently, the `ConnectionPanel` component features mock dropdowns and a hidden status indicator (`sr-only`), leaving users guessing if their synthesizer is actually receiving signals.

This proposal advocates for:
1.  Hooking up the existing `ConnectionPanel` directly to the `MidiService` to dynamically list actual hardware inputs and outputs.
2.  Replacing the hidden connection status indicator with a prominent visual cue (e.g., a colored dot or badge) that clearly reads "CONNECTED" when an active output device is selected, and "DISCONNECTED" otherwise.

## Why
*   **User Confidence:** Musicians need immediate feedback that their instrument is online before a performance.
*   **Troubleshooting:** If the user cannot hear sound, a clear connection indicator helps them narrow down if the issue is a physical cable, the Web MIDI API, or software routing.
*   **Hardware Parity:** It grounds the web UI in the physical reality of hardware connections.

## Hardware Validation
This feature relates to the foundational layer of communication. The ARDUINO-YM2149F relies on MIDI Note On/Off and CC messages via a MIDI TRS connection. If the web browser cannot establish a connection to the hardware MIDI interface, none of the mapped CC controls (like Vibrato, Envelopes, or Arpeggiation) will function. The `MidiService` already polls the Web MIDI API, so this is fully supported without any firmware changes.

## Prototype
A lightweight prototype will be implemented in `app/src/components/ConnectionPanel.tsx`.
*   It will subscribe to `midiService` to retrieve the live lists of `inputs` and `outputs`.
*   It will render a small, styled badge indicating the connection status.
*   It will update the `activeOutId` to actually set the output device in `midiService`.