# Aircraft Sim Browser Game Scaffold

This repo is a Vite + React + TypeScript browser-game scaffold with a cautious 2D reference image -> Meshy Pro -> raw GLB -> Blender cleanup -> optimized GLB -> React Three Fiber runtime pipeline.

## Setup

1. Install Node.js LTS and Blender.
2. Install dependencies:

```bash
npm install
```

3. Copy `.env.example` to `.env` and fill only local values:

```txt
MESHY_API_KEY=
BLENDER_PATH=
```

Use `BLENDER_PATH` when Blender is not on PATH, for example:

```txt
BLENDER_PATH=C:\Program Files\Blender Foundation\Blender 4.5\blender.exe
```

Do not create `VITE_MESHY_API_KEY`. Meshy calls belong only in local/server-side scripts because every `VITE_` variable is exposed to browser code.

## App Commands

```bash
npm run dev
npm run build
npm run preview
npm run typecheck
```

The default scene is now a flight-test range: a data-driven generic trainer aircraft, simple geometry visual skin, derivative-based custom aerodynamic simulation, chase camera, yoke indicator, and debug HUD.

Flight controls:

- Click canvas = capture mouse.
- Mouse down/up = pitch up/down, like a yoke.
- Mouse left/right = roll.
- `W/S` = throttle.
- `A/D` = rudder.
- `Q/E` = roll assist.
- Arrow keys = alternate pitch/roll.
- `R` = reset.
- `H` = HUD.
- `C` = camera mode.

The aircraft mesh is only visual. Flight behavior comes from `src/sim/aero/aircraftProfiles.ts`, especially the aircraft stability derivatives and control-surface limits.
The bottom-right yoke indicator shows current pitch/roll input and is the first piece of the aircraft control HUD.

## Dry-Run Asset Pipeline

Place a reference image in `public/images/references`, then test the wiring without spending Meshy credits:

```bash
npm run meshy:create -- --name tiny_test_asset --image public/images/references/tiny_test_asset.png
npm run meshy:poll -- --task-id dry-run-task --type image-to-3d
npm run meshy:download -- --task-id dry-run-task --name tiny_test_asset --type image-to-3d
```

After review, live calls require `--live`:

```bash
npm run meshy:create -- --name tiny_test_asset --image public/images/references/tiny_test_asset.png --live
```

Stop after creating and reviewing one tiny test asset. Do not batch-generate Meshy assets yet.

## Cleanup And Optimization

After a live Meshy download produces `public/models/raw/tiny_test_asset.glb`:

```bash
npm run asset:clean -- public/models/raw/tiny_test_asset.glb public/models/cleaned/tiny_test_asset.glb --asset-name tiny_test_asset
npm run asset:optimize -- --input public/models/cleaned/tiny_test_asset.glb --output public/models/optimized/tiny_test_asset.glb --texture-size 1024 --inspect
npm run asset:validate -- --allow-missing
```

Runtime models must be loaded only from `public/models/optimized`.

## Generated Asset Git Policy

Generated raw, cleaned, optimized, and collision GLB files are ignored during early development. This keeps the repo light while Meshy/Blender settings are still changing. The tradeoff is that optimized runtime assets will not travel with Git until you remove those ignore rules or move stable assets into Git LFS.

Meshy metadata files in `public/models/raw/*.meshy.json` are also ignored because live responses can include temporary signed asset URLs.

## Manual Setup Still Required

- Add a real Meshy Pro key to local `.env` only.
- Set `BLENDER_PATH` if `blender` is not available on PATH.
- Put one tiny reference image in `public/images/references`.
- Review the dry-run output and commands before adding `--live`.
