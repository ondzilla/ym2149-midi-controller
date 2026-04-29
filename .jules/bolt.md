## 2026-04-29 - Array Allocation in Render
**Learning:** Frequent array allocations (like `Array.from({ length: 16 })`) inside React render functions cause unnecessary GC pressure, especially when tied to rapid events like range sliders.
**Action:** Always move static arrays and lists of options outside of the component render loop or use `useMemo` to prevent reallocation during rapid re-renders.
