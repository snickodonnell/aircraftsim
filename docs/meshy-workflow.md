# Meshy Workflow

Meshy scripts live in `scripts/meshy`.

Commands:

```bash
npm run meshy:create -- --name tiny_test_asset --image public/images/references/tiny_test_asset.png
npm run meshy:multi-image-to-3d -- --name tiny_test_asset --images public/images/references/front.png,public/images/references/side.png
npm run meshy:poll -- --task-id TASK_ID --type image-to-3d
npm run meshy:download -- --task-id TASK_ID --name tiny_test_asset --type image-to-3d
```

Dry-run is the default. Use `--live` to call Meshy after review.

Aircraft runs:

- Read `docs/aircraft-end-to-end-asset-workflow.md` and `docs/docs/aircraft-end-to-end-asset-workflow.md` first.
- Confirm the source image exists before creating a task.
- Run the dry-run create command before the live create command.
- Set `ASSET_RAW_DIR`, `ASSET_CLEANED_DIR`, and `ASSET_OPTIMIZED_DIR` to the aircraft-specific folders for the command.
- Create exactly one live Meshy task unless the user explicitly asks for more.
- Treat the live create call as the likely credit-spending operation. Polling and downloading the same task should not create another task.
- Save canonical `meshy-task.json` and `meshy-metadata.json` next to the raw GLB.

Example aircraft command shape:

```powershell
$env:ASSET_RAW_DIR='public/models/raw/aircraft/spitfire_like'
$env:ASSET_CLEANED_DIR='public/models/cleaned/aircraft/spitfire_like'
$env:ASSET_OPTIMIZED_DIR='public/models/optimized/aircraft/spitfire_like'
npm run meshy:create -- --name spitfire_like_raw --image public/images/references/aircraft/spitfire_like/source.png
npm run meshy:create -- --name spitfire_like_raw --image public/images/references/aircraft/spitfire_like/source.png --live
```

Secrets:

- Put `MESHY_API_KEY` in `.env`.
- Never create `VITE_MESHY_API_KEY`.
- Never paste API keys into docs or source files.

The scripts use Meshy's current `image_url` and `image_urls` request fields and request GLB output with `target_formats: ["glb"]`. Local image files are converted to data URIs only in live mode.

Troubleshooting:

- Missing key: add `MESHY_API_KEY` to `.env`, then rerun with `--live`.
- Missing image: confirm the file exists in `public/images/references`.
- Failed task: inspect the saved `.meshy.json` metadata locally and retry only after understanding the failure.
- Signed Meshy asset URLs can appear in script metadata. Do not paste those URLs into public docs or final summaries.
