#!/usr/bin/env python3
"""
Professional 3D Game Character Pipeline CLI
Zero-cost, modular 3D character pipeline for game development.

Commands:
  discover   - Inspect live status of Hugging Face Spaces and local dependencies
  concept    - Generate symmetric A-pose 2D character concept sheet (FLUX.1)
  mesh       - Generate PBR textured 3D mesh GLB from 2D concept (Hunyuan3D-2 / TRELLIS)
  rig        - Rig raw GLB with skeletal armature (Make-It-Animatable / UniRig / Fallback)
  finalize   - Post-process (Blender/Fallback), optimize (gltf-transform), and validate
"""

import sys
import os
import shutil
import argparse
import json
import time
import subprocess
from typing import Dict, Any, Optional

# Ensure pipeline package is importable
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
if SCRIPT_DIR not in sys.path:
    sys.path.insert(0, SCRIPT_DIR)

from pipeline.hf_discovery import discover_all, find_best_space, get_hf_token
from pipeline.glb_validator import validate_glb

try:
    import gradio_client
except ImportError:
    gradio_client = None


def log(msg: str) -> None:
    """All progress logs strictly go to stderr"""
    sys.stderr.write(f"[PIPELINE] {msg}\n")
    sys.stderr.flush()


def output_json(data: Dict[str, Any]) -> None:
    """Strict JSON output only to stdout"""
    print(json.dumps(data, indent=2))
    sys.stdout.flush()


# ==============================================================================
# COMMAND: DISCOVER
# ==============================================================================
def cmd_discover(args) -> int:
    log("Running dependency and live HF Spaces discovery...")
    token = get_hf_token()
    token_present = bool(token)
    
    # Check binaries
    has_blender = bool(shutil.which("blender"))
    has_gltf_transform = bool(shutil.which("gltf-transform"))
    
    # Check Python packages
    python_deps = {}
    for pkg in ["gradio_client", "requests", "PIL", "trimesh"]:
        try:
            __import__(pkg)
            python_deps[pkg] = True
        except ImportError:
            python_deps[pkg] = False
            
    hf_spaces = discover_all(token)
    
    result = {
        "status": "ready",
        "timestamp": time.time(),
        "environment": {
            "hf_token_set": token_present,
            "has_blender": has_blender,
            "has_gltf_transform": has_gltf_transform,
            "python_dependencies": python_deps,
        },
        "spaces": hf_spaces
    }
    output_json(result)
    return 0


# ==============================================================================
# COMMAND: CONCEPT
# ==============================================================================
MANDATORY_PROMPT_SUFFIX = (
    "full body 3D game character design sheet, front view, strict symmetrical A-pose, "
    "arms straight at 45 degrees separated from torso, legs slightly apart, "
    "wearing fitted gear with no long cape or handheld weapon blocking body, "
    "flat neutral studio lighting, solid white background"
)

def cmd_concept(args) -> int:
    prompt = args.prompt.strip()
    out_path = os.path.abspath(args.out)
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    
    # Combine user prompt with strict 3D game asset constraints
    full_prompt = f"{prompt}, {MANDATORY_PROMPT_SUFFIX}"
    log(f"Generating concept image for prompt: '{prompt[:60]}...'")
    
    token = get_hf_token()
    space_candidates = [
        "black-forest-labs/FLUX.1-schnell",
        "mrfakename/FLUX.1-schnell",
        "multimodalart/flux-tarot",
    ]
    
    last_error = None
    for attempt in range(1, 4):
        log(f"Concept generation attempt {attempt}/3...")
        for space_id in space_candidates:
            try:
                log(f"Connecting to {space_id}...")
                client = gradio_client.Client(space_id, token=token, verbose=False)
                api_dict = client.view_api(return_format="dict")
                named_endpoints = api_dict.get("named_endpoints", {})
                
                ep = "/infer" if "/infer" in named_endpoints else list(named_endpoints.keys())[0]
                log(f"Calling endpoint {ep} on {space_id}...")
                
                # Check parameters for endpoint
                params = named_endpoints[ep].get("parameters", [])
                kwargs = {}
                for p in params:
                    pname = p.get("parameter_name")
                    if pname == "prompt":
                        kwargs["prompt"] = full_prompt
                    elif pname == "seed":
                        kwargs["seed"] = 42 + attempt
                    elif pname == "randomize_seed":
                        kwargs["randomize_seed"] = True
                    elif pname == "width":
                        kwargs["width"] = 1024
                    elif pname == "height":
                        kwargs["height"] = 1024
                    elif pname == "num_inference_steps":
                        kwargs["num_inference_steps"] = 4
                        
                res = client.predict(**kwargs, api_name=ep)
                # res is typically (result_image_dict_or_path, seed)
                img_path = None
                if isinstance(res, (tuple, list)):
                    first = res[0]
                    if isinstance(first, dict):
                        img_path = first.get("path")
                    elif isinstance(first, str):
                        img_path = first
                elif isinstance(res, dict):
                    img_path = res.get("path")
                elif isinstance(res, str):
                    img_path = res
                    
                if img_path and os.path.exists(img_path):
                    shutil.copyfile(img_path, out_path)
                    log(f"Saved concept image to: {out_path}")
                    output_json({
                        "status": "success",
                        "space": space_id,
                        "endpoint": ep,
                        "prompt": full_prompt,
                        "output_file": out_path,
                        "attempt": attempt
                    })
                    return 0
            except Exception as e:
                log(f"Attempt failed on {space_id}: {type(e).__name__}: {e}")
                last_error = str(e)
                time.sleep(2)
                continue
                
    output_json({
        "status": "error",
        "error": f"Failed after 3 attempts: {last_error}",
        "out_path": out_path
    })
    return 1


