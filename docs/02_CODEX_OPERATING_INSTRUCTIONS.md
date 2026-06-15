# 02 — Codex Operating Instructions

This file tells Codex how to behave in this repo.

## Overall behavior

Work in small, verifiable steps. Prefer simple code and explicit scripts over clever abstractions.

When implementing a task:

1. Inspect existing repo state.
2. Read relevant docs.
3. Plan the change.
4. Make focused edits.
5. Run the most relevant check.
6. Fix errors.
7. Update docs if behavior changed.

## Preserve user work

Do not delete or overwrite files unless clearly instructed.

When creating scaffold files in an existing repo:

- merge carefully
- preserve existing package scripts where possible
- avoid large rewrites
- do not rename user assets without a migration note

## Secrets policy

Never print real API keys.
Never commit real API keys.
Never include `.env.local` in git.
Never write real secrets into Markdown docs.

Use these files:

```txt
.env.example     # committed placeholder values
.env.local       # local real values, ignored by git
```

## Error handling standard

Scripts should fail with helpful messages.

Bad:

```txt
Error: undefined
```

Good:

```txt
Missing MESHY_API_KEY. Create .env.local from .env.example and add your Meshy Pro API key.
```

## Meshy API behavior

Codex should treat Meshy scripts as production-costing operations because they consume credits.

Before making scripts that call Meshy:

- validate env vars
- validate input image paths
- show task parameters
- require explicit command execution by the user or script caller
- do not loop infinitely
- poll at reasonable intervals
- persist metadata so failed/partial runs can resume

Do not repeatedly call Meshy just to debug TypeScript syntax.

For aircraft Meshy runs:

- read both aircraft workflow docs before starting
- run dry-run first
- create exactly one live task unless explicitly asked for more
- set command-scoped aircraft output directories if using generic scripts
- save canonical task/metadata JSON beside the raw GLB
- do not paste API keys or temporary signed model URLs into Markdown or final reports

## Blender automation behavior

Codex should prefer repeatable CLI scripts over manual Blender instructions.

Use:

```bash
blender -b --python scripts/blender/clean_glb.py -- input.glb output.glb [options]
```

If Blender is not found, support `BLENDER_PATH`.

Use Python scripts inside `scripts/blender/`.

Do not require GUI interaction for the default cleanup pipeline.

For aircraft cleanup, verify and document the visual orientation. Runtime aircraft forward is local `-Z`; after Blender import, that typically appears as Blender `+Y` in top view.

## Game code behavior

Keep game code simple and readable.

Use:

- one `Game.tsx` root
- one `Scene.tsx`
- one `Player.tsx`
- one `CameraRig.tsx`
- one `useGameStore.ts`
- one `assetManifest.ts`

Add complexity only when required.

## Documentation behavior

Whenever Codex creates or changes commands, update the relevant docs.

Important docs:

- `SCAFFOLD.md`
- `docs/05_MESHY_PIPELINE.md`
- `docs/06_BLENDER_AUTOMATION.md`
- `docs/07_GLTF_OPTIMIZATION.md`
- `docs/12_ACCEPTANCE_CHECKLIST.md`
- `docs/docs/aircraft-end-to-end-asset-workflow.md`

## Commit hygiene

Suggested commit grouping:

1. scaffold app
2. add game skeleton
3. add Meshy scripts
4. add Blender scripts
5. add optimization scripts
6. add docs

Do not include generated raw models in git unless the user explicitly wants to version assets.

Consider adding large generated assets to Git LFS later.
