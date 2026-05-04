import React from 'react';
import { midiService } from '../services/midiService';
import { percentageToMidi } from '../utils/mathUtils';
import { usePatchState } from '../hooks/usePatchState';

// Extracted into a separate component to prevent parent re-renders on state change
const AttackControl: React.FC<{ activeChannel: number }> = ({ activeChannel }) => {
  const [attack, setAttack] = usePatchState('attack', '20', (val) => {
    // YM2149 Envelope Attack mapped to CC12 (per firmware specs)
    try { midiService.sendCC(activeChannel, 12, percentageToMidi(Number(val))); } catch (e) { console.warn('MIDI error', e); }
  });

  const handleAttack = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAttack(e.target.value);
    midiService.sendCC(activeChannel, 12, percentageToMidi(Number(e.target.value)));
  };

  return (
    <div className="space-y-4">
      <div className="h-48 bg-surface-container-lowest relative flex flex-col justify-end p-1 group has-[:focus-visible]:outline-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-surface-container-high">
        <input type="range" min="0" max="100" aria-label="Attack" className="absolute w-[184px] h-[184px] left-[-76px] bottom-0 opacity-0 cursor-pointer z-10 -rotate-90 origin-center" value={attack} onChange={handleAttack} />
        <div className="w-full bg-primary/40 pointer-events-none group-hover:bg-primary/60 transition-colors" style={{ height: `${attack}%` }}></div>
        <div className="absolute left-0 w-full h-1 bg-primary shadow-[0_0_8px_#8eff71] pointer-events-none" style={{ bottom: `${attack}%` }}></div>
      </div>
      <div className="text-center">
        <div className="font-headline text-[10px] text-secondary">{attack}ms</div>
        <div className="font-headline text-[10px] text-primary font-bold">ATTACK</div>
      </div>
    </div>
  );
};

// Extracted into a separate component to prevent parent re-renders on state change
const DecayControl: React.FC<{ activeChannel: number }> = ({ activeChannel }) => {
  const [decay, setDecay] = usePatchState('decay', '50', (val) => {
    // YM2149 Envelope Decay mapped to CC11 (per firmware specs)
    try { midiService.sendCC(activeChannel, 11, percentageToMidi(Number(val))); } catch (e) { console.warn('MIDI error', e); }
  });

  const handleDecay = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDecay(e.target.value);
    midiService.sendCC(activeChannel, 11, percentageToMidi(Number(e.target.value)));
  };

  return (
    <div className="space-y-4">
      <div className="h-48 bg-surface-container-lowest relative flex flex-col justify-end p-1 group has-[:focus-visible]:outline-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-surface-container-high">
        <input type="range" min="0" max="100" aria-label="Decay" className="absolute w-[184px] h-[184px] left-[-76px] bottom-0 opacity-0 cursor-pointer z-10 -rotate-90 origin-center" value={decay} onChange={handleDecay} />
        <div className="w-full bg-primary/40 pointer-events-none group-hover:bg-primary/60 transition-colors" style={{ height: `${decay}%` }}></div>
        <div className="absolute left-0 w-full h-1 bg-primary shadow-[0_0_8px_#8eff71] pointer-events-none" style={{ bottom: `${decay}%` }}></div>
      </div>
      <div className="text-center">
        <div className="font-headline text-[10px] text-secondary">{decay}ms</div>
        <div className="font-headline text-[10px] text-primary font-bold">DECAY</div>
      </div>
    </div>
  );
};

// Extracted into a separate component to prevent parent re-renders on state change
const DetuneControl: React.FC<{ activeChannel: number }> = ({ activeChannel }) => {
  const [detune, setDetune] = usePatchState('detune', '64', (val) => {
    try { midiService.sendCC(activeChannel, 1, Number(val)); } catch (e) { console.warn('MIDI error', e); }
  });

  const handleDetune = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDetune(e.target.value);
    midiService.sendCC(activeChannel, 1, Number(e.target.value));
  };

  return (
    <div className="flex flex-col items-center gap-4 group has-[:focus-visible]:outline-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-surface-container-high">
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
  );
};

// Extracted into a separate component to prevent parent re-renders on state change
const PitchBendControl: React.FC<{ activeChannel: number }> = ({ activeChannel }) => {
  const [pitchBend, setPitchBend] = usePatchState('pitchBend', '8192', (val) => {
    try { midiService.sendPitchBend(activeChannel, Number(val)); } catch (e) { console.warn('MIDI error', e); }
  });

  const handlePitchBend = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPitchBend(e.target.value);
    midiService.sendPitchBend(activeChannel, Number(e.target.value));
  };

  return (
    <div className="flex flex-col items-center gap-4 group has-[:focus-visible]:outline-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-surface-container-high">
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
  );
};


