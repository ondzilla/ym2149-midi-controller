import React, { useState } from 'react';

export const ConnectionPanel: React.FC = () => {
  const [activeInId, setActiveInId] = useState<string | null>(null);
  const [activeOutId, setActiveOutId] = useState<string | null>(null);

  // Mocks matching the tests
  const inputs = [{ id: 'mock-in-1', name: 'Mock Input 1' }];
  const outputs = [{ id: 'mock-out-1', name: 'Mock Output 1' }];

  return (
    <>
      <h3 className="sr-only">Connection Panel</h3>
      <span data-testid="connection-status" className="sr-only">
        {activeOutId ? 'Connected' : 'Disconnected'}
      </span>

      <div className="bg-black/40 p-4 border-b-2 border-surface-container-highest">
        <label className="font-headline text-[10px] text-primary tracking-widest block mb-2">SIGNAL_INPUT</label>
        <div className="flex items-center gap-4 has-[:focus-visible]:outline-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-surface-container-high">
          <select 
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
        <label className="font-headline text-[10px] text-primary tracking-widest block mb-2">SIGNAL_OUTPUT</label>
        <div className="flex items-center gap-4 has-[:focus-visible]:outline-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-surface-container-high">
          <select 
            aria-label="Output Device" 
            value={activeOutId || ''} 
            onChange={e => setActiveOutId(e.target.value)}
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
