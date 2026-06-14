# Codex Operating Rules

Keep the scaffold simple until the first reviewed asset is working end to end.

Do:

- Preserve existing files.
- Prefer additive changes.
- Keep Meshy scripts dry-run by default.
- Use `MESHY_API_KEY` only in local/server-side scripts.
- Use `BLENDER_PATH` when Blender is not on PATH.
- Load only optimized GLBs at runtime.
- Use simple Rapier colliders.
- Run `npm run build` before claiming the app is ready.

Do not:

- Create `VITE_MESHY_API_KEY`.
- Make live Meshy calls without review.
- Batch-generate Meshy assets yet.
- Use raw generated meshes directly in the game.
- Add multiplayer, auth, backend services, ECS, procedural generation, or shader systems during this scaffold.
