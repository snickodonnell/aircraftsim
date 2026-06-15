# 05 — Meshy Pipeline

This document defines the Meshy Pro API workflow.

## Purpose

Codex should create scripts that let the user generate 3D assets from reference images and save the raw models into the repo.

Meshy calls consume credits. Scripts should be explicit and cautious.

For aircraft assets, read these first and follow the aircraft-specific layout and metadata requirements:

```txt
docs/aircraft-end-to-end-asset-workflow.md
docs/docs/aircraft-end-to-end-asset-workflow.md
```

Aircraft generation must not proceed as a generic object pipeline. Aircraft source images live under `public/images/references/aircraft/<aircraftId>/`, raw outputs live under `public/models/raw/aircraft/<aircraftId>/`, and the resulting visual model must be mapped to an `aircraftProfileId`. Do not derive aerodynamic properties from Meshy geometry.

## Supported workflows

### Image-to-3D

Use for a single strong reference image.

Input:

```txt
public/images/references/wooden_chest_front.png
```

Output:

```txt
public/models/raw/wooden_chest.glb
public/models/raw/wooden_chest.meshy.json
```

### Multi-Image-to-3D

Use for controlled front/side/back/three-quarter views.

Input:

```txt
public/images/references/wooden_chest_front.png
public/images/references/wooden_chest_side.png
public/images/references/wooden_chest_back.png
public/images/references/wooden_chest_3q.png
```

Output:

```txt
public/models/raw/wooden_chest.glb
public/models/raw/wooden_chest.meshy.json
```

## Endpoint configuration

Do not hard-code the full URL in many places. Centralize it.

Expected base:

```txt
MESHY_API_BASE_URL=https://api.meshy.ai/openapi/v1
```

Endpoint paths:

```txt
/image-to-3d
/image-to-3d/:id
/multi-image-to-3d
/multi-image-to-3d/:id
```

Confirm exact request fields against Meshy docs before production use.

## Authentication

Use Bearer token auth:

```txt
Authorization: Bearer ${MESHY_API_KEY}
```

Never print the key.

## Required scripts

### `scripts/meshy/create-image-to-3d-task.ts`

Responsibilities:

- Load env.
- Parse CLI args:
  - `--name`
  - `--image`
  - optional quality/model parameters
- Validate image exists.
- Create Meshy Image-to-3D task.
- Print task ID.
- Save task metadata to:

```txt
public/models/raw/<name>.meshy.json
```

Example command:

```bash
npm run meshy:create -- --name wooden_chest --image public/images/references/wooden_chest_front.png
```

### `scripts/meshy/create-multi-image-to-3d-task.ts`

Responsibilities:

- Load env.
- Parse CLI args:
  - `--name`
  - `--images` comma-separated list
- Validate every image exists.
- Create Meshy Multi-Image-to-3D task.
- Print task ID.
- Save task metadata.

Example:

```bash
npm run meshy:multi-image-to-3d -- --name wooden_chest --images public/images/references/wooden_chest_front.png,public/images/references/wooden_chest_side.png,public/images/references/wooden_chest_back.png
```

### `scripts/meshy/poll-task.ts`

Responsibilities:

- Load env.
- Parse CLI args:
  - `--task-id`
  - `--type image-to-3d | multi-image-to-3d`
- Poll status.
- Print status and progress.
- Stop on success/failure.
- Do not poll forever.

Example:

```bash
npm run meshy:poll -- --task-id 018a210d-8ba4-705c-b111-1f1776f7f578 --type image-to-3d
```

### `scripts/meshy/download-model.ts`

Responsibilities:

- Load env.
- Retrieve task result.
- Find model download URL.
- Download GLB/FBX/OBJ as requested.
- Prefer GLB.
- Save to `public/models/raw/<name>.glb`.
- Update metadata.

Example:

```bash
npm run meshy:download -- --task-id TASK_ID --type image-to-3d --name wooden_chest
```

### `scripts/meshy/generate-from-reference.ts`

Optional convenience wrapper.

Responsibilities:

- Create task.
- Poll task.
- Download output.
- Save metadata.

This wrapper should require a clear `--confirm` flag to avoid accidental credit use.

Example:

```bash
npm run meshy:create -- --name wooden_chest --image public/images/references/wooden_chest_front.png --live
```

## Metadata file pattern

For every generated model, save metadata:

```json
{
  "assetName": "wooden_chest",
  "source": "meshy",
  "workflow": "image-to-3d",
  "taskId": "TASK_ID",
  "inputImages": ["public/images/references/wooden_chest_front.png"],
  "rawModelPath": "public/models/raw/wooden_chest.glb",
  "cleanedModelPath": "public/models/cleaned/wooden_chest.glb",
  "optimizedModelPath": "public/models/optimized/wooden_chest.glb",
  "createdAt": "ISO_DATE",
  "notes": []
}
```

## Implementation notes for Codex

Use native `fetch` if Node version supports it. Otherwise install a minimal dependency only if necessary.

Do not add a full HTTP framework.

Use Node `fs/promises` and `path`.

Keep CLI parsing simple. For scaffold stage, a small helper function is acceptable; no need for Commander unless argument parsing grows.

## User-facing status messages

Scripts should print:

- asset name
- input path(s)
- workflow type
- task id
- status
- output path

Scripts must not print:

- API key
- full auth header