# ==============================================================================
# COMMAND: MESH
# ==============================================================================
def cmd_mesh(args) -> int:
    image_path = os.path.abspath(args.image)
    out_path = os.path.abspath(args.out)
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    
    if not os.path.exists(image_path):
        output_json({"status": "error", "error": f"Input image not found: {image_path}"})
        return 1
        
    log(f"Generating 3D Mesh from image: {image_path}")
    token = get_hf_token()
    
    # Candidate 3D spaces
    space_candidates = [
        "TencentARC/InstantMesh",
        "tencent/Hunyuan3D-2.1",
        "tencent/Hunyuan3D-2",
        "trellis-community/TRELLIS"
    ]
    
    last_error = None
    for attempt in range(1, 3):
        log(f"Mesh generation attempt {attempt}/2...")
        for space_id in space_candidates:
            try:
                log(f"Connecting to 3D Space: {space_id}...")
                client = gradio_client.Client(space_id, token=token, verbose=False)
                api_dict = client.view_api(return_format="dict")
                named_endpoints = api_dict.get("named_endpoints", {})
                
                # Check for InstantMesh endpoints
                if "/generate_mvs" in named_endpoints and "/make3d" in named_endpoints:
                    log("Using InstantMesh multi-step 3D generation...")
                    p_img = client.predict(
                        input_image=gradio_client.handle_file(image_path),
                        do_remove_background=True,
                        api_name="/preprocess"
                    )
                    p_path = p_img.get("path") if isinstance(p_img, dict) else p_img
                    client.predict(
                        input_image=gradio_client.handle_file(p_path),
                        sample_steps=75,
                        sample_seed=42,
                        api_name="/generate_mvs"
                    )
                    m3d_res = client.predict(api_name="/make3d")
                    glb_path = m3d_res[1] if isinstance(m3d_res, (tuple, list)) else m3d_res
                    if glb_path and os.path.exists(glb_path):
                        shutil.copyfile(glb_path, out_path)
                        log(f"Successfully generated mesh with InstantMesh: {out_path}")
                        output_json({
                            "status": "success",
                            "space": space_id,
                            "output_file": out_path
                        })
                        return 0

                # Check for Hunyuan endpoints
                elif "/generation_all" in named_endpoints:
                    log(f"Using Hunyuan /generation_all endpoint...")
                    res = client.predict(
                        image=gradio_client.handle_file(image_path),
                        mv_image_front=None,
                        mv_image_back=None,
                        mv_image_left=None,
                        mv_image_right=None,
                        steps=30,
                        guidance_scale=5.0,
                        seed=1234,
                        octree_resolution=256,
                        check_box_rembg=True,
                        num_chunks=8000,
                        randomize_seed=True,
                        api_name="/generation_all"
                    )
                    # res is (file_out, file_out2, output_html, mesh_stats, seed)
                    # Now call /on_export_click to get clean glb
                    file1 = res[0]
                    file2 = res[1]
                    if "/on_export_click" in named_endpoints:
                        export_res = client.predict(
                            file_out=file1,
                            file_out2=file2,
                            file_type="glb",
                            reduce_face=False,
                            export_texture=True,
                            target_face_num=15000,
                            api_name="/on_export_click"
                        )
                        glb_download = export_res[1]
                    else:
                        glb_download = file1
                        
                    download_path = glb_download if isinstance(glb_download, str) else glb_download.get("path")
                    if download_path and os.path.exists(download_path):
                        shutil.copyfile(download_path, out_path)
                        log(f"Successfully generated mesh: {out_path}")
                        output_json({
                            "status": "success",
                            "space": space_id,
                            "output_file": out_path
                        })
                        return 0
                        
                # Check for Trellis endpoint
                elif "/generate_and_extract_glb" in named_endpoints:
                    log(f"Using Trellis /generate_and_extract_glb endpoint...")
                    res = client.predict(
                        image=gradio_client.handle_file(image_path),
                        api_name="/generate_and_extract_glb"
                    )
                    glb_path = res if isinstance(res, str) else (res[0] if isinstance(res, (tuple, list)) else None)
                    if glb_path and os.path.exists(glb_path):
                        shutil.copyfile(glb_path, out_path)
                        log(f"Successfully generated mesh with TRELLIS: {out_path}")
                        output_json({
                            "status": "success",
                            "space": space_id,
                            "output_file": out_path
                        })
                        return 0
            except Exception as e:
                log(f"Failed mesh generation on {space_id}: {type(e).__name__}: {e}")
                last_error = str(e)
                time.sleep(3)
                continue
                
    output_json({
        "status": "error",
        "error": f"Failed after attempts: {last_error}",
        "out_path": out_path
    })
    return 1