const VintageKnobPrototype = () => (
  <div className="flex flex-col items-center justify-center gap-2 opacity-50 cursor-not-allowed">
    <div className="w-16 h-16 rounded-full bg-surface-container-highest border-2 border-outline-variant/30 relative flex items-center justify-center">
      <div className="w-2 h-2 rounded-full bg-primary/20 absolute top-2"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="material-symbols-outlined text-outline-variant/30 text-[32px]">sync</span>
      </div>
      <button disabled className="absolute inset-0 cursor-not-allowed z-10" aria-label="Future Knob Prototype"></button>
    </div>
    <div className="font-headline text-[10px] text-tertiary font-bold tracking-widest text-center mt-2">
      <span className="block text-outline-variant/50">VINTAGE</span>
      <span className="block text-outline-variant/50">KNOB</span>
    </div>
  </div>
);

export const SynthControls: React.FC = () => {
  const [globalChannel] = usePatchState('globalChannel', '1');
  const activeChannel = Number(globalChannel);

  return (
    <>
      <h2 className="sr-only">Synth Controls</h2>
      
      <section className="bg-surface-container-high relative p-6 solder-point solder-tl solder-tr solder-bl solder-br border border-[#32152f] h-full flex flex-col">
        <h3 className="font-headline text-xs tracking-[0.3em] text-tertiary mb-8 uppercase">ENVELOPE_SHAPER_MOD</h3>
        
        <div className="grid grid-cols-5 gap-6 flex-1">
          {/* Attack Slider */}
          <AttackControl activeChannel={activeChannel} />

          {/* Decay Slider */}
          <DecayControl activeChannel={activeChannel} />

          {/* Detune Slider */}
          <DetuneControl activeChannel={activeChannel} />

          {/* Pitch Bend Slider */}
          <PitchBendControl activeChannel={activeChannel} />

          {/* Future Knob Prototype */}
          <VintageKnobPrototype />
        </div>
      </section>
    </>
  );
};

// Extracted into a separate component to prevent parent re-renders on state change
const VibratoRateControl: React.FC<{ activeChannel: number }> = ({ activeChannel }) => {
  const [vibratoRate, setVibratoRate] = usePatchState('vibratoRate', 65, (val) => {
    try { midiService.sendCC(activeChannel, 2, percentageToMidi(Number(val))); } catch (e) { console.warn('MIDI error', e); }
  });

  const handleVibratoRate = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVibratoRate(Number(e.target.value));
    midiService.sendCC(activeChannel, 2, percentageToMidi(Number(e.target.value)));
  };

  return (
    <div className="relative w-32 h-32 flex items-center justify-center shrink-0 group has-[:focus-visible]:outline-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-surface-container-high">
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
  );
};

// Extracted into a separate component to prevent parent re-renders on state change
const VibratoDepthControl: React.FC<{ activeChannel: number }> = ({ activeChannel }) => {
  const [vibratoDepth, setVibratoDepth] = usePatchState('vibratoDepth', 40, (val) => {
    try { midiService.sendCC(activeChannel, 3, percentageToMidi(Number(val))); } catch (e) { console.warn('MIDI error', e); }
  });

  const handleVibratoDepth = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVibratoDepth(Number(e.target.value));
    midiService.sendCC(activeChannel, 3, percentageToMidi(Number(e.target.value)));
  };

  return (
    <div className="flex-1 space-y-6 w-full">
      <div className="bg-surface-container-lowest p-3 border-l-4 border-secondary relative group has-[:focus-visible]:outline-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-surface-container-high">
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
  );
};

export const VibratoLFO: React.FC = () => {
  const [globalChannel] = usePatchState('globalChannel', '1');
  const activeChannel = Number(globalChannel);

  return (
    <section className="bg-surface-container-high relative p-6 solder-point solder-tl solder-tr solder-bl solder-br border border-[#32152f] h-full flex flex-col">
      <h3 className="sr-only">Vibrato LFO</h3>
      <h2 className="font-headline text-xs tracking-[0.3em] text-tertiary mb-8 uppercase">VIBRATO_LFO_PATH</h2>
      
      <div className="flex flex-col md:flex-row items-center gap-10">
        <VibratoRateControl activeChannel={activeChannel} />
        <VibratoDepthControl activeChannel={activeChannel} />
      </div>
    </section>
  );
};
