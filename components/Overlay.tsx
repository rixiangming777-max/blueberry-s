
import React from 'react';
import { TreeState } from '../types';

interface OverlayProps {
  state: TreeState;
  onToggle: () => void;
}

const Overlay: React.FC<OverlayProps> = ({ state, onToggle }) => {
  return (
    <div className="fixed inset-0 pointer-events-none flex flex-col justify-between p-8 md:p-12 z-10">
      {/* Header */}
      <div className="flex justify-between items-start animate-fade-in">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-400 to-amber-700 tracking-tight leading-tight drop-shadow-2xl">
            圣诞快乐，<br />
            刘禹茗o(*￣▽￣*)ブ
          </h1>
          <p className="text-amber-500/80 text-xs md:text-sm font-semibold tracking-widest uppercase">
            Ultra-Dense • Grand Luxury Edition
          </p>
        </div>
        <div className="text-right hidden sm:block">
          <div className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Status</div>
          <div className="text-amber-200 font-bold">{state === TreeState.CHAOS ? 'DISPERSED' : 'GRAND FORM'}</div>
        </div>
      </div>

      {/* Footer / Controls */}
      <div className="flex flex-col items-center space-y-8">
        <div className="bg-black/40 backdrop-blur-md border border-amber-500/20 p-4 rounded-full pointer-events-auto transition-all hover:border-amber-500/50 group">
          <button 
            onClick={onToggle}
            className="px-12 py-4 rounded-full bg-gradient-to-r from-amber-700 via-amber-400 to-amber-700 text-black font-black uppercase tracking-widest text-sm shadow-[0_0_35px_rgba(251,191,36,0.6)] hover:shadow-[0_0_55px_rgba(251,191,36,0.8)] transition-all active:scale-95"
          >
            {state === TreeState.CHAOS ? 'Manifest The Masterpiece' : 'Release The Spirit'}
          </button>
        </div>

        <div className="text-white/30 text-[9px] uppercase tracking-[0.6em] text-center max-w-xs leading-relaxed">
          High Performance Rendering • 800k Needles
        </div>
      </div>
    </div>
  );
};

export default Overlay;
