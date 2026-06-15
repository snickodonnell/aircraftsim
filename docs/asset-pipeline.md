# Asset Pipeline

For aircraft assets, read and follow the aircraft-specific workflow before using the generic pipeline:

```txt
docs/aircraft-end-to-end-asset-workflow.md
docs/docs/aircraft-end-to-end-asset-workflow.md
```

Aircraft assets use aircraft-specific folders under `public/images/references/aircraft/<aircraftId>/` and `public/models/{raw,cleaned,optimized}/aircraft/<aircraftId>/`, must save metadata/reports beside each stage, and must map visuals to an `aircraftProfileId`. Do not derive aircraft physics from generated mesh geometry.

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
