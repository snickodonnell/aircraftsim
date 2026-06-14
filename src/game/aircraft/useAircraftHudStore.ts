import { create } from 'zustand';

type AircraftHudState = {
  pitch: number;
  roll: number;
  pointerLocked: boolean;
  setYokeInput: (input: { pitch: number; roll: number; pointerLocked: boolean }) => void;
};

export const useAircraftHudStore = create<AircraftHudState>((set) => ({
  pitch: 0,
  roll: 0,
  pointerLocked: false,
  setYokeInput: (input) => set(input),
}));
