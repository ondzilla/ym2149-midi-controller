import React, { useState, useEffect, useRef } from 'react';
import { midiService } from '../services/midiService';
import { presetManager } from '../services/presetManager';

const RESOLUTION_WIDTH = 64;
const RESOLUTION_HEIGHT = 48;
const PIXEL_THRESHOLD = 30; // Min difference to be considered motion
const MOTION_THRESHOLD = 50; // Min pixels changed to trigger an update

export const ThereminCam: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isSupported] = useState(() => !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia));
  const [cc1Value, setCc1Value] = useState(0);
  const [cc3Value, setCc3Value] = useState(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const prevFrameRef = useRef<Uint8ClampedArray | null>(null);
  const requestRef = useRef<number>(0);
  const lastSentRef = useRef<{ cc1: number, cc3: number }>({ cc1: -1, cc3: -1 });

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: RESOLUTION_WIDTH, height: RESOLUTION_HEIGHT } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setHasError(false);
      } catch (e) {
        console.error("Error accessing webcam:", e);
        setHasError(true);
        setIsActive(false);
      }
    };

    const stopCamera = () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      prevFrameRef.current = null;
    };

    if (isActive) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isActive]);

  useEffect(() => {
    if (!isActive) return;

    const processFrame = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
        requestRef.current = requestAnimationFrame(processFrame);
        return;
      }

      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, RESOLUTION_WIDTH, RESOLUTION_HEIGHT);
      const imageData = ctx.getImageData(0, 0, RESOLUTION_WIDTH, RESOLUTION_HEIGHT);
      const data = imageData.data;

      if (!prevFrameRef.current) {
        prevFrameRef.current = new Uint8ClampedArray(data);
        requestRef.current = requestAnimationFrame(processFrame);
        return;
      }

      let motionCount = 0;
      let sumX = 0;
      let sumY = 0;

      const prevData = prevFrameRef.current;

      // Check pixel differences
      for (let y = 0; y < RESOLUTION_HEIGHT; y++) {
        for (let x = 0; x < RESOLUTION_WIDTH; x++) {
          const i = (y * RESOLUTION_WIDTH + x) * 4;

          const rDiff = Math.abs(data[i] - prevData[i]);
          const gDiff = Math.abs(data[i+1] - prevData[i+1]);
          const bDiff = Math.abs(data[i+2] - prevData[i+2]);

          if (rDiff > PIXEL_THRESHOLD || gDiff > PIXEL_THRESHOLD || bDiff > PIXEL_THRESHOLD) {
            motionCount++;
            sumX += x;
            sumY += y;
          }
        }
      }

      // Store current frame for next comparison
      prevFrameRef.current.set(data);

      if (motionCount > MOTION_THRESHOLD) {
        const centerX = sumX / motionCount;
        const centerY = sumY / motionCount;

        // Map X to 0-127 (CC 1)
        const newCc1 = Math.floor((centerX / RESOLUTION_WIDTH) * 127);
        // Map Y to 0-127 (CC 3) - Y is 0 at top, so maybe invert it or just map it directly.
        const newCc3 = Math.floor((1 - (centerY / RESOLUTION_HEIGHT)) * 127);

        const globalChannel = Number(presetManager.getValue('globalChannel') || 1);

        if (newCc1 !== lastSentRef.current.cc1) {
          try { midiService.sendCC(globalChannel, 1, newCc1); } catch (e) { console.warn(e); }
          lastSentRef.current.cc1 = newCc1;
          setCc1Value(newCc1);
        }

        if (newCc3 !== lastSentRef.current.cc3) {
          try { midiService.sendCC(globalChannel, 3, newCc3); } catch (e) { console.warn(e); }
          lastSentRef.current.cc3 = newCc3;
          setCc3Value(newCc3);
        }
      } else {
         // Gradually drop values to 0 if no motion
         let { cc1, cc3 } = lastSentRef.current;
         let changed = false;

         if (cc1 > 0) { cc1 = Math.max(0, cc1 - 5); changed = true; }
         if (cc3 > 0) { cc3 = Math.max(0, cc3 - 5); changed = true; }

         if (changed) {
            const globalChannel = Number(presetManager.getValue('globalChannel') || 1);
            if (cc1 !== lastSentRef.current.cc1) {
              try { midiService.sendCC(globalChannel, 1, cc1); } catch (e) { console.warn(e); }
              lastSentRef.current.cc1 = cc1;
              setCc1Value(cc1);
            }
            if (cc3 !== lastSentRef.current.cc3) {
              try { midiService.sendCC(globalChannel, 3, cc3); } catch (e) { console.warn(e); }
              lastSentRef.current.cc3 = cc3;
              setCc3Value(cc3);
            }
         }
      }

      requestRef.current = requestAnimationFrame(processFrame);
    };

    requestRef.current = requestAnimationFrame(processFrame);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isActive]);

  const toggleListening = () => {
    setIsActive(prev => !prev);
  };

  if (!isSupported) {
    return (
      <div className="fixed bottom-4 right-72 bg-surface-container-high border border-outline p-4 shadow-lg z-50 pointer-events-none">
        <p className="font-headline text-[10px] text-error">THEREMIN_CAM: NOT_SUPPORTED</p>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-72 bg-surface-container-high border border-[#32152f] p-4 shadow-lg z-50 w-64">
      {/* Hidden elements for processing */}
      <video ref={videoRef} width={RESOLUTION_WIDTH} height={RESOLUTION_HEIGHT} className="hidden" muted playsInline />
      <canvas ref={canvasRef} width={RESOLUTION_WIDTH} height={RESOLUTION_HEIGHT} className="hidden" />

      <div className="flex justify-between items-center mb-4">
        <h3 className="font-headline text-xs tracking-widest text-tertiary">THEREMIN_CAM</h3>
        <button
          onClick={toggleListening}
          className={`material-symbols-outlined rounded p-1 transition-colors ${
            isActive ? 'text-primary animate-pulse shadow-[0_0_8px_var(--primary)]' : 'text-primary opacity-60 hover:opacity-100'
          }`}
          aria-label={isActive ? 'Stop Theremin Cam' : 'Start Theremin Cam'}
          title={isActive ? 'Stop Theremin Cam' : 'Start Theremin Cam'}
        >
          {isActive ? 'videocam' : 'videocam_off'}
        </button>
      </div>

      {hasError && (
        <p className="font-headline text-[10px] text-error mb-2">CAMERA_ACCESS_DENIED</p>
      )}

      <div className="space-y-2">
        <div className="bg-black/40 p-2 border border-surface-container-highest">
          <p className="font-headline text-[9px] text-tertiary opacity-60">X-AXIS (CC 1 - DETUNE)</p>
          <div className="w-full bg-surface-container-highest h-2 mt-1 relative">
            <div className="absolute top-0 left-0 h-full bg-secondary transition-all" style={{ width: `${(cc1Value / 127) * 100}%` }}></div>
          </div>
          <p className="font-body text-xs mt-1 text-right text-on-surface">{cc1Value}</p>
        </div>

        <div className="bg-black/40 p-2 border border-surface-container-highest">
          <p className="font-headline text-[9px] text-tertiary opacity-60">Y-AXIS (CC 3 - VIBRATO)</p>
          <div className="w-full bg-surface-container-highest h-2 mt-1 relative">
            <div className="absolute top-0 left-0 h-full bg-primary transition-all" style={{ width: `${(cc3Value / 127) * 100}%` }}></div>
          </div>
          <p className="font-body text-xs mt-1 text-right text-on-surface">{cc3Value}</p>
        </div>
      </div>
    </div>
  );
};
