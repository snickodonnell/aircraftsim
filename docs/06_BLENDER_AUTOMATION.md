# 06 — Blender Automation

This repo uses Blender Python scripts as the durable Codex ↔ Blender integration layer.

## Preferred workflow

```txt
raw Meshy GLB
→ Blender headless cleanup
→ cleaned GLB
→ glTF Transform optimization
→ optimized runtime GLB
```

Codex should generate and maintain Blender Python scripts under:

```txt
scripts/blender/
```

## Why scripts instead of interactive plugins

Blender Python scripts are:

- version-controlled
- repeatable
- reviewable
- easy to run in CI later
- easier for Codex to edit and debug

BlenderMCP may be useful later for interactive open-scene work, but it should not be required for the production asset pipeline.

## Required script: `clean_glb.py`

The script must accept:

```bash
blender -b --python scripts/blender/clean_glb.py -- input.glb output.glb --asset-name wooden_chest --scale 1.0 --decimate 0.65
```

Required positional args:

```txt
input.glb
output.glb
```

Optional args:

```txt
--asset-name <name>
--scale <float>
--decimate <float 0..1>
--origin center|base
--shade flat|smooth|keep
--generate-box-collider true|false
```

## Cleanup operations

The script should do these in order:

1. Reset scene.
2. Import input GLB.
3. Remove imported cameras unless `--keep-cameras` is added later.
4. Remove imported lights unless `--keep-lights` is added later.
5. Select imported mesh objects.
6. Apply scale/rotation transforms.
7. Normalize scale if `--scale` is provided.
8. Recalculate normals outside.
9. Rename objects.
10. Optionally decimate meshes.
11. Optionally shade flat or smooth.
12. Set origin to center or base.
13. Optionally generate simple collision helper.
14. Export output GLB.

## Object naming

Visible meshes:

```txt
<asset_name>_mesh_00
<asset_name>_mesh_01
```

Collision object:

```txt
<asset_name>_collider_box
```

Materials:

```txt
<asset_name>_mat_00
```

## Collision generation

For initial scaffold, collision generation can be simple:

- calculate bounding box around visible meshes
- create cube object with same dimensions
- name it `<asset_name>_collider_box`
- place it in the scene
- mark it with custom property:

```python
obj["collision"] = True
```

The runtime game does not have to load this collision mesh immediately. It may use primitive colliders in React Three Fiber first.

## Batch script: `batch_clean.py`

Optional but useful.

It should process all `.glb` files in `public/models/raw/` and write matching names to `public/models/cleaned/`.

Example:

```bash
blender -b --python scripts/blender/batch_clean.py -- public/models/raw public/models/cleaned --decimate 0.65
```

## Windows support

If `blender` is not on PATH, use `BLENDER_PATH`:

```txt
BLENDER_PATH=C:\Program Files\Blender Foundation\Blender 4.5\blender.exe
```

Codex may create a Node wrapper later:

```txt
scripts/assets/run-blender-clean.ts
```

That wrapper should read `BLENDER_PATH` and spawn Blender safely.

## Manual QA in Blender

After automated cleanup, the user may open the cleaned GLB in Blender and check:

- scale
- origin
- silhouette
- texture assignment
- normals
- hidden geometry
- triangle count
- collision shape

Codex should not assume AI-generated assets are automatically game-ready.
