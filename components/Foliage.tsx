
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TREE_CONFIG, COLORS } from '../constants';
import { getChaosPosition } from '../utils/math';

interface FoliageProps {
  progress: number;
}

const Foliage: React.FC<FoliageProps> = ({ progress }) => {
  const meshRef = useRef<THREE.Points>(null);

  const { chaosPositions, targetPositions, colors, randoms } = useMemo(() => {
    const chaos = new Float32Array(TREE_CONFIG.FOLIAGE_COUNT * 3);
    const target = new Float32Array(TREE_CONFIG.FOLIAGE_COUNT * 3);
    const cols = new Float32Array(TREE_CONFIG.FOLIAGE_COUNT * 3);
    const rnds = new Float32Array(TREE_CONFIG.FOLIAGE_COUNT * 3);

    const greenBase = new THREE.Color('#041a0a');
    const greenMid = new THREE.Color('#0a3d1c');
    const greenTip = new THREE.Color('#145a32');

    for (let i = 0; i < TREE_CONFIG.FOLIAGE_COUNT; i++) {
      const cPos = getChaosPosition();
      
      const y = Math.pow(Math.random(), 0.85) * TREE_CONFIG.HEIGHT;
      const taper = 1.0 - (y / TREE_CONFIG.HEIGHT);
      const angle = Math.random() * Math.PI * 2;
      
      // Conical distribution with jitter for organic branch spread
      const r = (TREE_CONFIG.RADIUS * taper) * (0.5 + Math.random() * 0.5);
      
      const tPos: [number, number, number] = [
        Math.cos(angle) * r,
        y,
        Math.sin(angle) * r
      ];

      chaos.set(cPos, i * 3);
      target.set(tPos, i * 3);

      const color = new THREE.Color();
      const randVal = Math.random();
      
      // Base color variation
      if (randVal > 0.6) color.copy(greenBase);
      else if (randVal > 0.2) color.copy(greenMid);
      else color.copy(greenTip);
      
      // Subtle brown/yellow "dryness" for inner parts of the tree
      if (r < TREE_CONFIG.RADIUS * taper * 0.3) {
        color.lerp(new THREE.Color('#3d2b1f'), 0.15);
      }
      
      // Brighter tips for new growth
      if (r > TREE_CONFIG.RADIUS * taper * 0.85) {
        color.lerp(new THREE.Color('#58d68d'), 0.1);
      }

      cols.set([color.r, color.g, color.b], i * 3);
      
      // x: rotation, y: size variation, z: saturation shift
      rnds.set([Math.random(), Math.random(), Math.random()], i * 3);
    }

    return { chaosPositions: chaos, targetPositions: target, colors: cols, randoms: rnds };
  }, []);

  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uProgress: { value: 0 },
        uTime: { value: 0 },
      },
      vertexShader: `
        uniform float uProgress;
        uniform float uTime;
        attribute vec3 chaosPosition;
        attribute vec3 targetPosition;
        attribute vec3 color;
        attribute vec3 randoms;
        varying vec3 vColor;
        varying float vAlpha;
        varying float vRotation;
        varying float vSaturation;

        void main() {
          vColor = color;
          vRotation = randoms.x * 6.28;
          vSaturation = randoms.z;
          
          vec3 mixedPos = mix(chaosPosition, targetPosition, uProgress);
          
          // Realistic branch sway (multi-layered sine waves)
          float sway = (sin(uTime * 0.5 + mixedPos.y * 0.2) * 0.1 + 
                        sin(uTime * 1.2 + mixedPos.x * 0.5) * 0.05) * uProgress;
          mixedPos.x += sway;
          mixedPos.z += sway;

          vec4 mvPosition = modelViewMatrix * vec4(mixedPos, 1.0);
          
          // Significantly increased point size for elongated texture rendering
          float baseSize = 52.0; 
          gl_PointSize = (baseSize / -mvPosition.z) * (0.8 + randoms.y * 0.4);
          gl_Position = projectionMatrix * mvPosition;
          
          vAlpha = smoothstep(-75.0, 0.0, mvPosition.z) * uProgress;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;
        varying float vRotation;
        varying float vSaturation;

        vec3 saturate(vec3 rgb, float adjustment) {
            vec3 intensity = vec3(dot(rgb, vec3(0.2126, 0.7152, 0.0722)));
            return mix(intensity, rgb, adjustment);
        }

        void main() {
          vec2 uv = gl_PointCoord - vec2(0.5);
          
          float cosR = cos(vRotation);
          float sinR = sin(vRotation);
          vec2 rUv = vec2(uv.x * cosR - uv.y * sinR, uv.x * sinR + uv.y * cosR);
          
          float needleIntensity = 0.0;
          const float numNeedles = 6.0;
          
          for(float i = 0.0; i < numNeedles; i++) {
             // Rotate each needle slightly differently
             float angle = i * (6.28 / numNeedles) + (vRotation * 0.2);
             float s = sin(angle);
             float c = cos(angle);
             vec2 nUv = vec2(rUv.x * c - rUv.y * s, rUv.x * s + rUv.y * c);
             
             // Add subtle curvature to the needle
             float curvature = nUv.y * nUv.y * 0.8 * (vRotation - 0.5);
             float dX = abs(nUv.x - curvature);
             
             // Elongated thin pine needle shape
             // abs(nUv.y) * 0.6 makes it longer, abs(nUv.x) * 12.0 makes it thinner
             float needle = smoothstep(0.1, 0.0, dX * 15.0 + abs(nUv.y) * 0.8);
             
             // Taper the needle at the tip
             needle *= smoothstep(0.5, 0.3, abs(nUv.y));
             
             needleIntensity = max(needleIntensity, needle);
          }
          
          if (needleIntensity < 0.05) discard;
          
          // Apply saturation variation and subtle jitter based on position
          vec3 saturationShift = saturate(vColor, 0.8 + vSaturation * 0.5);
          vec3 finalColor = saturationShift * (0.7 + needleIntensity * 0.3);
          
          gl_FragColor = vec4(finalColor, vAlpha * needleIntensity);
        }
      `,
      transparent: true,
      depthWrite: true,
      alphaTest: 0.1,
    });
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uProgress.value = THREE.MathUtils.lerp(material.uniforms.uProgress.value, progress, 0.01);
      material.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={TREE_CONFIG.FOLIAGE_COUNT} array={chaosPositions} itemSize={3} />
        <bufferAttribute attach="attributes-chaosPosition" count={TREE_CONFIG.FOLIAGE_COUNT} array={chaosPositions} itemSize={3} />
        <bufferAttribute attach="attributes-targetPosition" count={TREE_CONFIG.FOLIAGE_COUNT} array={targetPositions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={TREE_CONFIG.FOLIAGE_COUNT} array={colors} itemSize={3} />
        <bufferAttribute attach="attributes-randoms" count={TREE_CONFIG.FOLIAGE_COUNT} array={randoms} itemSize={3} />
      </bufferGeometry>
      <primitive object={shaderMaterial} />
    </points>
  );
};

export default Foliage;
