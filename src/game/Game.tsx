import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { FlightTestScene } from './aircraft/AircraftController';
import { AircraftYokeIndicator } from './aircraft/AircraftYokeIndicator';

export function Game() {
  return (
    <main className="game-shell">
      <Canvas shadows camera={{ position: [0, 12, 28], fov: 60, near: 0.1, far: 10000 }}>
        <Suspense fallback={null}>
          <FlightTestScene />
        </Suspense>
      </Canvas>
      <AircraftYokeIndicator />
    </main>
  );
}
