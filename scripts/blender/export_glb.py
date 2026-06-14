"""
Export the current Blender scene or a source .blend file to GLB.

Usage:
  blender -b source.blend --python scripts/blender/export_glb.py -- output.glb
  blender -b --python scripts/blender/export_glb.py -- output.glb
"""

import argparse
import sys
from pathlib import Path

import bpy


def parse_args():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    parser = argparse.ArgumentParser(description="Export current Blender scene as GLB.")
    parser.add_argument("output")
    parser.add_argument("--apply", choices=["true", "false"], default="true")
    return parser.parse_args(argv)


def main():
    args = parse_args()
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    bpy.ops.export_scene.gltf(
        filepath=str(output_path),
        export_format="GLB",
        export_apply=args.apply == "true",
    )
    print(f"GLB exported to: {output_path}")


if __name__ == "__main__":
    main()
