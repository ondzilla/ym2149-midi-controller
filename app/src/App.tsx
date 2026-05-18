import { useState } from 'react';
import './index.css';
import { SynthControls, VibratoLFO } from './components/SynthControls';
import { Arpeggiator } from './components/Arpeggiator';
import { XYPad } from './components/XYPad';
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
import { QwertyKeyboard } from './components/QwertyKeyboard';
import { MidiPaint } from './components/MidiPaint';
import { DrumSequencer } from './components/DrumSequencer';
import { usePatchState } from './hooks/usePatchState';
import { localAudioService } from './services/localAudioService';
import { useEffect } from 'react';

export default function App() {
  const [experimentalGamepad] = usePatchState('experimentalGamepad', false);
  const [experimentalVoiceControl] = usePatchState('experimentalVoiceControl', false);
  const [experimentalThereminCam] = usePatchState('experimentalThereminCam', false);
  const [experimentalQwertyPiano] = usePatchState('experimentalQwertyPiano', false);
  const [experimentalMidiPaint] = usePatchState('experimentalMidiPaint', false);
  const [experimentalDrumSequencer] = usePatchState('experimentalDrumSequencer', false);
  const [experimentalLocalAudio] = usePatchState('experimentalLocalAudio', false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    if (experimentalLocalAudio) {
        localAudioService.initialize();
        
        // Auto-resume audio context if suspended, which requires a user gesture
        const resumeCtx = () => {
            // @ts-ignore - reaching into service internals for convenience
            if (localAudioService.ctx?.state === 'suspended') {
                // @ts-ignore
                localAudioService.ctx.resume();
            }
        };
        
        window.addEventListener('click', resumeCtx);
        window.addEventListener('keydown', resumeCtx);
        
        return () => {
            window.removeEventListener('click', resumeCtx);
            window.removeEventListener('keydown', resumeCtx);
        };
    } else {
        localAudioService.shutdown();
    }
  }, [experimentalLocalAudio]);

  return (
    <div className="bg-background text-on-background font-body selection:bg-primary selection:text-on-primary min-h-screen flex">
      {experimentalGamepad && <GamepadController />}
      {experimentalVoiceControl && <VoiceController />}
      {experimentalQwertyPiano && <QwertyKeyboard />}

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
            <XYPad />
          </div>

          <div className="col-span-12 xl:col-span-6">
            <VibratoLFO />
          </div>

          <div className="col-span-12 xl:col-span-6">
            <Arpeggiator />
          </div>

          {experimentalThereminCam && (
            <div className="col-span-12">
              <ThereminCam />
            </div>
          )}

          {experimentalMidiPaint && (
            <div className="col-span-12">
              <MidiPaint />
            </div>
          )}

          {experimentalDrumSequencer && (
            <div className="col-span-12">
              <DrumSequencer />
            </div>
          )}

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
