import React from 'react';
import { midiService } from '../services/midiService';
import { usePatchState } from '../hooks/usePatchState';


interface SettingToggleProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  buttonText: string;
  activeText: string;
  inactiveText: string;
  activeColorClass: string;
  activeShadowClass: string;
  activeTextColorClass: string;
  inactiveTextColorClass?: string;
}

const SettingToggle: React.FC<SettingToggleProps> = ({
  label,
  isActive,
  onClick,
  buttonText,
  activeText,
  inactiveText,
  activeColorClass,
  activeShadowClass,
  activeTextColorClass,
  inactiveTextColorClass = 'text-primary'
}) => (
  <div className="bg-surface-container-highest flex flex-col items-center justify-center gap-2 border border-outline-variant/20 relative w-full p-0 has-[:focus-visible]:outline-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-surface-container-high">
    <button
      type="button"
      aria-pressed={isActive}
      className="absolute inset-0 w-full h-full cursor-pointer z-10 opacity-0"
      onClick={onClick}
    >{buttonText}</button>

    <div className="p-4 flex flex-col items-center gap-2 pointer-events-none w-full h-full transition-colors">
      <span className="font-headline text-[10px] text-tertiary opacity-60 uppercase text-center w-full truncate">{label}</span>
      {isActive ? (
         <div className={`w-4 h-4 ${activeColorClass} ${activeShadowClass}`}></div>
      ) : (
         <div className="w-4 h-4 bg-primary/20 border border-primary"></div>
      )}
      <span className={`font-headline text-[9px] font-bold ${isActive ? activeTextColorClass : inactiveTextColorClass}`}>
        {isActive ? activeText : inactiveText}
      </span>
    </div>
  </div>
);

const CHANNELS = Array.from({ length: 16 });

export const GlobalSettings: React.FC = () => {
  const [channel, setChannel] = usePatchState('globalChannel', '1');

  const [polyphony, setPolyphony] = usePatchState('globalPolyphony', false, (val) => {
    try { midiService.sendCC(Number(channel), 10, val ? 127 : 0); } catch (e) { console.warn('MIDI error', e); }
  });

  const [bank, setBank] = usePatchState('globalBank', 'A', (val) => {
    try { midiService.sendCC(Number(channel), 9, val === 'B' ? 127 : 0); } catch (e) { console.warn('MIDI error', e); }
  });

  const [velocity, setVelocity] = usePatchState('globalVelocity', false, (val) => {
    try { midiService.sendCC(Number(channel), 4, val ? 127 : 0); } catch (e) { console.warn('MIDI error', e); }
  });

  const [gamepad, setGamepad] = usePatchState('experimentalGamepad', false);
  const [voiceControl, setVoiceControl] = usePatchState('experimentalVoiceControl', false);
  const [thereminCam, setThereminCam] = usePatchState('experimentalThereminCam', false);

  const handleChannel = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setChannel(e.target.value);
  };

  const handlePolyphony = () => {
    setPolyphony(!polyphony);
  };

  const handleBank = () => {
    const newBank = bank === 'A' ? 'B' : 'A';
    setBank(newBank);
  };

  const handleVelocity = () => {
    setVelocity(!velocity);
  };

  const handleGamepad = () => {
    setGamepad(!gamepad);
  };

  const handleVoiceControl = () => {
    setVoiceControl(!voiceControl);
  };

  const handleThereminCam = () => {
    setThereminCam(!thereminCam);
  };

  return (
    <>
      <h2 className="sr-only">Global Settings</h2>
      
      <div className="bg-black/40 p-4 border-b-2 border-surface-container-highest flex justify-between items-center group relative cursor-pointer hover:bg-black/60 transition-colors has-[:focus-visible]:outline-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-surface-container-high">
        <label htmlFor="midi-channel" className="font-headline text-[10px] text-tertiary tracking-widest block opacity-60">MIDI_CHANNEL</label>
        <span className="font-headline text-secondary text-sm font-bold w-12 text-right pointer-events-none">CH_{channel}</span>
        <select 
          id="midi-channel"
          aria-label="MIDI Channel"
          value={channel} 
          onChange={handleChannel}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        >
          {CHANNELS.map((_, i) => (
            <option key={i + 1} value={String(i + 1)}>
              {String(i + 1).padStart(2, '0')}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <SettingToggle
          label="Polyphony"
          isActive={polyphony}
          onClick={handlePolyphony}
          buttonText="Toggle Polyphony"
          activeText="POLYPHONIC"
          inactiveText="MONOPHONIC"
          activeColorClass="bg-secondary"
          activeShadowClass="shadow-[0_0_10px_#f5ce53]"
          activeTextColorClass="text-secondary"
        />

        <SettingToggle
          label="Bank Switch"
          isActive={bank === 'B'}
          onClick={handleBank}
          buttonText="Bank B"
          activeText="EXT_ROM_B"
          inactiveText="EXT_ROM_A"
          activeColorClass="bg-primary"
          activeShadowClass="shadow-[0_0_10px_#8eff71]"
          activeTextColorClass="text-primary"
        />

        <SettingToggle
          label="Velocity Sens"
          isActive={velocity}
          onClick={handleVelocity}
          buttonText="Toggle Velocity"
          activeText="DYNAMIC"
          inactiveText="STATIC"
          activeColorClass="bg-tertiary"
          activeShadowClass="shadow-[0_0_10px_#ff9cf4]"
          activeTextColorClass="text-tertiary"
        />

        <SettingToggle
          label="Gamepad API"
          isActive={gamepad}
          onClick={handleGamepad}
          buttonText="Toggle Gamepad"
          activeText="ENABLED"
          inactiveText="DISABLED"
          activeColorClass="bg-secondary"
          activeShadowClass="shadow-[0_0_10px_#f5ce53]"
          activeTextColorClass="text-secondary"
        />

        <SettingToggle
          label="Voice Control"
          isActive={voiceControl}
          onClick={handleVoiceControl}
          buttonText="Toggle Voice Control"
          activeText="ENABLED"
          inactiveText="DISABLED"
          activeColorClass="bg-primary"
          activeShadowClass="shadow-[0_0_10px_#8eff71]"
          activeTextColorClass="text-primary"
        />

        <SettingToggle
          label="Theremin Cam"
          isActive={thereminCam}
          onClick={handleThereminCam}
          buttonText="Toggle Theremin Cam"
          activeText="ENABLED"
          inactiveText="DISABLED"
          activeColorClass="bg-tertiary"
          activeShadowClass="shadow-[0_0_10px_#ff9cf4]"
          activeTextColorClass="text-tertiary"
        />
      </div>
    </>
  );
};
