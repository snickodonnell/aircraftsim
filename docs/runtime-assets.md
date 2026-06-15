# Runtime Assets

The browser game must load GLB files only from:

```txt
public/models/optimized/
```

Do not load:

```txt
public/models/raw/
public/models/cleaned/
```

`src/assets/assetManifest.ts` defines the runtime contract:

- `id`
- `name`
- `runtimePath`
- `aircraftId`, when the model is an aircraft visual
- `aircraftProfileId`, when the visual should follow a flight profile
- `referenceImagePath`, when generated from a reference image
- `visualOnly`, when physics must come from data rather than mesh geometry
- `colliderType`
- `scale`
- `position`
- `rotation`
- `notes`

For aircraft, resolve visuals by explicit `aircraftProfileId` when possible. `runtimePath` selects the optimized GLB, while `aircraftProfileId` selects the physics profile. Keep a geometry-only fallback for profiles that do not yet have an optimized runtime asset.

Use simple Rapier colliders (`box`, `sphere`, `capsule`) unless a reviewed low-poly collision mesh is truly needed. Never use high-poly generated meshes as physics colliders.

Aircraft visuals used by the custom flight model should normally use `colliderType: 'none'` until a separate, reviewed collision strategy is added. Do not use generated visual mesh geometry as flight or collision truth by default.

Validate manifest paths:

```bash
npm run asset:validate -- --allow-missing
```

Remove `--allow-missing` once optimized GLBs are present.
