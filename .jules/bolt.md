## 2026-05-01 - [React Re-render Minimization on Slider Updates]
**Learning:** Components driving fast, continuous updates (like range sliders controlling Web MIDI CC via `usePatchState`) will trigger rapid re-renders of the entire parent component if not isolated. In components containing multiple `Array.from` mappings or complex layouts (like `Arpeggiator`), this causes noticeable garbage collection pressure and layout thrashing.
**Action:** Extract continuously updating form controls (e.g., `ArpRateControl`) into isolated child components to scope the state changes to the smallest possible DOM tree. Additionally, move static reference arrays outside of the component functional scope to prevent re-allocation on every render.
## 2026-05-03 - [Extract continuous sliders to isolate re-renders]
**Learning:** Components driving fast, continuous updates (like range sliders controlling Web MIDI CC via `usePatchState`) will trigger rapid re-renders of the entire parent component if not isolated. In components containing multiple `Array.from` mappings or complex layouts (like `SynthControls`), this causes noticeable garbage collection pressure and layout thrashing.
**Action:** Always extract continuously updating form controls into isolated child components to scope the state changes to the smallest possible DOM tree.

## 2023-10-27 - Object.entries in requestAnimationFrame loop
**Learning:** In highly optimized code like `GamepadController` using `requestAnimationFrame`, `Object.entries(DRUM_MAPPING)` was allocating a new array of arrays every single frame, causing unnecessary garbage collection pressure and potentially slowing down the loop.
**Action:** Extract static mapping arrays out of the render/animation loop, for example by declaring them once outside the component using `Object.entries(DRUM_MAPPING).map(...)`.
