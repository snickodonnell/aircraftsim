# 12 — Acceptance Checklist

Codex must verify this checklist before considering the scaffold complete.

## App setup

```txt
[ ] package.json exists
[ ] Vite React TypeScript app exists
[ ] npm install succeeds
[ ] npm run dev starts the app
[ ] npm run build succeeds
[ ] App renders a Canvas scene
[ ] Scene includes lighting
[ ] Scene includes ground
[ ] Scene includes physics provider
[ ] Scene includes player placeholder
[ ] Camera follows or views player
```

## Dependencies

```txt
[ ] three installed
[ ] @types/three installed
[ ] @react-three/fiber installed
[ ] @react-three/drei installed
[ ] @react-three/rapier installed
[ ] zustand installed
[ ] @gltf-transform/cli installed
[ ] gltfjsx installed
[ ] dotenv installed
[ ] tsx installed
```

## Environment

```txt
[ ] .env.example exists
[ ] .env.example includes MESHY_API_KEY placeholder
[ ] .env.example includes MESHY_API_BASE_URL
[ ] .env.example includes optional BLENDER_PATH
[ ] .gitignore excludes .env, .env.local, .env.*.local
[ ] No real API keys are committed
```

## Meshy scripts

```txt
[ ] scripts/meshy/create-image-to-3d-task.ts exists
[ ] scripts/meshy/create-multi-image-to-3d-task.ts exists
[ ] scripts/meshy/poll-task.ts exists
[ ] scripts/meshy/download-model.ts exists
[ ] Meshy scripts load env variables
[ ] Meshy scripts fail gracefully when MESHY_API_KEY is missing
[ ] Meshy scripts validate input image paths
[ ] Meshy scripts save metadata
[ ] Meshy scripts do not print API keys
[ ] Aircraft Meshy runs can write to public/models/raw/aircraft/<aircraftId>/ via command-scoped directory settings
```

## Blender scripts

```txt
[ ] scripts/blender/clean_glb.py exists
[ ] scripts/blender/batch_clean.py exists or is intentionally deferred
[ ] clean_glb.py accepts input and output args after --
[ ] clean_glb.py imports GLB
[ ] clean_glb.py exports GLB
[ ] clean_glb.py includes usage comments
[ ] Blender command can be run manually if Blender is installed
[ ] clean_glb.py can bake an explicit orientation rotation
[ ] clean_glb.py can write a cleanup report
```

## Asset optimization

```txt
[ ] scripts/assets/optimize-glb.ts exists
[ ] scripts/assets/inspect-glb.ts exists
[ ] scripts/assets/validate-asset-paths.ts exists
[ ] asset optimization writes to public/models/optimized/
[ ] asset manifest points only to /models/optimized/
[ ] aircraft optimization writes glTF report and asset metadata beside the optimized GLB
```

## Folders

```txt
[ ] public/images/references/ exists
[ ] public/models/raw/ exists
[ ] public/models/cleaned/ exists
[ ] public/models/optimized/ exists
[ ] public/models/collision/ exists
```

## Docs

```txt
[ ] SCAFFOLD.md exists
[ ] docs/ explains stack
[ ] docs/ explains Meshy pipeline
[ ] docs/ explains Blender automation
[ ] docs/ explains GLB optimization
[ ] docs/ explains asset standards
[ ] docs/ includes one-prompt setup
[ ] docs/aircraft-end-to-end-asset-workflow.md points to the aircraft workflow
[ ] docs/docs/aircraft-end-to-end-asset-workflow.md defines the full aircraft model workflow
```

## Aircraft asset workflow

Before claiming any generated aircraft is complete:

```txt
[ ] Source image is under public/images/references/aircraft/<aircraftId>/
[ ] Source image has notes.md describing visual-only use and intended profile
[ ] Meshy dry-run was executed before live create
[ ] Exactly one live Meshy create task was made for this aircraft
[ ] Raw GLB and Meshy metadata are under public/models/raw/aircraft/<aircraftId>/
[ ] Cleaned GLB and Blender cleanup report are under public/models/cleaned/aircraft/<aircraftId>/
[ ] Optimized GLB, glTF report, and asset metadata are under public/models/optimized/aircraft/<aircraftId>/
[ ] Runtime manifest maps the visual asset to aircraftProfileId
[ ] Flight test scene or selector can load the aircraft by aircraftProfileId
[ ] Aircraft profile exists or is intentionally mapped to an existing profile
[ ] Profile mode is recorded as real_aircraft, inspired_by_real_aircraft, or generic_class
[ ] Profile sources, assumptions, confidence, and tuning notes are recorded
[ ] Mesh geometry is not used as aerodynamic truth
[ ] Visual nose is oriented along aircraft local -Z
[ ] Browser smoke check confirms the optimized GLB loads and renders
[ ] Build and tests pass
[ ] Final report says whether generated GLBs are ignored by git and whether Meshy credits were spent
```

## Final manual notes

At completion, Codex should tell the user:

1. Which commands to run first.
2. Where to put the Meshy API key.
3. How to test the game.
4. How to generate the first Meshy asset.
5. How to clean and optimize that asset.
6. Any current limitations.
