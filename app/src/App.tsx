import './index.css';
import { ConnectionPanel } from './components/ConnectionPanel';
import { GlobalSettings } from './components/GlobalSettings';
import { SynthControls, VibratoLFO } from './components/SynthControls';
import { Arpeggiator } from './components/Arpeggiator';
import { DrumPads } from './components/DrumPads';

export default function App() {
  return (
    <div className="bg-background text-on-background font-body selection:bg-primary selection:text-on-primary min-h-screen flex">
      {/* SIDE NAVIGATION */}
      <aside className="fixed left-0 top-0 h-full flex flex-col z-40 bg-[#1b061a] border-r border-[#32152f] w-64 hidden lg:flex">
        <div className="p-6">
          <div className="text-[#ff9cf4] text-sm font-black font-headline tracking-widest uppercase mb-1">ENGINE_v1.0</div>
          <div className="text-[#8eff71] text-[10px] font-headline tracking-[0.2em] font-bold">SIGNAL_LOCKED</div>
        </div>
        <nav className="flex-1 mt-4">
          <div className="text-[#8eff71] border-l-4 border-[#8eff71] pl-4 py-3 bg-[#32152f] font-headline text-xs uppercase tracking-widest cursor-pointer mb-1 transition-transform active:scale-[0.97]">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-lg">settings_input_component</span>
              <span>Oscillators</span>
            </div>
          </div>
          <div className="text-[#ff9cf4] border-l-4 border-transparent pl-4 py-3 opacity-60 font-headline text-xs uppercase tracking-widest cursor-pointer hover:bg-[#32152f] hover:text-[#8eff71] transition-all mb-1">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-lg">waves</span>
              <span>Envelopes</span>
            </div>
          </div>
          <div className="text-[#ff9cf4] border-l-4 border-transparent pl-4 py-3 opacity-60 font-headline text-xs uppercase tracking-widest cursor-pointer hover:bg-[#32152f] hover:text-[#8eff71] transition-all mb-1">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-lg">tune</span>
              <span>Mixer</span>
            </div>
          </div>
          <div className="text-[#ff9cf4] border-l-4 border-transparent pl-4 py-3 opacity-60 font-headline text-xs uppercase tracking-widest cursor-pointer hover:bg-[#32152f] hover:text-[#8eff71] transition-all mb-1">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-lg">grid_view</span>
              <span>Matrix</span>
            </div>
          </div>
        </nav>
        <div className="p-4 flex flex-col gap-4">
          <button className="w-full bg-primary text-on-primary py-3 font-headline text-xs font-bold tracking-widest active:opacity-80 transition-opacity">
            SAVE_PATCH
          </button>
          <a href="https://github.com/Chiptune-Anamnesis/ARDUINO-YM2149F" target="_blank" rel="noopener noreferrer" className="text-[#ff9cf4] opacity-60 font-headline text-xs uppercase tracking-widest cursor-pointer hover:text-[#8eff71] flex items-center gap-3 px-4 transition-colors">
            <span className="material-symbols-outlined text-lg">menu_book</span>
            <span>Docs</span>
          </a>
        </div>
      </aside>

      {/* MAIN CONTENT CANVAS */}
      <main className="lg:ml-64 flex-1 flex flex-col h-screen overflow-y-auto overflow-x-hidden relative">
        {/* TOP APP BAR */}
        <header className="flex justify-between items-center w-full px-8 py-4 bg-[#1b061a] sticky top-0 z-30 border-b border-[#32152f]">
          <div className="font-headline tracking-tighter uppercase text-xl font-bold text-[#8eff71]">
            YM2149_SYNTH_CORE
          </div>
          <div className="flex items-center gap-6">
            <div className="flex gap-4">
              <span className="material-symbols-outlined text-[#ff9cf4] opacity-70 cursor-pointer hover:text-[#8eff71] transition-colors">settings</span>
              <span className="material-symbols-outlined text-[#ff9cf4] opacity-70 cursor-pointer hover:text-[#8eff71] transition-colors">power_settings_new</span>
            </div>
            <div className="flex items-center gap-2 border-l border-[#32152f] pl-6">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_#8eff71]"></div>
              <span className="font-headline text-[10px] tracking-widest text-primary hidden sm:inline">CORE_ACTIVE</span>
            </div>
          </div>
        </header>

        {/* PCB INTERFACE GRID */}
        <div className="p-8 grid grid-cols-12 gap-8 relative max-w-[1800px] w-full">
          {/* BACKGROUND TRACES */}
          <div className="absolute inset-0 pointer-events-none opacity-20 hidden lg:block">
            <div className="trace-line-h absolute top-1/4 left-0 w-full"></div>
            <div className="trace-line-h absolute top-3/4 left-0 w-full"></div>
            <div className="trace-line-v absolute left-1/3 top-0 h-full"></div>
            <div className="trace-line-v absolute left-2/3 top-0 h-full"></div>
          </div>

          <section className="col-span-12 lg:col-span-4 bg-surface-container-high relative p-6 solder-point solder-tl solder-tr solder-bl solder-br border border-[#32152f] flex flex-col justify-center">
            <h2 className="font-headline text-xs tracking-[0.3em] text-tertiary mb-8 uppercase">I/O_INTERFACE_PORT</h2>
            <div className="space-y-6">
              <ConnectionPanel />
              <GlobalSettings />
            </div>
          </section>

          <div className="col-span-12 lg:col-span-8">
            <SynthControls />
          </div>

          <div className="col-span-12 xl:col-span-6">
            <Arpeggiator />
          </div>

          <div className="col-span-12 xl:col-span-6">
            <VibratoLFO />
          </div>

          <div className="col-span-12">
            <DrumPads />
          </div>
        </div>

        {/* FOOTER */}
        <footer className="mt-auto p-8 flex justify-between items-end border-t border-[#32152f] z-10 bg-[#1b061a]">
          <div className="space-y-1">
            <div className="font-headline text-[9px] text-tertiary opacity-40 tracking-[0.4em] uppercase">MANUFACTURED_BY_Y_CORP</div>
            <div className="font-headline text-[9px] text-tertiary opacity-40 tracking-[0.4em] uppercase hidden sm:block">DESIGN_SPEC_REVISION_3.4.0</div>
          </div>
          <div className="flex gap-4 sm:gap-12">
            <div className="flex flex-col items-end">
              <span className="font-headline text-[10px] text-secondary tracking-widest mb-1">VOLTAGE_STABILITY</span>
              <span className="font-headline text-lg font-bold text-secondary">99.87%</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="font-headline text-[10px] text-primary tracking-widest mb-1">TEMP_SENSOR</span>
              <span className="font-headline text-lg font-bold text-primary">32.4°C</span>
            </div>
          </div>
        </footer>
      </main>

      {/* RIGHT OVERLAY */}
      <div className="hidden 2xl:flex fixed right-6 top-1/2 -translate-y-1/2 w-12 flex-col items-center gap-8 py-8 bg-[#32152f]/40 backdrop-blur-md border border-outline-variant/20 z-20 pointer-events-none">
        <div className="rotate-90 font-headline text-[9px] text-tertiary tracking-[0.5em] whitespace-nowrap opacity-60">SYSTEM_BUS_MONITOR</div>
        <div className="flex flex-col gap-2">
          <div className="w-2 h-8 bg-surface-container-lowest relative overflow-hidden"><div className="absolute bottom-0 w-full bg-primary h-3/4 animate-pulse"></div></div>
          <div className="w-2 h-8 bg-surface-container-lowest relative overflow-hidden"><div className="absolute bottom-0 w-full bg-secondary h-1/2"></div></div>
          <div className="w-2 h-8 bg-surface-container-lowest relative overflow-hidden"><div className="absolute bottom-0 w-full bg-tertiary h-1/4"></div></div>
        </div>
        <div className="w-1 h-32 bg-outline-variant/20 relative"><div className="absolute top-1/3 left-0 w-4 h-[2px] bg-primary -ml-1.5 shadow-[0_0_8px_#8eff71]"></div></div>
      </div>
    </div>
  );
}
