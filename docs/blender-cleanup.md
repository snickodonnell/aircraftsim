# Blender Cleanup

Blender scripts live in `scripts/blender`.

Single asset cleanup:

```bash
npm run asset:clean -- public/models/raw/tiny_test_asset.glb public/models/cleaned/tiny_test_asset.glb --asset-name tiny_test_asset --shade smooth
```

The Node wrapper reads `BLENDER_PATH` from `.env`. If unset, it tries `blender` from PATH.

Direct Blender form:

```bash
blender -b --python scripts/blender/clean_glb.py -- input.glb output.glb --asset-name tiny_test_asset --scale 1.0 --origin base --report public/models/cleaned/tiny_test_asset/blender-cleanup-report.json
```

Cleanup behavior:

- Imports GLB.
- Removes imported cameras and lights.
- Removes hidden objects when safe.
- Applies scale and rotation.
- Can bake an explicit orientation rotation with `--rotate-euler-deg x y z`.
- Recalculates normals.
- Optionally decimates with `--decimate`.
- Optionally shades flat or smooth.
- Renames mesh/material objects consistently.
- Can create a simple box collision helper.
- Exports cleaned GLB.
- Writes a JSON cleanup report when `--report` is supplied.

Aircraft orientation:

- Runtime aircraft visuals must use `+X` right wing, `+Y` up, and `-Z` nose/forward.
- Blender's glTF importer maps runtime `-Z` to Blender `+Y`, so an imported, correctly oriented aircraft usually points nose toward Blender `+Y` in top view.
- Meshy aircraft often need a baked cleanup rotation. For example, a raw aircraft with nose along Blender `-X` can be fixed with `--rotate-euler-deg 0 0 -90`.
- Record the raw orientation, applied rotation, and verification notes in `blender-cleanup-report.json`.

If Blender cannot start, set `BLENDER_PATH` to the full `blender.exe` path.
