# YM2149F Controller

A web-based MIDI controller application designed for the YM2149F Arduino Synthesizer. This application allows you to control the synth's features via a modern web interface.

## Board Documentation

For details on the hardware board and its capabilities, please refer to the official documentation:
[ARDUINO-YM2149F Documentation](https://github.com/Chiptune-Anamnesis/ARDUINO-YM2149F)

## Setup & Running

This project uses `pnpm` for package management. Please **do not use npm or yarn**.

1. Navigate to the `app` directory:
   ```bash
   cd app
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Start the development server (runs on `http://localhost:5173`):
   ```bash
   pnpm run dev
   ```

## Linting and Building

- **Linting:** Ensure code quality by running:
  ```bash
  pnpm lint
  ```
- **Building:** Build the project using:
  ```bash
  pnpm build
  ```

## Testing

The project includes both unit tests (Vitest) and End-to-End (E2E) tests (Playwright).

- **Unit Tests:**
  ```bash
  pnpm test
  ```

- **E2E Tests:**
  Before running E2E tests for the first time, you must install the Playwright browsers:
  ```bash
  pnpm exec playwright install
  ```
  Then, run the tests:
  ```bash
  pnpm run test:e2e
  ```
