import { VisualEnvelopeEditor } from './VisualEnvelopeEditor';
import React, { useId, useEffect, useRef } from 'react';
import { midiService } from '../services/midiService';
import { percentageToMidi, mapRange } from '../utils/mathUtils';
import { usePatchState } from '../hooks/usePatchState';

// Extracted into a separate component to prevent parent re-renders on state change
const AudioModulationControl: React.FC<{ activeChannel: number }> = ({ activeChannel }) => {
  const [audioMod, setAudioMod] = usePatchState('audioMod', false);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const animationRef = useRef<number | null>(null);
  const smoothedRmsRef = useRef<number>(0);
  const id = useId();

  const handleAudioModToggle = () => {
    setAudioMod(!audioMod);
  };

  useEffect(() => {
    let isMounted = true;
    let localStream: MediaStream | null = null;
    let localCtx: AudioContext | null = null;

    if (audioMod) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          if (!isMounted) {
            stream.getTracks().forEach(track => track.stop());
            return;
          }
          localStream = stream;
          streamRef.current = stream;

          const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
          if (!AudioContextClass) return;

          localCtx = new AudioContextClass();
          audioCtxRef.current = localCtx;

          const source = localCtx.createMediaStreamSource(stream);
          const analyser = localCtx.createAnalyser();
          analyser.fftSize = 256;
          source.connect(analyser);

          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);

          const loop = () => {
            analyser.getByteTimeDomainData(dataArray);

            // Calculate RMS (average distance from 128)
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
              const diff = (dataArray[i] - 128) / 128; // Normalize to -1 to 1
              sum += diff * diff;
            }
            const rms = Math.sqrt(sum / bufferLength);

            // Smooth the RMS value
            smoothedRmsRef.current = smoothedRmsRef.current * 0.8 + rms * 0.2;
            const currentRms = smoothedRmsRef.current;

            // Map RMS to MIDI CC values
            // Let's assume max RMS is around 0.5 for normal speech/music
            const normalizedRms = Math.min(1, currentRms * 2);

            const detuneValue = mapRange(normalizedRms, 0, 1, 64, 127);
            const vibratoValue = mapRange(normalizedRms, 0, 1, 0, 127);

            // Send MIDI CC messages
            try {
              midiService.sendCC(activeChannel, 1, detuneValue);
            } catch (e) {
              console.warn('Failed to send Detune CC', e);
            }

            try {
              midiService.sendCC(activeChannel, 3, vibratoValue);
            } catch (e) {
              console.warn('Failed to send Vibrato CC', e);
            }

            // Update visualizer if element exists
            if (visualizerRef.current) {
              visualizerRef.current.style.width = `${Math.min(100, currentRms * 200)}%`;
            }

            animationRef.current = requestAnimationFrame(loop);
          };

          loop();
        })
        .catch(err => {
          console.warn('AudioModulation error:', err);
          if (isMounted) {
            setAudioMod(false);
          }
        });
    } else {
      if (visualizerRef.current) {
         visualizerRef.current.style.width = '0%';
      }
    }

    return () => {
      isMounted = false;
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (localCtx && localCtx.state !== 'closed') {
        localCtx.close().catch(() => {});
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
      smoothedRmsRef.current = 0;
    };
  }, [audioMod, activeChannel, setAudioMod]);

  const visualizerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        id={id}
        aria-pressed={audioMod}
        onClick={handleAudioModToggle}
        className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-colors has-[:focus-visible]:outline-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-surface-container-high ${audioMod ? 'bg-primary border-primary text-background shadow-[0_0_10px_#8eff71]' : 'bg-surface-container-lowest border-outline text-tertiary opacity-60'}`}
        title="Toggle Audio Modulation"
      >
        <span className="material-symbols-outlined" aria-hidden="true">
          {audioMod ? 'mic' : 'mic_off'}
        </span>
      </button>
      <label htmlFor={id} className="font-headline text-[10px] text-tertiary cursor-pointer font-bold">AUDIO_MOD</label>

      {/* Visualizer Bar */}
      <div className="w-full h-2 bg-surface-container-lowest relative mt-2 border border-outline/20">
        <div
          ref={visualizerRef}
          className="absolute left-0 top-0 h-full bg-primary transition-all duration-75"
          style={{ width: '0%' }}
        ></div>
      </div>
    </div>
  );
};

// Extracted into a separate component to prevent parent re-renders on state change
// Extracted into a separate component to prevent parent re-renders on state change
const DetuneControl: React.FC<{ activeChannel: number }> = ({ activeChannel }) => {
  const [detune, setDetune] = usePatchState('detune', '64', (val) => {
    try { midiService.sendCC(activeChannel, 1, Number(val)); } catch (e) { console.warn('MIDI error', e); }
  });

  const handleDetune = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDetune(e.target.value);
  };

  const id = useId();

  return (
    <div className="flex flex-col items-center gap-4 group has-[:focus-visible]:outline-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-surface-container-high">
      <div className="h-48 w-8 bg-surface-container-lowest relative rounded-full border border-tertiary/20 p-1 cursor-pointer">
        <input id={id} type="range" min="0" max="127" aria-label="Detune" value={detune} onChange={handleDetune} className="absolute inset-0 opacity-0 cursor-pointer -rotate-90 origin-center w-48 h-8 -left-20 top-20 z-10" />
        <div className="absolute bottom-1 left-1 right-1 bg-tertiary/40 rounded-full transition-all" style={{ height: `${(Number(detune) / 127) * 100}%` }}></div>
        <div className="absolute left-1 right-1 h-4 bg-tertiary rounded-full shadow-[0_0_10px_#ff9cf4]" style={{ bottom: `calc(${(Number(detune) / 127) * 100}% - 8px)` }}></div>
      </div>
      <div className="flex flex-col items-center gap-1">
        <div className="font-headline text-[10px] text-tertiary">{Number(detune) - 64}</div>
        <label htmlFor={id} className="font-headline text-[10px] text-tertiary font-bold cursor-pointer">DETUNE</label>
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
  };

  const id = useId();

  return (
    <div className="flex flex-col items-center gap-4 group has-[:focus-visible]:outline-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-surface-container-high">
      <div className="h-48 w-8 bg-surface-container-lowest relative rounded-full border border-secondary/20 p-1 cursor-pointer">
        <input id={id} type="range" min="0" max="16383" aria-label="Pitch Bend" value={pitchBend} onChange={handlePitchBend} className="absolute inset-0 opacity-0 cursor-pointer -rotate-90 origin-center w-48 h-8 -left-20 top-20 z-10" />
        <div className="absolute bottom-1 left-1 right-1 bg-secondary/40 rounded-full transition-all" style={{ height: `${(Number(pitchBend) / 16383) * 100}%` }}></div>
        <div className="absolute left-1 right-1 h-4 bg-secondary rounded-full shadow-[0_0_10px_#f5ce53]" style={{ bottom: `calc(${(Number(pitchBend) / 16383) * 100}% - 8px)` }}></div>
      </div>
      <div className="flex flex-col items-center gap-1">
        <div className="font-headline text-[10px] text-secondary">{Math.round(((Number(pitchBend) - 8192) / 8192) * 100)}%</div>
        <label htmlFor={id} className="font-headline text-[10px] text-secondary font-bold cursor-pointer">PITCH_BEND</label>
      </div>
    </div>
  );
};


export const SynthControls: React.FC = () => {
  const [globalChannel] = usePatchState('globalChannel', '1');
  const activeChannel = Number(globalChannel);

  return (
    <>
      <h2 className="sr-only">Synth Controls</h2>
      
      <section className="bg-surface-container-high relative p-6 solder-point solder-tl solder-tr solder-bl solder-br border border-[#32152f] h-full flex flex-col">
        <h3 className="font-headline text-xs tracking-[0.3em] text-tertiary mb-8 uppercase">ENVELOPE_SHAPER_MOD</h3>
        
        <div className="grid grid-cols-4 gap-6 flex-1">
          {/* Visual Envelope Editor (Attack & Decay) */}
          <VisualEnvelopeEditor activeChannel={activeChannel} />

          {/* Detune Slider */}
          <DetuneControl activeChannel={activeChannel} />

          {/* Pitch Bend Slider */}
          <PitchBendControl activeChannel={activeChannel} />
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
  };

  return (
    <div className="relative w-32 h-32 flex items-center justify-center shrink-0 group has-[:focus-visible]:outline-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-surface-container-high">
      <input type="range" min="0" max="100" aria-label="Vibrato Rate" value={vibratoRate} onChange={handleVibratoRate} className="absolute inset-0 opacity-0 z-20 cursor-pointer" />
      <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
        <circle className="text-surface-container-lowest" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeWidth="8"></circle>
        <circle className="text-primary transition-all duration-75" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeDasharray="364.4" strokeDashoffset={364.4 - (vibratoRate / 100) * 364.4} strokeWidth="8"></circle>
      </svg>
      <div className="text-center z-10 pointer-events-none">
        <div className="font-headline text-lg font-bold text-primary leading-none group-hover:drop-shadow-[0_0_8px_#8eff71] transition-all">{vibratoRate}</div>
        <div className="font-headline text-[10px] text-secondary tracking-widest">RATE %</div>
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
  };

  const id = useId();

  return (
    <div className="flex-1 space-y-6 w-full">
      <div className="bg-surface-container-lowest p-3 border-l-4 border-secondary relative group has-[:focus-visible]:outline-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-surface-container-high">
        <div className="font-headline text-[10px] text-tertiary mb-2 flex justify-between">
          <label htmlFor={id} className="cursor-pointer relative z-20">DEPTH_MOD</label>
          <span className="text-secondary">{vibratoDepth}%</span>
        </div>
        <input id={id} type="range" min="0" max="100" aria-label="Vibrato Depth" value={vibratoDepth} onChange={handleVibratoDepth} className="absolute inset-0 opacity-0 z-10 cursor-pointer" />
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
        <AudioModulationControl activeChannel={activeChannel} />
      </div>
    </section>
  );
};
