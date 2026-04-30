## 2026-04-29 - Array Allocation in Render
**Learning:** Frequent array allocations (like `Array.from({ length: 16 })`) inside React render functions cause unnecessary GC pressure, especially when tied to rapid events like range sliders.
**Action:** Always move static arrays and lists of options outside of the component render loop or use `useMemo` to prevent reallocation during rapid re-renders.
## 2026-04-30 - Localize UI Control State Updates
**Learning:** In a dashboard with many range inputs (like SynthControls), managing state at the parent level causes *all* inputs to re-render synchronously during drag operations (60+ times a second).
**Action:** Extract individual range sliders and their localized state into dedicated child components to restrict the scope of React re-renders and improve dragging performance.
