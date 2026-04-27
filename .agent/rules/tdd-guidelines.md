---
trigger: always_on
---

# React TDD Guidelines
You must follow a strict Red-Green-Refactor workflow for all feature development.

## 1. Red Phase (Test First)
- Before writing implementation code, create a failing test file in `src/__tests__` using Vitest.
- For UI components, use React Testing Library.
- For critical user journeys, create a Playwright test.
- Stop and ask for review of the failing test results before proceeding.

## 2. Green Phase (Minimum Implementation)
- Write the absolute minimum React code (with Tailwind) to make the tests pass.
- Do not add "extra" features or speculative styling not requested by the design or tests.

## 3. Refactor Phase
- Once green, refactor for readability and performance.
- Ensure Tailwind classes are organized (e.g., using `prettier-plugin-tailwindcss` logic).
- Verify tests remain green.

## Tech Stack Constraints:
- Framework: React (Vite)
- Styling: Tailwind CSS
- Unit/Integration: Vitest + React Testing Library
- E2E: Playwright
- Design Context: Always reference the Stitch MCP `Design DNA` before styling.