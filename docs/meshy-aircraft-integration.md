# Meshy Aircraft Integration

Meshy aircraft models are visual skins only.

Pipeline:

```txt
reference image
-> Meshy raw GLB
-> Blender cleanup
-> glTF Transform optimization
-> public/models/optimized/*.glb
-> assetManifest.ts visual entry
-> aircraftProfileId selects physics
```

Do not use raw Meshy models directly in the game. Do not infer aero from triangles, silhouette, collider shape, model filename, apparent wingspan, visible dihedral, or tail size.

If a Meshy model visually looks like a Spitfire, the game should still use an explicit data mapping such as `aircraftProfileId: 'spitfire_like'`. The profile supplies mass, inertia, wing area, control-surface limits, stability derivatives, engine thrust, spawn defaults, and tuning notes.

## Mapping Example

```ts
{
  id: 'meshy_spitfire_001',
  name: 'Spitfire',
  runtimePath: '/models/optimized/spitfire.glb',
  aircraftProfileId: 'spitfire_like',
  meshHintNames: ['spitfire', 'ww2_spitfire'],
  colliderType: 'box',
  scale: [1, 1, 1],
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  notes: 'Visual skin only. Physics comes from spitfire_like.',
}
```

`runtimePath` controls the visual model. `aircraftProfileId` controls flight behavior.

Explicit `aircraftProfileId` wins. If it is absent, profile resolution may use `assetId`, display name, or `meshHintNames`, then falls back to `generic_trainer`.

Future asset metadata should include:

- `aircraftProfileId`: required for real gameplay assets.
- `runtimePath`: optimized GLB path under `public/models/optimized`.
- `visualScale` or `scale`: visual-only size correction.
- `modelRotationEulerDeg` or `rotation`: visual-only orientation correction.
- `meshHintNames`: optional fallback hints.
- `notes`: any hand-authored cleanup or profile-tuning reminders.

## Naming Guidance

Use lowercase snake case asset IDs:

- `meshy_spitfire_001`
- `trainer_blue_001`
- `heavy_bomber_test_001`

Include hints when helpful, but do not rely on hints for important gameplay. Store the intended profile id.
