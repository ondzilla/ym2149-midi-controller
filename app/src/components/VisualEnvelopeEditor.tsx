import React, { useRef, useState, useId } from 'react';
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
  const [focusedNode, setFocusedNode] = useState<'attack' | 'decay' | null>(null);

  const getPercentageFromPointerEvent = (e: React.PointerEvent<SVGCircleElement>) => {
    if (!svgRef.current) return 0;

    const rect = svgRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    return Math.round((x / rect.width) * 100);
  };

  const handlePointerDown = (node: 'attack' | 'decay', e: React.PointerEvent<SVGCircleElement>) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setDraggingNode(node);
  };

  const handlePointerMove = (node: 'attack' | 'decay', e: React.PointerEvent<SVGCircleElement>) => {
    if (draggingNode !== node) return;

    const percentage = getPercentageFromPointerEvent(e);
    if (node === 'attack') {
      // Prevent attack from passing decay
      const maxAttack = Math.max(0, Number(decay) - 1);
      setAttack(Math.min(percentage, maxAttack).toString());
    } else if (node === 'decay') {
      // Prevent decay from going below attack
      const minDecay = Math.min(100, Number(attack) + 1);
      setDecay(Math.max(percentage, minDecay).toString());
    }
  };

  const handlePointerUp = (e: React.PointerEvent<SVGCircleElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    setDraggingNode(null);
  };

  // Points mapped from 0-100 logic onto an SVG with viewBox "0 0 100 100"
  // Start point (0, 100) -> bottom left
  // Attack point (attack, 0) -> peak
  // Decay end point (decay, 100) -> bottom right
  const attackX = Number(attack);
  const decayX = Number(decay);

  const attackId = useId();
  const decayId = useId();

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
            className={`cursor-grab ${draggingNode === 'attack' ? 'cursor-grabbing scale-150' : 'hover:scale-125'} transition-transform origin-center ${focusedNode === 'attack' ? 'stroke-white stroke-2' : ''}`}
            style={{ transformOrigin: `${attackX}px 0px` }}
            onPointerDown={(e) => handlePointerDown('attack', e)}
            onPointerMove={(e) => handlePointerMove('attack', e)}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          />

          {/* Decay Node */}
          <circle
            cx={decayX}
            cy="100"
            r="4"
            fill="#8eff71"
            className={`cursor-grab ${draggingNode === 'decay' ? 'cursor-grabbing scale-150' : 'hover:scale-125'} transition-transform origin-center ${focusedNode === 'decay' ? 'stroke-white stroke-2' : ''}`}
            style={{ transformOrigin: `${decayX}px 100px` }}
            onPointerDown={(e) => handlePointerDown('decay', e)}
            onPointerMove={(e) => handlePointerMove('decay', e)}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          />
        </svg>

        {/* Visually hidden inputs for accessibility and testing */}
        <input
          id={attackId}
          type="range"
          min="0"
          max="100"
          aria-label="Attack"
          value={attack}
          onChange={(e) => setAttack(e.target.value)}
          onFocus={() => setFocusedNode('attack')}
          onBlur={() => setFocusedNode(null)}
          className="sr-only"
        />
        <input
          id={decayId}
          type="range"
          min="0"
          max="100"
          aria-label="Decay"
          value={decay}
          onChange={(e) => setDecay(e.target.value)}
          onFocus={() => setFocusedNode('decay')}
          onBlur={() => setFocusedNode(null)}
          className="sr-only"
        />
      </div>

      <div className="flex justify-between px-2">
        <div className="text-left">
          <div className="font-headline text-[10px] text-secondary">{attack}ms</div>
          <label htmlFor={attackId} className="font-headline text-[10px] text-primary font-bold cursor-pointer inline-block">ATTACK</label>
        </div>
        <div className="text-right">
          <div className="font-headline text-[10px] text-secondary">{decay}ms</div>
          <label htmlFor={decayId} className="font-headline text-[10px] text-primary font-bold cursor-pointer inline-block">DECAY</label>
        </div>
      </div>
    </div>
  );
};
