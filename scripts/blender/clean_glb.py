"""
Blender GLB cleanup script.

Usage:
  blender -b --python scripts/blender/clean_glb.py -- input.glb output.glb --asset-name wooden_chest --scale 1.0 --decimate 0.65 --origin base --shade smooth --generate-box-collider true

Arguments after `--`:
  input.glb                         Required input GLB path.
  output.glb                        Required output GLB path.
  --asset-name <name>               Stable asset name used for object renaming.
  --scale <float>                   Uniform scale multiplier applied before export.
  --decimate <float 0..1>           Optional decimate ratio. Omit to skip.
  --origin center|base              Origin placement. Default: base.
  --shade flat|smooth|keep          Shading mode. Default: keep.
  --generate-box-collider true|false Default: false.

Notes:
  This script is intended to be edited and improved by Codex.
  It is a safe starter, not a perfect cleanup system for every generated model.
"""

import argparse
import sys
from pathlib import Path

import bpy
import mathutils


def parse_args():
    if "--" in sys.argv:
        argv = sys.argv[sys.argv.index("--") + 1:]
    else:
        argv = []

    parser = argparse.ArgumentParser(description="Clean and export a GLB asset using Blender.")
    parser.add_argument("input", help="Input GLB path")
    parser.add_argument("output", help="Output GLB path")
    parser.add_argument("--asset-name", default=None)
    parser.add_argument("--scale", type=float, default=1.0)
    parser.add_argument("--decimate", type=float, default=None)
    parser.add_argument("--origin", choices=["center", "base"], default="base")
    parser.add_argument("--shade", choices=["flat", "smooth", "keep"], default="keep")
    parser.add_argument("--generate-box-collider", choices=["true", "false"], default="false")
    return parser.parse_args(argv)


def reset_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete()


def import_glb(path: str):
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=path)
    after = set(bpy.data.objects)
    return list(after - before)


def remove_cameras_and_lights(objects):
    for obj in list(objects):
        if obj.type in {"CAMERA", "LIGHT"}:
            bpy.data.objects.remove(obj, do_unlink=True)


def remove_hidden_junk():
    for obj in list(bpy.context.scene.objects):
        if obj.hide_get() or obj.hide_viewport:
            bpy.data.objects.remove(obj, do_unlink=True)


def mesh_objects():
    return [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]


def apply_transforms(scale: float):
    meshes = mesh_objects()
    for obj in meshes:
        obj.select_set(True)
        bpy.context.view_layer.objects.active = obj
        obj.scale = (obj.scale.x * scale, obj.scale.y * scale, obj.scale.z * scale)
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
        obj.select_set(False)


def recalc_normals():
    for obj in mesh_objects():
        bpy.ops.object.select_all(action="DESELECT")
        obj.select_set(True)
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.mode_set(mode="EDIT")
        bpy.ops.mesh.select_all(action="SELECT")
        bpy.ops.mesh.normals_make_consistent(inside=False)
        bpy.ops.object.mode_set(mode="OBJECT")
        obj.select_set(False)


def decimate_meshes(ratio):
    if ratio is None:
        return
    ratio = max(0.01, min(1.0, ratio))
    for obj in mesh_objects():
        mod = obj.modifiers.new(name="codex_decimate", type="DECIMATE")
        mod.ratio = ratio
        bpy.context.view_layer.objects.active = obj
        obj.select_set(True)
        bpy.ops.object.modifier_apply(modifier=mod.name)
        obj.select_set(False)


def shade_meshes(mode):
    if mode == "keep":
        return
    for obj in mesh_objects():
        bpy.ops.object.select_all(action="DESELECT")
        obj.select_set(True)
        bpy.context.view_layer.objects.active = obj
        if mode == "smooth":
            bpy.ops.object.shade_smooth()
        elif mode == "flat":
            bpy.ops.object.shade_flat()
        obj.select_set(False)


def rename_objects(asset_name):
    if not asset_name:
        return
    for i, obj in enumerate(mesh_objects()):
        obj.name = f"{asset_name}_mesh_{i:02d}"
        if obj.data:
            obj.data.name = f"{asset_name}_mesh_data_{i:02d}"
        for j, slot in enumerate(obj.material_slots):
            if slot.material:
                slot.material.name = f"{asset_name}_mat_{j:02d}"


def combined_bounds(objects):
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


def set_origin(asset_name, mode):
    # Starter behavior: set origin to geometry, then move object so lowest Z rests on 0 for base-origin props.
    meshes = mesh_objects()
    if not meshes:
        return
    bpy.ops.object.select_all(action="DESELECT")
    for obj in meshes:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = meshes[0]
    bpy.ops.object.origin_set(type="ORIGIN_GEOMETRY", center="BOUNDS")

    if mode == "base":
        min_z = min((obj.matrix_world @ mathutils.Vector(corner)).z for obj in meshes for corner in obj.bound_box)
        for obj in meshes:
            obj.location.z -= min_z


def generate_box_collider(asset_name):
    meshes = mesh_objects()
    if not meshes:
        return
    min_x = min_y = min_z = float("inf")
    max_x = max_y = max_z = float("-inf")
    for obj in meshes:
        for corner in obj.bound_box:
            world = obj.matrix_world @ mathutils.Vector(corner)
            min_x = min(min_x, world.x)
            min_y = min(min_y, world.y)
            min_z = min(min_z, world.z)
            max_x = max(max_x, world.x)
            max_y = max(max_y, world.y)
            max_z = max(max_z, world.z)

    center = ((min_x + max_x) / 2, (min_y + max_y) / 2, (min_z + max_z) / 2)
    size = (max_x - min_x, max_y - min_y, max_z - min_z)
    bpy.ops.mesh.primitive_cube_add(size=1, location=center)
    collider = bpy.context.object
    collider.name = f"{asset_name or 'asset'}_collider_box"
    collider.dimensions = size
    collider["collision"] = True
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)


def export_glb(path: str):
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=path,
        export_format="GLB",
        export_apply=True,
    )


def main():
    args = parse_args()
    input_path = Path(args.input)
    output_path = Path(args.output)

    if not input_path.exists():
        raise FileNotFoundError(f"Input GLB not found: {input_path}")

    reset_scene()
    imported = import_glb(str(input_path))
    remove_cameras_and_lights(imported)
    remove_hidden_junk()
    apply_transforms(args.scale)
    recalc_normals()
    decimate_meshes(args.decimate)
    shade_meshes(args.shade)
    rename_objects(args.asset_name)
    set_origin(args.asset_name, args.origin)

    if args.generate_box_collider == "true":
        generate_box_collider(args.asset_name)

    export_glb(str(output_path))
    print(f"Cleaned GLB exported to: {output_path}")


if __name__ == "__main__":
    main()
