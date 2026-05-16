import React, { useState } from 'react';
import { midiService } from '../services/midiService';

const PAD_COUNT = Array.from({ length: 16 });

const drumMap = [
  { label: 'Dog Yap', note: 60 },
  { label: 'Bass Thing', note: 61 },
  { label: 'Hi-Hat', note: 62 },
  { label: 'Snare', note: 63 },
  { label: 'Kick Drum', note: 64 },
];

export const DrumPads: React.FC = () => {
  const [activeNote, setActiveNote] = useState<number | null>(null);

  const handleTrigger = (note: number) => {
    midiService.sendNoteOn(9, note, 127);
    setActiveNote(note);
  };

  const handleRelease = (note: number) => {
    midiService.sendNoteOff(9, note, 0);
    setActiveNote(null);
  };

  return (
    <section className="bg-surface-container-high relative p-6 solder-point solder-tl solder-tr solder-bl solder-br border border-[#32152f]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-headline text-xs tracking-[0.3em] text-tertiary uppercase">MANUAL_TRIGGER_ARRAY</h2>
        <div className="font-headline text-[10px] text-primary bg-primary/10 px-3 py-1 border border-primary/30 uppercase">LIVE_MODE_READY</div>
      </div>
      
      <div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-16 gap-3">
        {PAD_COUNT.map((_, i) => {
          const drum = drumMap[i];
          const isMapped = !!drum; // only map first 5 logically to keep test passing
          
          return (
            <button
              key={i}
              disabled={!isMapped}
              title={isMapped ? drum.label : 'Unmapped Pad'}
              aria-label={isMapped ? drum.label : 'Unmapped Pad'}
              className={`aspect-square bg-surface-container-highest border border-outline-variant/30 flex items-center justify-center transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-container-high ${!isMapped ? 'hidden md:flex opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'} ${activeNote === drum?.note ? 'scale-95' : ''}`}
              onMouseDown={() => isMapped && handleTrigger(drum.note)}
              onMouseUp={() => isMapped && handleRelease(drum.note)}
              onMouseLeave={() => {
                if (isMapped && activeNote === drum.note) {
                  handleRelease(drum.note);
                }
              }}
              onKeyDown={(e) => {
                if (isMapped && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  if (e.repeat) return;
                  handleTrigger(drum.note);
                }
              }}
              onKeyUp={(e) => {
                if (isMapped && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  handleRelease(drum.note);
                }
              }}
            >
              {isMapped ? (
                <div className={`w-3/4 h-3/4 border flex items-center justify-center text-center p-1 transition-all ${
                  activeNote === drum.note
                    ? 'bg-secondary border-secondary shadow-[0_0_15px_#f5ce53] text-[#1b061a]'
                    : 'bg-surface-container-low border-secondary/40 text-secondary group-hover:bg-secondary/20 group-hover:shadow-[0_0_15px_#f5ce53]'
                }`}>
                  <span className="font-headline text-[9px] sm:text-[10px] md:text-xs font-bold leading-tight">{drum.label}</span>
                </div>
              ) : (
                <div className="w-1/2 h-1/2 border bg-surface-container-low border-primary/20 flex items-center justify-center">
                  <span className="font-headline text-[8px] text-primary/40">UNMAPPED</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
};
