import React, { useState } from 'react';
import { midiService } from '../services/midiService';
import { percentageToMidi } from '../utils/mathUtils';

const PATTERNS = Array.from({ length: 16 });
const OCTAVES = ['OFF', '-3', '-2', '-1', '0', '+1', '+2', '+3'];
const GATE_LIGHTS = Array.from({ length: 8 });

export const Arpeggiator: React.FC = () => {
  const channel = 1;
  const [rate, setRate] = useState('50');
  const [octave, setOctave] = useState('0');
  const [arpMode, setArpMode] = useState(false);
  const [pattern, setPattern] = useState(0);

  const handleRate = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRate(e.target.value);
    midiService.sendCC(channel, 5, percentageToMidi(Number(e.target.value)));
  };

  const handleOctave = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setOctave(e.target.value);
    let ccValue = 0;
    switch (e.target.value) {
      case 'OFF': ccValue = 0; break;
      case '-3': ccValue = 10; break;
      case '-2': ccValue = 32; break;
      case '-1': ccValue = 53; break;
      case '0': ccValue = 74; break;
      case '+1': ccValue = 95; break;
      case '+2': ccValue = 116; break;
      case '+3': ccValue = 127; break;
    }
    midiService.sendCC(channel, 8, ccValue);
  };

  const playPattern = (index: number) => {
    setPattern(index);
    midiService.sendCC(channel, 6, index);
  };

  const handleArpMode = () => {
    setArpMode(!arpMode);
    midiService.sendCC(channel, 7, !arpMode ? 127 : 0);
  };

  return (
    <section className="bg-surface-container-high relative p-6 solder-point solder-tl solder-tr solder-bl solder-br border border-[#32152f] flex flex-col h-full">
      <h2 className="sr-only">Arpeggiator</h2>
      <h3 className="font-headline text-xs tracking-[0.3em] text-tertiary mb-8 uppercase">ARP_LOGIC_GATE</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 flex-1">
        
        <div className="space-y-6 flex flex-col justify-center">
          <div className="flex justify-between items-end border-b border-outline-variant/30 pb-2 relative group has-[:focus-visible]:outline-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-surface-container-high">
            <span className="font-headline text-[10px] text-tertiary">PATTERN_SELECT</span>
            <span className="font-headline text-secondary text-xs font-bold pointer-events-none">PTN_{pattern}</span>
            <select aria-label="Pattern" value={pattern} className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full" onChange={(e) => playPattern(Number(e.target.value))}>
              {PATTERNS.map((_, i) => <option key={i} value={i}>Pattern {i}</option>)}
            </select>
          </div>
          <div className="flex justify-between items-end border-b border-outline-variant/30 pb-2 relative group has-[:focus-visible]:outline-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-surface-container-high">
            <span className="font-headline text-[10px] text-tertiary">OCTAVE_RANGE</span>
            <span className="font-headline text-secondary text-xs font-bold pointer-events-none">{octave}</span>
            <select aria-label="Octave" value={octave} onChange={handleOctave} className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full">
              {OCTAVES.map(opt => (
                <option key={opt} value={opt}>{opt} OCT</option>
              ))}
            </select>
          </div>
          <div className="flex justify-between items-end border-b border-outline-variant/30 pb-2 relative group has-[:focus-visible]:outline-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-surface-container-high">
            <span className="font-headline text-[10px] text-tertiary">GATE_TIME</span>
            <span className="font-headline text-secondary text-xs font-bold pointer-events-none">{rate}%</span>
            <input type="range" min="0" max="100" aria-label="Rate" value={rate} onChange={handleRate} className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full" />
          </div>
        </div>

        <div className="flex flex-col gap-4 justify-center">
          <div className="flex-1 bg-surface-container-lowest border border-primary/20 p-2 flex flex-wrap gap-2 content-start min-h-[100px]">
            {GATE_LIGHTS.map((_, i) => (
              <div key={i} className={`w-4 h-4 ${i % 2 === 0 ? 'bg-primary shadow-[0_0_5px_#8eff71]' : 'bg-primary/20 border border-primary/40'}`}></div>
            ))}
          </div>
          <button className="bg-secondary text-on-secondary py-2 font-headline text-[10px] font-bold tracking-widest active:scale-[0.98] transition-all w-full">RESET_GATE</button>
          <button type="button" onClick={handleArpMode} className="bg-primary text-on-primary py-2 font-headline text-[10px] font-bold tracking-widest active:scale-[0.98] transition-all w-full relative">
            <span className="sr-only">Arp Mode</span>
            MODE: {arpMode ? 'SELF' : 'VOICE A'}
          </button>
          <div className="sr-only">
            {PATTERNS.map((_, i) => (
              <button key={i} onClick={() => playPattern(i)}>Pattern {i}</button>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
