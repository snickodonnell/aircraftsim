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

Secrets:

- Put `MESHY_API_KEY` in `.env`.
- Never create `VITE_MESHY_API_KEY`.
- Never paste API keys into docs or source files.

The scripts use Meshy's current `image_url` and `image_urls` request fields and request GLB output with `target_formats: ["glb"]`. Local image files are converted to data URIs only in live mode.

Troubleshooting:

- Missing key: add `MESHY_API_KEY` to `.env`, then rerun with `--live`.
- Missing image: confirm the file exists in `public/images/references`.
- Failed task: inspect the saved `.meshy.json` metadata locally and retry only after understanding the failure.
