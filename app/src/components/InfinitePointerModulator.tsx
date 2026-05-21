import React, { useRef, useEffect, useState, useId } from 'react';
import { usePatchState } from '../hooks/usePatchState';
import { midiService } from '../services/midiService';

// Available mappings according to YM2149F parity list
const MIDI_MAPPINGS = [
  { cc: 1, label: 'CC 1: Detune' },
  { cc: 2, label: 'CC 2: Env Shape' },
  { cc: 3, label: 'CC 3: Vibrato Depth' },
  { cc: 4, label: 'CC 4: Vibrato Speed' },
  { cc: 5, label: 'CC 5: Env Frequency' },
  { cc: 6, label: 'CC 6: Arp Pattern' },
  { cc: 7, label: 'CC 7: Volume' },
  { cc: 70, label: 'CC 70: Noise Level' },
  { cc: 71, label: 'CC 71: Resonance' },
  { cc: 74, label: 'CC 74: Cutoff' }
];

export const InfinitePointerModulator: React.FC = () => {
  const padRef = useRef<HTMLDivElement>(null);

  // Modulator state
  const [isLocked, setIsLocked] = useState(false);
  const [xVal, setXVal] = useState(64);
  const [yVal, setYVal] = useState(64);

  // We use refs for accumulators to prevent dependency loops in mousemove
  const xAccumulator = useRef(64);
  const yAccumulator = useRef(64);

  // Mappings via usePatchState to persist user preference
  const [xMapping, setXMapping] = usePatchState('infiniteModulatorMappingX', '1');
  const [yMapping, setYMapping] = usePatchState('infiniteModulatorMappingY', '3');

  // Sensitivity configuration
  const SENSITIVITY = 0.5;

  // Modulo math for safe wrapping
  const wrapValue = (val: number, max: number) => {
    return ((val % max) + max) % max;
  };

  useEffect(() => {
    const handleLockChange = () => {
      if (document.pointerLockElement === padRef.current) {
        setIsLocked(true);
      } else {
        setIsLocked(false);
      }
    };

    document.addEventListener('pointerlockchange', handleLockChange);
    return () => {
      document.removeEventListener('pointerlockchange', handleLockChange);
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isLocked) return;

      // Unbounded raw deltas
      const deltaX = e.movementX;
      const deltaY = e.movementY;

      // Update accumulators
      xAccumulator.current += deltaX * SENSITIVITY;
      // Invert Y so up is positive (optional, but standard for mod wheels)
      yAccumulator.current -= deltaY * SENSITIVITY;

      // Wrap to 0-127
      const newX = Math.floor(wrapValue(xAccumulator.current, 128));
      const newY = Math.floor(wrapValue(yAccumulator.current, 128));

      // Update React state for UI feedback (throttling could be applied here if performance drops,
      // but useState handles rapid consecutive synchronous updates relatively well)
      setXVal(newX);
      setYVal(newY);

      // Send MIDI
      try {
        midiService.sendCC(1, Number(xMapping), newX);
      } catch (err) {
        console.error('Failed to send CC for Modulator X', err);
      }

      try {
        midiService.sendCC(1, Number(yMapping), newY);
      } catch (err) {
        console.error('Failed to send CC for Modulator Y', err);
      }
    };

    if (isLocked) {
      document.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isLocked, xMapping, yMapping]);

  const requestLock = () => {
    if (!isLocked && padRef.current) {
      padRef.current.requestPointerLock();
    }
  };

  const xSelectId = useId();
  const ySelectId = useId();

  return (
    <div className="bg-surface-container p-6 relative border-2 border-surface-container-highest solder-point solder-tl solder-tr solder-bl solder-br flex flex-col h-full min-h-[300px]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-headline text-sm tracking-widest text-tertiary uppercase">Infinite Pointer Modulator</h2>
        <div className={`w-3 h-3 rounded-full ${isLocked ? 'bg-primary shadow-[0_0_10px_#8eff71]' : 'bg-primary/20 border border-primary'}`} />
      </div>

      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <label htmlFor={xSelectId} className="block font-headline text-[10px] text-tertiary opacity-60 mb-1 uppercase tracking-widest">X-Axis Mapping</label>
          <div className="relative">
            <select
              id={xSelectId}
              value={xMapping}
              onChange={(e) => setXMapping(e.target.value)}
              className="w-full bg-surface-container-highest border border-outline-variant/20 p-2 font-headline text-xs text-primary appearance-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-container"
            >
              {MIDI_MAPPINGS.map(map => (
                <option key={`x-${map.cc}`} value={map.cc}>{map.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex-1">
          <label htmlFor={ySelectId} className="block font-headline text-[10px] text-tertiary opacity-60 mb-1 uppercase tracking-widest">Y-Axis Mapping</label>
          <div className="relative">
            <select
              id={ySelectId}
              value={yMapping}
              onChange={(e) => setYMapping(e.target.value)}
              className="w-full bg-surface-container-highest border border-outline-variant/20 p-2 font-headline text-xs text-secondary appearance-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-container"
            >
              {MIDI_MAPPINGS.map(map => (
                <option key={`y-${map.cc}`} value={map.cc}>{map.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* The Modulator Pad */}
      <div
        ref={padRef}
        onClick={requestLock}
        onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                requestLock();
            }
        }}
        tabIndex={0}
        role="button"
        aria-pressed={isLocked}
        aria-label="Infinite Modulator Pad. Click to lock pointer and continuously modulate mapped values. Press Escape to release."
        title="Infinite Modulator Pad (Click to lock)"
        className={`flex-1 relative bg-surface-container-lowest border-2 border-dashed ${isLocked ? 'border-primary cursor-none' : 'border-outline-variant/30 cursor-pointer hover:border-tertiary'} transition-colors flex items-center justify-center overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-container-high`}
      >
        {!isLocked && (
          <div className="text-center pointer-events-none">
             <span className="material-symbols-outlined text-4xl text-tertiary opacity-40 mb-2 block" aria-hidden="true">ads_click</span>
             <p className="font-headline text-xs text-tertiary opacity-60 uppercase tracking-widest">Click to Lock Pointer</p>
          </div>
        )}

        {isLocked && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
             {/* Dynamic crosshair indicating values visually without a bounds limit */}
             <div
                className="absolute w-full h-[1px] bg-primary"
                style={{ top: `${(yVal / 127) * 100}%` }}
             />
             <div
                className="absolute h-full w-[1px] bg-secondary"
                style={{ left: `${(xVal / 127) * 100}%` }}
             />
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mt-4">
        <div className="font-headline text-xs text-primary bg-surface-container-highest px-3 py-1 border border-outline-variant/20">
          X: {xVal.toString().padStart(3, '0')}
        </div>
        <div className="font-headline text-[10px] text-tertiary opacity-60 uppercase tracking-widest text-center">
          {isLocked ? 'Press ESC to Release' : 'Idle'}
        </div>
        <div className="font-headline text-xs text-secondary bg-surface-container-highest px-3 py-1 border border-outline-variant/20">
          Y: {yVal.toString().padStart(3, '0')}
        </div>
      </div>
    </div>
  );
};
