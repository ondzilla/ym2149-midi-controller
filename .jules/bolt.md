## 2026-05-01 - [React Re-render Minimization on Slider Updates]
**Learning:** Components driving fast, continuous updates (like range sliders controlling Web MIDI CC via `usePatchState`) will trigger rapid re-renders of the entire parent component if not isolated. In components containing multiple `Array.from` mappings or complex layouts (like `Arpeggiator`), this causes noticeable garbage collection pressure and layout thrashing.
**Action:** Extract continuously updating form controls (e.g., `ArpRateControl`) into isolated child components to scope the state changes to the smallest possible DOM tree. Additionally, move static reference arrays outside of the component functional scope to prevent re-allocation on every render.
## 2026-05-03 - [Extract continuous sliders to isolate re-renders]
**Learning:** Components driving fast, continuous updates (like range sliders controlling Web MIDI CC via `usePatchState`) will trigger rapid re-renders of the entire parent component if not isolated. In components containing multiple `Array.from` mappings or complex layouts (like `SynthControls`), this causes noticeable garbage collection pressure and layout thrashing.
**Action:** Always extract continuously updating form controls into isolated child components to scope the state changes to the smallest possible DOM tree.

## 2023-10-27 - Object.entries in requestAnimationFrame loop
**Learning:** In highly optimized code like `GamepadController` using `requestAnimationFrame`, `Object.entries(DRUM_MAPPING)` was allocating a new array of arrays every single frame, causing unnecessary garbage collection pressure and potentially slowing down the loop.
**Action:** Extract static mapping arrays out of the render/animation loop, for example by declaring them once outside the component using `Object.entries(DRUM_MAPPING).map(...)`.

## 2026-05-05 - [React Pointer Events over window event listeners]
**Learning:** When dealing with continuous drag operations in a component, binding  or  to  inside a  can cause severe garbage collection and re-binding overhead if state variables (like  or ) need to be included in the dependency array to avoid stale closures. This runs 60fps and leads to layout thrashing.
**Action:** Always prefer native React  delegation (, , ) directly on SVG elements or wrappers. Combine this with  to natively handle dragging outside element bounds without manually managing window event lifecycles.

## 2026-05-05 - [React Pointer Events over window event listeners]
**Learning:** When dealing with continuous drag operations in a component, binding mousemove or touchmove to window inside a useEffect can cause severe garbage collection and re-binding overhead if state variables (like attack or decay) need to be included in the dependency array to avoid stale closures. This runs 60fps and leads to layout thrashing.
**Action:** Always prefer native React PointerEvent delegation (onPointerDown, onPointerMove, onPointerUp) directly on SVG elements or wrappers. Combine this with e.currentTarget.setPointerCapture to natively handle dragging outside element bounds without manually managing window event lifecycles.

## 2026-05-06 - [Extracting allocations from requestAnimationFrame]
**Learning:** Functions defined inside a requestAnimationFrame callback loop (like `processAxis` in GamepadController) are allocated up to 60 times a second, putting unnecessary pressure on the garbage collector.
**Action:** Move function definitions out of the loop and pass any necessary closure variables as arguments.

## 2026-05-15 - [Avoid micro-optimizing small constant loops]
**Learning:** Attempting to optimize small constant-time loops (like a 16-channel iteration) is generally rejected in code reviews as a micro-optimization with no measurable impact. Always look for optimizations in high-frequency paths like audio loops or requestAnimationFrame, such as hoisting operations out of buffer iteration loops.
**Action:** Focus performance improvements on large arrays or high-frequency loops. For example, pulling division out of the audio buffer RMS calculation loop in `AudioModulationControl`.

## 2026-05-10 - [Extract mathematical recalculations from nested processing loops]
**Learning:** In high-frequency, pixel-level processing loops (like analyzing 3072 pixels per frame at 60fps in ThereminCam), recalculating 1D array indexes mathematically `const i = (y * RESOLUTION_WIDTH + x) * 4` creates severe performance bottlenecks. It resulted in roughly ~552,960 unnecessary math operations per second.
**Action:** Instead of complex recalculations inside nested loops, hoist variables to the outer scope when possible and rely on sequential accumulation `i += 4`. This principle applies universally to heavy nested iteration contexts.

## 2026-05-18 - [Cache Canvas Context in requestAnimationFrame]
**Learning:** Calling `canvas.getContext('2d')` inside a high-frequency loop like `requestAnimationFrame` forces the browser to look up and return the rendering context up to 60 times a second, which adds unnecessary overhead.
**Action:** Always cache the `CanvasRenderingContext2D` instance using a `useRef` and reuse it across frames to save execution time and avoid redundant API calls.

## 2026-05-18 - [Cache Canvas Context in requestAnimationFrame]
**Learning:** Calling `canvas.getContext('2d')` inside a high-frequency loop like `requestAnimationFrame` forces the browser to look up and return the rendering context up to 60 times a second, which adds unnecessary overhead.
**Action:** Always cache the `CanvasRenderingContext2D` instance using a `useRef` and reuse it across frames to save execution time and avoid redundant API calls.
## 2026-05-19 - [Replace Math.pow with direct multiplication in hot loops]
**Learning:** High-frequency, pixel-level distance calculations inside nested loops or frequent callbacks (like `getClosestChannel` running up to 128 times per frame in a `requestAnimationFrame` loop) create severe overhead when using `Math.pow(value, 2)`. This adds overhead for generic typing and function invocations.
**Action:** Replace `Math.pow(val, 2)` with direct multiplication `(val * val)`. The simplest performance boost for spatial calculations on hot paths in graphics code.
