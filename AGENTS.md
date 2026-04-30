# Jules AI Agent Configuration - YM2149 MIDI Controller

## 🌐 Project Context
This is a modern React 19 web application designed to control an external YM2149 chiptune synthesizer via the Web MIDI API. 

## 🛠 Tech Stack
- **Frontend:** React 19 (using the latest patterns), Vite 8, TypeScript.
- **Styling:** Tailwind CSS.
- **Testing:** Vitest for units, Playwright for E2E.
- **Communication:** Web MIDI API (handling MIDI CC, Program Changes, and Note data).

## 🎯 Core Directives for Jules
1. **Hardware-Aware Design:** This app is a controller. Feature suggestions should focus on UI/UX patterns that make vintage hardware control intuitive (e.g., ADSR visualizers, patch management, or sequencer grids).
2. **Web MIDI Reliability:** Ensure MIDI access is handled gracefully (checking for browser support, handling disconnects).
3. **Latest React Patterns:** Use React 19 features (like the new `use` hook or improved Action patterns) where appropriate.
4. **External Reference:** The hardware capabilities are defined by the [ARDUINO-YM2149F documentation](https://github.com/Chiptune-Anamnesis/ARDUINO-YM2149F). Refer to its MIDI implementation map to see what parameters (CC numbers, etc.) we can control.

## 📁 Output Rules
- All new feature ideas, architectural brainstorms, or UI mocks should be written to individual markdown files in `docs/ideas/`.
- Name files following the pattern: `YYYY-MM-DD-feature-name.md`.