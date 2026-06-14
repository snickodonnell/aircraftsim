# 09 — Asset Standards

This document defines the standards for all generated and imported 3D assets.

## Naming

Use lowercase snake case for asset IDs and file names.

Good:

```txt
wooden_chest
stone_wall_low
rusty_key
```

Bad:

```txt
Wooden Chest
woodenChest
wooden-chest-final-FINAL2
```

## Folder lifecycle

```txt
public/images/references/   # 2D source references
public/models/raw/          # Meshy output
public/models/cleaned/      # Blender cleanup output
public/models/optimized/    # runtime game assets
```

## Scale

Adopt this default scale:

```txt
1 Blender unit = 1 meter
```

Rough guide:

```txt
Player height:        1.7–1.9 units
Door height:          2.0–2.2 units
Small chest:          0.8–1.2 units wide
Table:                0.8 units tall
Wall segment:         2.0–3.0 units wide
```

## Origin / pivot

For props:

```txt
Origin at bottom center, sitting on ground plane.
```

For characters:

```txt
Origin between feet on ground plane.
```

For doors or hinged objects:

```txt
Origin at hinge point.
```

For projectiles/items:

```txt
Origin at visual center.
```

## Orientation

Use consistent forward direction.

Preferred:

```txt
Object forward = negative Z
Up = positive Y
```

If this conflicts with tool output, fix in Blender cleanup and document the convention.

## Colliders

Default collider by type:

```txt
Small prop:          box
Round object:        sphere
Character:           capsule
Wall/floor:          box
Complex static mesh: simplified collision mesh only if needed
```

Do not use raw generated mesh as a collider.

## Triangle budget rough guide

```txt
Tiny prop:       100–1,000 triangles
Small prop:      500–3,000 triangles
Medium prop:     2,000–8,000 triangles
Hero prop:       5,000–20,000 triangles
Character:       depends on animation; keep lean
```

For browser runtime, smaller is better.

## Texture budget rough guide

```txt
Tiny prop:       256–512
Small prop:      512–1024
Medium prop:     1024
Hero prop:       1024–2048
```

Use 2048 only when needed.

## Material policy

Prefer simple PBR materials.

Avoid:

- enormous texture maps
- many tiny materials on one prop
- complex node materials that do not export well
- unsupported shader effects

## Mesh cleanup checklist

Every generated asset should pass this checklist before entering `optimized/`:

```txt
[ ] Correct scale
[ ] Correct origin
[ ] Correct forward direction
[ ] No unnecessary cameras/lights
[ ] No hidden junk geometry
[ ] Normals fixed
[ ] File name follows convention
[ ] Runtime path points to optimized GLB
[ ] Collider strategy defined
[ ] Texture size reasonable
[ ] GLB inspected/optimized
```
