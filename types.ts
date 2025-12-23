
export enum TreeState {
  CHAOS = 'CHAOS',
  FORMED = 'FORMED'
}

export interface OrnamentData {
  chaosPosition: [number, number, number];
  targetPosition: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  type: 'GIFT' | 'BALL' | 'LIGHT';
  color: string;
}

export interface FoliageData {
  chaosPosition: Float32Array;
  targetPosition: Float32Array;
  colors: Float32Array;
}
