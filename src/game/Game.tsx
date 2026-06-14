import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { Scene } from './Scene';
import { GRAVITY } from './physics';
import { useGameStore } from './useGameStore';

export function Game() {
  const levelId = useGameStore((state) => state.levelId);

  return (
    <main className="game-shell">
      <div className="game-hud">
        <strong>Prototype Scene</strong>
        <span>{levelId} | WASD / arrow keys</span>
      </div>
      <Canvas shadows camera={{ position: [0, 5, 8], fov: 50 }}>
        <Suspense fallback={null}>
          <Physics gravity={GRAVITY}>
            <Scene />
          </Physics>
        </Suspense>
      </Canvas>
    </main>
  );
}
