import React, { useEffect, useRef, useState } from 'react';
import { midiService } from '../services/midiService';
import { usePatchState } from '../hooks/usePatchState';

export const ThereminCam: React.FC = () => {
  const [globalChannel] = usePatchState('globalChannel', '1');
  const globalChannelRef = useRef(globalChannel);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [streamActive, setStreamActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    globalChannelRef.current = globalChannel;
  }, [globalChannel]);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let animationFrameId: number;
    let previousImageData: ImageData | null = null;
    let isMounted = true;

    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
        if (!isMounted) {
          // Unmounted before stream resolved, clean it up immediately
          mediaStream.getTracks().forEach(track => track.stop());
          return;
        }
        stream = mediaStream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setStreamActive(true);
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to access camera');
        }
        console.error('Theremin Cam Error:', err);
      }
    };

    const processFrame = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
        animationFrameId = requestAnimationFrame(processFrame);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw current video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const currentImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = currentImageData.data;

      if (previousImageData) {
        const prevData = previousImageData.data;
        let motionX = 0;
        let motionY = 0;
        let totalMotion = 0;

        // Compare current frame with previous frame
        for (let y = 0; y < canvas.height; y += 4) { // Sample every 4th pixel for performance
          for (let x = 0; x < canvas.width; x += 4) {
            const i = (y * canvas.width + x) * 4;

            // Calculate pixel difference (simplified to just red channel for speed, or average)
            const rDiff = Math.abs(data[i] - prevData[i]);
            const gDiff = Math.abs(data[i+1] - prevData[i+1]);
            const bDiff = Math.abs(data[i+2] - prevData[i+2]);

            const totalDiff = (rDiff + gDiff + bDiff) / 3;

            if (totalDiff > 30) { // Threshold for motion
              motionX += x;
              motionY += y;
              totalMotion++;
            }
          }
        }

        if (totalMotion > 50) { // Minimum motion threshold to trigger MIDI
          // Calculate center of mass of motion
          const centerX = motionX / totalMotion;
          const centerY = motionY / totalMotion;

          // Normalize to 0-1
          const normX = centerX / canvas.width;
          const normY = centerY / canvas.height;

          // Map to 0-127 MIDI range (invert Y so up is higher value)
          const cc1Value = Math.floor(normX * 127);
          const cc3Value = Math.floor((1 - normY) * 127);

          try {
            const ch = Number(globalChannelRef.current);
            // CC 1 (Detune)
            midiService.sendCC(ch, 1, Math.max(0, Math.min(127, cc1Value)));
            // CC 3 (Vibrato Amount)
            midiService.sendCC(ch, 3, Math.max(0, Math.min(127, cc3Value)));
          } catch (e) {
            console.warn('Theremin MIDI error', e);
          }
        }
      }

      previousImageData = currentImageData;
      animationFrameId = requestAnimationFrame(processFrame);
    };

    startCamera().then(() => {
      animationFrameId = requestAnimationFrame(processFrame);
    });

    return () => {
      isMounted = false;
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []); // Only run once on mount

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-surface-container-highest border border-outline p-2 rounded pointer-events-none opacity-50">
      <div className="text-[10px] text-primary mb-1 uppercase tracking-widest font-headline">Theremin Cam</div>
      {error ? (
        <div className="text-error text-[10px]">{error}</div>
      ) : (
        <div className="relative w-32 h-24 bg-black rounded overflow-hidden">
          <video
            ref={videoRef}
            width={320}
            height={240}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />
          <canvas
            ref={canvasRef}
            width={320}
            height={240}
            className="hidden"
          />
          {!streamActive && (
             <div className="absolute inset-0 flex items-center justify-center text-secondary text-[10px] animate-pulse">
               INITIALIZING...
             </div>
          )}
        </div>
      )}
    </div>
  );
};
