import React, { useRef, useEffect, useState } from 'react';
import { midiService } from '../services/midiService';
import { presetManager } from '../services/presetManager';

const CANVAS_WIDTH = 512;
const CANVAS_HEIGHT = 128;
const PLAYHEAD_SPEED = 2; // Pixels per frame

export const MidiPaint: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isActive, setIsActive] = useState(true);
  const isDrawingRef = useRef(false);
  const lastDrawPosRef = useRef<{ x: number, y: number } | null>(null);

  const playheadXRef = useRef(0);
  const requestRef = useRef<number>(0);
  const activeNotesRef = useRef<Map<number, number>>(new Map()); // Note -> Velocity

  // Handle Playback Loop
  useEffect(() => {
    const currentNotesRef = activeNotesRef.current;

    if (!isActive) {
      // Send note off for all currently playing notes
      const globalChannel = Number(presetManager.getValue('globalChannel') || 1);
      currentNotesRef.forEach((_, note) => {
        try { midiService.sendNoteOff(globalChannel, note, 0); } catch (e) { console.warn(e); }
      });
      currentNotesRef.clear();
      return;
    }

    const processFrame = () => {
      const canvas = canvasRef.current;
      if (!canvas) {
        requestRef.current = requestAnimationFrame(processFrame);
        return;
      }

      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      // Draw the playhead visually
      // Wait, we don't want to draw the playhead onto the same canvas because getImageData would read it!
      // The component should probably render a second canvas or a div for the playhead overlay.

      const x = Math.floor(playheadXRef.current);

      // Read a 1px vertical column at the playhead
      const imageData = ctx.getImageData(x, 0, 1, CANVAS_HEIGHT);
      const data = imageData.data;

      const currentNotes = new Map<number, number>();

      for (let y = 0; y < CANVAS_HEIGHT; y++) {
        // data is [R, G, B, A]
        const i = y * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        if (a > 0) {
          // Calculate brightness (simple average) as velocity
          const brightness = Math.floor((r + g + b) / 3);
          const velocity = Math.max(1, Math.floor((brightness / 255) * 127));

          // Map Y to MIDI Note (0-127). Y=0 is top (higher pitch), Y=127 is bottom (lower pitch)
          // To ensure it stays within valid bounds:
          const note = Math.max(0, Math.min(127, 127 - y));

          currentNotes.set(note, velocity);
        }
      }

      const globalChannel = Number(presetManager.getValue('globalChannel') || 1);

      // Notes to turn on
      currentNotes.forEach((velocity, note) => {
        if (!activeNotesRef.current.has(note)) {
          try { midiService.sendNoteOn(globalChannel, note, velocity); } catch (e) { console.warn(e); }
          activeNotesRef.current.set(note, velocity);
        } else {
            // Note already playing, maybe velocity changed, but typically we don't send continuous NoteOn
            // Could send Polyphonic Aftertouch, but keeping it simple for now.
        }
      });

      // Notes to turn off
      activeNotesRef.current.forEach((velocity, note) => {
        if (!currentNotes.has(note)) {
          try { midiService.sendNoteOff(globalChannel, note, 0); } catch (e) { console.warn(e); }
          activeNotesRef.current.delete(note);
        }
      });

      // Advance playhead
      playheadXRef.current = (playheadXRef.current + PLAYHEAD_SPEED) % CANVAS_WIDTH;

      // Force React update for playhead overlay position if needed,
      // but modifying DOM directly might be smoother
      if (containerRef.current) {
         const playheadElement = containerRef.current.querySelector('.playhead-line') as HTMLElement;
         if (playheadElement) {
             playheadElement.style.transform = `translateX(${playheadXRef.current}px)`;
         }
      }

      requestRef.current = requestAnimationFrame(processFrame);
    };

    requestRef.current = requestAnimationFrame(processFrame);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }

      // Cleanup notes
      const globalChannel = Number(presetManager.getValue('globalChannel') || 1);
      currentNotesRef.forEach((_, note) => {
        try { midiService.sendNoteOff(globalChannel, note, 0); } catch (e) { console.warn(e); }
      });
      currentNotesRef.clear();
    };
  }, [isActive]);


  const getPointerPos = (e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    isDrawingRef.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    const pos = getPointerPos(e);
    lastDrawPosRef.current = pos;
    drawDot(pos.x, pos.y);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawingRef.current) return;

    const pos = getPointerPos(e);
    if (lastDrawPosRef.current) {
        drawLine(lastDrawPosRef.current.x, lastDrawPosRef.current.y, pos.x, pos.y);
    }
    lastDrawPosRef.current = pos;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDrawingRef.current = false;
    lastDrawPosRef.current = null;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const drawDot = (x: number, y: number) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      ctx.fillStyle = '#ff9cf4'; // Using tertiary color for neon aesthetic
      ctx.shadowColor = '#ff9cf4';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
  };

  const drawLine = (x1: number, y1: number, x2: number, y2: number) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      ctx.strokeStyle = '#ff9cf4';
      ctx.shadowColor = '#ff9cf4';
      ctx.shadowBlur = 10;
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
  };

  const clearCanvas = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  };

  const togglePlayback = () => {
      setIsActive(prev => !prev);
  };

  return (
    <div className="bg-surface-container-high border border-[#32152f] p-6 relative solder-point solder-tl solder-tr solder-bl solder-br flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-headline text-xs tracking-widest text-tertiary">MIDI_PAINT [EXPERIMENTAL]</h3>
        <div className="flex gap-4">
            <button
                onClick={clearCanvas}
                className="font-headline text-[10px] text-tertiary opacity-60 hover:opacity-100 transition-opacity uppercase"
            >
                Clear
            </button>
            <button
            onClick={togglePlayback}
            aria-pressed={isActive}
            className={`rounded p-1 transition-colors ${
                isActive ? 'text-primary animate-pulse shadow-[0_0_8px_var(--primary)]' : 'text-primary opacity-60 hover:opacity-100'
            }`}
            aria-label={isActive ? 'Stop Playback' : 'Start Playback'}
            title={isActive ? 'Stop Playback' : 'Start Playback'}
            >
            <span className="material-symbols-outlined" aria-hidden="true">
                {isActive ? 'stop' : 'play_arrow'}
            </span>
            </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="w-full relative bg-black/40 border border-surface-container-highest cursor-crosshair overflow-hidden"
        style={{ aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}` }}
      >
          {/* Drawing Canvas */}
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="w-full h-full block absolute inset-0 touch-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          />

          {/* Playhead Overlay */}
          <div
            className="playhead-line absolute top-0 bottom-0 left-0 w-0.5 bg-primary shadow-[0_0_8px_var(--primary)] pointer-events-none z-10"
            style={{
                transform: 'translateX(0px)',
                width: `${(1 / CANVAS_WIDTH) * 100}%`,
                // Make visual width slightly larger but accurate
                borderLeft: '1px solid rgba(142, 255, 113, 0.8)'
            }}
          />

          {/* Guidelines */}
          <div className="absolute inset-0 pointer-events-none opacity-20 flex flex-col justify-between">
              {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-full h-px bg-tertiary"></div>
              ))}
          </div>
      </div>

      <p className="font-headline text-[9px] text-tertiary opacity-60 mt-4 text-center">
        DRAW STROKES TO GENERATE MIDI NOTES. Y-AXIS = PITCH, X-AXIS = TIME.
      </p>
    </div>
  );
};
