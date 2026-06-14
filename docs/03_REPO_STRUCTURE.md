# 03 — Repo Structure

Codex should create or preserve this structure.

```txt
.
├─ SCAFFOLD.md
├─ .env.example
├─ .gitignore
├─ package.json
├─ vite.config.ts
├─ tsconfig.json
├─ index.html
├─ docs/
│  ├─ 01_STACK_DECISIONS.md
│  ├─ 02_CODEX_OPERATING_INSTRUCTIONS.md
│  ├─ 03_REPO_STRUCTURE.md
│  ├─ 04_ENVIRONMENT_AND_SECRETS.md
│  ├─ 05_MESHY_PIPELINE.md
│  ├─ 06_BLENDER_AUTOMATION.md
│  ├─ 07_GLTF_OPTIMIZATION.md
│  ├─ 08_THREEJS_GAME_ARCHITECTURE.md
│  ├─ 09_ASSET_STANDARDS.md
│  ├─ 10_REFERENCE_IMAGE_PROMPTS.md
│  ├─ 11_ONE_PROMPT_SETUP.md
│  └─ 12_ACCEPTANCE_CHECKLIST.md
├─ src/
│  ├─ App.tsx
│  ├─ main.tsx
│  ├─ index.css
│  ├─ game/
│  │  ├─ Game.tsx
│  │  ├─ Scene.tsx
│  │  ├─ Player.tsx
│  │  ├─ CameraRig.tsx
│  │  ├─ Lighting.tsx
│  │  ├─ physics.ts
│  │  ├─ input.ts
│  │  └─ useGameStore.ts
│  ├─ assets/
│  │  ├─ assetManifest.ts
│  │  └─ GeneratedModels.md
│  ├─ components/
│  └─ levels/
│     └─ level01.json
├─ public/
│  ├─ images/
│  │  └─ references/
│  ├─ references/
│  └─ models/
│     ├─ raw/
│     ├─ cleaned/
│     ├─ optimized/
│     └─ collision/
└─ scripts/
   ├─ meshy/
   │  ├─ create-image-to-3d-task.ts
   │  ├─ create-multi-image-to-3d-task.ts
   │  ├─ poll-task.ts
   │  ├─ download-model.ts
   │  └─ generate-from-reference.ts
   ├─ blender/
   │  ├─ clean_glb.py
   │  └─ batch_clean.py
   └─ assets/
      ├─ optimize-glb.ts
      ├─ inspect-glb.ts
      └─ validate-asset-paths.ts
```

## Directory responsibilities

### `src/game/`

All gameplay and scene code.

### `src/assets/`

Asset manifest and generated component notes. This should not contain large binary files.

### `src/levels/`

Small JSON level definitions.

### `public/images/references/`

2D reference images used as Meshy inputs. These are usually `.png` or `.jpg`.

### `public/references/`

Compatibility placeholder for older scaffold commands. Prefer `public/images/references/`.

### `public/models/raw/`

Raw downloads from Meshy. These are not runtime assets.

### `public/models/cleaned/`

Blender-cleaned exports. These are not runtime assets unless temporarily debugging.

### `public/models/optimized/`

Final runtime GLB files loaded by the browser game.

### `public/models/collision/`

Optional collision-only assets or exported collision helpers.

### `scripts/meshy/`

Node/TypeScript scripts for Meshy API work.

### `scripts/blender/`

Python scripts executed by Blender.

### `scripts/assets/`

Node/TypeScript wrappers for glTF inspection, optimization, and manifest validation.

## File naming conventions

Use lowercase snake case for asset files:

```txt
wooden_chest.glb
stone_wall_low.glb
goblin_idle.glb
```

Avoid spaces in file names.

Use stable asset IDs in code:

```ts
wooden_chest
stone_wall_low
goblin_idle
```
