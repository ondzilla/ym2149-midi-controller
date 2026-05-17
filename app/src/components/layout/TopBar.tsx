import { useState, useEffect } from 'react';
import { midiService } from '../../services/midiService';
import { usePatchState } from '../../hooks/usePatchState';

interface TopBarProps {
  onOpenSettings: () => void;
}

export function TopBar({ onOpenSettings }: TopBarProps) {
  const [experimentalGamepad] = usePatchState('experimentalGamepad', false);
  const [gamepadConnected, setGamepadConnected] = useState(() => {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (const gp of gamepads) {
      if (gp && gp.connected) {
        return true;
      }
    }
    return false;
  });
  const [activeOutId, setActiveOutId] = useState<string | null>(midiService.outputDevice?.id || null);
  const [midiError, setMidiError] = useState<string | null>(midiService.error);
  const [outputCount, setOutputCount] = useState<number>(midiService.outputs.length);

  useEffect(() => {
    const handleGamepadConnected = () => setGamepadConnected(true);
    const handleGamepadDisconnected = () => setGamepadConnected(false);

    window.addEventListener('gamepadconnected', handleGamepadConnected);
    window.addEventListener('gamepaddisconnected', handleGamepadDisconnected);

    const unsubscribe = midiService.subscribe(() => {
      setActiveOutId(midiService.outputDevice?.id || null);
      setMidiError(midiService.error);
      setOutputCount(midiService.outputs.length);
    });

    return () => {
      unsubscribe();
      window.removeEventListener('gamepadconnected', handleGamepadConnected);
      window.removeEventListener('gamepaddisconnected', handleGamepadDisconnected);
    };
  }, []);

  const handlePanic = () => {
    try {
      // Send All Notes Off (CC 123) to all 3 MIDI channels
      for (let i = 1; i <= 3; i++) {
        midiService.sendCC(i, 123, 0);
      }
    } catch (error) {
      console.error('Failed to send Panic (All Notes Off) message:', error);
    }
  };

  return (
    <header className="flex justify-between items-center w-full px-8 py-4 bg-[#1b061a] sticky top-0 z-30 border-b border-[#32152f]">
      <div className="font-headline tracking-tighter uppercase text-xl font-bold text-[#8eff71]">
        YM2149_SYNTH_CORE
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 border-r border-[#32152f] pr-6">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${activeOutId ? 'bg-primary shadow-[0_0_8px_#8eff71]' : 'bg-error shadow-[0_0_8px_#ff5449]'}`}></div>
            <span role="status" aria-live="polite" className={`font-headline text-[10px] tracking-widest ${activeOutId ? 'text-primary' : 'text-error'}`}>
              MIDI: {midiError ? `ERROR (${midiError})` : activeOutId ? 'CONNECTED' : `DISCONNECTED (${outputCount} found)`}
            </span>
          </div>

          {experimentalGamepad && (
            <div className="flex items-center gap-2 border-l border-[#32152f] pl-4">
              <div className={`w-2 h-2 rounded-full ${gamepadConnected ? 'bg-primary shadow-[0_0_8px_#8eff71]' : 'bg-error shadow-[0_0_8px_#ff5449]'}`}></div>
              <span role="status" aria-live="polite" className={`font-headline text-[10px] tracking-widest ${gamepadConnected ? 'text-primary' : 'text-error'}`}>
                GAMEPAD: {gamepadConnected ? 'CONNECTED' : 'DISCONNECTED'}
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="Settings"
            title="Settings"
            className="text-[#ff9cf4] opacity-70 cursor-pointer hover:text-[#8eff71] focus-visible:text-[#8eff71] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded transition-colors"
          >
            <span aria-hidden="true" className="material-symbols-outlined">settings</span>
          </button>
          <button
            type="button"
            aria-label="All Notes Off (Panic)"
            title="All Notes Off (Panic)"
            onClick={handlePanic}
            className="text-[#ff9cf4] opacity-70 cursor-pointer hover:text-[#8eff71] focus-visible:text-[#8eff71] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded transition-colors"
          >
            <span aria-hidden="true" className="material-symbols-outlined">power_settings_new</span>
          </button>
        </div>
      </div>
    </header>
  );
}
