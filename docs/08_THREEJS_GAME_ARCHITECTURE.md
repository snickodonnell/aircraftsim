# 08 — three.js / React Three Fiber Game Architecture

This document defines the initial game architecture.

## App entry

`src/main.tsx` should render `src/App.tsx`.

`src/App.tsx` should render `Game`.

## Game root

`src/game/Game.tsx` should own the R3F canvas.

Suggested responsibilities:

- full viewport layout
- Canvas setup
- Suspense/loading fallback
- Physics provider
- scene root

Example shape:

```tsx
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { Suspense } from 'react';
import { Scene } from './Scene';

export function Game() {
  return (
    <Canvas shadows camera={{ position: [0, 6, 8], fov: 50 }}>
      <Suspense fallback={null}>
        <Physics gravity={[0, -9.81, 0]}>
          <Scene />
        </Physics>
      </Suspense>
    </Canvas>
  );
}
```

## Scene

`src/game/Scene.tsx` should include:

- lighting
- ground
- player
- props
- level loader placeholder
- camera rig

## Player

`src/game/Player.tsx` should start simple:

- capsule or cuboid body
- WASD movement
- no complex animation initially
- visible placeholder mesh

Keep controls simple enough to debug.

## Camera

`src/game/CameraRig.tsx` should follow the player.

Start with an orbit/follow camera, not a complex cinematic system.

## State

Use Zustand in `src/game/useGameStore.ts` for:

- player position if needed
- score/progress
- loaded level ID
- debug flags

Do not overuse global state. React refs and local component state are fine.

## Asset manifest

`src/assets/assetManifest.ts` should define runtime assets.

Example:

```ts
export type AssetId = 'wooden_chest' | 'stone_wall_low';

export type AssetDefinition = {
  id: AssetId;
  path: string;
  kind: 'prop' | 'character' | 'environment' | 'item';
  scale?: number;
  collider?: 'box' | 'sphere' | 'capsule' | 'mesh' | 'none';
};

export const assetManifest: Record<AssetId, AssetDefinition> = {
  wooden_chest: {
    id: 'wooden_chest',
    path: '/models/optimized/wooden_chest.glb',
    kind: 'prop',
    scale: 1,
    collider: 'box',
  },
  stone_wall_low: {
    id: 'stone_wall_low',
    path: '/models/optimized/stone_wall_low.glb',
    kind: 'environment',
    scale: 1,
    collider: 'box',
  },
};
```

For aircraft visuals, extend the manifest with explicit data-driven mapping:

```ts
{
  id: 'spitfire_like',
  name: 'Spitfire-Like Fighter',
  runtimePath: '/models/optimized/aircraft/spitfire_like/spitfire_like.glb',
  aircraftId: 'spitfire_like',
  aircraftProfileId: 'spitfire_like',
  referenceImagePath: '/images/references/aircraft/spitfire_like/source.png',
  visualOnly: true,
  colliderType: 'none',
}
```

The flight scene should resolve the visual by `aircraftProfileId` and keep physics in the aircraft profile. Keep a simple geometry visual as fallback when a profile has no optimized GLB yet.

## Level data

`src/levels/level01.json` can define simple placements:

```json
{
  "id": "level01",
  "name": "Prototype Level",
  "spawn": [0, 1, 0],
  "objects": [
    {
      "assetId": "wooden_chest",
      "position": [2, 0, -1],
      "rotation": [0, 0, 0],
      "scale": [1, 1, 1]
    }
  ]
}
```

## GLB loading

Use `useGLTF` from Drei for individual assets.

For many repeated assets, consider cloning or instancing later. Do not overcomplicate at scaffold stage.

## Physics policy

Use simple colliders first:

```tsx
<RigidBody type="fixed" colliders={false}>
  <Model />
  <CuboidCollider args={[1, 0.5, 1]} />
</RigidBody>
```

Do not use high-poly mesh colliders for generated assets unless specifically required.

## Rendering policy

Start with basic lighting:

- ambient light
- directional light
- optional hemisphere light

Add post-processing later only after gameplay works.
