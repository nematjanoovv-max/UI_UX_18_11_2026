"""
Blender Post-Processing Script
Can be run inside Blender:
  blender -b --python pipeline/blender_postprocess.py -- --in <file.glb> --out <clean.glb> --anims <idle,walk> --render-sheet <sheet.png>
Or executed via Python CLI directly (with auto-fallback if Blender is not installed).
"""

import sys
import os
import argparse
import json

def log(msg: str) -> None:
    sys.stderr.write(f"[POST_PROCESS] {msg}\n")
    sys.stderr.flush()

# Check if running inside Blender
IN_BLENDER = False
try:
    import bpy
    IN_BLENDER = True
except ImportError:
    bpy = None


def run_blender_pipeline(input_glb: str, output_glb: str, target_height: float = 1.75, render_sheet_path: str = None, anims: list = None):
    """
    Executes standard Blender cleanup, centering, 1.75m scaling, contact sheet rendering, and export.
    """
    log("Running inside Blender headless environment...")
    # Clear default scene
    bpy.ops.wm.read_factory_settings(use_empty=True)
    
    # Import GLB
    bpy.ops.import_scene.gltf(filepath=input_glb)
    
    # Select all objects
    bpy.ops.object.select_all(action='SELECT')
    
    # Apply all transformations (Location, Rotation, Scale)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    
    # Find all mesh objects to compute bounding box
    mesh_objs = [obj for obj in bpy.context.scene.objects if obj.type == 'MESH']
    armature_objs = [obj for obj in bpy.context.scene.objects if obj.type == 'ARMATURE']
    
    if not mesh_objs:
        log("No mesh objects found in scene!")
    else:
        # Calculate world bounding box
        min_x = min_y = min_z = float('inf')
        max_x = max_y = max_z = float('-inf')
        for obj in mesh_objs:
            for v in obj.bound_box:
                world_coord = obj.matrix_world @ bpy.types.Vector(v)
                min_x = min(min_x, world_coord.x)
                max_x = max(max_x, world_coord.x)
                min_y = min(min_y, world_coord.y)
                max_y = max(max_y, world_coord.y)
                min_z = min(min_z, world_coord.z)
                max_z = max(max_z, world_coord.z)
        
        current_height = max_z - min_z
        log(f"Current bounding height: {current_height:.3f}m")
        scale_factor = 1.0
        if current_height > 0.001:
            scale_factor = target_height / current_height
            log(f"Scaling scene by factor: {scale_factor:.4f} to achieve {target_height}m")
            
        # Create a parent empty or scale root objects
        root_objs = [obj for obj in bpy.context.scene.objects if obj.parent is None]
        for obj in root_objs:
            obj.scale = (obj.scale.x * scale_factor, obj.scale.y * scale_factor, obj.scale.z * scale_factor)
            
        bpy.ops.object.select_all(action='SELECT')
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        
        # Center X and Y, and place feet exactly at Z=0
        # Recompute min_z after scale
        min_z_new = min_x_new = min_y_new = float('inf')
        max_x_new = max_y_new = float('-inf')
        for obj in mesh_objs:
            for v in obj.bound_box:
                world_coord = obj.matrix_world @ bpy.types.Vector(v)
                min_x_new = min(min_x_new, world_coord.x)
                max_x_new = max(max_x_new, world_coord.x)
                min_y_new = min(min_y_new, world_coord.y)
                max_y_new = max(max_y_new, world_coord.y)
                min_z_new = min(min_z_new, world_coord.z)
                
        center_x = (min_x_new + max_x_new) / 2.0
        center_y = (min_y_new + max_y_new) / 2.0
        
        for obj in root_objs:
            obj.location.x -= center_x
            obj.location.y -= center_y
            obj.location.z -= min_z_new
            
        bpy.ops.object.select_all(action='SELECT')
        bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
        log("Transformed model: Feet at Z=0, centered at X=0, Y=0, height=1.75m")

    # Render 4-view contact sheet (Front, Back, Left, Right) if requested
    if render_sheet_path:
        render_4view_blender(render_sheet_path, target_height)

    # Export clean GLB
    os.makedirs(os.path.dirname(os.path.abspath(output_glb)), exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=output_glb,
        export_format='GLB',
        export_apply=True,
        export_yup=True
    )
    log(f"Exported clean GLB to: {output_glb}")


