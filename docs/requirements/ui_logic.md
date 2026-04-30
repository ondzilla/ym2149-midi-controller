# UI and Logic Requirements

## UI Design & Layout
The application will be a React web app with a responsive, modern interface. It should have clearly separated sections:
1. **Connection Panel**: Web MIDI API device selection (Inputs/Outputs) and Connection Status.
2. **Channel/Bank Selector**: Dropdown or buttons to select active MIDI channel (1-16) and switch Banks (A/B via CC9).
3. **Core Synth Controls**:
   - **Envelope**: Knobs or sliders for Attack (CC12) and Decay (CC11).
   - **Vibrato**: Knobs for Rate (CC2) and Amount (CC3).
   - **Pitch/Detune**: Pitch Bend wheel/slider and Detune knob (CC1).
   - **Velocity**: Sensitivity knob (CC4).
4. **Arpeggiator Controls**:
   - Arp Rate (CC5) and Arp Octave (CC8).
   - Arp Pattern Selector (CC6) displaying the 16 available chord patterns.
   - Arp Mode (CC7).
5. **Polyphony**: Toggle for simultaneous voice playing (CC10).
6. **Drum Pad Section** (Visible specifically for Channel 10):
   - 5 trigger pads mapping to notes C3, C#3, D3, D#3, E3.

## Logic and State Management
- **MIDI Service**: An abstraction over the `navigator.requestMIDIAccess()` API. Needs to handle connecting to devices, listening for state changes, and exposing a generic send message utility.
- **State Math/Formatting**:
  - UI inputs (e.g., 0-100% sliders) must be formatted to standard 7-bit MIDI values (0-127).
  - Certain controls have specific ranges (e.g., Arp Octave maps values to specific `-36` to `+36` steps).
- **Throttling/Debouncing**: Continuous controls (knobs/sliders) should throttle MIDI messages to prevent flooding the hardware.
- **Testing**: Using Vitest and React Testing Library to unit test the MIDI service math logic and ensure UI interactions invoke correctly formatted MIDI messages.
