# 💡 Idea Proposal: Domain-Specific Vintage Rotary Knobs

## 🎯 The Vision
Replace the generic, rotated vertical HTML `<input type="range">` sliders used for synthesis parameters (Attack, Decay, Detune, Pitch Bend) with bespoke, vintage-style rotary knob components.

## 🧠 Why It Matters
A web-based MIDI controller for a retro chip like the YM2149 should capture the tactile essence of vintage hardware.
Currently, the UI uses standard vertical sliders. While functional, they break the illusion of controlling a physical synthesizer. Rotary knobs are the standard interaction paradigm for analog and early digital synths. By implementing custom rotary controls, we vastly improve the UI's aesthetic and user experience without changing the underlying parameter values or capabilities.

## 🎛️ Hardware Validation
This is a purely front-end UX improvement. The ARDUINO-YM2149F firmware maps parameters exactly as they are currently doing via specific CC values (e.g., Attack to CC 12, Decay to CC 11). This change does not introduce hallucinated features or demand unsupported polyphony; it simply changes how the user inputs values that are then sent via the existing `midiService.sendCC` method.

## 🛠️ Proposed Implementation
1. **New Component:** Create a `<VintageKnob>` React component.
2. **Visuals:** Use SVG to render a stylized knob with a clear indicator line. The rotation angle of the knob will visually represent the current value.
3. **Accessibility:** The component will wrap a hidden `<input type="range">` or use explicit `role="slider"`, `aria-valuemin`, `aria-valuemax`, and `aria-valuenow` to maintain full keyboard and screen-reader accessibility.
4. **Interaction:** Implement mouse-drag logic to allow users to click and drag vertically to turn the knob, mirroring standard audio plugin behavior.
