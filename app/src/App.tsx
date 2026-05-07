import { useState } from 'react';
import './index.css';
import { SynthControls, VibratoLFO } from './components/SynthControls';
import { Arpeggiator } from './components/Arpeggiator';
import { DrumPads } from './components/DrumPads';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { Footer } from './components/layout/Footer';
import { RightOverlay } from './components/layout/RightOverlay';
import { BackgroundTraces } from './components/layout/BackgroundTraces';
import { GamepadController } from './components/GamepadController';
import { VoiceController } from './components/VoiceController';
import { ThereminCam } from './components/ThereminCam';
import { SettingsOverlay } from './components/layout/SettingsOverlay';
import { usePatchState } from './hooks/usePatchState';

export default function App() {
  const [experimentalGamepad] = usePatchState('experimentalGamepad', false);
  const [experimentalVoiceControl] = usePatchState('experimentalVoiceControl', false);
  const [experimentalThereminCam] = usePatchState('experimentalThereminCam', false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="bg-background text-on-background font-body selection:bg-primary selection:text-on-primary min-h-screen flex">
      {experimentalGamepad && <GamepadController />}
      {experimentalVoiceControl && <VoiceController />}
      {experimentalThereminCam && <ThereminCam />}

      <SettingsOverlay
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* SIDE NAVIGATION */}
      <Sidebar />

      {/* MAIN CONTENT CANVAS */}
      <main className="lg:ml-64 flex-1 flex flex-col h-screen overflow-y-auto overflow-x-hidden relative">
        {/* TOP APP BAR */}
        <TopBar onOpenSettings={() => setIsSettingsOpen(true)} />

        {/* PCB INTERFACE GRID */}
        <div className="p-8 grid grid-cols-12 gap-8 relative max-w-[1800px] w-full">
          {/* BACKGROUND TRACES */}
          <BackgroundTraces />

          <div className="col-span-12">
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
