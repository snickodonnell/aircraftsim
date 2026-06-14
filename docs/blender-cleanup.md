# Blender Cleanup

Blender scripts live in `scripts/blender`.

Single asset cleanup:

```bash
npm run asset:clean -- public/models/raw/tiny_test_asset.glb public/models/cleaned/tiny_test_asset.glb --asset-name tiny_test_asset --shade smooth
```

The Node wrapper reads `BLENDER_PATH` from `.env`. If unset, it tries `blender` from PATH.

Direct Blender form:

```bash
blender -b --python scripts/blender/clean_glb.py -- input.glb output.glb --asset-name tiny_test_asset --scale 1.0 --origin base
```

Cleanup behavior:

- Imports GLB.
- Removes imported cameras and lights.
- Removes hidden objects when safe.
- Applies scale and rotation.
- Recalculates normals.
- Optionally decimates with `--decimate`.
- Optionally shades flat or smooth.
- Renames mesh/material objects consistently.
- Can create a simple box collision helper.
- Exports cleaned GLB.

If Blender cannot start, set `BLENDER_PATH` to the full `blender.exe` path.
