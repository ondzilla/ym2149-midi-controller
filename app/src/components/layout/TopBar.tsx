import { midiService } from '../../services/midiService';

export function TopBar() {
  const handlePanic = () => {
    try {
      // Send All Notes Off (CC 123) to all 16 MIDI channels
      for (let i = 1; i <= 16; i++) {
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
        <div className="flex gap-4">
          <button
            type="button"
            aria-label="Settings"
            className="material-symbols-outlined text-[#ff9cf4] opacity-70 cursor-pointer hover:text-[#8eff71] focus-visible:text-[#8eff71] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded transition-colors"
          >
            settings
          </button>
          <button
            type="button"
            aria-label="All Notes Off (Panic)"
            onClick={handlePanic}
            className="material-symbols-outlined text-[#ff9cf4] opacity-70 cursor-pointer hover:text-[#8eff71] focus-visible:text-[#8eff71] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded transition-colors"
          >
            power_settings_new
          </button>
        </div>
        <div className="flex items-center gap-2 border-l border-[#32152f] pl-6">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_#8eff71]"></div>
          <span className="font-headline text-[10px] tracking-widest text-primary hidden sm:inline">CORE_ACTIVE</span>
        </div>
      </div>
    </header>
  );
}
