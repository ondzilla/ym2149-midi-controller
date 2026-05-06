import React, { useRef, useState, useEffect } from 'react';
import { usePatchState } from '../hooks/usePatchState';
import { midiService } from '../services/midiService';
import { percentageToMidi } from '../utils/mathUtils';

interface VisualEnvelopeEditorProps {
  activeChannel: number;
}

export const VisualEnvelopeEditor: React.FC<VisualEnvelopeEditorProps> = ({ activeChannel }) => {
  const [attack, setAttack] = usePatchState('attack', '20', (val) => {
    try { midiService.sendCC(activeChannel, 12, percentageToMidi(Number(val))); } catch (e) { console.warn('MIDI error', e); }
  });

  const [decay, setDecay] = usePatchState('decay', '50', (val) => {
    try { midiService.sendCC(activeChannel, 11, percentageToMidi(Number(val))); } catch (e) { console.warn('MIDI error', e); }
  });

  const svgRef = useRef<SVGSVGElement>(null);
  const [draggingNode, setDraggingNode] = useState<'attack' | 'decay' | null>(null);

  // Store the latest state in refs to avoid capturing stale closures in event listeners
  // and triggering re-binds on every state update (60fps during dragging).
  const attackRef = useRef(attack);
  const decayRef = useRef(decay);

  useEffect(() => {
    attackRef.current = attack;
  }, [attack]);

  useEffect(() => {
    decayRef.current = decay;
  }, [decay]);

  const getPercentageFromMouseEvent = (e: MouseEvent | TouchEvent) => {
    if (!svgRef.current) return 0;

    let clientX;
    if (window.TouchEvent && e instanceof TouchEvent) {
      clientX = e.touches[0].clientX;
    } else {
      clientX = (e as MouseEvent).clientX;
    }

    const rect = svgRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    return Math.round((x / rect.width) * 100);
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!draggingNode) return;

      const percentage = getPercentageFromMouseEvent(e);
      if (draggingNode === 'attack') {
        // Prevent attack from passing decay
        const maxAttack = Math.max(0, Number(decayRef.current) - 1);
        setAttack(Math.min(percentage, maxAttack).toString());
      } else if (draggingNode === 'decay') {
        // Prevent decay from going below attack
        const minDecay = Math.min(100, Number(attackRef.current) + 1);
        setDecay(Math.max(percentage, minDecay).toString());
      }
    };

    const handleUp = () => {
      setDraggingNode(null);
    };

    if (draggingNode) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleUp);
      window.addEventListener('touchmove', handleMove, { passive: false });
      window.addEventListener('touchend', handleUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, [draggingNode, setAttack, setDecay]);

  // Points mapped from 0-100 logic onto an SVG with viewBox "0 0 100 100"
  // Start point (0, 100) -> bottom left
  // Attack point (attack, 0) -> peak
  // Decay end point (decay, 100) -> bottom right
  const attackX = Number(attack);
  const decayX = Number(decay);

  return (
    <div className="col-span-2 space-y-4">
      <div
        className="h-48 bg-surface-container-lowest relative p-1 group overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-surface-container-high"
      >
        <svg
          ref={svgRef}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="w-full h-full cursor-crosshair overflow-visible touch-none"
          onClick={(e) => {
            // allow clicking to snap nearest node
            if (!svgRef.current) return;
            const rect = svgRef.current.getBoundingClientRect();
            const clickX = ((e.clientX - rect.left) / rect.width) * 100;
            if (Math.abs(clickX - attackX) < Math.abs(clickX - decayX)) {
              setAttack(Math.round(clickX).toString());
            } else {
              setDecay(Math.round(clickX).toString());
            }
          }}
        >
          {/* Grid/Background */}
          <line x1="25" y1="0" x2="25" y2="100" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          <line x1="75" y1="0" x2="75" y2="100" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

          {/* Envelope Fill */}
          <path
            d={`M 0 100 L ${attackX} 0 L ${decayX} 100 Z`}
            fill="rgba(142, 255, 113, 0.2)"
            className="group-hover:fill-[rgba(142,255,113,0.3)] transition-colors"
          />

          {/* Envelope Line */}
          <path
            d={`M 0 100 L ${attackX} 0 L ${decayX} 100`}
            fill="none"
            stroke="#8eff71"
            strokeWidth="2"
            className="drop-shadow-[0_0_4px_#8eff71]"
          />

          {/* Attack Node */}
          <circle
            cx={attackX}
            cy="0"
            r="4"
            fill="#8eff71"
            className={`cursor-grab ${draggingNode === 'attack' ? 'cursor-grabbing scale-150' : 'hover:scale-125'} transition-transform origin-center`}
            style={{ transformOrigin: `${attackX}px 0px` }}
            onMouseDown={(e) => { e.stopPropagation(); setDraggingNode('attack'); }}
            onTouchStart={(e) => { e.stopPropagation(); setDraggingNode('attack'); }}
          />

          {/* Decay Node */}
          <circle
            cx={decayX}
            cy="100"
            r="4"
            fill="#8eff71"
            className={`cursor-grab ${draggingNode === 'decay' ? 'cursor-grabbing scale-150' : 'hover:scale-125'} transition-transform origin-center`}
            style={{ transformOrigin: `${decayX}px 100px` }}
            onMouseDown={(e) => { e.stopPropagation(); setDraggingNode('decay'); }}
            onTouchStart={(e) => { e.stopPropagation(); setDraggingNode('decay'); }}
          />
        </svg>

        {/* Visually hidden inputs for accessibility and testing */}
        <input
          type="range"
          min="0"
          max="100"
          aria-label="Attack"
          value={attack}
          onChange={(e) => setAttack(e.target.value)}
          className="sr-only"
        />
        <input
          type="range"
          min="0"
          max="100"
          aria-label="Decay"
          value={decay}
          onChange={(e) => setDecay(e.target.value)}
          className="sr-only"
        />
      </div>

      <div className="flex justify-between px-2">
        <div className="text-left">
          <div className="font-headline text-[10px] text-secondary">{attack}ms</div>
          <div className="font-headline text-[10px] text-primary font-bold">ATTACK</div>
        </div>
        <div className="text-right">
          <div className="font-headline text-[10px] text-secondary">{decay}ms</div>
          <div className="font-headline text-[10px] text-primary font-bold">DECAY</div>
        </div>
      </div>
    </div>
  );
};