# ==============================================================================
# COMMAND: RIG
# ==============================================================================
def cmd_rig(args) -> int:
    in_path = os.path.abspath(args.input_glb)
    out_path = os.path.abspath(args.out)
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    
    if not os.path.exists(in_path):
        output_json({"status": "error", "error": f"Input GLB not found: {in_path}"})
        return 1
        
    name = os.path.splitext(os.path.basename(in_path))[0].replace("_raw", "")
    manual_drop_dir = os.path.join(SCRIPT_DIR, "manual_drop")
    os.makedirs(manual_drop_dir, exist_ok=True)
    manual_target = os.path.join(manual_drop_dir, f"{name}_rigged.glb")
    
    # Check if user already dropped a rigged model in manual_drop/
    if os.path.exists(manual_target):
        log(f"Found manually dropped rigged model: {manual_target}")
        shutil.copyfile(manual_target, out_path)
        output_json({
            "status": "success",
            "source": "manual_drop",
            "output_file": out_path
        })
        return 0
        
    token = get_hf_token()
    rig_spaces = [
        "jasongzy/Make-It-Animatable",
        "MohamedRashad/UniRig"
    ]
    
    log(f"Attempting cloud auto-rigging for: {in_path}")
    rigged_ok = False
    
    for space_id in rig_spaces:
        try:
            log(f"Connecting to rigging space: {space_id}...")
            client = gradio_client.Client(space_id, token=token, verbose=False)
            api_dict = client.view_api(return_format="dict")
            named_endpoints = api_dict.get("named_endpoints", {})
            
            # Select rigging endpoint if available
            target_ep = None
            for ep in ["/predict", "/rig", "/auto_rig"]:
                if ep in named_endpoints:
                    target_ep = ep
                    break
                    
            if target_ep:
                log(f"Calling rigging endpoint {target_ep} on {space_id}...")
                res = client.predict(
                    inputs=gradio_client.handle_file(in_path),
                    api_name=target_ep
                )
                rig_file = res if isinstance(res, str) else (res[0] if isinstance(res, (tuple, list)) else None)
                if rig_file and os.path.exists(rig_file):
                    shutil.copyfile(rig_file, out_path)
                    log(f"Cloud auto-rigging successful: {out_path}")
                    output_json({
                        "status": "success",
                        "space": space_id,
                        "output_file": out_path
                    })
                    return 0
        except Exception as e:
            log(f"Rigging on {space_id} note: {type(e).__name__}: {str(e)[:100]}")
            continue
            
    # Graceful Fallback Protocol
    log("Cloud auto-rigging queue busy/quota reached. Initiating Graceful Fallback Protocol.")
    # Copy raw model to manual_drop for user convenience with Mixamo / AccuRIG
    raw_copy_path = os.path.join(manual_drop_dir, f"{name}_raw.glb")
    shutil.copyfile(in_path, raw_copy_path)
    
    output_json({
        "status": "needs_manual_rig",
        "message": "Cloud auto-rigging space is busy. Please drop rigged model into manual_drop/ or proceed with static mesh.",
        "raw_glb": raw_copy_path,
        "manual_drop_target": manual_target,
        "instructions": (
            f"1. Upload '{raw_copy_path}' to https://www.mixamo.com/ (free auto-rigger)\n"
            f"2. Export as FBX/GLB with T-pose or chosen animations\n"
            f"3. Save file as '{manual_target}'"
        )
    })
    return 0


