export const WORLD_FRAME_DESCRIPTION = {
  x: 'right / east',
  y: 'up',
  z: 'forward / south',
} as const;

export const AIRCRAFT_FRAME_DESCRIPTION = {
  x: 'right wing',
  y: 'aircraft up',
  z: 'tailward; aircraft nose points along local -Z',
} as const;

export const WORLD_UP: [number, number, number] = [0, 1, 0];
export const AIRCRAFT_FORWARD_LOCAL: [number, number, number] = [0, 0, -1];
export const AIRCRAFT_UP_LOCAL: [number, number, number] = [0, 1, 0];
export const AIRCRAFT_RIGHT_LOCAL: [number, number, number] = [1, 0, 0];

export function degreesToRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

export function radiansToDegrees(radians: number) {
  return (radians * 180) / Math.PI;
}
