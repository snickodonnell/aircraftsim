# Asset Pipeline

For aircraft assets, read and follow the aircraft-specific workflow before using the generic pipeline:

```txt
docs/aircraft-end-to-end-asset-workflow.md
docs/docs/aircraft-end-to-end-asset-workflow.md
```

Aircraft assets use aircraft-specific folders under `public/images/references/aircraft/<aircraftId>/` and `public/models/{raw,cleaned,optimized}/aircraft/<aircraftId>/`, must save metadata/reports beside each stage, and must map visuals to an `aircraftProfileId`. Do not derive aircraft physics from generated mesh geometry.

When using the current generic Meshy scripts for aircraft, set the asset output directories for that command so the scripts do not write to the generic model folders:

```powershell
$env:ASSET_RAW_DIR='public/models/raw/aircraft/<aircraftId>'
$env:ASSET_CLEANED_DIR='public/models/cleaned/aircraft/<aircraftId>'
$env:ASSET_OPTIMIZED_DIR='public/models/optimized/aircraft/<aircraftId>'
```

Then write canonical stage files beside the generated artifacts:

```txt
public/models/raw/aircraft/<aircraftId>/meshy-task.json
public/models/raw/aircraft/<aircraftId>/meshy-metadata.json
public/models/cleaned/aircraft/<aircraftId>/blender-cleanup-report.json
public/models/optimized/aircraft/<aircraftId>/gltf-report.json
public/models/optimized/aircraft/<aircraftId>/asset-metadata.json
```

The intended single-asset flow is:

```txt
public/images/references/*.png
-> Meshy Image-to-3D dry-run/live task
-> public/models/raw/*.glb
-> Blender background cleanup
-> public/models/cleaned/*.glb
-> glTF Transform optimization
-> public/models/optimized/*.glb
-> src/assets/assetManifest.ts
-> React Three Fiber scene
```

Use one tiny test asset first:

```bash
npm run meshy:create -- --name tiny_test_asset --image public/images/references/tiny_test_asset.png
npm run meshy:poll -- --task-id TASK_ID --type image-to-3d
npm run meshy:download -- --task-id TASK_ID --name tiny_test_asset --type image-to-3d
npm run asset:build -- --name tiny_test_asset --input public/models/raw/tiny_test_asset.glb
```

Meshy commands are dry-run by default. Add `--live` only after reviewing the scaffold and accepting that the call may consume Meshy credits.

Do not automate batch generation yet. Do not use raw Meshy GLBs directly in the game.

Generated GLBs and Meshy script metadata are currently ignored by `.gitignore`. Mention that in final reports, and use Git LFS or adjust ignore rules when a stable runtime asset must be shared through git.