# ==============================================================================
# COMMAND: FINALIZE
# ==============================================================================
def cmd_finalize(args) -> int:
    in_path = os.path.abspath(args.input_glb)
    out_path = os.path.abspath(args.out)
    max_mb = float(args.max_mb)
    anims = args.anims.strip()
    
    if not os.path.exists(in_path):
        output_json({"status": "error", "error": f"Input file not found: {in_path}"})
        return 1
        
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    name = os.path.splitext(os.path.basename(out_path))[0]
    
    # Step 1: Blender / Fallback Post-Processing (1.75m height, center pivot, 2x2 render sheet)
    render_sheet = os.path.join(SCRIPT_DIR, ".tmp", "renders", f"{name}_sheet.png")
    intermediate_clean = os.path.join(SCRIPT_DIR, ".tmp", f"{name}_clean.glb")
    
    postprocess_py = os.path.join(SCRIPT_DIR, "pipeline", "blender_postprocess.py")
    log("Executing Step 1: Geometry normalization (height 1.75m, centered pivot)...")
    
    post_cmd = [
        sys.executable, postprocess_py,
        "--in", in_path,
        "--out", intermediate_clean,
        "--target-height", "1.75",
        "--render-sheet", render_sheet,
        "--anims", anims
    ]
    subprocess.run(post_cmd, check=True)
    
    # Step 2: gltf-transform optimization
    gltf_cli = shutil.which("gltf-transform")
    optimized_path = os.path.join(SCRIPT_DIR, ".tmp", f"{name}_opt.glb")
    
    if gltf_cli:
        log("Executing Step 2: gltf-transform optimization (Meshopt & WebP)...")
        tex_size = 1024
        opt_cmd = [
            gltf_cli, "optimize",
            intermediate_clean, optimized_path,
            "--texture-compress", "webp",
            "--texture-size", str(tex_size),
            "--simplify", "false",
            "--compress", "meshopt"
        ]
        log(f"Running: {' '.join(opt_cmd)}")
        res = subprocess.run(opt_cmd)
        
        # If optimization failed (e.g. sharp/wasm issues), fallback to intermediate clean
        if res.returncode != 0 or not os.path.exists(optimized_path):
            log("gltf-transform warning, falling back to normalized clean model...")
            shutil.copyfile(intermediate_clean, out_path)
        else:
            # Check size
            opt_size_mb = os.path.getsize(optimized_path) / (1024 * 1024)
            if opt_size_mb > max_mb:
                log(f"Size {opt_size_mb:.2f}MB exceeds {max_mb}MB. Retrying with --texture-size 512...")
                opt_cmd[6] = "512"
                subprocess.run(opt_cmd)
            shutil.copyfile(optimized_path, out_path)
    else:
        log("gltf-transform CLI not found in PATH, writing clean normalized model...")
        shutil.copyfile(intermediate_clean, out_path)
        
    # Step 3: glb_validator verification
    log("Executing Step 3: GLB 2.0 binary validation...")
    val_report = validate_glb(out_path, max_mb=max_mb)
    
    final_result = {
        "status": "success" if val_report.get("valid") else "warning",
        "output_file": out_path,
        "contact_sheet": render_sheet if os.path.exists(render_sheet) else None,
        "validation": val_report
    }
    output_json(final_result)
    return 0 if val_report.get("valid") else 1


# ==============================================================================
# MAIN ENTRYPOINT
# ==============================================================================
def main():
    parser = argparse.ArgumentParser(description="Professional 3D Game Character Pipeline CLI")
    subparsers = parser.add_subparsers(dest="command", required=True)
    
    # Subcommand: discover
    subparsers.add_parser("discover", help="Discover live HF spaces and local tools")
    
    # Subcommand: concept
    p_concept = subparsers.add_parser("concept", help="Generate 2D concept sheet")
    p_concept.add_argument("--prompt", required=True, help="Character description")
    p_concept.add_argument("--out", required=True, help="Output image file path (.png)")
    
    # Subcommand: mesh
    p_mesh = subparsers.add_parser("mesh", help="Generate 3D PBR mesh GLB from concept image")
    p_mesh.add_argument("--image", required=True, help="Input concept image path")
    p_mesh.add_argument("--out", required=True, help="Output raw GLB path")
    
    # Subcommand: rig
    p_rig = subparsers.add_parser("rig", help="Auto-rig raw GLB")
    p_rig.add_argument("--in", dest="input_glb", required=True, help="Input raw GLB path")
    p_rig.add_argument("--out", required=True, help="Output rigged GLB path")
    
    # Subcommand: finalize
    p_fin = subparsers.add_parser("finalize", help="Post-process, optimize, and validate")
    p_fin.add_argument("--in", dest="input_glb", required=True, help="Input GLB path")
    p_fin.add_argument("--anims", default="idle,walk,run,jump", help="Animation list")
    p_fin.add_argument("--max-mb", default="12", help="Maximum file size in MB")
    p_fin.add_argument("--out", required=True, help="Output final GLB path")
    
    args = parser.parse_args()
    
    handlers = {
        "discover": cmd_discover,
        "concept": cmd_concept,
        "mesh": cmd_mesh,
        "rig": cmd_rig,
        "finalize": cmd_finalize,
    }
    
    handler = handlers.get(args.command)
    if handler:
        sys.exit(handler(args))
    else:
        parser.print_help(sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
