import React, { useState, useEffect } from 'react';
import { transportService } from '../services/transportService';
import { midiService } from '../services/midiService';

const DRUM_TRACKS = [
  { label: 'Dog Yap', note: 60 },
  { label: 'Hi-Hat', note: 62 },
  { label: 'Snare', note: 63 },
  { label: 'Kick', note: 64 },
];

export const DrumSequencer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(transportService.isPlaying);
  const [bpm, setBpm] = useState(transportService.bpm);
  const [currentStep, setCurrentStep] = useState(transportService.currentStep);
  const [grid, setGrid] = useState<boolean[][]>(
    Array(DRUM_TRACKS.length).fill(Array(16).fill(false))
  );

  useEffect(() => {
    const unsubscribe = transportService.subscribe((state) => {
      setIsPlaying(state.isPlaying);
      setBpm(state.bpm);
      
      if (state.currentStep !== currentStep && state.isPlaying) {
          setCurrentStep(state.currentStep);
          // Trigger notes for this step
          grid.forEach((row, rowIndex) => {
              if (row[state.currentStep]) {
                  const note = DRUM_TRACKS[rowIndex].note;
                  midiService.sendNoteOn(10, note, 127);
                  // Send note off shortly after
                  setTimeout(() => {
                      midiService.sendNoteOff(10, note, 0);
                  }, 50);
              }
          });
      } else if (!state.isPlaying) {
          setCurrentStep(state.currentStep);
      }
    });

    return () => unsubscribe();
  }, [grid, currentStep]);

  const toggleStep = (rowIndex: number, colIndex: number) => {
    const newGrid = grid.map((row, r) =>
      r === rowIndex
        ? row.map((col, c) => (c === colIndex ? !col : col))
        : row
    );
    setGrid(newGrid);
  };

  const handlePlayPause = () => {
      if (isPlaying) {
          transportService.pause();
      } else {
          transportService.play();
      }
  };

  const handleStop = () => {
      transportService.stop();
  };

  const handleBpmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      transportService.setBpm(Number(e.target.value));
  };

  return (
    <section className="bg-surface-container-high relative p-6 solder-point solder-tl solder-tr solder-bl solder-br border border-[#32152f] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-headline text-xs tracking-[0.3em] text-tertiary uppercase">SEQUENCER_CORE</h2>
        <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
                <label htmlFor="bpm-slider" className="font-headline text-[10px] text-tertiary">BPM: {bpm}</label>
                <input 
                    id="bpm-slider"
                    type="range" 
                    min="40" 
                    max="240" 
                    value={bpm} 
                    onChange={handleBpmChange}
                    className="w-24 accent-primary"
                />
            </div>
            <button
                onClick={handleStop}
                className="text-tertiary opacity-60 hover:opacity-100 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded p-1"
                aria-label="Stop"
                title="Stop"
            >
                <span className="material-symbols-outlined" aria-hidden="true">stop</span>
            </button>
            <button
                onClick={handlePlayPause}
                className={`rounded p-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    isPlaying ? 'text-primary animate-pulse shadow-[0_0_8px_var(--primary)]' : 'text-primary opacity-60 hover:opacity-100'
                }`}
                aria-label={isPlaying ? 'Pause' : 'Play'}
                title={isPlaying ? 'Pause' : 'Play'}
            >
                <span className="material-symbols-outlined" aria-hidden="true">
                    {isPlaying ? 'pause' : 'play_arrow'}
                </span>
            </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {DRUM_TRACKS.map((track, rowIndex) => (
          <div key={rowIndex} className="flex items-center gap-2">
            <div className="w-16 flex-shrink-0 font-headline text-[10px] text-secondary text-right pr-2">
              {track.label}
            </div>
            <div className="flex-1 grid grid-cols-16 gap-1">
              {grid[rowIndex].map((isActive, colIndex) => (
                <button
                  key={colIndex}
                  onClick={() => toggleStep(rowIndex, colIndex)}
                  className={`aspect-square border transition-colors ${
                    isActive
                      ? 'bg-primary border-primary shadow-[0_0_8px_var(--primary)]'
                      : 'bg-surface-container-lowest border-outline-variant/30 hover:bg-surface-container-low'
                  } ${
                      currentStep === colIndex && isPlaying
                        ? 'ring-2 ring-white ring-inset'
                        : ''
                  }`}
                  aria-label={`Toggle ${track.label} step ${colIndex + 1}`}
                  title={`Toggle ${track.label} step ${colIndex + 1}`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
