import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App Component', () => {
  it('renders the main application header', () => {
    render(<App />);
    expect(screen.getByText(/YM2149_SYNTH_CORE/i)).toBeInTheDocument();
  });

  it('renders the side navigation elements', () => {
    render(<App />);
    expect(screen.getByText(/Oscillators/i)).toBeInTheDocument();
    expect(screen.getByText(/Envelopes/i)).toBeInTheDocument();
    expect(screen.getByText(/Mixer/i)).toBeInTheDocument();
  });
});
