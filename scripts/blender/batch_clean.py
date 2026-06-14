"""
Batch clean GLB files with Blender.

Usage:
  blender -b --python scripts/blender/batch_clean.py -- public/models/raw public/models/cleaned --decimate 0.65

This is intentionally secondary to single-asset cleanup. Use it only after the
single asset pipeline has been reviewed.
"""

import argparse
import subprocess
import sys
from pathlib import Path

import bpy


def parse_args():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    parser = argparse.ArgumentParser(description="Batch clean GLB files.")
    parser.add_argument("input_dir")
    parser.add_argument("output_dir")
    parser.add_argument("--decimate", default=None)
    parser.add_argument("--shade", choices=["flat", "smooth", "keep"], default="keep")
    return parser.parse_args(argv)


def main():
    args = parse_args()
    input_dir = Path(args.input_dir)
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    files = sorted(input_dir.glob("*.glb"))
    if not files:
        print(f"No .glb files found in {input_dir}")
        return

    clean_script = Path(__file__).with_name("clean_glb.py")
    for input_path in files:
        asset_name = input_path.stem
        output_path = output_dir / input_path.name
        command = [
            bpy.app.binary_path,
            "-b",
            "--python",
            str(clean_script),
            "--",
            str(input_path),
            str(output_path),
            "--asset-name",
            asset_name,
            "--shade",
            args.shade,
        ]
        if args.decimate is not None:
            command.extend(["--decimate", str(args.decimate)])
        print(f"Cleaning {input_path} -> {output_path}")
        subprocess.run(command, check=True)


if __name__ == "__main__":
    main()
