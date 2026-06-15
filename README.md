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

The default scene is now a flight-test range: a data-driven aircraft selected by `src/levels/flightTestLevel.json`, derivative-based custom aerodynamic simulation, chase camera, yoke indicator, and debug HUD. Profiles with optimized GLBs load their runtime visual through `src/assets/assetManifest.ts`; profiles without one fall back to the simple geometry test aircraft.

Flight controls:

- Click canvas = capture mouse.
- Mouse down/up = pitch up/down.
- Mouse left/right = roll right/left.
- `W/S` = throttle.
- `A/D` = rudder.
- `Q/E` = roll assist.
- Arrow keys = alternate pitch/roll.
- `R` = reset.
- `H` = HUD.
- `C` = camera mode.

The aircraft mesh is only visual. Flight behavior comes from `src/sim/aero/aircraftProfiles.ts`, especially the aircraft stability derivatives and control-surface limits.
The bottom-right yoke indicator shows current pitch/roll input and is the first piece of the aircraft control HUD.

## Aircraft Asset Workflow

Before generating or processing aircraft models, read:

```txt
docs/aircraft-end-to-end-asset-workflow.md
docs/docs/aircraft-end-to-end-asset-workflow.md
```

That workflow is the source of truth for aircraft-specific Meshy, Blender, optimization, manifest, and profile work. It supersedes the generic single-object examples below when the asset is an aircraft.

Aircraft workflow rules:

- Do not call Meshy live until explicitly approved.
- Run the Meshy dry-run path first; a live create call is the likely credit-spending step.
- Do not batch-generate aircraft unless explicitly instructed.
- Place source images under `public/images/references/aircraft/<aircraftId>/`.
- Save raw, cleaned, and optimized aircraft GLBs under `public/models/{raw,cleaned,optimized}/aircraft/<aircraftId>/`.
- Runtime aircraft visuals must come from optimized GLBs.
- Fix/verify aircraft visual orientation during Blender cleanup: `+X` right wing, `+Y` up, `-Z` nose/forward.
- Use `aircraftProfileId` to select physics.
- Do not derive aerodynamic properties from Meshy geometry.
- Record Meshy metadata, Blender cleanup reports, glTF reports, asset metadata, source notes, assumptions, confidence, and tuning notes.

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

For aircraft, prefer the aircraft-specific workflow and folder layout. If using the current generic Meshy scripts, set `ASSET_RAW_DIR`, `ASSET_CLEANED_DIR`, and `ASSET_OPTIMIZED_DIR` to `public/models/{raw,cleaned,optimized}/aircraft/<aircraftId>` for that command, then write the canonical stage metadata files beside the generated GLBs.

## Generated Asset Git Policy

Generated raw, cleaned, optimized, and collision GLB files are ignored during early development. This keeps the repo light while Meshy/Blender settings are still changing. The tradeoff is that optimized runtime assets will not travel with Git until you remove those ignore rules or move stable assets into Git LFS.

Meshy metadata files in `public/models/raw/*.meshy.json` are also ignored because live responses can include temporary signed asset URLs.

Aircraft JSON reports such as `meshy-task.json`, `meshy-metadata.json`, `blender-cleanup-report.json`, `gltf-report.json`, and `asset-metadata.json` are intended to be committed. The corresponding GLBs may still be ignored until Git LFS or ignore rules are updated.

## Manual Setup Still Required

- Add a real Meshy Pro key to local `.env` only.
- Set `BLENDER_PATH` if `blender` is not available on PATH.
- Put one tiny reference image in `public/images/references`.
- Review the dry-run output and commands before adding `--live`.
