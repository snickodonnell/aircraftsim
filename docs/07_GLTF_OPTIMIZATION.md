# 07 — glTF / GLB Optimization

The game should load optimized `.glb` files only.

## Tool

Use `@gltf-transform/cli`.

Install:

```bash
npm install -D @gltf-transform/cli
```

## Standard commands

Inspect:

```bash
gltf-transform inspect public/models/cleaned/wooden_chest.glb
```

Optimize:

```bash
gltf-transform optimize public/models/cleaned/wooden_chest.glb public/models/optimized/wooden_chest.glb --texture-compress webp --texture-size 1024
```

Inspect final:

```bash
gltf-transform inspect public/models/optimized/wooden_chest.glb
```

## Required wrapper: `scripts/assets/optimize-glb.ts`

The wrapper should accept:

```bash
npm run asset:optimize -- --input public/models/cleaned/wooden_chest.glb --output public/models/optimized/wooden_chest.glb --texture-size 1024
```

Responsibilities:

1. Validate input exists.
2. Ensure output directory exists.
3. Run glTF Transform optimize.
4. Print output file size.
5. Optionally run inspect after optimization.

## Required wrapper: `scripts/assets/inspect-glb.ts`

The wrapper should accept:

```bash
npm run asset:inspect -- --input public/models/optimized/wooden_chest.glb
```

Responsibilities:

1. Validate input exists.
2. Run glTF Transform inspect.
3. Print summary.

## Required wrapper: `scripts/assets/validate-asset-paths.ts`

Responsibilities:

1. Read `src/assets/assetManifest.ts` or a JSON manifest if Codex chooses JSON.
2. Confirm every asset path exists.
3. Fail if optimized model is missing.
4. Warn if runtime points to raw or cleaned model folders.

## File size targets

Initial rough targets:

```txt
Small prop:       < 1 MB preferred
Medium prop:      < 3 MB preferred
Hero prop:        < 5 MB if possible
Character:        depends on rig/animation, keep lean
Texture size:     512 or 1024 for most props
Triangle count:   lower is better for browser runtime
```

These are not hard rules, but Codex should warn when assets are huge.

## Texture policy

Default texture size:

```txt
1024
```

Use 512 for small props.
Use 2048 only for important hero assets.

## Runtime manifest policy

Only reference paths like:

```txt
/models/optimized/wooden_chest.glb
```

Do not use:

```txt
/models/raw/wooden_chest.glb
/models/cleaned/wooden_chest.glb
```
