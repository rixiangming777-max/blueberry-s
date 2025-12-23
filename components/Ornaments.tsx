
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TREE_CONFIG, COLORS } from '../constants';
import { getTreePosition, getChaosPosition } from '../utils/math';

interface OrnamentsProps {
  progress: number;
}

const Ornaments: React.FC<OrnamentsProps> = ({ progress }) => {
  const ballsRef = useRef<THREE.InstancedMesh>(null);
  const giftsRef = useRef<THREE.InstancedMesh>(null);
  const lightsRef = useRef<THREE.InstancedMesh>(null);

  const ornamentItems = useMemo(() => {
    const items = [];
    const colors = [COLORS.LUXURY_RED, COLORS.GOLD, COLORS.LUXURY_GREEN, COLORS.EMERALD];
    const lightColors = [COLORS.WARM_WHITE, COLORS.GOLD, COLORS.LUXURY_RED, COLORS.LUXURY_GREEN];

    for (let i = 0; i < TREE_CONFIG.ORNAMENT_COUNT; i++) {
      const dice = Math.random();
      let type: 'BALL' | 'GIFT' | 'LIGHT' = 'BALL';
      
      // Distribution: 45% lights, 40% balls, 15% gifts
      if (dice < 0.45) type = 'LIGHT';
      else if (dice < 0.85) type = 'BALL';
      else type = 'GIFT';

      let color;
      if (type === 'LIGHT') {
        color = lightColors[Math.floor(Math.random() * lightColors.length)];
      } else {
        color = colors[Math.floor(Math.random() * colors.length)];
      }
      
      items.push({
        type,
        color,
        chaosPosition: getChaosPosition(),
        targetPosition: getTreePosition(i, TREE_CONFIG.ORNAMENT_COUNT),
        scale: type === 'LIGHT' ? 0.06 + Math.random() * 0.04 : 
               type === 'GIFT' ? 0.15 + Math.random() * 0.15 : 0.18 + Math.random() * 0.12,
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
      });
    }
    return items;
  }, []);

  const tempObject = new THREE.Object3D();
  const tempColor = new THREE.Color();

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    const updateLayer = (ref: React.RefObject<THREE.InstancedMesh>, type: string) => {
      if (!ref.current) return;
      let count = 0;
      ornamentItems.forEach((item, i) => {
        if (item.type !== type) return;

        const currentPos = new THREE.Vector3().fromArray(item.chaosPosition).lerp(
          new THREE.Vector3().fromArray(item.targetPosition),
          progress
        );

        tempObject.position.copy(currentPos);
        if (type === 'GIFT') {
          tempObject.rotation.set(item.rotation[0], item.rotation[1], item.rotation[2]);
        } else if (type === 'BALL') {
          // Slight oscillation
          tempObject.position.y += Math.sin(time + i) * 0.05 * progress;
        }
        
        tempObject.scale.setScalar(item.scale);
        tempObject.updateMatrix();
        ref.current!.setMatrixAt(count, tempObject.matrix);

        tempColor.set(item.color);
        if (type === 'LIGHT') {
          const intensity = 1.0 + Math.sin(time * 6 + i) * 0.5;
          tempColor.multiplyScalar(intensity);
        }
        ref.current!.setColorAt(count, tempColor);
        count++;
      });
      ref.current.instanceMatrix.needsUpdate = true;
      if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
    };

    updateLayer(ballsRef, 'BALL');
    updateLayer(giftsRef, 'GIFT');
    updateLayer(lightsRef, 'LIGHT');
  });

  const ballCount = ornamentItems.filter(i => i.type === 'BALL').length;
  const giftCount = ornamentItems.filter(i => i.type === 'GIFT').length;
  const lightCount = ornamentItems.filter(i => i.type === 'LIGHT').length;

  return (
    <>
      {/* BAUBLES */}
      <instancedMesh ref={ballsRef} args={[undefined, undefined, ballCount]}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshStandardMaterial metalness={0.9} roughness={0.1} />
      </instancedMesh>

      {/* GIFT BOXES */}
      <instancedMesh ref={giftsRef} args={[undefined, undefined, giftCount]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial metalness={0.5} roughness={0.5} />
      </instancedMesh>

      {/* FAIRY LIGHTS */}
      <instancedMesh ref={lightsRef} args={[undefined, undefined, lightCount]}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshStandardMaterial emissiveIntensity={20} toneMapped={false} />
      </instancedMesh>
    </>
  );
};

export default Ornaments;
