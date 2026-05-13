# 💡 Bulb [Experimental]: QWERTY Piano Keyboard

## The Concept: "QWERTY Piano Keyboard"

The idea is to introduce a "QWERTY Piano Keyboard" component that turns the user's standard computer keyboard into a playable MIDI controller. This allows users who may not own dedicated MIDI hardware to easily "play" the synthesizer using standard typing keys.

By mapping a row of keys (like A, S, D, F, G, H, J, K, L) to white notes and the row above it (W, E, T, Y, U, O, P) to black notes, users can play melodies and chords directly from their laptop or desktop keyboard.

## Hardware Parity Check

*   **Pitch (Note Number):** Explicitly supported by ARDUINO-YM2149F firmware via standard Note On messages.
*   **Note Triggering:** Explicitly supported via Note On and Note Off messages.
*   **No new DSP features:** We are strictly sending standard Note On/Off messages for existing, supported parameters based on key presses.

## Feasibility Study

This feature leverages standard modern Web APIs without any heavy external libraries:

1.  **Keyboard Events:** Uses the native browser `KeyboardEvent` API (`keydown` and `keyup` listeners on the `window` or a specific container).
2.  **Data Mapping:** A simple mapping dictionary translates `event.code` (e.g., `KeyA`, `KeyW`) to specific MIDI note numbers (e.g., 60 for Middle C).
3.  **State Management:** An active notes registry (e.g., a React `useRef` or `Set`) ensures that holding a key doesn't repeatedly trigger `Note On` messages due to the OS key repeat feature.
4.  **Performance:** Native keyboard event listeners are extremely low-latency, making them ideal for musical applications.

## Implementation Notes

This feature falls under the "Experimental Lab" by providing alternative input methods for the hardware.

1.  **UI Component:** Build an optional `<QwertyKeyboard>` React component, or a globally active hook that can be toggled via a setting.
2.  **Interaction:** Listen for `keydown` to trigger `midiService.sendNoteOn()`, and `keyup` to trigger `midiService.sendNoteOff()`.
3.  **Visual Feedback:** (Optional) If an on-screen keyboard is rendered, highlight the corresponding virtual keys when typing.
4.  **Accessibility:** Ensure the feature does not interfere with standard screen reader navigation or other essential keyboard shortcuts when active (perhaps require focus on a specific element or toggle a "Play Mode").
