export function Footer() {
  return (
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
  );
}
