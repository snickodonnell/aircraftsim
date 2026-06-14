import { create } from 'zustand';

type Vec3 = [number, number, number];

type GameState = {
  levelId: string;
  playerPosition: Vec3;
  debugPhysics: boolean;
  setLevelId: (levelId: string) => void;
  setPlayerPosition: (position: Vec3) => void;
  setDebugPhysics: (enabled: boolean) => void;
};

export const useGameStore = create<GameState>((set) => ({
  levelId: 'level01',
  playerPosition: [0, 1.25, 3],
  debugPhysics: false,
  setLevelId: (levelId) => set({ levelId }),
  setPlayerPosition: (playerPosition) => set({ playerPosition }),
  setDebugPhysics: (debugPhysics) => set({ debugPhysics }),
}));
