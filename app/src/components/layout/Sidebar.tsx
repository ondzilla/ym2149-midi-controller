export function Sidebar() {
  return (
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
        <button disabled className="w-full bg-secondary text-on-secondary py-3 font-headline text-xs font-bold tracking-widest opacity-50 cursor-not-allowed border border-secondary/20">
          LOAD_PATCH
        </button>
        <a href="https://github.com/Chiptune-Anamnesis/ARDUINO-YM2149F" target="_blank" rel="noopener noreferrer" className="text-[#ff9cf4] opacity-60 font-headline text-xs uppercase tracking-widest cursor-pointer hover:text-[#8eff71] flex items-center gap-3 px-4 transition-colors">
          <span className="material-symbols-outlined text-lg">menu_book</span>
          <span>Docs</span>
        </a>
      </div>
    </aside>
  );
}
