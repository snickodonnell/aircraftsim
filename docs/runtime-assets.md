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
- `colliderType`
- `scale`
- `position`
- `rotation`
- `notes`

Use simple Rapier colliders (`box`, `sphere`, `capsule`) unless a reviewed low-poly collision mesh is truly needed. Never use high-poly generated meshes as physics colliders.

Validate manifest paths:

```bash
npm run asset:validate -- --allow-missing
```

Remove `--allow-missing` once optimized GLBs are present.
