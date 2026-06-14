# 01 — Stack Decisions

This repo is a browser game plus an AI-assisted 3D asset pipeline. Keep the stack small, modern, and easy for Codex to reason about.

## Application stack

Use these technologies for the browser game:

```txt
Vite
React
TypeScript
three
@react-three/fiber
@react-three/drei
@react-three/rapier
zustand
```

### Why this stack

- **Vite**: fast dev server and simple build system.
- **React + TypeScript**: readable component structure and type safety.
- **three**: core WebGL rendering library.
- **React Three Fiber**: React renderer for three.js; keeps scene code componentized.
- **Drei**: useful R3F helpers.
- **Rapier**: browser-friendly physics.
- **Zustand**: lightweight state management without heavy architecture.

## Asset generation stack

Use:

```txt
OpenAI / image model of choice for 2D references
Meshy Pro API for Image-to-3D and Multi-Image-to-3D
Blender for cleanup
Blender Python for automation
GLB as final runtime asset format
glTF Transform for optimization
Khronos glTF Validator for validation
```

## Codex role

Codex should own:

- repo setup
- dependency installation
- scripts
- TypeScript game code
- Blender Python automation
- Meshy API wrapper scripts
- asset manifest management
- documentation updates
- test/build fixes

Codex should not be expected to judge final artistic quality. The user may still inspect assets visually in Blender or a model viewer.

## What not to add at scaffold stage

Do not add these during the initial scaffold:

- multiplayer
- backend database
- authentication
- procedural terrain generation
- ECS framework
- complex animation state machines
- multiplayer physics
- shader-heavy rendering system
- unnecessary UI libraries

Add those only after the first playable prototype exists.

## Default install commands

```bash
npm install three @types/three @react-three/fiber @react-three/drei @react-three/rapier zustand
npm install -D @gltf-transform/cli gltfjsx dotenv tsx typescript
```

Optional:

```bash
npm install -D prettier eslint
```

## Runtime asset policy

Only optimized GLB files in `public/models/optimized/` should be loaded by the game.

Raw and cleaned files are pipeline artifacts, not runtime assets.

```txt
public/models/raw/       # Meshy downloads, not used by game
public/models/cleaned/   # Blender output, not used by game
public/models/optimized/ # final runtime GLB assets
```

## Current first-playable target

Build the smallest useful prototype:

- controllable player
- small level
- camera follow
- ground and obstacles
- physics
- one loaded GLB prop
- asset manifest
- repeatable asset pipeline
