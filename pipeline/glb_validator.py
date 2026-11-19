"""
GLB 2.0 Binary Validator & Inspector
Lightweight, zero-heavy-dependency binary GLB parser.
Checks:
 - Header magic (0x46546C67 "glTF") & version (2)
 - Mesh count & primitives
 - Textures, materials, images presence
 - Skins count & joints count
 - Joint weights (presence of JOINTS_0, WEIGHTS_0 in primitives)
 - Bounding box height calculation (target: 1.5m - 2.0m)
 - Animation clips list
 - File size in MB
"""

import sys
import os
import struct
import json
from typing import Dict, Any, List

MAGIC_GLTF = 0x46546C67  # 'glTF'
CHUNK_TYPE_JSON = 0x4E4F534A  # 'JSON'
CHUNK_TYPE_BIN = 0x004E4942   # 'BIN\0'


def log(msg: str) -> None:
    sys.stderr.write(f"[GLB_VALIDATOR] {msg}\n")
    sys.stderr.flush()


def validate_glb(file_path: str, max_mb: float = 12.0) -> Dict[str, Any]:
    if not os.path.exists(file_path):
        return {
            "valid": False,
            "error": f"File does not exist: {file_path}",
            "file_size_mb": 0
        }
        
    size_bytes = os.path.getsize(file_path)
    size_mb = round(size_bytes / (1024 * 1024), 2)
    
    with open(file_path, "rb") as f:
        # Header (12 bytes)
        header = f.read(12)
        if len(header) < 12:
            return {"valid": False, "error": "File too small for GLB header", "file_size_mb": size_mb}
            
        magic, version, length = struct.unpack("<III", header)
        if magic != MAGIC_GLTF:
            return {"valid": False, "error": f"Invalid magic header: {hex(magic)} (expected 0x46546c67)", "file_size_mb": size_mb}
            
        if version != 2:
            return {"valid": False, "error": f"Unsupported glTF version: {version} (expected 2)", "file_size_mb": size_mb}
            
        # First chunk must be JSON
        chunk_header = f.read(8)
        if len(chunk_header) < 8:
            return {"valid": False, "error": "Missing JSON chunk header", "file_size_mb": size_mb}
            
        chunk_length, chunk_type = struct.unpack("<II", chunk_header)
        if chunk_type != CHUNK_TYPE_JSON:
            return {"valid": False, "error": f"First chunk is not JSON: {hex(chunk_type)}", "file_size_mb": size_mb}
            
        json_data_bytes = f.read(chunk_length)
        try:
            gltf = json.loads(json_data_bytes.decode("utf-8"))
        except Exception as e:
            return {"valid": False, "error": f"Corrupt glTF JSON: {e}", "file_size_mb": size_mb}
            
    # Analyze GLTF JSON
    meshes = gltf.get("meshes", [])
    textures = gltf.get("textures", [])
    materials = gltf.get("materials", [])
    images = gltf.get("images", [])
    skins = gltf.get("skins", [])
    animations = gltf.get("animations", [])
    accessors = gltf.get("accessors", [])
    
    mesh_count = len(meshes)
    texture_count = len(textures) or len(images)
    material_count = len(materials)
    skins_count = len(skins)
    
    joints_count = 0
    for skin in skins:
        joints_count += len(skin.get("joints", []))
        
    # Check joint weights (JOINTS_0, WEIGHTS_0) in mesh primitives
    has_skinning = False
    for mesh in meshes:
        for prim in mesh.get("primitives", []):
            attrs = prim.get("attributes", {})
            if "JOINTS_0" in attrs and "WEIGHTS_0" in attrs:
                has_skinning = True
                break
        if has_skinning:
            break
            
    # Calculate bounding box from POSITION accessors or trimesh decoded scene
    min_coord = [float("inf"), float("inf"), float("inf")]
    max_coord = [float("-inf"), float("-inf"), float("-inf")]
    found_positions = False
    
    # Try trimesh for decoded world bounds if available
    try:
        import trimesh
        scene = trimesh.load(file_path, force='scene')
        t_bounds = scene.bounds
        min_coord = [round(float(x), 3) for x in t_bounds[0]]
        max_coord = [round(float(x), 3) for x in t_bounds[1]]
        found_positions = True
    except Exception:
        pass

    if not found_positions:
        for mesh in meshes:
            for prim in mesh.get("primitives", []):
                attrs = prim.get("attributes", {})
                pos_accessor_idx = attrs.get("POSITION")
                if pos_accessor_idx is not None and pos_accessor_idx < len(accessors):
                    acc = accessors[pos_accessor_idx]
                    acc_min = acc.get("min")
                    acc_max = acc.get("max")
                    if acc_min and acc_max and len(acc_min) >= 3 and len(acc_max) >= 3:
                        found_positions = True
                        for i in range(3):
                            min_coord[i] = min(min_coord[i], acc_min[i])
                            max_coord[i] = max(max_coord[i], acc_max[i])
                        
    bounding_box = {
        "min": min_coord if found_positions else [0, 0, 0],
        "max": max_coord if found_positions else [0, 0, 0],
        "size": [
            round(max_coord[i] - min_coord[i], 3) if found_positions else 0.0
            for i in range(3)
        ]
    }
    
    # In glTF standard: Y is UP (height), X is width, Z is depth
    height_candidate_y = bounding_box["size"][1]
    height_candidate_z = bounding_box["size"][2]
    estimated_height = max(height_candidate_y, height_candidate_z)
    
    # Animation clips
    anim_clips = [anim.get("name") or f"clip_{idx}" for idx, anim in enumerate(animations)]
    
    # Validation checks
    errors = []
    warnings = []
    
    if mesh_count == 0:
        errors.append("No meshes found in model")
    if size_mb > max_mb:
        errors.append(f"File size {size_mb} MB exceeds limit of {max_mb} MB")
    if estimated_height < 0.1:
        warnings.append("Model bounding height is very small (< 0.1m)")
    elif not (1.3 <= estimated_height <= 2.2):
        warnings.append(f"Model height {estimated_height:.2f}m is outside standard 1.5m-2.0m range")
        
    if skins_count == 0 and not has_skinning:
        warnings.append("No skeleton/rig found (unrigged static mesh)")
        
    is_valid = len(errors) == 0
    
    report = {
        "valid": is_valid,
        "file_path": file_path,
        "file_size_mb": size_mb,
        "mesh_count": mesh_count,
        "materials_count": material_count,
        "textures_count": texture_count,
        "skins_count": skins_count,
        "joints_count": joints_count,
        "has_skinning": has_skinning,
        "bounding_box": bounding_box,
        "estimated_height_m": round(estimated_height, 3),
        "animations": anim_clips,
        "errors": errors,
        "warnings": warnings
    }
    
    return report


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.stderr.write("Usage: python glb_validator.py <path_to_model.glb> [--max-mb 12]\n")
        sys.exit(1)
        
    target_path = sys.argv[1]
    limit_mb = 12.0
    if "--max-mb" in sys.argv:
        idx = sys.argv.index("--max-mb")
        if idx + 1 < len(sys.argv):
            limit_mb = float(sys.argv[idx + 1])
            
    res = validate_glb(target_path, max_mb=limit_mb)
    print(json.dumps(res, indent=2))
    sys.exit(0 if res.get("valid") else 1)
