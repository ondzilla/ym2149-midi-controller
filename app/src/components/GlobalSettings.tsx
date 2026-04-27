import React, { useState } from 'react';
import { midiService } from '../services/midiService';

export const GlobalSettings: React.FC = () => {
  const [channel, setChannel] = useState('1');
  const [polyphony, setPolyphony] = useState(false);
  const [bank, setBank] = useState('A');
  const [velocity, setVelocity] = useState(false);

  const handleChannel = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setChannel(e.target.value);
  };

  const handlePolyphony = () => {
    setPolyphony(!polyphony);
    midiService.sendCC(Number(channel), 10, !polyphony ? 127 : 0);
  };

  const handleBank = () => {
    const newBank = bank === 'A' ? 'B' : 'A';
    setBank(newBank);
    midiService.sendCC(Number(channel), 9, newBank === 'B' ? 127 : 0);
  };

  const handleVelocity = () => {
    setVelocity(!velocity);
    midiService.sendCC(Number(channel), 4, !velocity ? 127 : 0);
  };

  return (
    <>
      <h2 className="sr-only">Global Settings</h2>
      
      <div className="bg-black/40 p-4 border-b-2 border-surface-container-highest flex justify-between items-center group relative cursor-pointer hover:bg-black/60 transition-colors">
        <label className="font-headline text-[10px] text-tertiary tracking-widest block opacity-60">MIDI_CHANNEL</label>
        <span className="font-headline text-secondary text-sm font-bold w-12 text-right pointer-events-none">CH_{channel}</span>
        <select 
          aria-label="MIDI Channel"
          value={channel} 
          onChange={handleChannel}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        >
          {Array.from({ length: 16 }, (_, i) => (
            <option key={i + 1} value={String(i + 1)}>
              {String(i + 1).padStart(2, '0')}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-surface-container-highest flex flex-col items-center justify-center gap-2 border border-outline-variant/20 relative w-full p-0">
          <button 
            type="button" 
            className="absolute inset-0 w-full h-full cursor-pointer z-10 opacity-0" 
            onClick={handlePolyphony}
          >Toggle Polyphony</button>
          
          <div className="p-4 flex flex-col items-center gap-2 pointer-events-none w-full h-full transition-colors">
            <span className="font-headline text-[10px] text-tertiary opacity-60 uppercase text-center w-full truncate">Polyphony</span>
            {polyphony ? (
               <div className="w-4 h-4 bg-secondary shadow-[0_0_10px_#f5ce53]"></div>
            ) : (
               <div className="w-4 h-4 bg-primary/20 border border-primary"></div>
            )}
            <span className={`font-headline text-[9px] font-bold ${polyphony ? 'text-secondary' : 'text-primary'}`}>
              {polyphony ? 'POLYPHONIC' : 'MONOPHONIC'}
            </span>
          </div>
        </div>

        <div className="bg-surface-container-highest flex flex-col items-center justify-center gap-2 border border-outline-variant/20 relative w-full p-0">
          <button 
            type="button" 
            className="absolute inset-0 w-full h-full cursor-pointer z-10 opacity-0" 
            onClick={handleBank}
          >Bank B</button>
          
          <div className="p-4 flex flex-col items-center gap-2 pointer-events-none w-full h-full transition-colors">
            <span className="font-headline text-[10px] text-tertiary opacity-60 uppercase text-center w-full truncate">Bank Switch</span>
            {bank === 'B' ? (
               <div className="w-4 h-4 bg-primary shadow-[0_0_10px_#8eff71]"></div>
            ) : (
               <div className="w-4 h-4 bg-primary/20 border border-primary"></div>
            )}
            <span className={`font-headline text-[9px] font-bold ${bank === 'B' ? 'text-primary' : 'text-primary'}`}>
              EXT_ROM_{bank}
            </span>
          </div>
        </div>

        <div className="bg-surface-container-highest flex flex-col items-center justify-center gap-2 border border-outline-variant/20 relative w-full p-0">
          <button 
            type="button" 
            className="absolute inset-0 w-full h-full cursor-pointer z-10 opacity-0" 
            onClick={handleVelocity}
          >Toggle Velocity</button>
          
          <div className="p-4 flex flex-col items-center gap-2 pointer-events-none w-full h-full transition-colors">
            <span className="font-headline text-[10px] text-tertiary opacity-60 uppercase text-center w-full truncate">Velocity Sens</span>
            {velocity ? (
               <div className="w-4 h-4 bg-tertiary shadow-[0_0_10px_#ff9cf4]"></div>
            ) : (
               <div className="w-4 h-4 bg-primary/20 border border-primary"></div>
            )}
            <span className={`font-headline text-[9px] font-bold ${velocity ? 'text-tertiary' : 'text-primary'}`}>
              {velocity ? 'DYNAMIC' : 'STATIC'}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};
