# 11 — One-Prompt Setup for Codex

Copy the prompt below into Codex when you are ready to scaffold the repo.

```txt
Read SCAFFOLD.md and every file in docs/ before making changes.

Set up this repository as a Vite + React + TypeScript + React Three Fiber browser game with an AI-assisted 2D reference → Meshy Pro 3D generation → Blender cleanup → glTF optimization → three.js runtime asset pipeline.

Follow the scaffold exactly unless you find an existing repo structure that must be preserved. Do not delete existing user files. Make small, verifiable changes.

Primary tasks:

1. Inspect the repo and determine whether it is empty or already has a Vite app.
2. If empty, create a Vite React TypeScript app.
3. Install runtime dependencies: three, @types/three, @react-three/fiber, @react-three/drei, @react-three/rapier, zustand.
4. Install dev/pipeline dependencies: @gltf-transform/cli, gltfjsx, dotenv, tsx, typescript.
5. Create the required src/, public/, scripts/, and docs-aware structure from SCAFFOLD.md.
6. Create or update .env.example with Meshy and Blender placeholders. Ensure .env, .env.local, and .env.*.local are ignored.
7. Add package scripts for dev/build/preview, Meshy task creation/polling/downloading, Blender cleanup, asset inspection, asset optimization, and asset path validation.
8. Build a minimal working React Three Fiber scene with lighting, physics, ground, controllable placeholder player, camera follow, and a simple level file.
9. Create src/assets/assetManifest.ts with runtime asset conventions pointing only to /models/optimized/*.glb.
10. Create Meshy TypeScript scripts that load env vars, validate inputs, create Image-to-3D and Multi-Image-to-3D tasks, poll status, download model output, and save metadata. Do not print API keys. Confirm current Meshy request/response fields against docs before finalizing exact payloads.
11. Create Blender Python scripts for headless GLB cleanup: import raw GLB, remove unneeded cameras/lights, apply transforms, fix normals, optionally decimate, rename objects, set origin, optionally generate a simple box collider, and export cleaned GLB.
12. Create asset optimization scripts wrapping glTF Transform inspect/optimize, saving final files to public/models/optimized/.
13. Update docs if any command or file structure differs from the scaffold.
14. Run npm run build and fix errors.
15. Verify acceptance criteria in docs/12_ACCEPTANCE_CHECKLIST.md.

Important constraints:

- Use GLB as the only runtime asset format.
- Do not commit real API keys.
- Do not use raw Meshy models directly in the game.
- Do not use high-poly generated meshes as physics colliders.
- Keep the initial app simple: no multiplayer, no backend, no auth, no ECS, no procedural generation.
- Prefer repeatable scripts over manual steps.
- If Blender is not on PATH, support BLENDER_PATH in .env.

At the end, summarize what you created, what commands to run, and any manual follow-up required.
```
