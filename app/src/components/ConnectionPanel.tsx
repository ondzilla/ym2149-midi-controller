import React, { useState, useEffect } from 'react';
import { midiService } from '../services/midiService';

export const ConnectionPanel: React.FC = () => {
  const [activeInId, setActiveInId] = useState<string | null>(null);
  const [activeOutId, setActiveOutId] = useState<string | null>(midiService.outputDevice?.id || null);
  const [inputs, setInputs] = useState<MIDIInput[]>(midiService.inputs);
  const [outputs, setOutputs] = useState<MIDIOutput[]>(midiService.outputs);

  useEffect(() => {
    // Subscribe to changes
    const unsubscribe = midiService.subscribe(() => {
      setInputs(midiService.inputs);
      setOutputs(midiService.outputs);
      if (midiService.outputDevice) {
        setActiveOutId(midiService.outputDevice.id);
      } else {
        setActiveOutId(null);
      }
    });

    return unsubscribe;
  }, []);

  const handleOutputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setActiveOutId(val);
    midiService.setOutputDevice(val);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="sr-only">Connection Panel</h3>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${activeOutId ? 'bg-primary shadow-[0_0_8px_#8eff71]' : 'bg-error shadow-[0_0_8px_#ff5449]'}`}></div>
          <span data-testid="connection-status" className={`font-headline text-[10px] tracking-widest ${activeOutId ? 'text-primary' : 'text-error'}`}>
            {activeOutId ? 'CONNECTED' : 'DISCONNECTED'}
          </span>
        </div>
      </div>

      <div className="bg-black/40 p-4 border-b-2 border-surface-container-highest">
        <label htmlFor="signal-input" className="font-headline text-[10px] text-primary tracking-widest block mb-2">SIGNAL_INPUT</label>
        <div className="flex items-center gap-4 has-[:focus-visible]:outline-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-surface-container-high">
          <select 
            id="signal-input"
            aria-label="Input Device" 
            value={activeInId || ''} 
            onChange={e => setActiveInId(e.target.value)}
            className="flex-1 bg-surface-container-lowest text-primary text-xs font-headline border-none ring-0 outline-none p-1 placeholder-opacity-50 cursor-pointer"
          >
            <option value="">None</option>
            {inputs.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-black/40 p-4 border-b-2 border-surface-container-highest">
        <label htmlFor="signal-output" className="font-headline text-[10px] text-primary tracking-widest block mb-2">SIGNAL_OUTPUT</label>
        <div className="flex items-center gap-4 has-[:focus-visible]:outline-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-surface-container-high">
          <select 
            id="signal-output"
            aria-label="Output Device" 
            value={activeOutId || ''} 
            onChange={handleOutputChange}
            className="flex-1 bg-surface-container-lowest text-secondary text-xs font-headline border-none ring-0 outline-none p-1 placeholder-opacity-50 cursor-pointer"
          >
            <option value="">None</option>
            {outputs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
        </div>
      </div>
    </>
  );
};
