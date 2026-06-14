# Codex Scaffold: AI-Assisted 2D → 3D → three.js Browser Game

This file is the master instruction document for Codex. Read this file first, then read every file in `docs/` before making changes.

The goal is to scaffold a browser-based 3D game pipeline where Codex can:

1. Create and maintain a modern three.js browser game.
2. Use Meshy Pro API credentials from environment variables to generate 3D assets from controlled 2D references.
3. Save generated assets into predictable folders.
4. Run Blender in background/headless mode for repeatable mesh cleanup.
5. Run glTF Transform for final GLB optimization.
6. Import final optimized assets into a React Three Fiber game.
7. Keep the whole workflow version-controlled, reproducible, and safe.

The intended developer environment is:

- Windows + VS Code
- Node.js LTS
- npm
- Blender installed locally
- Meshy Pro account with API key
- Codex available in VS Code and/or Codex CLI
- Git/GitHub

Do not assume the repository already contains a working app. If this file is used in an empty repo, create the app from scratch. If it is used in an existing repo, preserve existing work and adapt the structure carefully.

---

## Read order for Codex

Before editing code, read these files in order:

1. `SCAFFOLD.md` — master setup and operating plan.
2. `docs/01_STACK_DECISIONS.md` — chosen app, asset, and automation stack.
3. `docs/02_CODEX_OPERATING_INSTRUCTIONS.md` — how Codex should work in this repo.
4. `docs/03_REPO_STRUCTURE.md` — required directory and file layout.
5. `docs/04_ENVIRONMENT_AND_SECRETS.md` — environment variables and secret handling.
6. `docs/05_MESHY_PIPELINE.md` — Meshy API workflow and required scripts.
7. `docs/06_BLENDER_AUTOMATION.md` — Blender headless cleanup workflow.
8. `docs/07_GLTF_OPTIMIZATION.md` — GLB inspection, validation, and optimization.
9. `docs/08_THREEJS_GAME_ARCHITECTURE.md` — app architecture and game systems.
10. `docs/09_ASSET_STANDARDS.md` — naming, scale, pivots, collision, texture rules.
11. `docs/10_REFERENCE_IMAGE_PROMPTS.md` — 2D reference prompt templates.
12. `docs/11_ONE_PROMPT_SETUP.md` — single prompt the user can paste into Codex.
13. `docs/12_ACCEPTANCE_CHECKLIST.md` — final completion criteria.

---

## Non-negotiable design rules

Codex must follow these rules unless the user explicitly overrides them.

### Runtime asset format

Use `.glb` as the only runtime 3D asset format.

Allowed intermediate formats:

- `.glb`
- `.gltf`
- `.fbx` only when Blender cleanup or rigging requires it
- `.blend` only for manual source files, not runtime

The game should load only optimized `.glb` assets from:

```txt
public/models/optimized/
```

### Meshy API usage

Use Meshy through API credentials stored in local environment variables. Never hard-code keys. Never commit real keys.

Expected environment variable:

```txt
MESHY_API_KEY=replace_with_real_key
```

The Meshy API base URL should be configurable:

```txt
MESHY_API_BASE_URL=https://api.meshy.ai/openapi/v1
```

The current Meshy Image-to-3D endpoint pattern is:

```txt
POST /image-to-3d
GET /image-to-3d/:id
```

The current Meshy Multi-Image-to-3D endpoint pattern is:

```txt
POST /multi-image-to-3d
GET /multi-image-to-3d/:id
```

Confirm request/response fields against current Meshy docs before finalizing production scripts. Build scripts so endpoint paths and model parameters can be updated easily.

### Blender automation approach

Use Blender Python scripts as the primary Codex ↔ Blender integration method.

Preferred flow:

```txt
Codex edits Python scripts
→ npm script invokes Blender in background mode
→ Blender imports raw GLB
→ Blender cleans/scales/renames/exports cleaned GLB
→ glTF Transform optimizes final GLB
```

Do not rely on BlenderMCP for the production asset pipeline. BlenderMCP may be added later for interactive scene inspection, but the durable pipeline should be version-controlled scripts.

### Browser game framework

Use:

```txt
Vite
React
TypeScript
three
@react-three/fiber
@react-three/drei
@react-three/rapier
zustand
```

Prefer simple, understandable game architecture over heavy engine patterns.

Do not add multiplayer, ECS, networking, backend services, or procedural world generation during the initial scaffold unless the user explicitly asks.

### Physics

Use `@react-three/rapier` for runtime physics.

