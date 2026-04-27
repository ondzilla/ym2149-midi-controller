export function RightOverlay() {
  return (
    <div className="hidden 2xl:flex fixed right-6 top-1/2 -translate-y-1/2 w-12 flex-col items-center gap-8 py-8 bg-[#32152f]/40 backdrop-blur-md border border-outline-variant/20 z-20 pointer-events-none">
      <div className="rotate-90 font-headline text-[9px] text-tertiary tracking-[0.5em] whitespace-nowrap opacity-60">SYSTEM_BUS_MONITOR</div>
      <div className="flex flex-col gap-2">
        <div className="w-2 h-8 bg-surface-container-lowest relative overflow-hidden"><div className="absolute bottom-0 w-full bg-primary h-3/4 animate-pulse"></div></div>
        <div className="w-2 h-8 bg-surface-container-lowest relative overflow-hidden"><div className="absolute bottom-0 w-full bg-secondary h-1/2"></div></div>
        <div className="w-2 h-8 bg-surface-container-lowest relative overflow-hidden"><div className="absolute bottom-0 w-full bg-tertiary h-1/4"></div></div>
      </div>
      <div className="w-1 h-32 bg-outline-variant/20 relative"><div className="absolute top-1/3 left-0 w-4 h-[2px] bg-primary -ml-1.5 shadow-[0_0_8px_#8eff71]"></div></div>
    </div>
  );
}
