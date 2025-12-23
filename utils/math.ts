
import { TREE_CONFIG } from '../constants';

export const getTreePosition = (index: number, total: number) => {
  const y = Math.random() * TREE_CONFIG.HEIGHT;
  // Conical shape: radius decreases as y increases
  const ratio = 1 - (y / TREE_CONFIG.HEIGHT);
  const currentRadius = TREE_CONFIG.RADIUS * ratio;
  const angle = Math.random() * Math.PI * 2;
  
  const x = Math.cos(angle) * currentRadius;
  const z = Math.sin(angle) * currentRadius;
  
  return [x, y, z] as [number, number, number];
};

export const getChaosPosition = () => {
  const r = TREE_CONFIG.CHAOS_RADIUS * Math.pow(Math.random(), 0.3);
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  
  const x = r * Math.sin(phi) * Math.cos(theta);
  const y = r * Math.sin(phi) * Math.sin(theta);
  const z = r * Math.cos(phi);
  
  return [x, y, z] as [number, number, number];
};
