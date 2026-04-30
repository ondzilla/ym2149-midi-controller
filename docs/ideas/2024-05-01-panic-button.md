# 💡 Idea Proposal: MIDI Panic Button (All Notes Off)

## 🎯 The Vision
Implement a dedicated "Panic Button" in the main application header to immediately silence all active voices.

## 🧠 Why It Matters
When working with hardware synthesizers—especially those with limited polyphony (3 channels for the YM2149) or experimental MIDI setups—"stuck notes" are a common occurrence. This happens when a `Note On` message is received but the corresponding `Note Off` is lost or delayed. A Panic Button is a crucial quality-of-life feature for live performances and studio sessions, providing a one-click solution to stop all sound instantly without needing to restart the device or wait for notes to decay.

## 🎛️ Hardware Validation
The standard MIDI protocol reserves Continuous Controller (CC) **123** for "All Notes Off".
While the specific `requirements/midi_cc_mapping.md` documentation focuses on synthesis parameters, sending CC 123 is a universally understood MIDI command. When broadcast across the active MIDI channel(s), the receiving hardware (or its internal MIDI parser) handles the immediate silencing of active oscillators.

## 🛠️ Proposed Implementation
We can repurpose the existing `power_settings_new` icon in the `<TopBar />` component.
The prototype will map a click event to iterate through all 16 MIDI channels and broadcast CC 123 with a value of 0.

```typescript
const handlePanic = () => {
  // Broadcast CC 123 (All Notes Off) across all 16 MIDI channels
  for (let i = 1; i <= 16; i++) {
    midiService.sendCC(i, 123, 0);
  }
};
```

Additionally, to maintain the project's accessibility standards, the icon will be wrapped in a proper `<button>` element with an `aria-label="All Notes Off"` and `focus-visible` styling.
