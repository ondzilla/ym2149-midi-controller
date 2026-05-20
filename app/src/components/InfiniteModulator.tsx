import React, { useState, useRef, useEffect } from 'react';
import { usePatchState } from '../hooks/usePatchState';
import { midiService } from '../services/midiService';

const CC_OPTIONS = [
  { value: '1', label: 'CC 1 (Detune)' },
  { value: '3', label: 'CC 3 (Vibrato Amount)' },
  { value: '4', label: 'CC 4 (Vibrato Speed)' },
  { value: '6', label: 'CC 6 (Arpeggiator Pattern)' },
];

export const InfiniteModulator: React.FC = () => {
  const [globalChannel] = usePatchState('globalChannel', '1');
  const activeChannel = Number(globalChannel);

  const [ccX, setCcX] = usePatchState('infiniteModulatorCcX', '1');
  const [ccY, setCcY] = usePatchState('infiniteModulatorCcY', '3');

  const [isLocked, setIsLocked] = useState(false);
  const padRef = useRef<HTMLDivElement>(null);

  // Accumulators for unbounded relative motion
  const xAcc = useRef(64);
  const yAcc = useRef(64);

  // Visual feedback state
  const [visualX, setVisualX] = useState(64);
  const [visualY, setVisualY] = useState(64);

  // Throttling / requestAnimationFrame
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const handlePointerLockChange = () => {
      setIsLocked(document.pointerLockElement === padRef.current);
    };

    document.addEventListener('pointerlockchange', handlePointerLockChange);
    return () => {
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  const handlePointerDown = async () => {
    if (!padRef.current) return;
    try {
      await padRef.current.requestPointerLock();
    } catch (err) {
      console.warn('Failed to lock pointer', err);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isLocked) return;

    // Scale down movement slightly for better control
    const sensitivity = 0.5;

    const deltaX = e.movementX * sensitivity;
    // Invert Y so moving mouse up increases value
    const deltaY = -e.movementY * sensitivity;

    xAcc.current += deltaX;
    yAcc.current += deltaY;

    // Wrap around 0-127 safely handling negative numbers
    xAcc.current = ((xAcc.current % 128) + 128) % 128;
    yAcc.current = ((yAcc.current % 128) + 128) % 128;

    if (!frameRef.current) {
      frameRef.current = requestAnimationFrame(() => {
        const outX = Math.floor(xAcc.current);
        const outY = Math.floor(yAcc.current);

        setVisualX(outX);
        setVisualY(outY);

        try {
          midiService.sendCC(activeChannel, Number(ccX), outX);
          midiService.sendCC(activeChannel, Number(ccY), outY);
        } catch (err) {
          console.warn('MIDI error', err);
        }

        frameRef.current = null;
      });
    }
  };

  return (
    <section className="bg-surface-container-high relative p-6 solder-point solder-tl solder-tr solder-bl solder-br border border-[#32152f] h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <h2 className="font-headline text-xs tracking-[0.3em] text-tertiary uppercase">INFINITE_MODULATOR</h2>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="cc-x-select" className="font-headline text-[10px] text-tertiary">X-AXIS:</label>
            <select
              id="cc-x-select"
              value={ccX}
              onChange={(e) => setCcX(e.target.value)}
              className="bg-black/40 border border-tertiary/20 text-tertiary text-[10px] font-headline p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-container-high"
            >
              {CC_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="cc-y-select" className="font-headline text-[10px] text-secondary">Y-AXIS:</label>
            <select
              id="cc-y-select"
              value={ccY}
              onChange={(e) => setCcY(e.target.value)}
              className="bg-black/40 border border-secondary/20 text-secondary text-[10px] font-headline p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-container-high"
            >
              {CC_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div
        ref={padRef}
        className={`flex-1 min-h-[200px] bg-surface-container-lowest relative border ${isLocked ? 'border-primary shadow-[0_0_15px_#8eff71]' : 'border-outline/20'} cursor-crosshair group touch-none outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-container-high transition-all flex items-center justify-center overflow-hidden`}
        onMouseDown={handlePointerDown}
        onMouseMove={handleMouseMove}
        tabIndex={0}
        role="button"
        aria-label="Infinite Modulator Pad"
        title="Click to lock pointer and modulate infinitely"
      >
        {!isLocked && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <span className="font-headline text-xs text-primary opacity-60 uppercase tracking-widest animate-pulse">Click to Lock Pointer</span>
          </div>
        )}

        {/* Background Grid Lines */}
        <div className="absolute inset-0 pointer-events-none opacity-10" style={{
          backgroundImage: 'linear-gradient(to right, #8eff71 1px, transparent 1px), linear-gradient(to bottom, #8eff71 1px, transparent 1px)',
          backgroundSize: '10% 10%'
        }}></div>

        {isLocked && (
          <>
            {/* Infinite crosshairs indicating wrap-around */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
              <div className="absolute top-0 bottom-0 w-px bg-primary" style={{ left: `${(visualX / 127) * 100}%` }}></div>
              <div className="absolute left-0 right-0 h-px bg-secondary" style={{ top: `${100 - (visualY / 127) * 100}%` }}></div>
            </div>

            {/* The infinite Puck */}
            <div
              className="absolute w-8 h-8 -ml-4 -mt-4 rounded-full border-2 border-primary bg-primary/20 backdrop-blur-sm pointer-events-none shadow-[0_0_15px_#8eff71]"
              style={{
                left: `${(visualX / 127) * 100}%`,
                top: `${100 - (visualY / 127) * 100}%`
              }}
            >
              <div className="absolute inset-0 m-auto w-1 h-1 bg-primary rounded-full"></div>
            </div>

            <div className="absolute bottom-2 left-2 font-headline text-[10px] text-tertiary opacity-75 pointer-events-none">X: {visualX}</div>
            <div className="absolute top-2 right-2 font-headline text-[10px] text-secondary opacity-75 pointer-events-none origin-top-right -rotate-90 translate-x-full">Y: {visualY}</div>
            <div className="absolute top-2 left-2 font-headline text-[10px] text-primary opacity-75 pointer-events-none">Press ESC to exit</div>
          </>
        )}
      </div>
    </section>
  );
};
