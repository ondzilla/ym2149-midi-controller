import React, { useRef } from 'react';
import { usePatchState } from '../hooks/usePatchState';
import { midiService } from '../services/midiService';
import { mapRange, percentageToMidi } from '../utils/mathUtils';

export const XYPad: React.FC = () => {
  const [globalChannel] = usePatchState('globalChannel', '1');
  const activeChannel = Number(globalChannel);

  const [detune, setDetune] = usePatchState('detune', '64', (val) => {
    try { midiService.sendCC(activeChannel, 1, Number(val)); } catch (e) { console.warn('MIDI error', e); }
  });

  const [vibratoDepth, setVibratoDepth] = usePatchState('vibratoDepth', 40, (val) => {
    try { midiService.sendCC(activeChannel, 3, percentageToMidi(Number(val))); } catch (e) { console.warn('MIDI error', e); }
  });

  const padRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.buttons !== 1) return; // Only track while primary button is pressed
    if (!padRef.current) return;

    const rect = padRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    const newDetune = Math.round(mapRange(x, 0, 1, 0, 127));
    const newVibratoDepth = Math.round(mapRange(1 - y, 0, 1, 0, 100));

    setDetune(newDetune.toString());
    setVibratoDepth(newVibratoDepth);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!padRef.current) return;
    padRef.current.setPointerCapture(e.pointerId);
    handlePointerMove(e);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!padRef.current) return;
    padRef.current.releasePointerCapture(e.pointerId);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    let newDetune = Number(detune);
    let newVibratoDepth = Number(vibratoDepth);
    let handled = false;

    if (e.key === 'ArrowUp') {
      newVibratoDepth = Math.min(100, newVibratoDepth + 1);
      handled = true;
    } else if (e.key === 'ArrowDown') {
      newVibratoDepth = Math.max(0, newVibratoDepth - 1);
      handled = true;
    } else if (e.key === 'ArrowLeft') {
      newDetune = Math.max(0, newDetune - 1);
      handled = true;
    } else if (e.key === 'ArrowRight') {
      newDetune = Math.min(127, newDetune + 1);
      handled = true;
    }

    if (handled) {
      e.preventDefault();
      setDetune(newDetune.toString());
      setVibratoDepth(newVibratoDepth);
    }
  };

  const xPercentage = (Number(detune) / 127) * 100;
  const yPercentage = 100 - Number(vibratoDepth);

  return (
    <section className="bg-surface-container-high relative p-6 solder-point solder-tl solder-tr solder-bl solder-br border border-[#32152f] h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <h2 className="font-headline text-xs tracking-[0.3em] text-tertiary uppercase">EXPRESSION_PAD</h2>
        <button
          onClick={() => { setDetune('64'); setVibratoDepth(40); }}
          className="text-tertiary hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded p-1"
          aria-label="Reset Expression Pad"
          title="Reset"
        >
          <span className="material-symbols-outlined text-sm" aria-hidden="true">refresh</span>
        </button>
      </div>

      <div
        ref={padRef}
        className="flex-1 min-h-[200px] bg-surface-container-lowest relative border border-outline/20 cursor-crosshair group touch-none outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-container-high"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="slider"
        aria-label="XY Expression Pad"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={vibratoDepth}
        aria-valuetext={`Detune: ${detune}, Vibrato Depth: ${vibratoDepth}%`}
      >
        {/* Background Grid Lines */}
        <div className="absolute inset-0 pointer-events-none opacity-10" style={{
          backgroundImage: 'linear-gradient(to right, #8eff71 1px, transparent 1px), linear-gradient(to bottom, #8eff71 1px, transparent 1px)',
          backgroundSize: '10% 10%'
        }}></div>

        {/* Center Crosshairs */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-primary -translate-x-1/2"></div>
          <div className="absolute top-1/2 left-0 right-0 h-px bg-primary -translate-y-1/2"></div>
        </div>

        {/* The Puck */}
        <div
          className="absolute w-8 h-8 -ml-4 -mt-4 rounded-full border-2 border-primary bg-primary/20 backdrop-blur-sm pointer-events-none shadow-[0_0_15px_#8eff71] transition-transform duration-75 ease-out group-active:scale-90"
          style={{
            left: `${xPercentage}%`,
            top: `${yPercentage}%`
          }}
        >
          <div className="absolute inset-0 m-auto w-1 h-1 bg-primary rounded-full"></div>
        </div>

        {/* Labels */}
        <div className="absolute bottom-2 left-2 font-headline text-[10px] text-tertiary opacity-75 pointer-events-none">DETUNE {detune}</div>
        <div className="absolute top-2 right-2 font-headline text-[10px] text-secondary opacity-75 pointer-events-none origin-top-right -rotate-90 translate-x-full">DEPTH {vibratoDepth}%</div>
      </div>
    </section>
  );
};