def render_4view_blender(sheet_path: str, height: float):
    """
    Renders 4 angles (Front, Back, Left, Right) and creates 2x2 contact sheet using CPU-safe workbench.
    """
    os.makedirs(os.path.dirname(os.path.abspath(sheet_path)), exist_ok=True)
    scene = bpy.context.scene
    scene.render.engine = 'BLENDER_WORKBENCH'
    scene.render.resolution_x = 512
    scene.render.resolution_y = 512
    scene.display.shading.color_type = 'TEXTURE'
    scene.display.shading.light = 'FLAT'
    
    # Setup camera
    cam_data = bpy.data.cameras.new("ContactCam")
    cam_data.type = 'ORTHO'
    cam_data.ortho_scale = height * 1.3
    cam_obj = bpy.data.objects.new("ContactCam", cam_data)
    scene.collection.objects.link(cam_obj)
    scene.camera = cam_obj
    
    import math
    views = [
        ("front", (0, -3.0, height / 2.0), (math.radians(90), 0, 0)),
        ("back", (0, 3.0, height / 2.0), (math.radians(90), 0, math.radians(180))),
        ("left", (-3.0, 0, height / 2.0), (math.radians(90), 0, math.radians(-90))),
        ("right", (3.0, 0, height / 2.0), (math.radians(90), 0, math.radians(90))),
    ]
    
    rendered_frames = []
    tmp_dir = os.path.dirname(sheet_path)
    for name, loc, rot in views:
        cam_obj.location = loc
        cam_obj.rotation_euler = rot
        frame_path = os.path.join(tmp_dir, f"_sub_{name}.png")
        scene.render.filepath = frame_path
        bpy.ops.render.render(write_still=True)
        rendered_frames.append(frame_path)
        
    # Stitch 2x2 with Pillow
    try:
        from PIL import Image
        sheet = Image.new("RGBA", (1024, 1024), (30, 30, 35, 255))
        img_front = Image.open(rendered_frames[0])
        img_back = Image.open(rendered_frames[1])
        img_left = Image.open(rendered_frames[2])
        img_right = Image.open(rendered_frames[3])
        sheet.paste(img_front, (0, 0))
        sheet.paste(img_back, (512, 0))
        sheet.paste(img_left, (0, 512))
        sheet.paste(img_right, (512, 512))
        sheet.save(sheet_path)
        log(f"Contact sheet saved to: {sheet_path}")
        for f in rendered_frames:
            if os.path.exists(f):
                os.remove(f)
    except Exception as e:
        log(f"Failed to stitch sheet with PIL: {e}")


def fallback_python_postprocess(input_glb: str, output_glb: str, target_height: float = 1.75, render_sheet_path: str = None):
    """
    Pure Python fallback when Blender is not installed.
    Uses trimesh / PIL to scale, center pivot, and generate visual verification sheet.
    glTF coordinate system: +Y is UP, +Z is FORWARD, +X is RIGHT.
    """
    log("Running Pure Python fallback post-processor (trimesh + PIL)...")
    import shutil
    try:
        import trimesh
        mesh = trimesh.load(input_glb, force='scene')
        bounds = mesh.bounds
        
        # Determine which axis is height (longest dimension usually Y)
        sizes = bounds[1] - bounds[0]
        # In glTF, standard UP is Y (index 1)
        current_height = sizes[1]
        log(f"Current bounding height (Y-axis): {current_height:.3f}m")
        if current_height > 0.001:
            scale = target_height / current_height
            mesh.apply_scale(scale)
            # Recompute bounds after scale
            bounds = mesh.bounds
            # Center X and Z, set Y min (feet) to 0
            center_x = (bounds[0][0] + bounds[1][0]) / 2.0
            center_z = (bounds[0][2] + bounds[1][2]) / 2.0
            min_y = bounds[0][1]
            translation = [-center_x, -min_y, -center_z]
            mesh.apply_translation(translation)
            log(f"Model scaled by {scale:.4f} and centered. Bounding height: {target_height}m, Feet at Y=0")
            
        os.makedirs(os.path.dirname(os.path.abspath(output_glb)), exist_ok=True)
        mesh.export(output_glb)
        log(f"Saved normalized GLB to {output_glb}")
    except Exception as e:
        log(f"Trimesh normalization failed ({e}), performing direct copy...")
        os.makedirs(os.path.dirname(os.path.abspath(output_glb)), exist_ok=True)
        shutil.copyfile(input_glb, output_glb)

    # Generate 2x2 contact sheet image for verification
    if render_sheet_path:
        generate_fallback_sheet(output_glb, render_sheet_path)


