import React, { useId } from 'react';
import { midiService } from '../services/midiService';
import { percentageToMidi, mapRange } from '../utils/mathUtils';
import { usePatchState } from '../hooks/usePatchState';

const PATTERNS = Array.from({ length: 16 });
const OCTAVES = ['OFF', '-3', '-2', '-1', '0', '+1', '+2', '+3'];

const ArpRateControl: React.FC<{ channel: number }> = ({ channel }) => {
  const [rate, setRate] = usePatchState('arpRate', '50', (val) => {
    try { midiService.sendCC(channel, 5, percentageToMidi(Number(val))); } catch (e) { console.warn('MIDI error', e); }
  });

  const handleRate = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRate(e.target.value);
  };

  const rateId = useId();

  return (
    <div className="flex justify-between items-end border-b border-outline-variant/30 pb-2 relative group has-[:focus-visible]:outline-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-surface-container-high">
      <label htmlFor={rateId} className="font-headline text-[10px] text-tertiary">RATE</label>
      <span className="font-headline text-secondary text-xs font-bold pointer-events-none">{rate}%</span>
      <input id={rateId} type="range" min="0" max="100" aria-label="Rate" value={rate} onChange={handleRate} className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full" />
    </div>
  );
};

export const Arpeggiator: React.FC = () => {
  const [globalChannel] = usePatchState('globalChannel', '1');
  const channel = Number(globalChannel);

  const [octave, setOctave] = usePatchState('arpOctave', '0', (val) => {
    let ccValue = 0;
    switch (val) {
      case 'OFF': ccValue = 0; break;
      case '-3': ccValue = 10; break;
      case '-2': ccValue = 32; break;
      case '-1': ccValue = 53; break;
      case '0': ccValue = 74; break;
      case '+1': ccValue = 95; break;
      case '+2': ccValue = 116; break;
      case '+3': ccValue = 127; break;
    }
    try { midiService.sendCC(channel, 8, ccValue); } catch (e) { console.warn('MIDI error', e); }
  });

  const [arpMode, setArpMode] = usePatchState('arpMode', false, (val) => {
    try { midiService.sendCC(channel, 7, val ? 127 : 0); } catch (e) { console.warn('MIDI error', e); }
  });

  const [pattern, setPattern] = usePatchState('arpPattern', 0, (val) => {
    try {
      // YM2149 firmware expects the 16 patterns to be distributed across the 0-127 MIDI range
      const scaledVal = mapRange(Number(val), 0, 15, 0, 127);
      midiService.sendCC(channel, 6, scaledVal);
    } catch (e) { console.warn('MIDI error', e); }
  });

  const handleOctave = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setOctave(e.target.value);
  };

  const playPattern = (index: number) => {
    setPattern(index);
  };

  const handleArpMode = () => {
    setArpMode(!arpMode);
  };

  const patternId = useId();
  const octaveId = useId();

  return (
    <section className="bg-surface-container-high relative p-6 solder-point solder-tl solder-tr solder-bl solder-br border border-[#32152f] flex flex-col h-full">
      <h2 className="sr-only">Arpeggiator</h2>
      <h3 className="font-headline text-xs tracking-[0.3em] text-tertiary mb-8 uppercase">ARP_LOGIC_GATE</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 flex-1">
        
        <div className="space-y-6 flex flex-col justify-center">
          <div className="flex justify-between items-end border-b border-outline-variant/30 pb-2 relative group has-[:focus-visible]:outline-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-surface-container-high">
            <label htmlFor={patternId} className="font-headline text-[10px] text-tertiary">PATTERN_SELECT</label>
            <span className="font-headline text-secondary text-xs font-bold pointer-events-none">PTN_{pattern}</span>
            <select id={patternId} aria-label="Pattern" value={pattern} className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full" onChange={(e) => playPattern(Number(e.target.value))}>
              {PATTERNS.map((_, i) => <option key={i} value={i}>Pattern {i}</option>)}
            </select>
          </div>
          <div className="flex justify-between items-end border-b border-outline-variant/30 pb-2 relative group has-[:focus-visible]:outline-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-surface-container-high">
            <label htmlFor={octaveId} className="font-headline text-[10px] text-tertiary">OCTAVE_RANGE</label>
            <span className="font-headline text-secondary text-xs font-bold pointer-events-none">{octave}</span>
            <select id={octaveId} aria-label="Octave" value={octave} onChange={handleOctave} className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full">
              {OCTAVES.map(opt => (
                <option key={opt} value={opt}>{opt} OCT</option>
              ))}
            </select>
          </div>
          <ArpRateControl channel={channel} />
        </div>

        <div className="flex flex-col gap-4 justify-center">
          <button type="button" aria-pressed={arpMode} onClick={handleArpMode} className="bg-primary text-on-primary py-2 font-headline text-[10px] font-bold tracking-widest active:scale-[0.98] transition-all w-full relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-container-high">
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
