export function BackgroundTraces() {
  return (
    <div className="absolute inset-0 pointer-events-none opacity-20 hidden lg:block">
      <div className="trace-line-h absolute top-1/4 left-0 w-full"></div>
      <div className="trace-line-h absolute top-3/4 left-0 w-full"></div>
      <div className="trace-line-v absolute left-1/3 top-0 h-full"></div>
      <div className="trace-line-v absolute left-2/3 top-0 h-full"></div>
    </div>
  );
}
