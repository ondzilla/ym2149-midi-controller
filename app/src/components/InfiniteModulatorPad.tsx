import React, { useRef, useState, useEffect, useCallback } from 'react';
import { usePatchState } from '../hooks/usePatchState';
import { midiService } from '../services/midiService';
import { percentageToMidi } from '../utils/mathUtils';

export const InfiniteModulatorPad: React.FC = () => {
  const [globalChannel] = usePatchState('globalChannel', '1');
  const activeChannel = Number(globalChannel);

  const [detune, setDetune] = usePatchState('detune', '64', (val) => {
    try { midiService.sendCC(activeChannel, 1, Number(val)); } catch (e) { console.warn('MIDI error', e); }
  });

  const [vibratoDepth, setVibratoDepth] = usePatchState('vibratoDepth', 40, (val) => {
    try { midiService.sendCC(activeChannel, 3, percentageToMidi(Number(val))); } catch (e) { console.warn('MIDI error', e); }
  });

  const padRef = useRef<HTMLDivElement>(null);
  const [isLocked, setIsLocked] = useState(false);

  // Use refs for accumulators so we don't trigger re-renders just for math
  const accumX = useRef(Number(detune));
  const accumY = useRef(Number(vibratoDepth));

  // Sync refs if state changes externally (e.g. preset load)
  useEffect(() => {
    accumX.current = Number(detune);
  }, [detune]);

  useEffect(() => {
    accumY.current = Number(vibratoDepth);
  }, [vibratoDepth]);

  const handlePointerLockChange = useCallback(() => {
    if (document.pointerLockElement === padRef.current) {
      setIsLocked(true);
    } else {
      setIsLocked(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    return () => {
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
    };
  }, [handlePointerLockChange]);

  const sensitivity = 0.5;

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isLocked) return;

    // Detune is 0-127
    accumX.current = (accumX.current + e.movementX * sensitivity);
    // Wrap to 0-127 using proper modulo math for negative values
    accumX.current = ((accumX.current % 128) + 128) % 128;
    const newDetune = Math.round(accumX.current);

    // Vibrato Depth is 0-100 (percentage)
    // Invert Y movement so up is positive
    accumY.current = (accumY.current - e.movementY * sensitivity);
    // Wrap to 0-100 using proper modulo math for negative values
    accumY.current = ((accumY.current % 101) + 101) % 101;
    const newVibratoDepth = Math.round(accumY.current);

    setDetune(newDetune.toString());
    setVibratoDepth(newVibratoDepth);
  }, [isLocked, setDetune, setVibratoDepth]);

  useEffect(() => {
    if (isLocked) {
      document.addEventListener('mousemove', handleMouseMove);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isLocked, handleMouseMove]);

  const handleClick = () => {
    if (!isLocked && padRef.current) {
      padRef.current.requestPointerLock();
    } else if (isLocked) {
        document.exitPointerLock();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape' && isLocked) {
      document.exitPointerLock();
    }
  };

  const xPercentage = (Number(detune) / 127) * 100;
  const yPercentage = 100 - Number(vibratoDepth);

  return (
    <section className="bg-surface-container-high relative p-6 solder-point solder-tl solder-tr solder-bl solder-br border border-[#32152f] h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <h2 className="font-headline text-xs tracking-[0.3em] text-tertiary uppercase">INFINITE_MODULATOR</h2>
        <div className={`font-headline text-[10px] ${isLocked ? 'text-primary' : 'text-tertiary opacity-60'}`}>
          {isLocked ? 'LOCKED (ESC TO EXIT)' : 'CLICK TO LOCK'}
        </div>
      </div>

      <div
        ref={padRef}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label="Infinite Modulator Pad"
        aria-pressed={isLocked}
        className={`flex-1 min-h-[200px] relative border transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-container-high ${isLocked ? 'bg-surface-container-lowest border-primary cursor-none shadow-[inset_0_0_20px_rgba(142,255,113,0.2)]' : 'bg-surface-container-lowest border-outline/20 cursor-pointer hover:border-outline/50'}`}
      >
        {/* Background Grid Lines (Pulsating when locked) */}
        <div className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${isLocked ? 'opacity-30' : 'opacity-10'}`} style={{
          backgroundImage: `linear-gradient(to right, ${isLocked ? '#8eff71' : '#ff9cf4'} 1px, transparent 1px), linear-gradient(to bottom, ${isLocked ? '#8eff71' : '#ff9cf4'} 1px, transparent 1px)`,
          backgroundSize: '10% 10%'
        }}></div>

        {/* Center Crosshairs */}
        <div className={`absolute inset-0 pointer-events-none transition-opacity ${isLocked ? 'opacity-40' : 'opacity-20'}`}>
          <div className={`absolute left-1/2 top-0 bottom-0 w-px ${isLocked ? 'bg-primary' : 'bg-tertiary'} -translate-x-1/2`}></div>
          <div className={`absolute top-1/2 left-0 right-0 h-px ${isLocked ? 'bg-primary' : 'bg-tertiary'} -translate-y-1/2`}></div>
        </div>

        {/* The Puck (Visual Feedback) */}
        <div
          className={`absolute w-8 h-8 -ml-4 -mt-4 rounded-full border-2 bg-primary/20 backdrop-blur-sm pointer-events-none transition-all duration-75 ease-out ${isLocked ? 'border-primary shadow-[0_0_20px_#8eff71] scale-110' : 'border-tertiary shadow-[0_0_10px_#ff9cf4]'}`}
          style={{
            left: `${xPercentage}%`,
            top: `${yPercentage}%`
          }}
        >
          <div className={`absolute inset-0 m-auto w-1 h-1 rounded-full ${isLocked ? 'bg-primary shadow-[0_0_5px_#8eff71]' : 'bg-tertiary'}`}></div>
        </div>

        {/* Labels */}
        <div className="absolute bottom-2 left-2 font-headline text-[10px] text-tertiary opacity-75 pointer-events-none">DETUNE {detune}</div>
        <div className="absolute top-2 right-2 font-headline text-[10px] text-secondary opacity-75 pointer-events-none origin-top-right -rotate-90 translate-x-full">DEPTH {vibratoDepth}%</div>
      </div>
    </section>
  );
};