Do not use high-poly generated meshes as colliders. Use simple primitive colliders first:

- cuboids
- balls
- capsules
- manually-created low-poly collision meshes

### Asset quality goal

This scaffold is for a browser game. Optimize for:

- fast loading
- stable frame rate
- readable silhouettes
- consistent scale
- simple collision
- repeatable pipeline

Do not optimize for film-quality assets.

---

## Initial setup task list for Codex

When asked to scaffold the repo, perform these steps.

### Phase 0 — Inspect repo

1. Check whether `package.json` exists.
2. Check whether a Vite app already exists.
3. Check whether `src/`, `public/`, or existing game files exist.
4. Do not delete existing user files.
5. If the repo is empty, create a new Vite React TypeScript app.
6. If the repo is not empty, adapt the structure while preserving existing work.

### Phase 1 — Install dependencies

Install runtime dependencies:

```bash
npm install three @types/three @react-three/fiber @react-three/drei @react-three/rapier zustand
```

Install dev/pipeline dependencies:

```bash
npm install -D @gltf-transform/cli gltfjsx dotenv tsx typescript
```

Optional but helpful:

```bash
npm install -D prettier eslint
```

Do not install large or obscure packages unless needed.

### Phase 2 — Create repo structure

Create this structure if missing:

```txt
src/
  game/
    Game.tsx
    Scene.tsx
    Player.tsx
    CameraRig.tsx
    Lighting.tsx
    physics.ts
    input.ts
    useGameStore.ts
  assets/
    assetManifest.ts
    GeneratedModels.md
  components/
  levels/
    level01.json

public/
  references/
  models/
    raw/
    cleaned/
    optimized/
    collision/

scripts/
  meshy/
    create-image-to-3d-task.ts
    create-multi-image-to-3d-task.ts
    poll-task.ts
    download-model.ts
    generate-from-reference.ts
  blender/
    clean_glb.py
    batch_clean.py
  assets/
    optimize-glb.ts
    inspect-glb.ts
    validate-asset-paths.ts

docs/
  ...existing scaffold docs...
```

### Phase 3 — Create environment files

Create `.env.example` with placeholders.

Create `.gitignore` rules to ensure local env files are not committed:

```txt
.env
.env.local
.env.*.local
```

Do not create a real `.env.local` unless the user asks. If one exists, do not read or print secret values.

### Phase 4 — Add package scripts

