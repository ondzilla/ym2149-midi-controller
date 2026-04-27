import React, { useState } from 'react';
import { midiService } from '../services/midiService';
import { percentageToMidi } from '../utils/mathUtils';

export const SynthControls: React.FC = () => {
  const activeChannel = 1;
  const [attack, setAttack] = useState('20');
  const [decay, setDecay] = useState('50');
  const [detune, setDetune] = useState('64');
  const [pitchBend, setPitchBend] = useState('8192');

  const handleAttack = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAttack(e.target.value);
    midiService.sendCC(activeChannel, 12, percentageToMidi(Number(e.target.value)));
  };

  const handleDecay = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDecay(e.target.value);
    midiService.sendCC(activeChannel, 11, percentageToMidi(Number(e.target.value)));
  };

  const handleDetune = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDetune(e.target.value);
    midiService.sendCC(activeChannel, 1, Number(e.target.value));
  };

  const handlePitchBend = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPitchBend(e.target.value);
    midiService.sendPitchBend(activeChannel, Number(e.target.value));
  };

  return (
    <>
      <h2 className="sr-only">Synth Controls</h2>
      
      <section className="bg-surface-container-high relative p-6 solder-point solder-tl solder-tr solder-bl solder-br border border-[#32152f] h-full flex flex-col">
        <h3 className="font-headline text-xs tracking-[0.3em] text-tertiary mb-8 uppercase">ENVELOPE_SHAPER_MOD</h3>
        
        <div className="grid grid-cols-4 gap-6 flex-1">
          {/* Attack Slider */}
          <div className="space-y-4">
            <div className="h-48 bg-surface-container-lowest relative flex flex-col justify-end p-1 group">
              <input type="range" min="0" max="100" aria-label="Attack" className="absolute w-[184px] h-[184px] left-[-76px] bottom-0 opacity-0 cursor-pointer z-10 -rotate-90 origin-center" value={attack} onChange={handleAttack} />
              <div className="w-full bg-primary/40 pointer-events-none group-hover:bg-primary/60 transition-colors" style={{ height: `${attack}%` }}></div>
              <div className="absolute left-0 w-full h-1 bg-primary shadow-[0_0_8px_#8eff71] pointer-events-none" style={{ bottom: `${attack}%` }}></div>
            </div>
            <div className="text-center">
              <div className="font-headline text-[10px] text-secondary">{attack}ms</div>
              <div className="font-headline text-[10px] text-primary font-bold">ATTACK</div>
            </div>
          </div>

          {/* Decay Slider */}
          <div className="space-y-4">
            <div className="h-48 bg-surface-container-lowest relative flex flex-col justify-end p-1 group">
              <input type="range" min="0" max="100" aria-label="Decay" className="absolute w-[184px] h-[184px] left-[-76px] bottom-0 opacity-0 cursor-pointer z-10 -rotate-90 origin-center" value={decay} onChange={handleDecay} />
              <div className="w-full bg-primary/40 pointer-events-none group-hover:bg-primary/60 transition-colors" style={{ height: `${decay}%` }}></div>
              <div className="absolute left-0 w-full h-1 bg-primary shadow-[0_0_8px_#8eff71] pointer-events-none" style={{ bottom: `${decay}%` }}></div>
            </div>
            <div className="text-center">
              <div className="font-headline text-[10px] text-secondary">{decay}ms</div>
              <div className="font-headline text-[10px] text-primary font-bold">DECAY</div>
            </div>
          </div>

          {/* Detune Slider */}
          <div className="flex flex-col items-center gap-4 group">
            <div className="h-48 w-8 bg-surface-container-lowest relative rounded-full border border-tertiary/20 p-1 cursor-pointer">
              <input type="range" min="0" max="127" aria-label="Detune" value={detune} onChange={handleDetune} className="absolute inset-0 opacity-0 cursor-pointer -rotate-90 origin-center w-48 h-8 -left-20 top-20 z-10" />
              <div className="absolute bottom-1 left-1 right-1 bg-tertiary/40 rounded-full transition-all" style={{ height: `${(Number(detune) / 127) * 100}%` }}></div>
              <div className="absolute left-1 right-1 h-4 bg-tertiary rounded-full shadow-[0_0_10px_#ff9cf4]" style={{ bottom: `calc(${(Number(detune) / 127) * 100}% - 8px)` }}></div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="font-headline text-[10px] text-tertiary">{Number(detune) - 64}</div>
              <div className="font-headline text-[10px] text-tertiary font-bold">DETUNE</div>
            </div>
          </div>

          {/* Pitch Bend Slider */}
          <div className="flex flex-col items-center gap-4 group">
            <div className="h-48 w-8 bg-surface-container-lowest relative rounded-full border border-secondary/20 p-1 cursor-pointer">
              <input type="range" min="0" max="16383" aria-label="Pitch Bend" value={pitchBend} onChange={handlePitchBend} className="absolute inset-0 opacity-0 cursor-pointer -rotate-90 origin-center w-48 h-8 -left-20 top-20 z-10" />
              <div className="absolute bottom-1 left-1 right-1 bg-secondary/40 rounded-full transition-all" style={{ height: `${(Number(pitchBend) / 16383) * 100}%` }}></div>
              <div className="absolute left-1 right-1 h-4 bg-secondary rounded-full shadow-[0_0_10px_#f5ce53]" style={{ bottom: `calc(${(Number(pitchBend) / 16383) * 100}% - 8px)` }}></div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="font-headline text-[10px] text-secondary">{Math.round(((Number(pitchBend) - 8192) / 8192) * 100)}%</div>
              <div className="font-headline text-[10px] text-secondary font-bold">PITCH_BEND</div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export const VibratoLFO: React.FC = () => {
  const activeChannel = 1;
  const [vibratoRate, setVibratoRate] = useState(65);
  const [vibratoDepth, setVibratoDepth] = useState(40);

  const handleVibratoRate = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVibratoRate(Number(e.target.value));
    midiService.sendCC(activeChannel, 2, percentageToMidi(Number(e.target.value)));
  };

  const handleVibratoDepth = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVibratoDepth(Number(e.target.value));
    midiService.sendCC(activeChannel, 3, percentageToMidi(Number(e.target.value)));
  };

  return (
    <section className="bg-surface-container-high relative p-6 solder-point solder-tl solder-tr solder-bl solder-br border border-[#32152f] h-full flex flex-col">
      <h3 className="sr-only">Vibrato LFO</h3>
      <h2 className="font-headline text-xs tracking-[0.3em] text-tertiary mb-8 uppercase">VIBRATO_LFO_PATH</h2>
      
      <div className="flex flex-col md:flex-row items-center gap-10">
        <div className="relative w-32 h-32 flex items-center justify-center shrink-0 group">
          <input type="range" min="0" max="100" aria-label="Vibrato Rate" value={vibratoRate} onChange={handleVibratoRate} className="absolute inset-0 opacity-0 z-20 cursor-pointer" />
          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
            <circle className="text-surface-container-lowest" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeWidth="8"></circle>
            <circle className="text-primary transition-all duration-75" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeDasharray="364.4" strokeDashoffset={364.4 - (vibratoRate / 100) * 364.4} strokeWidth="8"></circle>
          </svg>
          <div className="text-center z-10 pointer-events-none">
            <div className="font-headline text-lg font-bold text-primary leading-none group-hover:drop-shadow-[0_0_8px_#8eff71] transition-all">{((vibratoRate / 100) * 20).toFixed(1)}</div>
            <div className="font-headline text-[10px] text-secondary tracking-widest">Hz</div>
          </div>
          <div className="absolute top-1 right-1 w-2 h-2 bg-secondary rounded-full"></div>
        </div>

        <div className="flex-1 space-y-6 w-full">
          <div className="bg-surface-container-lowest p-3 border-l-4 border-primary relative">
            <div className="font-headline text-[10px] text-tertiary mb-1">WAVEFORM_TYPE</div>
            <div className="flex gap-4">
              <span className="material-symbols-outlined text-primary text-xl">water_drop</span>
              <span className="font-headline text-sm text-on-surface font-bold">TRIANGLE_BI</span>
            </div>
          </div>
          
          <div className="bg-surface-container-lowest p-3 border-l-4 border-secondary relative group">
            <div className="font-headline text-[10px] text-tertiary mb-2 flex justify-between">
              <span>DEPTH_MOD</span>
              <span className="text-secondary">{vibratoDepth}%</span>
            </div>
            <input type="range" min="0" max="100" aria-label="Vibrato Depth" value={vibratoDepth} onChange={handleVibratoDepth} className="absolute inset-0 opacity-0 z-10 cursor-pointer" />
            <div className="h-1 w-full bg-surface-container-highest relative pointer-events-none mt-2">
               <div className="absolute top-0 left-0 h-full bg-secondary transition-all" style={{ width: `${vibratoDepth}%` }}></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