def generate_fallback_sheet(glb_path: str, sheet_path: str):
    """
    Generates a 2x2 verification sheet with PIL displaying model info, wireframe/silhouette, and metadata.
    glTF standard: +Y is UP, +X is RIGHT, +Z is FORWARD.
    """
    try:
        from PIL import Image, ImageDraw, ImageFont
        os.makedirs(os.path.dirname(os.path.abspath(sheet_path)), exist_ok=True)
        w, h = 1024, 1024
        img = Image.new("RGBA", (w, h), (18, 20, 26, 255))
        draw = ImageDraw.Draw(img)
        
        # Draw 2x2 grid lines
        draw.line([(512, 0), (512, 1024)], fill=(45, 52, 64, 255), width=2)
        draw.line([(0, 512), (1024, 512)], fill=(45, 52, 64, 255), width=2)
        
        labels = [
            ("FRONT VIEW (+Z / Front)", (20, 20)),
            ("BACK VIEW (-Z / Back)", (532, 20)),
            ("LEFT PROFILE (-X / Left)", (20, 532)),
            ("RIGHT PROFILE (+X / Right)", (532, 532)),
        ]
        for text, pos in labels:
            draw.text(pos, text, fill=(0, 243, 255, 255))

        # Project 3D points
        try:
            import trimesh
            import numpy as np
            scene = trimesh.load(glb_path, force='scene')
            all_verts = []
            if hasattr(scene, 'geometry'):
                for g in scene.geometry.values():
                    if hasattr(g, 'vertices') and len(g.vertices) > 0:
                        all_verts.append(np.array(g.vertices))
            if all_verts:
                verts = np.vstack(all_verts)
                if len(verts) > 18000:
                    indices = np.random.choice(len(verts), 18000, replace=False)
                    verts = verts[indices]
                
                # Normalize: center X, Z at 0, Y from 0 to 1
                v_min = verts.min(axis=0)
                v_max = verts.max(axis=0)
                h_span = max(v_max[1] - v_min[1], 1e-4)
                
                # Projections (Y is UP):
                # Front: X vs Y
                # Back: -X vs Y
                # Left: Z vs Y
                # Right: -Z vs Y
                projections = [
                    (verts[:, 0] / h_span, (verts[:, 1] - v_min[1]) / h_span, 256, 450, (0, 240, 255, 200)),
                    (-verts[:, 0] / h_span, (verts[:, 1] - v_min[1]) / h_span, 768, 450, (140, 200, 255, 200)),
                    (verts[:, 2] / h_span, (verts[:, 1] - v_min[1]) / h_span, 256, 960, (255, 180, 50, 200)),
                    (-verts[:, 2] / h_span, (verts[:, 1] - v_min[1]) / h_span, 768, 960, (255, 100, 150, 200)),
                ]
                for px, py, ox, oy_feet, color in projections:
                    sx = ox + px * 380
                    sy = oy_feet - py * 380
                    points = list(zip(sx.astype(int), sy.astype(int)))
                    for pt in points:
                        draw.point(pt, fill=color)
        except Exception as err:
            log(f"Point projection note: {err}")
            
        img.save(sheet_path)
        log(f"Verification sheet saved: {sheet_path}")
    except Exception as e:
        log(f"Failed to generate verification sheet: {e}")


def main():
    parser = argparse.ArgumentParser(description="Blender & Fallback 3D Post-Processor")
    parser.add_argument("--in", dest="input_glb", required=True, help="Input raw GLB path")
    parser.add_argument("--out", dest="output_glb", required=True, help="Clean output GLB path")
    parser.add_argument("--target-height", type=float, default=1.75, help="Target height in meters (default: 1.75)")
    parser.add_argument("--render-sheet", dest="render_sheet", default=None, help="Output 4-view contact sheet path")
    parser.add_argument("--anims", default="", help="Comma separated animations to merge/retarget")
    
    # When passed inside Blender: blender -b --python script.py -- --in ...
    args_list = sys.argv[1:]
    if "--" in args_list:
        args_list = args_list[args_list.index("--") + 1:]
    args = parser.parse_args(args_list)
    
    if IN_BLENDER:
        run_blender_pipeline(args.input_glb, args.output_glb, args.target_height, args.render_sheet, args.anims.split(","))
    else:
        # Check if blender command is available
        import shutil
        blender_bin = shutil.which("blender")
        if blender_bin:
            import subprocess
            cmd = [
                blender_bin, "-b", "--python", __file__, "--",
                "--in", args.input_glb,
                "--out", args.output_glb,
                "--target-height", str(args.target_height),
                "--anims", args.anims
            ]
            if args.render_sheet:
                cmd.extend(["--render-sheet", args.render_sheet])
            log(f"Spawning Blender subprocess: {' '.join(cmd)}")
            subprocess.run(cmd, check=True)
        else:
            fallback_python_postprocess(args.input_glb, args.output_glb, args.target_height, args.render_sheet)


if __name__ == "__main__":
    main()
