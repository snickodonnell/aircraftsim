"""
Create a simple collision helper GLB from a cleaned source GLB.

Usage:
  blender -b --python scripts/blender/make_collision.py -- input.glb output.glb --asset-name tiny_test_asset

The output is a bounding-box collision helper. It is for tooling/review only;
the runtime scaffold still uses simple Rapier primitive colliders by default.
"""

import argparse
import sys
from pathlib import Path

import bpy
import mathutils


def parse_args():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    parser = argparse.ArgumentParser(description="Build a box collision helper GLB.")
    parser.add_argument("input")
    parser.add_argument("output")
    parser.add_argument("--asset-name", default="asset")
    return parser.parse_args(argv)


def reset_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete()


def mesh_objects():
    return [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]


def bounds(objects):
    min_x = min_y = min_z = float("inf")
    max_x = max_y = max_z = float("-inf")
    for obj in objects:
        for corner in obj.bound_box:
            world = obj.matrix_world @ mathutils.Vector(corner)
            min_x = min(min_x, world.x)
            min_y = min(min_y, world.y)
            min_z = min(min_z, world.z)
            max_x = max(max_x, world.x)
            max_y = max(max_y, world.y)
            max_z = max(max_z, world.z)
    return (min_x, min_y, min_z), (max_x, max_y, max_z)


def main():
    args = parse_args()
    input_path = Path(args.input)
    output_path = Path(args.output)
    if not input_path.exists():
        raise FileNotFoundError(f"Input GLB not found: {input_path}")

    reset_scene()
    bpy.ops.import_scene.gltf(filepath=str(input_path))
    meshes = mesh_objects()
    if not meshes:
        raise RuntimeError("No mesh objects found to bound.")

    min_corner, max_corner = bounds(meshes)
    center = tuple((min_corner[i] + max_corner[i]) / 2 for i in range(3))
    size = tuple(max_corner[i] - min_corner[i] for i in range(3))

    reset_scene()
    bpy.ops.mesh.primitive_cube_add(size=1, location=center)
    collider = bpy.context.object
    collider.name = f"{args.asset_name}_collider_box"
    collider.dimensions = size
    collider["collision"] = True
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.export_scene.gltf(filepath=str(output_path), export_format="GLB", export_apply=True)
    print(f"Collision helper exported to: {output_path}")


if __name__ == "__main__":
    main()