Add scripts like these to `package.json`, adapting paths for Windows if needed:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "meshy:image-to-3d": "tsx scripts/meshy/create-image-to-3d-task.ts",
    "meshy:multi-image-to-3d": "tsx scripts/meshy/create-multi-image-to-3d-task.ts",
    "meshy:poll": "tsx scripts/meshy/poll-task.ts",
    "meshy:download": "tsx scripts/meshy/download-model.ts",
    "asset:inspect": "tsx scripts/assets/inspect-glb.ts",
    "asset:optimize": "tsx scripts/assets/optimize-glb.ts",
    "asset:validate": "tsx scripts/assets/validate-asset-paths.ts",
    "asset:clean": "blender -b --python scripts/blender/clean_glb.py --",
    "asset:batch-clean": "blender -b --python scripts/blender/batch_clean.py --"
  }
}
```

On Windows, if `blender` is not in PATH, instruct the user to set:

```txt
BLENDER_PATH=C:\Program Files\Blender Foundation\Blender 4.5\blender.exe
```

Then scripts should use a Node wrapper that reads `BLENDER_PATH` rather than assuming `blender` is globally available.

### Phase 5 — Build the game skeleton

Create a minimal working scene:

- Canvas fills viewport.
- Lighting is present.
- Ground plane exists.
- Physics world exists.
- Player placeholder exists.
- Camera follows player.
- `assetManifest.ts` can register optimized GLB assets.
- Level data lives in `src/levels/level01.json`.

The initial scene should compile and run even before Meshy assets exist.

### Phase 6 — Build Meshy pipeline scripts

Create scripts that can:

1. Load env variables.
2. Validate `MESHY_API_KEY` exists.
3. Create an Image-to-3D task.
4. Create a Multi-Image-to-3D task.
5. Poll task status.
6. Download result files when available.
7. Save raw generated models under `public/models/raw/`.
8. Save metadata under `public/models/raw/<asset-name>.json` or `src/assets/generated/`.

Scripts should be explicit and defensive. They should print helpful messages but never print API keys.

### Phase 7 — Build Blender cleanup scripts

Create Blender Python scripts that:

1. Import raw `.glb`.
2. Clear cameras/lights from imported asset unless intentionally preserved.
3. Apply transforms.
4. Normalize scale if instructed.
5. Set origin/pivot.
6. Rename meshes according to asset naming rules.
7. Recalculate normals.
8. Optionally decimate.
9. Optionally shade flat or smooth.
10. Optionally generate simple box collision objects.
11. Export cleaned `.glb` to `public/models/cleaned/`.

The script should accept CLI args after `--`:

```bash
blender -b --python scripts/blender/clean_glb.py -- input.glb output.glb --asset-name chest_wooden --scale 1.0 --decimate 0.5
```

### Phase 8 — Build optimization pipeline

Create scripts that wrap glTF Transform to:

1. Inspect the cleaned asset.
2. Optimize the asset.
3. Resize/compress textures.
4. Save optimized `.glb` under `public/models/optimized/`.
5. Optionally run final inspection.
6. Update or validate `src/assets/assetManifest.ts`.

### Phase 9 — Add documentation

Keep docs up to date when adding pipeline behavior.

When adding new scripts, update:

- `docs/05_MESHY_PIPELINE.md`
- `docs/06_BLENDER_AUTOMATION.md`
- `docs/07_GLTF_OPTIMIZATION.md`
- `docs/12_ACCEPTANCE_CHECKLIST.md`

---

## Asset pipeline summary

The intended full asset flow is:

```txt
2D reference prompt
→ generated image/reference sheet
→ save reference to public/images/references/
→ Meshy Image-to-3D or Multi-Image-to-3D
→ raw model saved to public/models/raw/
→ Blender headless cleanup
→ cleaned model saved to public/models/cleaned/
→ glTF Transform optimization
→ optimized model saved to public/models/optimized/
→ asset manifest updated
→ game scene loads optimized model
```

---

## Meshy workflow commands to support

Codex should support a workflow similar to:

```bash
npm run meshy:create -- --name chest_wooden --image public/images/references/chest_front.png
npm run meshy:poll -- --task-id TASK_ID --type image-to-3d
npm run meshy:download -- --task-id TASK_ID --name chest_wooden --type image-to-3d
npm run asset:clean -- public/models/raw/chest_wooden.glb public/models/cleaned/chest_wooden.glb --asset-name chest_wooden
npm run asset:optimize -- --input public/models/cleaned/chest_wooden.glb --output public/models/optimized/chest_wooden.glb --texture-size 1024
```

For multi-image references:

```bash
npm run meshy:multi-image-to-3d -- --name chest_wooden --images public/images/references/chest_front.png,public/images/references/chest_side.png,public/images/references/chest_back.png
```

---

## First playable prototype target

The initial scaffold should aim for this first playable target:

```txt
One browser page
One controllable player placeholder
One small test level
Ground + simple obstacles
Physics collisions
One sample optimized GLB loaded from public/models/optimized/
Asset manifest
Documented Meshy → Blender → GLB workflow
No backend
No multiplayer
No account system
No procedural generation
```

---

## Required acceptance checks

Before claiming the scaffold is done, Codex must verify:

1. `npm install` succeeds.
2. `npm run dev` starts the app.
3. `npm run build` succeeds.
4. No real API keys are committed.
5. `.env.example` exists.
6. `public/models/raw`, `cleaned`, and `optimized` exist.
7. Meshy scripts fail gracefully if `MESHY_API_KEY` is missing.
8. Blender scripts include CLI usage documentation.
9. Asset optimization scripts include clear CLI usage.
10. A minimal R3F scene renders without Meshy assets.
11. `docs/` explains the full workflow.

---

## Sources and docs to check when updating this scaffold

When changing integration details, verify current docs:

- Meshy API docs: `https://docs.meshy.ai/`
- Meshy Image-to-3D docs: `https://docs.meshy.ai/en/api/image-to-3d`
- Meshy Multi-Image-to-3D docs: `https://docs.meshy.ai/en/api/multi-image-to-3d`
- Blender command line docs: `https://docs.blender.org/manual/en/latest/advanced/command_line/arguments.html`
- Blender Python API docs: `https://docs.blender.org/api/current/`
- glTF Transform CLI docs: `https://gltf-transform.dev/cli`
- three.js docs: `https://threejs.org/docs/`
- React Three Fiber docs: `https://r3f.docs.pmnd.rs/`
- Rapier docs: `https://rapier.rs/`
