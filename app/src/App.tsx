import './index.css';
import { ConnectionPanel } from './components/ConnectionPanel';
import { GlobalSettings } from './components/GlobalSettings';
import { SynthControls, VibratoLFO } from './components/SynthControls';
import { Arpeggiator } from './components/Arpeggiator';
import { DrumPads } from './components/DrumPads';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { Footer } from './components/layout/Footer';
import { RightOverlay } from './components/layout/RightOverlay';
import { BackgroundTraces } from './components/layout/BackgroundTraces';

export default function App() {
  return (
    <div className="bg-background text-on-background font-body selection:bg-primary selection:text-on-primary min-h-screen flex">
      {/* SIDE NAVIGATION */}
      <Sidebar />

      {/* MAIN CONTENT CANVAS */}
      <main className="lg:ml-64 flex-1 flex flex-col h-screen overflow-y-auto overflow-x-hidden relative">
        {/* TOP APP BAR */}
        <TopBar />

        {/* PCB INTERFACE GRID */}
        <div className="p-8 grid grid-cols-12 gap-8 relative max-w-[1800px] w-full">
          {/* BACKGROUND TRACES */}
          <BackgroundTraces />

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
        <Footer />
      </main>

      {/* RIGHT OVERLAY */}
      <RightOverlay />
    </div>
  );
}
