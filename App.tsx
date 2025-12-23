
import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import Experience from './components/Experience';
import Overlay from './components/Overlay';
import { TreeState } from './types';

const App: React.FC = () => {
  const [treeState, setTreeState] = useState<TreeState>(TreeState.CHAOS);

  const toggleTree = () => {
    setTreeState(prev => prev === TreeState.CHAOS ? TreeState.FORMED : TreeState.CHAOS);
  };

  return (
    <div className="relative w-screen h-screen bg-[#010a05] overflow-hidden">
      {/* 3D Scene */}
      <Canvas
        shadows
        gl={{ 
          antialias: false, // Postprocessing handles AA
          powerPreference: 'high-performance',
          stencil: false,
          depth: true
        }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <Experience isFormed={treeState === TreeState.FORMED} />
        </Suspense>
      </Canvas>

      {/* UI Controls */}
      <Overlay state={treeState} onToggle={toggleTree} />

      {/* Custom Styles for luxury feel */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Loading Indicator */}
      <div className="fixed bottom-4 right-4 text-white/10 text-[8px] font-mono pointer-events-none">
        RENDER ENGINE: R3F v9.0-alpha • ASSETS: INSTANCED_ORNAMENTS • SHADER: CUSTOM_FOLIAGE
      </div>
    </div>
  );
};

export default App;
