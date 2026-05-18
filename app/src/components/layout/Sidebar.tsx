import { useEffect, useState, useRef } from 'react';
import { presetManager } from '../../services/presetManager';
import { midiService, type MidiLogEntry } from '../../services/midiService';
import { usePatchState } from '../../hooks/usePatchState';

export function Sidebar() {
  const [showMidiLog] = usePatchState('showMidiLog', false);
  const [logs, setLogs] = useState<MidiLogEntry[]>(() => [...midiService.logs]);
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showMidiLog) return;

    const unsubscribe = midiService.subscribe(() => {
      setLogs([...midiService.logs]);
    });

    return unsubscribe;
  }, [showMidiLog]);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const formatLogData = (log: MidiLogEntry) => {
    if (log.type === 'CC') {
      return `CC ${log.data[0]} = ${log.data[1]}`;
    }
    if (log.type === 'NoteOn' || log.type === 'NoteOff') {
      return `Note ${log.data[0]} Vel ${log.data[1]}`;
    }
    if (log.type === 'PitchBend') {
      return `Val ${log.data}`;
    }
    return '';
  };

  const handleSavePatch = () => {
    const name = window.prompt('Enter patch name to save:');
    if (name) {
      presetManager.savePreset(name);
    }
  };

  const handleLoadPatch = () => {
    const names = presetManager.getPresetNames();
    if (names.length === 0) {
      window.alert('No saved patches found.');
      return;
    }
    const name = window.prompt(`Enter patch name to load (${names.join(', ')}):`);
    if (name) {
      presetManager.loadPreset(name);
    }
  };

  return (
    <aside className="fixed left-0 top-0 h-full flex flex-col z-40 bg-[#1b061a] border-r border-[#32152f] w-64 hidden lg:flex">
      <div className="p-6">
        <div className="text-[#ff9cf4] text-sm font-black font-headline tracking-widest uppercase mb-1">ENGINE_v1.0</div>
        <div className="text-[#8eff71] text-[10px] font-headline tracking-[0.2em] font-bold">SIGNAL_LOCKED</div>
      </div>
      <nav className="flex-1 mt-4 flex flex-col overflow-hidden">
        <div className="text-[#8eff71] border-l-4 border-[#8eff71] pl-4 py-3 bg-[#32152f] font-headline text-xs uppercase tracking-widest cursor-pointer mb-1 transition-transform active:scale-[0.97] shrink-0">
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="material-symbols-outlined text-lg">settings_input_component</span>
            <span>Synth Panel</span>
          </div>
        </div>

        {showMidiLog && (
          <div className="flex-1 min-h-0 flex flex-col border-t border-[#32152f] mt-2">
            <div className="flex justify-between items-center px-4 py-2 bg-[#32152f]/30 shrink-0">
              <span className="text-[#ff9cf4] text-[10px] font-headline tracking-widest uppercase">MIDI LOG</span>
              <button 
                onClick={() => midiService.clearLogs()}
                className="text-[#8eff71] text-[9px] font-headline tracking-widest uppercase hover:opacity-80 focus-visible:outline-none"
              >
                CLEAR LOG
              </button>
            </div>
            <div ref={logContainerRef} className="flex-1 overflow-y-auto p-4 space-y-2 text-[9px] font-mono text-[#8eff71]/80">
              {logs.length === 0 ? (
                <div className="text-center opacity-50 italic font-body">No messages</div>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="flex gap-2 leading-tight">
                    <span className="opacity-50">{(new Date(log.timestamp)).toISOString().substring(11, 23)}</span>
                    <span className="text-[#ff9cf4]">[{log.type}]</span>
                    {log.channel !== undefined && <span className="text-secondary">CH{log.channel}</span>}
                    <span>{formatLogData(log)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </nav>
      <div className="p-4 flex flex-col gap-4">
        <button
          onClick={handleSavePatch}
          className="w-full bg-primary text-on-primary py-3 font-headline text-xs font-bold tracking-widest active:opacity-80 transition-opacity cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-container-high"
        >
          SAVE_PATCH
        </button>
        <button
          onClick={handleLoadPatch}
          className="w-full bg-secondary text-on-secondary py-3 font-headline text-xs font-bold tracking-widest active:opacity-80 transition-opacity cursor-pointer border border-secondary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-container-high"
        >
          LOAD_PATCH
        </button>
        <a href="https://github.com/Chiptune-Anamnesis/ARDUINO-YM2149F" target="_blank" rel="noopener noreferrer" className="text-[#ff9cf4] opacity-60 font-headline text-xs uppercase tracking-widest cursor-pointer hover:text-[#8eff71] flex items-center gap-3 px-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-container-high rounded">
          <span aria-hidden="true" className="material-symbols-outlined text-lg">menu_book</span>
          <span>Docs</span>
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>
    </aside>
  );
}
