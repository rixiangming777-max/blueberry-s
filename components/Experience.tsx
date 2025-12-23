
import React, { useMemo, useRef } from 'react';
import { OrbitControls, PerspectiveCamera, Environment, Stars, Float } from '@react-three/drei';
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import Foliage from './Foliage';
import Ornaments from './Ornaments';
import { COLORS, TREE_CONFIG } from '../constants';

interface ExperienceProps {
  isFormed: boolean;
}

const Star: React.FC<{ progress: number }> = ({ progress }) => {
  const starShape = useMemo(() => {
    const shape = new THREE.Shape();
    const spikes = 5;
    const outerRadius = 0.8;
    const innerRadius = 0.35;

    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();
    return shape;
  }, []);

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
      <mesh position={[0, TREE_CONFIG.HEIGHT + 0.5, 0]} scale={progress}>
        <extrudeGeometry args={[starShape, { depth: 0.2, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.1 }]} />
        <meshStandardMaterial 
          color={COLORS.GOLD} 
          emissive={COLORS.GOLD} 
          emissiveIntensity={12} 
          toneMapped={false} 
          roughness={0.1}
          metalness={1.0}
        />
        <pointLight intensity={80} distance={15} color={COLORS.WARM_WHITE} />
      </mesh>
    </Float>
  );
};

const LuxuryTrunk: React.FC<{ progress: number }> = ({ progress }) => {
  return (
    <group>
      <mesh castShadow position={[0, (TREE_CONFIG.HEIGHT * progress) / 2, 0]}>
        <cylinderGeometry args={[0.05, 0.8, TREE_CONFIG.HEIGHT * progress, 12]} />
        <meshStandardMaterial color="#1a0f00" roughness={1.0} />
      </mesh>
      
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[1.6, 2.0, 0.7, 32]} />
          <meshStandardMaterial color="#0a0500" roughness={0.9} />
        </mesh>
        <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0.01, 0]}>
          <circleGeometry args={[3, 32]} />
          <meshStandardMaterial color="#000000" transparent opacity={0.8} />
        </mesh>
      </group>
    </group>
  );
};

const Experience: React.FC<ExperienceProps> = ({ isFormed }) => {
  const progress = isFormed ? 1 : 0;

  return (
    <>
      <color attach="background" args={['#000000']} />
      
      <PerspectiveCamera makeDefault position={[0, 5, 28]} fov={40} />
      <OrbitControls 
        enablePan={false} 
        maxDistance={40} 
        minDistance={8} 
        autoRotate={isFormed} 
        autoRotateSpeed={0.25} 
        maxPolarAngle={Math.PI / 1.7}
      />

      <Stars radius={150} depth={50} count={3000} factor={4} saturation={0} fade speed={0.5} />
      
      <ambientLight intensity={1.5} />
      <spotLight position={[30, 40, 30]} angle={0.25} penumbra={1} intensity={10} color="#fffce0" castShadow />
      <directionalLight position={[-15, 20, 10]} intensity={2.5} color={COLORS.EMERALD} />
      <pointLight position={[0, 6, 18]} intensity={8} color={COLORS.WARM_WHITE} />

      <group position={[0, -6, 0]}>
        <LuxuryTrunk progress={progress} />
        <Foliage progress={progress} />
        <Ornaments progress={progress} />
        <Star progress={progress} />
        
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#010101" metalness={0.1} roughness={0.9} />
        </mesh>
      </group>

      <Environment preset="night" />

      <EffectComposer disableNormalPass>
        <Bloom 
          luminanceThreshold={0.85} 
          mipmapBlur 
          intensity={1.8} 
          radius={0.4} 
        />
        <Vignette darkness={1.3} offset={0.1} />
      </EffectComposer>
    </>
  );
};

export default Experience;
